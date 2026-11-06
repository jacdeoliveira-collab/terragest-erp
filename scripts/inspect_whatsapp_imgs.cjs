const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/aster/Downloads';
const files = fs.readdirSync(dir).filter(f => f.startsWith('WhatsApp Image'));

console.log(`Encontradas ${files.length} imagens do WhatsApp em Downloads:`);
files.forEach(f => {
  const stat = fs.statSync(path.join(dir, f));
  console.log(`- ${f} | ${stat.size} bytes | ${stat.mtime.toISOString()}`);
});

