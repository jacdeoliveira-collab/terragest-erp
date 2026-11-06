const fs = require('fs');
const { KJUR } = require('jsrsasign');

const serviceAccount = JSON.parse(fs.readFileSync('google-credentials.json', 'utf8'));

async function checkFrotaFolder() {
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

  // 1. Checar pasta Frota_Fotos com ID 17Neh8Ngob6sCTsThY73MyGb0AtVVI4Qv (com 0)
  const q1 = await fetch("https://www.googleapis.com/drive/v3/files?q='17Neh8Ngob6sCTsThY73MyGb0AtVVI4Qv'+in+parents&supportsAllDrives=true&includeItemsFromAllDrives=true&fields=files(id,name,size,mimeType,createdTime,webViewLink)", {
    headers: { Authorization: `Bearer ${token}` }
  });
  const res1 = await q1.json();
  console.log(`Arquivos em Frota_Fotos (com 0):`, res1.files?.length || 0);
  res1.files?.forEach(f => console.log(`- ${f.name} | ${f.id} | ${f.webViewLink}`));

  // 2. Checar se existe pasta pai de Frota_Fotos
  const fCheck = await fetch("https://www.googleapis.com/drive/v3/files/17Neh8Ngob6sCTsThY73MyGb0AtVVI4Qv?fields=id,name,parents,owners", {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`Info da pasta Frota_Fotos:`, await fCheck.json());
}

checkFrotaFolder();

