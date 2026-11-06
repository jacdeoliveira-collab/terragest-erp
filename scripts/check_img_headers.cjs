const fs = require('fs');
const path = require('path');

const dir = 'C:/Users/aster/Downloads';
const files = [
  'WhatsApp Image 2026-10-28 at 09.41.40.jpeg',
  'WhatsApp Image 2026-10-28 at 11.00.25.jpeg',
  'WhatsApp Image 2026-10-28 at 11.04.02.jpeg',
  'WhatsApp Image 2026-11-03 at 10.54.36 (1).jpeg',
  'WhatsApp Image 2026-11-03 at 10.54.36 (2).jpeg',
  'WhatsApp Image 2026-11-03 at 10.54.36.jpeg'
];

files.forEach(f => {
  const p = path.join(dir, f);
  if (fs.existsSync(p)) {
    const buf = fs.readFileSync(p);
    console.log(`${f} | ${buf.length} bytes | Header: ${buf.slice(0, 10).toString('hex')}`);
  }
});

