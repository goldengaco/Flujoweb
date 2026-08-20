const fs = require('fs');

const tx = fs.readFileSync('sistemas/transaction-flow/index.html', 'utf8');
const ids = [...tx.matchAll(/id="([^"]+)"/g)].map(m => m[1]);
console.log('All IDs in transaction flow:', ids);

// Look for step or node classes
const nodeElements = [...tx.matchAll(/<div[^>]*class="[^"]*(?:node|step|card|branch)[^"]*"[^>]*>/g)];
console.log('Node/Step/Card/Branch divs:');
nodeElements.forEach(m => console.log(m[0]));
