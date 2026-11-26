import { KJUR } from 'jsrsasign';
import { supabase } from '../lib/supabase';
import serviceAccount from '../../google-credentials.json';

const PROD_DRIVE_AUTH_URL = 'https://terragest.agrodronesma.com.br/api/google-drive-auth';

export const DRIVE_CONFIG = {
  rhFolderId: (import.meta.env.VITE_DRIVE_RH_FOLDER_ID as string) || '1euaw3LAbdxek1Dh-qbUxUMeMPEL5XKsd',
  frotaFolderId: (import.meta.env.VITE_DRIVE_FROTA_FOLDER_ID as string) || '17Neh8Ngob6sCTsThY73MyGb0AtVVI4Qv'
};

export function getDriveFolderId(pastaTipo: 'rh' | 'frota'): string {
  return pastaTipo === 'rh' ? DRIVE_CONFIG.rhFolderId : DRIVE_CONFIG.frotaFolderId;
}

let cachedServiceToken: { token: string; expiresAt: number } | null = null;

async function getServiceAccountToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedServiceToken && cachedServiceToken.expiresAt > now + 60) return cachedServiceToken.token;
  const header = JSON.stringify({ alg: 'RS256', typ: 'JWT' });
  const claimSet = JSON.stringify({
    iss: serviceAccount.client_email, scope: 'https://www.googleapis.com/auth/drive',
    aud: serviceAccount.token_uri, exp: now + 3600, iat: now
  });
  const jwt = KJUR.jws.JWS.sign(null, header, claimSet, serviceAccount.private_key);
  const res = await fetch(serviceAccount.token_uri, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  if (!res.ok) throw new Error(`Falha na autenticação Google Drive: ${await res.text()}`);
  const tokenData = await res.json();
  cachedServiceToken = { token: tokenData.access_token, expiresAt: now + (tokenData.expires_in || 3600) };
  return cachedServiceToken.token;
}

async function renovarTokenNoServidor(tenantId: string): Promise<string | null> {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const jwt = sessionData.session?.access_token;
    const isCap = typeof window !== 'undefined' && window.location.protocol === 'capacitor:';
    const apiUrl = isCap ? PROD_DRIVE_AUTH_URL : '/api/google-drive-auth';
    const resp = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}) },
      body: JSON.stringify({ action: 'refresh', tenantId })
    });
    if (!resp.ok) return null;
    const data = await resp.json();
    if (data?.access_token && typeof window !== 'undefined') {
      localStorage.setItem('terragest_google_drive_token', data.access_token);
      localStorage.setItem('terragest_google_drive_token_time', String(Date.now()));
      return data.access_token;
    }
  } catch {}
  return null;
}

async function getAccessTokenForUpload(forceRefresh = false): Promise<string> {
  const activeTenant = typeof window !== 'undefined' ? localStorage.getItem('terragest_tenant_ativo_id') : null;
  if (!forceRefresh && typeof window !== 'undefined') {
    const local = localStorage.getItem('terragest_google_drive_token');
    const tokenTime = localStorage.getItem('terragest_google_drive_token_time');
    if (local && tokenTime && Date.now() - Number(tokenTime) < 3000 * 1000) return local;
  }

  let tenantId = activeTenant;
  if (!tenantId) {
    const { data: userData } = await supabase.auth.getUser();
    tenantId = (userData.user?.user_metadata?.tenant_id as string | undefined) || userData.user?.id || null;
  }

  if (tenantId) {
    const refreshed = await renovarTokenNoServidor(tenantId);
    if (refreshed) return refreshed;
  }

  return getServiceAccountToken();
}

export async function uploadParaGoogleDrive(
  arquivo: File,
  pastaTipo: 'rh' | 'frota'
): Promise<{ sucesso: boolean; driveUrl?: string; fileId?: string; erro?: string }> {
  try {
    const folderId = getDriveFolderId(pastaTipo);
    let token = await getAccessTokenForUpload(false);

    const metadata = { name: `${Date.now()}_${arquivo.name}`, parents: [folderId] };
    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const fileBytes = await new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(arquivo);
    });

    const bodyBlob = new Blob([
      `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`,
      `${delimiter}Content-Type: ${arquivo.type || 'application/octet-stream'}\r\n\r\n`,
      new Uint8Array(fileBytes),
      closeDelimiter
    ], { type: `multipart/related; boundary=${boundary}` });

    const apiUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink';
    let uploadRes = await fetch(apiUrl, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: bodyBlob });

    if (uploadRes.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('terragest_google_drive_token');
        localStorage.removeItem('terragest_google_drive_token_time');
      }
      token = await getAccessTokenForUpload(true);
      uploadRes = await fetch(apiUrl, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: bodyBlob });
    }

    if (!uploadRes.ok) {
      const errTxt = await uploadRes.text();
      let friendly = errTxt;
      try { friendly = JSON.parse(errTxt)?.error?.message || friendly; } catch {}
      if (friendly.includes('storage quota') || friendly.includes('invalid authentication credentials')) {
        friendly = 'Conecte o Google Drive em Minha Empresa > Bancos e Drive (1 única vez) para ativar a renovação automática.';
      }
      throw new Error(friendly);
    }

    const fileResult = await uploadRes.json();
    const driveUrl = fileResult.webViewLink || `https://drive.google.com/file/d/${fileResult.id}/view`;
    return { sucesso: true, driveUrl, fileId: fileResult.id };
  } catch (err: unknown) {
    return { sucesso: false, erro: err instanceof Error ? err.message : 'Falha no upload para o Drive' };
  }
}
