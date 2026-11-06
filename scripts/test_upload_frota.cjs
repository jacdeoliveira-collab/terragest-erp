const fs = require('fs');
const { KJUR } = require('jsrsasign');

const serviceAccount = JSON.parse(fs.readFileSync('google-credentials.json', 'utf8'));

async function checkPermissions() {
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

  // Checar permissões na pasta Frota_Fotos
  const fCheck = await fetch("https://www.googleapis.com/drive/v3/files/17Neh8Ngob6sCTsThY73MyGb0AtVVI4Qv?fields=id,name,permissions", {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`Permissões Frota_Fotos:`, JSON.stringify(await fCheck.json(), null, 2));

  // Checar se o Service Account consegue criar um arquivo de teste dentro de Frota_Fotos agora!
  console.log("Tentando criar arquivo de teste em Frota_Fotos...");
  const meta = { name: "teste_terragest.txt", parents: ["17Neh8Ngob6sCTsThY73MyGb0AtVVI4Qv"] };
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;
  const body = delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(meta) + '\r\n' +
    delimiter +
    'Content-Type: text/plain\r\n\r\n' +
    'TerraGest Teste\r\n' +
    closeDelimiter;

  const up = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true", {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body
  });
  console.log("Status upload teste:", up.status);
  const upText = await up.text();
  console.log("Resposta upload teste:", upText);
}

checkPermissions();

