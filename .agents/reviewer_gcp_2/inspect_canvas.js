const fs = require('fs');
const r2 = fs.readFileSync('c:/DevWork/Depredador/Flujoweb/sistemas/gcp-event-pubsub/index.html', 'utf8');
console.log('R2 Canvas tags:', r2.match(/<canvas[^>]+>/gi));
