import { KJUR } from 'jsrsasign';
import { supabase } from '../lib/supabase';
import serviceAccount from '../../google-credentials.json';

export const DRIVE_CONFIG = {
  rhFolderId: (import.meta.env.VITE_DRIVE_RH_FOLDER_ID as string) || '17Neh8Ngob6sCTsThY73MyGb0AtVVI4Qv',
  frotaFolderId: (import.meta.env.VITE_DRIVE_FROTA_FOLDER_ID as string) || '1euaw3LAbdxek1Dh-qbUxUMeMPEL5XKsd'
};

export function getDriveFolderId(pastaTipo: 'rh' | 'frota'): string {
  return pastaTipo === 'rh' ? DRIVE_CONFIG.rhFolderId : DRIVE_CONFIG.frotaFolderId;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getServiceAccountToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60) return cachedAccessToken.token;

  const header = JSON.stringify({ alg: 'RS256', typ: 'JWT' });
  const claimSet = JSON.stringify({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/drive',
    aud: serviceAccount.token_uri,
    exp: now + 3600,
    iat: now
  });
  const jwt = KJUR.jws.JWS.sign(null, header, claimSet, serviceAccount.private_key);
  const res = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  if (!res.ok) throw new Error(`Falha na autenticação da conta de serviço Google Drive: ${await res.text()}`);
  const tokenData = await res.json();
  cachedAccessToken = { token: tokenData.access_token, expiresAt: now + (tokenData.expires_in || 3600) };
  return cachedAccessToken.token;
}

async function getAccessTokenForUpload(): Promise<string> {
  if (typeof window !== 'undefined') {
    const local = localStorage.getItem('terragest_google_drive_token');
    if (local) return local;
  }
  try {
    const { data: userData } = await supabase.auth.getUser();
    const activeTenant = typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null;
    const tenantId = activeTenant || userData.user?.user_metadata?.tenant_id || '00000000-0000-0000-0000-000000000001';
    const { data: integ } = await supabase
      .from('tenant_integrations')
      .select('access_token')
      .eq('tenant_id', tenantId)
      .eq('provider', 'GOOGLE_DRIVE')
      .maybeSingle();

    if (integ?.access_token) return integ.access_token;
  } catch {}
  return getServiceAccountToken();
}

export async function uploadParaGoogleDrive(
  arquivo: File,
  pastaTipo: 'rh' | 'frota'
): Promise<{ sucesso: boolean; driveUrl?: string; fileId?: string; erro?: string }> {
  try {
    const folderId = getDriveFolderId(pastaTipo);
    const token = await getAccessTokenForUpload();

    const metadata: Record<string, any> = { name: `${Date.now()}_${arquivo.name}`, parents: [folderId] };
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileBytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(arquivo);
    });

    const criarBlob = (meta: Record<string, any>) => new Blob([
      `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(meta)}\r\n`,
      `${delimiter}Content-Type: ${arquivo.type || 'application/octet-stream'}\r\n\r\n`,
      new Uint8Array(fileBytes),
      closeDelimiter
    ], { type: `multipart/related; boundary=${boundary}` });

    const apiUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink';
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);

    let uploadRes = await fetch(apiUrl, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: criarBlob(metadata),
      signal: controller.signal
    });
    clearTimeout(timer);

    if (!uploadRes.ok && uploadRes.status !== 403) {
      uploadRes = await fetch(apiUrl, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: criarBlob({ name: metadata.name })
      });
    }

    if (!uploadRes.ok) {
      const errTxt = await uploadRes.text();
      let friendly = errTxt;
      try {
        const json = JSON.parse(errTxt);
        friendly = json?.error?.message || friendly;
      } catch {}
      if (friendly.includes('storage quota')) {
        friendly = 'Cota do Drive pessoal: Conecte sua conta do Google em Minha Empresa > Integrações para sincronização em nuvem.';
      }
      throw new Error(friendly);
    }

    const fileResult = await uploadRes.json();
    const driveUrl = fileResult.webViewLink || `https://drive.google.com/file/d/${fileResult.id}/view`;
    return { sucesso: true, driveUrl, fileId: fileResult.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha no upload para o Drive';
    return { sucesso: false, erro: msg };
  }
}

