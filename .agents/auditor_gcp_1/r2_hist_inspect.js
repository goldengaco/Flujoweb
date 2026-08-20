const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '../..');

const r2 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-event-pubsub/index.html'), 'utf8');
const lines = r2.split('\n');
console.log(lines.slice(2530, 2590).map((l, i) => `${2531+i}: ${l}`).join('\n'));
