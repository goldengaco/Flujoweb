const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '../..');

const r1 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-serverless-pipeline/index.html'), 'utf8');
const r2 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-event-pubsub/index.html'), 'utf8');
const r3 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-sql-networking/index.html'), 'utf8');
const r4 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-iam-security/index.html'), 'utf8');
const r5 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-cloudops-cockpit/index.html'), 'utf8');

console.log('================================================================');
console.log('=== DETAILED SIMULATION LOGIC INSPECTION ===');
console.log('================================================================\n');

// 1. R2 Poisson Generator & Log-normal SLA distribution
console.log('--- [R2] POISSON GENERATOR & LOG-NORMAL LATENCY SLA HISTOGRAM ---');
const r2Script = r2.substring(r2.indexOf('<script>'), r2.lastIndexOf('</script>'));
// Look for distribution generator or math in R2
const r2MathMatches = r2Script.match(/(function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{[\s\S]*?\n\})/g) || [];
r2MathMatches.forEach(fn => {
  if (/poisson|lognormal|boxmuller|normal|gaussian|crc32|sla|histogram|throughput|publish|process/i.test(fn)) {
    console.log(fn.substring(0, 500) + '\n...\n');
  }
});

// Also check CRC32 implementation in R2
console.log('--- [R2] CRC32 ORDERING KEY HASHING ---');
const crcMatches = r2Script.match(/function\s+crc32[\s\S]*?\n\}/g) || [];
if (crcMatches.length > 0) {
  console.log(crcMatches[0]);
}

// 2. R1 Bézier Particle Routing & Traffic Splitter
console.log('\n--- [R1] BÉZIER PARTICLE BEAM ROUTER & TRAFFIC SPLITTING ---');
const r1Script = r1.substring(r1.indexOf('<script>'), r1.lastIndexOf('</script>'));
const r1CanvasMatches = r1Script.match(/(function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{[\s\S]*?\n\})/g) || [];
r1CanvasMatches.forEach(fn => {
  if (/particle|traffic|canvas|bezier|route|render/i.test(fn)) {
    console.log(fn.substring(0, 500) + '\n...\n');
  }
});

// 3. R3 PostgreSQL Lock Table & Automated Primary Crash / Failover Engine
console.log('\n--- [R3] POSTGRESQL LOCK TABLE & 7-STEP FAILOVER ENGINE ---');
const r3Script = r3.substring(r3.indexOf('<script>'), r3.lastIndexOf('</script>'));
const r3LockMatches = r3Script.match(/(function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{[\s\S]*?\n\})/g) || [];
r3LockMatches.forEach(fn => {
  if (/lock|crash|failover|promote|reprovision|cmek|pg_/i.test(fn)) {
    console.log(fn.substring(0, 500) + '\n...\n');
  }
});

// 4. R4 GCP IAM Downscoping & Least-Privilege Risk Matrix
console.log('\n--- [R4] GCP IAM DOWNSCOPING & SECRET LIFECYCLE ---');
const r4Script = r4.substring(r4.indexOf('<script>'), r4.lastIndexOf('</script>'));
const r4IamMatches = r4Script.match(/(function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{[\s\S]*?\n\})/g) || [];
r4IamMatches.forEach(fn => {
  if (/downscope|remediate|revoke|rotate|destroy|secret|quota|hsm|matrix/i.test(fn)) {
    console.log(fn.substring(0, 500) + '\n...\n');
  }
});

// 5. R5 Google SRE Multi-Burn-Rate Engine & 4 Golden Signals & Particle Mesh
console.log('\n--- [R5] GOOGLE SRE MULTI-BURN-RATE ENGINE & GOLDEN SIGNALS ---');
const r5Script = r5.substring(r5.indexOf('<script>'), r5.lastIndexOf('</script>'));
const r5SreMatches = r5Script.match(/(function\s+[a-zA-Z0-9_]+\s*\([^)]*\)\s*\{[\s\S]*?\n\})/g) || [];
r5SreMatches.forEach(fn => {
  if (/burn|slo|budget|golden|radar|mesh|log|action|mitigat/i.test(fn)) {
    console.log(fn.substring(0, 500) + '\n...\n');
  }
});
