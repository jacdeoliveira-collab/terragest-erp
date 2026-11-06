const fs = require('fs');
const { KJUR } = require('jsrsasign');

const serviceAccount = JSON.parse(fs.readFileSync('google-credentials.json', 'utf8'));

async function checkJairOwner() {
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

  // Checar arquivo Jair
  const fCheck = await fetch("https://www.googleapis.com/drive/v3/files/1lAqW6BLlfFmxdvD8lI48qeFHnA18s3_n?fields=id,name,owners,sharingUser", {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log(`Info do arquivo Jair:`, JSON.stringify(await fCheck.json(), null, 2));
}

checkJairOwner();

