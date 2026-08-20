const fs = require('fs');
const path = require('path');
const file = path.resolve('c:/DevWork/Depredador/Flujoweb/tests/gcp_tier2_boundaries.js');
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

lines.forEach((line, idx) => {
  if (/assertTrue\s*\(\s*true\s*[,)]/i.test(line)) {
    console.log(`Line ${idx+1}: ${line}`);
    console.log('Context:');
    console.log(lines.slice(Math.max(0, idx-5), Math.min(lines.length, idx+6)).join('\n'));
  }
});
