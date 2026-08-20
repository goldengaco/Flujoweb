const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '../..');

const r1 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-serverless-pipeline/index.html'), 'utf8');
const r2 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-event-pubsub/index.html'), 'utf8');
const r3 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-sql-networking/index.html'), 'utf8');
const r4 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-iam-security/index.html'), 'utf8');
const r5 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-cloudops-cockpit/index.html'), 'utf8');

console.log('=== DEEP ALGORITHMIC VERIFICATION ===\n');

console.log('--- 1. Poisson / Inter-arrival / Log-Normal Generation in R2 Event PubSub & R4 & R5 ---');
function extractFunctions(src, namePatterns) {
  const lines = src.split('\n');
  const results = [];
  lines.forEach((line, idx) => {
    if (namePatterns.some(p => p.test(line))) {
      results.push(`Line ${idx+1}: ${line.trim()}`);
      // grab next 10 lines
      for (let i = 1; i <= 8; i++) {
        if (lines[idx + i]) results.push(`   ${lines[idx+i].trim()}`);
      }
    }
  });
  return results;
}

console.log('R2 Math / Simulation Functions:');
console.log(extractFunctions(r2, [/poisson/i, /catmull/i, /lognormal/i, /crc32/i, /spline/i, /gaussian/i, /histogram/i]).slice(0, 30).join('\n'));

console.log('\n--- 2. Catmull-Rom Spline in R2 Event PubSub ---');
console.log(extractFunctions(r2, [/drawCatmullRom|catmullRom|function.*spline|curveTo/i]).join('\n'));

console.log('\n--- 3. Bézier Routing in R1, R2, R3, R5 ---');
console.log('R1 Particle / Bézier:');
console.log(extractFunctions(r1, [/bezier|particle|quadraticCurveTo|bezierCurveTo/i]).slice(0, 15).join('\n'));
console.log('R3 Packet Router Bézier:');
console.log(extractFunctions(r3, [/bezier|packet|quadraticCurveTo|bezierCurveTo|drawNetwork/i]).slice(0, 15).join('\n'));

console.log('\n--- 4. Google SRE Burn Rate Formulas in R5 & R3 ---');
console.log('R5 SLO & Burn Rate Engine:');
console.log(extractFunctions(r5, [/burnRate|errorBudget|calculateBurn|calcSLO|SEV-1|multiBurn/i]).slice(0, 30).join('\n'));

console.log('\n--- 5. PostgreSQL Lock Tables & Failover in R3 ---');
console.log('R3 Lock Table & Failover:');
console.log(extractFunctions(r3, [/ExclusiveLock|AccessShareLock|failover|simulateCrash|reprovision|pg_locks|pg_stat/i]).slice(0, 30).join('\n'));

console.log('\n--- 6. GCP IAM Downscoping in R4 ---');
console.log('R4 Least-Privilege & Downscoping:');
console.log(extractFunctions(r4, [/downscope|leastPrivilege|excessPermissions|recommendation|remediate/i]).slice(0, 30).join('\n'));

console.log('\n--- 7. GCP LogEntry Schemas in R1, R2, R4, R5 ---');
console.log('R1 LogEntry structure:');
console.log(extractFunctions(r1, [/insertId|LogEntry|resource:\s*\{|httpRequest/i]).slice(0, 15).join('\n'));
console.log('R5 LogEntry structure:');
console.log(extractFunctions(r5, [/insertId|LogEntry|resource:\s*\{|httpRequest|logging\.googleapis/i]).slice(0, 15).join('\n'));
