const fs = require('fs');
const path = require('path');

function processDir(dir) {
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) {
      processDir(p);
    } else if (p.endsWith('.jsx')) {
      let content = fs.readFileSync(p, 'utf8');
      
      // Replace fixed string classNames
      content = content.replace(/<span\s+className="material-symbols-outlined([^"]*)"/g, '<span translate="no" className="material-symbols-outlined notranslate$1"');
      
      // Replace template literal classNames
      content = content.replace(/<span\s+className=\{`material-symbols-outlined/g, '<span translate="no" className={`material-symbols-outlined notranslate');
      
      // Logo in Sidebar.jsx
      if (p.endsWith('Sidebar.jsx')) {
        content = content.replace(
          /<div className="font-display text-2xl font-bold text-on-surface tracking-tight">NutriShield<\/div>/g, 
          '<div translate="no" className="font-display text-2xl font-bold text-on-surface tracking-tight notranslate">NutriShield</div>'
        );
        content = content.replace(
          /<span className="material-symbols-outlined text-primary text-3xl">eco<\/span>/g,
          '<span translate="no" className="material-symbols-outlined notranslate text-primary text-3xl">eco</span>'
        );
      }
      
      fs.writeFileSync(p, content);
    }
  }
}
processDir('c:/Users/amayn/OneDrive/Desktop/Nutrisheild/frontend/src');
console.log('Fixed all translation bugs.');
