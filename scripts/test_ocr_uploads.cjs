const fs = require('fs');

async function testOcr() {
  const f1 = 'C:/Users/aster/.gemini/antigravity/brain/c4366eb9-82cf-4ecf-9fff-1a1a5ca09402/.user_uploaded/media_1793486284298_c2e5b908.jpg';
  const f2 = 'C:/Users/aster/.gemini/antigravity/brain/c4366eb9-82cf-4ecf-9fff-1a1a5ca09402/.user_uploaded/media_1793486284347_3d24e460.jpg';

  console.log("File 1 exists:", fs.existsSync(f1));
  console.log("File 2 exists:", fs.existsSync(f2));
}

testOcr();

