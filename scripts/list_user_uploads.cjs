const fs = require('fs');
const path = require('path');

const uploadDir = 'C:/Users/aster/.gemini/antigravity/brain/c4366eb9-82cf-4ecf-9fff-1a1a5ca09402/.user_uploaded';

if (fs.existsSync(uploadDir)) {
  const files = fs.readdirSync(uploadDir);
  console.log(`Found ${files.length} uploaded files in ${uploadDir}:`);
  files.forEach(f => {
    const stats = fs.statSync(path.join(uploadDir, f));
    console.log(`- ${f} | size: ${(stats.size / 1024).toFixed(1)} KB | date: ${stats.mtime.toISOString()}`);
  });
} else {
  console.log("Upload dir does not exist");
}

