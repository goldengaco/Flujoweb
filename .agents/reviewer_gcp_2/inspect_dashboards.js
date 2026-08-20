const fs = require('fs');
const path = require('path');

const sistemasDir = path.resolve('c:/DevWork/Depredador/Flujoweb/sistemas');
const dashboards = [
  { name: 'R1: Serverless Pipeline', path: path.join(sistemasDir, 'gcp-serverless-pipeline', 'index.html') },
  { name: 'R2: Event PubSub DLQ', path: path.join(sistemasDir, 'gcp-event-pubsub', 'index.html') },
  { name: 'R3: Cloud SQL HA', path: path.join(sistemasDir, 'gcp-sql-networking', 'index.html') },
  { name: 'R4: IAM Security', path: path.join(sistemasDir, 'gcp-iam-security', 'index.html') },
  { name: 'R5: CloudOps SRE Cockpit', path: path.join(sistemasDir, 'gcp-cloudops-cockpit', 'index.html') },
];

console.log('=== GCP DASHBOARD INTEGRITY & ARCHITECTURE AUDIT ===\n');

dashboards.forEach(d => {
  if (!fs.existsSync(d.path)) {
    console.error(`MISSING: ${d.name} at ${d.path}`);
    return;
  }
  const content = fs.readFileSync(d.path, 'utf8');
  const size = fs.statSync(d.path).size;
  const lines = content.split('\n').length;
  
  // Find GCP APIs
  const apiMatches = content.match(/[a-z0-9_-]+\.googleapis\.com/gi) || [];
  const uniqueApis = [...new Set(apiMatches.map(a => a.toLowerCase()))];
  
  // Check Canvas
  const hasCanvas = content.includes('<canvas');
  const hasRaf = content.includes('requestAnimationFrame');
  const canvasCount = (content.match(/<canvas/gi) || []).length;
  
  // Check Interactive Controls
  const buttonCount = (content.match(/<button/gi) || []).length;
  const inputCount = (content.match(/<input/gi) || []).length;
  const sliderCount = (content.match(/type=["']range["']/gi) || []).length;
  
  // Check state machine / data structures
  const hasStateMachine = /state|status|transition|phase|step/i.test(content);
  
  console.log(`--- [${d.name}] ---`);
  console.log(`File: ${d.path}`);
  console.log(`Size: ${(size / 1024).toFixed(2)} KB | Lines: ${lines}`);
  console.log(`GCP APIs (${uniqueApis.length}): ${uniqueApis.join(', ')}`);
  console.log(`Canvas count: ${canvasCount} | RAF loop: ${hasRaf ? 'YES' : 'NO'}`);
  console.log(`Buttons: ${buttonCount} | Inputs: ${inputCount} | Sliders: ${sliderCount}`);
  console.log('');
});
