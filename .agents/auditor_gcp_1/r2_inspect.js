const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '../..');

const r2 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-event-pubsub/index.html'), 'utf8');
const lines = r2.split('\n');

// Find occurrences of crc32, histogram, poisson, lognormal, catmull
console.log('--- R2 pubsub inspection ---');
lines.forEach((l, i) => {
  if (/crc32|partition|histogram|sla|catmull|poisson|burst|deadletter|replay/i.test(l)) {
    console.log(`${i+1}: ${l}`);
  }
});
