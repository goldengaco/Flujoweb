const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '../..');

const r5 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-cloudops-cockpit/index.html'), 'utf8');
const lines = r5.split('\n');
console.log(lines.slice(3030, 3130).map((l, i) => `${3031+i}: ${l}`).join('\n'));
