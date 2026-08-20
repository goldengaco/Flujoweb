const fs = require('fs');
const path = require('path');

console.log('=== VERIFYING DOCUMENTATION MANUALS ===');
const base = path.resolve('sistemas');
const docs = [
  'manual_observabilidad_cloud_sre.md',
  'mulesoft_y_arquitectura_sistemas.md',
  'mulesoft_80_ideas_observabilidad.md'
];

docs.forEach(d => {
  const p = path.join(base, d);
  const exists = fs.existsSync(p);
  if (exists) {
    const stat = fs.statSync(p);
    const content = fs.readFileSync(p, 'utf8');
    const lines = content.split('\n');
    const h1 = lines.filter(l => l.startsWith('# '));
    const h2 = lines.filter(l => l.startsWith('## '));
    const h3 = lines.filter(l => l.startsWith('### '));
    const codeBlocks = lines.filter(l => l.trim().startsWith('```'));
    const tables = lines.filter(l => l.trim().startsWith('|') && l.trim().endsWith('|'));
    console.log(`[DOC] ${d}:`);
    console.log(`  - Exists: true`);
    console.log(`  - Size: ${stat.size} bytes`);
    console.log(`  - Lines: ${lines.length}`);
    console.log(`  - H1 count: ${h1.length}`);
    console.log(`  - H2 count: ${h2.length}`);
    console.log(`  - H3 count: ${h3.length}`);
    console.log(`  - Code block markers: ${codeBlocks.length}`);
    console.log(`  - Table rows: ${tables.length}`);
  } else {
    console.log(`[DOC] ${d}: NOT FOUND!`);
  }
});

console.log('\n=== VERIFYING PORTAL INDEX.HTML AND SYSTEMS MANIFEST ===');
const portalPath = path.join(base, 'index.html');
if (fs.existsSync(portalPath)) {
  const portalHtml = fs.readFileSync(portalPath, 'utf8');
  console.log(`Portal index.html Size: ${portalHtml.length} bytes`);

  // Extract JSON manifest
  const manifestMatch = portalHtml.match(/const\s+SYSTEMS_MANIFEST\s*=\s*(\[[\s\S]*?\]);/);
  if (manifestMatch) {
    try {
      const manifest = eval(manifestMatch[1]);
      console.log(`Manifest contains ${manifest.length} systems:`);
      manifest.forEach((sys, idx) => {
        const fullHref = path.resolve(base, sys.href);
        const linkExists = fs.existsSync(fullHref);
        console.log(`  ${idx + 1}. [${sys.id}] category: ${sys.category}, badges: [${sys.badges.join(', ')}], href: ${sys.href}, Target exists: ${linkExists}`);
      });
    } catch (e) {
      console.error('Failed to parse SYSTEMS_MANIFEST:', e.message);
    }
  } else {
    console.log('SYSTEMS_MANIFEST regex did not match.');
  }
} else {
  console.log('Portal index.html not found!');
}
