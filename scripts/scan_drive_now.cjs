const fs = require('fs');
const { KJUR } = require('jsrsasign');

const serviceAccount = JSON.parse(fs.readFileSync('google-credentials.json', 'utf8'));

async function scanDriveFoldersNow() {
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
  console.log("Token obtido com sucesso.");

  // 1. Listar arquivos em Frota_Fotos (17Neh8Ngob6sCTsThY73MyGb0AtVVI4Qv)
  const qFrota = await fetch("https://www.googleapis.com/drive/v3/files?q='17Neh8Ngob6sCTsThY73MyGb0AtVVI4Qv'+in+parents+and+trashed=false&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,name,size,mimeType,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const resFrota = await qFrota.json();
  console.log(`\n=== ARQUIVOS NA PASTA Frota_Fotos (${resFrota.files?.length || 0}) ===`);
  resFrota.files?.forEach(f => {
    console.log(`- [FROTA] ${f.name} | ID: ${f.id} | Data: ${f.createdTime} | Link: ${f.webViewLink}`);
  });

  // 2. Listar arquivos em RH_Documentos (1euaw3LAbdxek1Dh-qbUxUMeMPEL5XKsd)
  const qRh = await fetch("https://www.googleapis.com/drive/v3/files?q='1euaw3LAbdxek1Dh-qbUxUMeMPEL5XKsd'+in+parents+and+trashed=false&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,name,size,mimeType,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const resRh = await qRh.json();
  console.log(`\n=== ARQUIVOS NA PASTA RH_Documentos (${resRh.files?.length || 0}) ===`);
  resRh.files?.forEach(f => {
    console.log(`- [RH] ${f.name} | ID: ${f.id} | Data: ${f.createdTime} | Link: ${f.webViewLink}`);
  });

  // 3. Listar TODOS os arquivos acessíveis pela conta de serviço
  const qAll = await fetch("https://www.googleapis.com/drive/v3/files?pageSize=100&supportsAllDrives=true&includeItemsFromAllDrives=true&q=trashed=false&fields=files(id,name,size,mimeType,createdTime,webViewLink,parents)", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const resAll = await qAll.json();
  console.log(`\n=== TODOS OS ARQUIVOS ACESSÍVEIS (${resAll.files?.length || 0}) ===`);
  resAll.files?.forEach(f => {
    console.log(`- ${f.name} | Parents: ${JSON.stringify(f.parents)} | ID: ${f.id} | Link: ${f.webViewLink}`);
  });
}

scanDriveFoldersNow();

