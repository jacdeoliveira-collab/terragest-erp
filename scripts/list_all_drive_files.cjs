const fs = require('fs');
const { KJUR } = require('jsrsasign');

const serviceAccount = JSON.parse(fs.readFileSync('google-credentials.json', 'utf8'));

async function listAllDriveFiles() {
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
  console.log("Token obtido.");

  // Listar todos os arquivos acessíveis
  const driveRes = await fetch('https://www.googleapis.com/drive/v3/files?pageSize=100&fields=files(id,name,mimeType,createdTime,size,webViewLink,parents)&supportsAllDrives=true&includeItemsFromAllDrives=true', {
    headers: { Authorization: `Bearer ${token}` }
  });

  const list = await driveRes.json();
  console.log(`Arquivos no Google Drive (total: ${list.files?.length || 0}):`);
  list.files?.forEach(f => {
    console.log(`- ${f.name} | ID: ${f.id} | Data: ${f.createdTime} | Size: ${f.size} | Link: ${f.webViewLink}`);
  });
}

listAllDriveFiles();

