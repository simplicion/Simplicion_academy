const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const f of files) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) {
      processDir(full);
    } else if (f.endsWith('.md')) {
      let content = fs.readFileSync(full, 'utf8');
      // Replace garbled UTF-8 artifacts
      content = content.replace(/\u00e2\u0080\u0093/g, '—')
                       .replace(/\u00e2\u0080\u0094/g, '—')
                       .replace(/\u00e2\u0080/g, '')
                       .replace(/â€“/g, '—')
                       .replace(/â€”/g, '—');
      fs.writeFileSync(full, content, 'utf8');
    }
  }
}

processDir('./docs');
console.log('Successfully cleaned all markdown file encodings!');
