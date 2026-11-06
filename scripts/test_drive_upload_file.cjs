const fs = require('fs');
const { KJUR } = require('jsrsasign');

const serviceAccount = JSON.parse(fs.readFileSync('google-credentials.json', 'utf8'));

async function testUploadFile() {
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
  console.log("Got access token");

  const folderId = '1euaw3LAbdxek1Dh-qbUxUMeMPEL5XKsd'; // frota
  const metadata = { name: `teste_${Date.now()}.txt`, parents: [folderId] };
  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;
  const fileContent = "Hello from TerraGest ERP test upload";

  const multipartBody = 
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) + '\r\n' +
    delimiter +
    'Content-Type: text/plain\r\n\r\n' +
    fileContent +
    closeDelimiter;

  const uploadRes = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: multipartBody
  });

  console.log("Upload status:", uploadRes.status);
  const text = await uploadRes.text();
  console.log("Upload response:", text);
}

testUploadFile();

