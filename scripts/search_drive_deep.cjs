const fs = require('fs');
const { KJUR } = require('jsrsasign');

const serviceAccount = JSON.parse(fs.readFileSync('google-credentials.json', 'utf8'));

async function searchDriveFolders() {
  const now = Math.floor(Date.now() / 1000);
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

  const tokenData = await res.json();
  const token = tokenData.access_token;

  // Buscar TODOS os arquivos e pastas, inclusive em pastas compartilhadas
  let pageToken = null;
  let allFiles = [];

  do {
    let url = 'https://www.googleapis.com/drive/v3/files?pageSize=100&fields=nextPageToken,files(id,name,mimeType,createdTime,modifiedTime,size,webViewLink,parents,description)&supportsAllDrives=true&includeItemsFromAllDrives=true&q=trashed=false';
    if (pageToken) url += `&pageToken=${pageToken}`;

    const driveRes = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    const data = await driveRes.json();
    if (data.files) allFiles = allFiles.concat(data.files);
    pageToken = data.nextPageToken;
  } while (pageToken);

  console.log(`\n=== TOTAL DE ARQUIVOS LOCALIZADOS NO GOOGLE DRIVE: ${allFiles.length} ===`);
  allFiles.forEach(f => {
    console.log(`- Nome: "${f.name}" | ID: ${f.id} | Tipo: ${f.mimeType} | Data: ${f.createdTime} | Parents: ${JSON.stringify(f.parents)} | Link: ${f.webViewLink}`);
  });

  // Procurar também nos itens da lixeira caso tenham sido movidos
  const trashRes = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,mimeType,createdTime,webViewLink)&supportsAllDrives=true&includeItemsFromAllDrives=true&q=trashed=true', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const trashData = await trashRes.json();
  console.log(`\n=== ARQUIVOS NA LIXEIRA DO DRIVE: ${trashData.files?.length || 0} ===`);
  trashData.files?.forEach(f => {
    console.log(`- [LIXEIRA] "${f.name}" | ID: ${f.id} | Data: ${f.createdTime}`);
  });
}

searchDriveFolders();

