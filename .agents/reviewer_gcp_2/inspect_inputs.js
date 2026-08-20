const fs = require('fs');
const path = require('path');

const r1 = fs.readFileSync('c:/DevWork/Depredador/Flujoweb/sistemas/gcp-serverless-pipeline/index.html', 'utf8');
const r2 = fs.readFileSync('c:/DevWork/Depredador/Flujoweb/sistemas/gcp-event-pubsub/index.html', 'utf8');
const r4 = fs.readFileSync('c:/DevWork/Depredador/Flujoweb/sistemas/gcp-iam-security/index.html', 'utf8');

console.log('R1 Sliders/Inputs:', r1.match(/<input[^>]+>/gi));
console.log('R2 Sliders/Inputs:', r2.match(/<input[^>]+>/gi));
console.log('R4 Sliders/Inputs:', r4.match(/<input[^>]+>/gi));
