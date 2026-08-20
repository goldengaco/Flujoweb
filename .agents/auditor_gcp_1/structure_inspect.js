const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '../..');

const files = [
  { name: 'R1', path: 'sistemas/gcp-serverless-pipeline/index.html' },
  { name: 'R2', path: 'sistemas/gcp-event-pubsub/index.html' },
  { name: 'R3', path: 'sistemas/gcp-sql-networking/index.html' },
  { name: 'R4', path: 'sistemas/gcp-iam-security/index.html' },
  { name: 'R5', path: 'sistemas/gcp-cloudops-cockpit/index.html' }
];

files.forEach(f => {
  const content = fs.readFileSync(path.join(projectRoot, f.path), 'utf8');
  console.log(`\n================== ${f.name} STRUCTURE ==================`);
  
  // Find script blocks
  const scriptRegex = /<script>([\s\S]*?)<\/script>/gi;
  let match;
  let idx = 0;
  while ((match = scriptRegex.exec(content)) !== null) {
    idx++;
    const script = match[1];
    console.log(`Script block #${idx} (${script.length} characters)`);
    
    // Find top-level variables, objects, classes, and main structures
    const declarations = script.match(/(?:const|let|var|class|function)\s+([a-zA-Z0-9_$]+)/g) || [];
    console.log('Key declarations:', [...new Set(declarations)].slice(0, 25).join(', '));
  }
});
