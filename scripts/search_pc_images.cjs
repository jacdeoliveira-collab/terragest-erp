const fs = require('fs');
const path = require('path');

const dirsToCheck = [
  'C:/Users/aster/Downloads',
  'C:/Users/aster/Pictures',
  'C:/Users/aster/Desktop',
  'C:/Users/aster/Documents',
  'C:/Users/aster/Google Drive',
  'C:/Users/aster/OneDrive'
];

dirsToCheck.forEach(dir => {
  if (fs.existsSync(dir)) {
    try {
      const files = fs.readdirSync(dir);
      console.log(`\n=== DIR: ${dir} (${files.length} itens) ===`);
      files.forEach(f => {
        const lower = f.toLowerCase();
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.includes('hor') || lower.includes('foto') || lower.includes('painel') || lower.includes('barroso') || lower.includes('nilo') || lower.includes('escavadeira') || lower.includes('terragest')) {
          console.log(`  - ${f}`);
        }
      });
    } catch (e) {
      console.log(`  Erro lendo ${dir}: ${e.message}`);
    }
  } else {
    console.log(`Dir não existe: ${dir}`);
  }
});

