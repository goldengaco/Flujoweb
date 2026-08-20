const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '../..');

const r1 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-serverless-pipeline/index.html'), 'utf8');
const r2 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-event-pubsub/index.html'), 'utf8');
const r3 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-sql-networking/index.html'), 'utf8');
const r4 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-iam-security/index.html'), 'utf8');
const r5 = fs.readFileSync(path.join(projectRoot, 'sistemas/gcp-cloudops-cockpit/index.html'), 'utf8');

console.log('===============================================================');
console.log('=== VERIFYING AUTHENTIC CLIENT-SIDE SIMULATION ALGORITHMS ===');
console.log('===============================================================\n');

// 1. R1: Particle Bézier & Cold-Start & LogEntry
console.log('--- [R1] Particle class & Bézier routing ---');
const r1ParticleMatch = r1.match(/class Particle[\s\S]*?\n  \}/);
if (r1ParticleMatch) {
  console.log(r1ParticleMatch[0].split('\n').slice(0, 35).join('\n'));
}

console.log('\n--- [R1] LogEntry schema generation ---');
const r1LogEntryMatch = r1.match(/function addLog[\s\S]*?\n  \}/);
if (r1LogEntryMatch) {
  console.log(r1LogEntryMatch[0]);
}

// 2. R2: Poisson generator, Catmull-Rom, CRC32, Log-Normal distribution
console.log('\n--- [R2] Catmull-Rom Spline implementation ---');
const r2Catmull = r2.match(/function drawCatmullRom[\s\S]*?\n  \}/);
if (r2Catmull) {
  console.log(r2Catmull[0]);
}

console.log('\n--- [R2] Ingestion / Poisson / Distribution generation ---');
const r2Tick = r2.match(/function simulationTick[\s\S]*?\n  \}/) || r2.match(/function generate[\s\S]*?\n  \}/) || r2.match(/function step[\s\S]*?\n  \}/);
if (r2Tick) {
  console.log(r2Tick[0].split('\n').slice(0, 40).join('\n'));
} else {
  // search for tick or loop in R2
  const r2Interval = r2.match(/(?:setInterval|requestAnimationFrame)[\s\S]*?\n  \}/);
  if (r2Interval) console.log(r2Interval[0].slice(0, 500));
}

// Look for CRC32 or partition key hashing in R2
console.log('\n--- [R2] Partition key hashing / CRC32 ---');
const r2CRC = r2.match(/function [a-zA-Z0-9_]*crc[a-zA-Z0-9_]*[\s\S]*?\n  \}/i) || r2.match(/partition[\s\S]{0,300}hash/i);
if (r2CRC) console.log(r2CRC[0]);

// Look for SLA histogram calculation in R2
console.log('\n--- [R2] Log-Normal SLA histogram calculation ---');
const r2Sla = r2.match(/function updateSlaHistogram[\s\S]*?\n  \}/) || r2.match(/function renderHistogram[\s\S]*?\n  \}/);
if (r2Sla) console.log(r2Sla[0]);

// 3. R3: Topology packet routing Bézier, Connection Pool, Lock Contention, Failover
console.log('\n--- [R3] Topology packet routing with Bézier curves ---');
const r3Bézier = r3.match(/renderPackets[\s\S]*?\n  \}/) || r3.match(/drawRoute[\s\S]*?\n  \}/) || r3.match(/drawNetwork[\s\S]*?\n  \}/);
if (r3Bézier) console.log(r3Bézier[0].split('\n').slice(0, 35).join('\n'));

console.log('\n--- [R3] Failover 7-step sequence ---');
const r3Failover = r3.match(/function startFailover[\s\S]*?\n  \}/) || r3.match(/async function triggerFailover[\s\S]*?\n  \}/) || r3.match(/simulatePrimaryCrash[\s\S]*?\n  \}/);
if (r3Failover) console.log(r3Failover[0].split('\n').slice(0, 35).join('\n'));

console.log('\n--- [R3] PostgreSQL Lock Table & session management ---');
const r3Locks = r3.match(/function renderLockTable[\s\S]*?\n  \}/) || r3.match(/const initialLocks[\s\S]*?\];/);
if (r3Locks) console.log(r3Locks[0].split('\n').slice(0, 30).join('\n'));

// 4. R4: IAM Least-Privilege & Downscoping recommendations
console.log('\n--- [R4] Least-Privilege Risk Matrix & Downscoping logic ---');
const r4Downscope = r4.match(/function downscopePrincipal[\s\S]*?\n  \}/) || r4.match(/function remediate[\s\S]*?\n  \}/);
if (r4Downscope) console.log(r4Downscope[0]);

console.log('\n--- [R4] Service Account Key Revoke & Rotate ---');
const r4KeyRevoke = r4.match(/function revokeKey[\s\S]*?\n  \}/) || r4.match(/function rotateKey[\s\S]*?\n  \}/);
if (r4KeyRevoke) console.log(r4KeyRevoke[0]);

// 5. R5: 4 Golden Signals, Google SRE Multi-Burn-Rate, Health Radar, Cloud Logging Live-tail
console.log('\n--- [R5] Google SRE Burn Rate calculations ---');
const r5Burn = r5.match(/function updateTelemetryStep[\s\S]*?\n  \}/);
if (r5Burn) console.log(r5Burn[0].split('\n').slice(0, 45).join('\n'));

console.log('\n--- [R5] Multi-Service Health Radar (polar canvas) ---');
const r5Radar = r5.match(/function drawHealthRadar[\s\S]*?\n  \}/);
if (r5Radar) console.log(r5Radar[0].split('\n').slice(0, 35).join('\n'));

console.log('\n--- [R5] Interactive Cloud Logging live-tail filter & correlation ---');
const r5Logs = r5.match(/function renderLogs[\s\S]*?\n  \}/) || r5.match(/function filterLogs[\s\S]*?\n  \}/);
if (r5Logs) console.log(r5Logs[0].split('\n').slice(0, 35).join('\n'));
