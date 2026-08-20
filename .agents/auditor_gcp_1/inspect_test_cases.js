const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '../..');

const t1 = fs.readFileSync(path.join(projectRoot, 'tests/gcp_tier1_features.js'), 'utf8');
const lines = t1.split('\n');
console.log('Sample test cases from gcp_tier1_features.js:');
console.log(lines.slice(0, 100).join('\n'));
