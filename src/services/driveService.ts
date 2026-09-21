/**
 * TerraGest SaaS - Serviço de Upload com Conta de Serviço Google Drive
 * Arquivo: driveService.ts (< 150 linhas)
 */
import { KJUR } from 'jsrsasign';
import serviceAccount from '../../google-credentials.json';

export const DRIVE_CONFIG = {
  rhFolderId: (import.meta.env.VITE_DRIVE_RH_FOLDER_ID as string) || '17Neh8Ngob6sCTsThY73MyGb0AtVVI4Qv',
  frotaFolderId: (import.meta.env.VITE_DRIVE_FROTA_FOLDER_ID as string) || '1euaw3LAbdxek1Dh-qbUxUMeMPEL5XKsd'
};

export function getDriveFolderId(pastaTipo: 'rh' | 'frota'): string {
  return pastaTipo === 'rh' ? DRIVE_CONFIG.rhFolderId : DRIVE_CONFIG.frotaFolderId;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

async function getGoogleDriveAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 60) {
    return cachedAccessToken.token;
  }

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

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Falha na autenticação com Google Drive API: ${errorText}`);
  }

  const tokenData = await res.json();
  cachedAccessToken = {
    token: tokenData.access_token,
    expiresAt: now + (tokenData.expires_in || 3600)
  };

  return cachedAccessToken.token;
}

export async function uploadParaGoogleDrive(
  arquivo: File,
  pastaTipo: 'rh' | 'frota'
): Promise<{ sucesso: boolean; driveUrl?: string; fileId?: string; erro?: string }> {
  try {
    const folderId = getDriveFolderId(pastaTipo);
    const token = await getGoogleDriveAccessToken();

    const metadata = {
      name: `${Date.now()}_${arquivo.name}`,
      parents: [folderId]
    };

    const boundary = '-------314159265358979323846';
    const delimiter = `\r\n--${boundary}\r\n`;
    const closeDelimiter = `\r\n--${boundary}--`;

    const reader = new FileReader();
    const fileDataPromise = new Promise<ArrayBuffer>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = reject;
      reader.readAsArrayBuffer(arquivo);
    });
    const fileBytes = await fileDataPromise;

    const metadataHeader = `${delimiter}Content-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n`;
    const mediaHeader = `${delimiter}Content-Type: ${arquivo.type || 'application/octet-stream'}\r\n\r\n`;

    const blob = new Blob(
      [metadataHeader, mediaHeader, new Uint8Array(fileBytes), closeDelimiter],
      { type: `multipart/related; boundary=${boundary}` }
    );

    const uploadRes = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: blob
      }
    );

    if (!uploadRes.ok) {
      const errTxt = await uploadRes.text();
      throw new Error(`Erro no envio para Google Drive: ${errTxt}`);
    }

    const fileResult = await uploadRes.json();
    const driveUrl = fileResult.webViewLink || `https://drive.google.com/file/d/${fileResult.id}/view`;

    return {
      sucesso: true,
      driveUrl,
      fileId: fileResult.id
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Falha desconhecida no upload para o Drive';
    return { sucesso: false, erro: msg };
  }
}
