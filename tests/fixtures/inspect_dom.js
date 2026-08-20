const fs = require('fs');
const path = require('path');

const systems = ['security-audit', 'server-status', 'transaction-flow'];

systems.forEach(sys => {
  const p = path.join(__dirname, '..', '..', 'sistemas', sys, 'index.html');
  if (!fs.existsSync(p)) {
    console.log(`[${sys}] Not found`);
    return;
  }
  const content = fs.readFileSync(p, 'utf8');
  console.log(`\n================== ${sys} ==================`);
  
  // Find all IDs
  const idMatches = content.match(/id=["']([^"']+)["']/g) || [];
  const ids = idMatches.map(m => m.replace(/id=["']/, '').replace(/["']/, ''));
  console.log('IDs (' + ids.length + '):', ids.slice(0, 30).join(', '));
  if (ids.length > 30) console.log('  ...', ids.slice(30).join(', '));

  // Find buttons
  const btnMatches = content.match(/<button[^>]*>([\s\S]*?)<\/button>/g) || [];
  console.log('Buttons (' + btnMatches.length + '):');
  btnMatches.slice(0, 10).forEach(b => console.log('  ', b.replace(/\s+/g, ' ').slice(0, 120)));

  // Find canvases/svgs
  const canvases = content.match(/<canvas[^>]*>/g) || [];
  console.log('Canvases:', canvases);
});
