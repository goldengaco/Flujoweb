const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '../..');

const r5 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-cloudops-cockpit/index.html'), 'utf8');

// Find all canvas rendering functions in R5
const r5Matches = [...r5.matchAll(/function\s+([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{/g)].map(m => m[1]);
console.log('Functions in R5:', r5Matches);

// Find animationLoop or canvas drawing
const anim = r5.match(/function animationLoop[\s\S]*?\n    \}/);
if (anim) {
  console.log('animationLoop in R5:\n', anim[0]);
}

// Find renderMesh or renderRadar
const drawFns = r5.match(/(?:render|draw)[a-zA-Z0-9_]+\s*[:=]\s*function[\s\S]*?\n    \}|function (?:render|draw)[a-zA-Z0-9_]+[\s\S]*?\n    \}/g) || [];
console.log('Draw functions in R5:\n', drawFns.map(f => f.slice(0, 200)));
