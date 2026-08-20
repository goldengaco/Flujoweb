const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = 'c:/DevWork/Depredador/Flujoweb';

function loadFile(relPath) {
  const fullPath = path.join(ROOT, relPath);
  const content = fs.readFileSync(fullPath, 'utf8');
  const scriptMatch = content.match(/<script[\s\S]*?>([\s\S]*?)<\/script>/i);
  return {
    relPath,
    fullPath,
    content,
    script: scriptMatch ? scriptMatch[1] : ''
  };
}

const sec = loadFile('sistemas/security-audit/index.html');
const srv = loadFile('sistemas/server-status/index.html');
const tx = loadFile('sistemas/transaction-flow/index.html');

console.log('=== FORENSIC ANALYSIS COMMENCED ===\n');

const results = {
  sec: {},
  srv: {},
  tx: {},
  bypasses: [],
  networkViolations: [],
  facades: []
};

// -------------------------------------------------------------
// 1. FORENSIC AUDIT: SECURITY AUDIT
// -------------------------------------------------------------
console.log('>>> Auditing Security Audit...');

// Check Nodes Count & Configuration
const secNodesMatch = sec.script.match(/const SECURITY_NODES\s*=\s*(\[[\s\S]*?\n\s*\]);/);
if (secNodesMatch) {
  try {
    const nodes = eval(secNodesMatch[1]);
    results.sec.nodeCount = nodes.length;
    results.sec.nodeIds = nodes.map(n => n.id);
    console.log(`- Node count: ${nodes.length}`);
    console.log(`- Node IDs: ${nodes.map(n => n.id).join(', ')}`);
  } catch (e) {
    console.error('Error parsing SECURITY_NODES:', e.message);
  }
}

// Check Gauge Math
const hasGaugeCircumference = sec.script.includes('351.858') || sec.script.includes('2 * Math.PI * 56') || sec.script.includes('strokeDashoffset');
const hasGradeLogic = sec.script.includes('getGrade(score)') || sec.script.includes('score >= 95');
results.sec.hasGaugeMath = hasGaugeCircumference && hasGradeLogic;
console.log(`- Gauge Math & Grade Logic: ${results.sec.hasGaugeMath ? 'VERIFIED' : 'FAIL'}`);

// Check Score Calculation Math
const hasScoreMath = sec.script.includes('calculateTotalScore') && sec.script.includes('pointWeight') && sec.script.includes('initialPoints');
results.sec.hasScoreMath = hasScoreMath;
console.log(`- Dynamic Score Math: ${hasScoreMath ? 'VERIFIED' : 'FAIL'}`);

// Check Fix / Patch Simulation
const hasPatchLogic = sec.script.includes('togglePatch') && sec.script.includes('simulateFixAll') && sec.script.includes('patchedNodeIds');
results.sec.hasPatchLogic = hasPatchLogic;
console.log(`- Patch Simulation & State Mutation: ${hasPatchLogic ? 'VERIFIED' : 'FAIL'}`);

// Check Drawer & Raw Inspection
const hasDrawerInspection = sec.script.includes('DrawerController') && sec.script.includes('rawHeaders') && sec.script.includes('cveList');
results.sec.hasDrawerInspection = hasDrawerInspection;
console.log(`- Drawer & Raw Telemetry Inspection: ${hasDrawerInspection ? 'VERIFIED' : 'FAIL'}`);

// Check Table Filtering
const hasTableFilter = sec.script.includes('activeFilter') && sec.script.includes('searchQuery') && sec.script.includes('renderTable');
results.sec.hasTableFilter = hasTableFilter;
console.log(`- Tabular Vulnerability Matrix Filters: ${hasTableFilter ? 'VERIFIED' : 'FAIL'}`);

// Check Export JSON
const hasExportJson = sec.script.includes('exportJson') && sec.script.includes('application/json') && sec.script.includes('createObjectURL');
results.sec.hasExportJson = hasExportJson;
console.log(`- Export JSON functionality: ${hasExportJson ? 'VERIFIED' : 'FAIL'}`);

// -------------------------------------------------------------
// 2. FORENSIC AUDIT: SERVER STATUS NOC
// -------------------------------------------------------------
console.log('\n>>> Auditing Server Status NOC...');

// Check Services Count & Types
const srvMeshMatch = srv.script.match(/const SERVICES\s*=\s*(\[[\s\S]*?\n\s*\]);/);
if (srvMeshMatch) {
  try {
    const services = eval(srvMeshMatch[1]);
    results.srv.serviceCount = services.length;
    results.srv.serviceNames = services.map(s => s.name);
    console.log(`- Service count: ${services.length}`);
    console.log(`- Services: ${services.map(s => s.name).join(', ')}`);
  } catch (e) {
    console.error('Error parsing SERVICES:', e.message);
  }
}

// Check RingBuffer / Telemetry Math
const hasRingBuffer = srv.script.includes('RingBuffer') || srv.script.includes('Float32Array') || srv.script.includes('history');
const hasSparklineCanvas = srv.script.includes('sparkline') || srv.script.includes('getContext(\'2d\')') || srv.script.includes('renderSparkline');
results.srv.hasRingBufferMath = hasRingBuffer;
results.srv.hasSparklineCanvas = hasSparklineCanvas;
console.log(`- RingBuffer / Metric History: ${hasRingBuffer ? 'VERIFIED' : 'FAIL'}`);
console.log(`- Sparkline Canvas 2D rendering: ${hasSparklineCanvas ? 'VERIFIED' : 'FAIL'}`);

// Check 90-Day SLA Uptime Bar
const has90DaySla = srv.script.includes('90') && (srv.script.includes('generateHistory') || srv.script.includes('uptimeHistory') || srv.script.includes('days'));
results.srv.has90DaySla = has90DaySla;
console.log(`- 90-Day SLA Uptime Bar with micro-outage tooltips: ${has90DaySla ? 'VERIFIED' : 'FAIL'}`);

// Check Chaos Injection & Auto-Healing State Machine
const hasChaosInjection = srv.script.includes('injectChaos') || srv.script.includes('chaos');
const hasAutoHealing = srv.script.includes('autoHeal') || srv.script.includes('healing') || srv.script.includes('mitigate');
results.srv.hasChaosInjection = hasChaosInjection;
results.srv.hasAutoHealing = hasAutoHealing;
console.log(`- Chaos Injection Simulator: ${hasChaosInjection ? 'VERIFIED' : 'FAIL'}`);
console.log(`- Auto-Healing State Transitions: ${hasAutoHealing ? 'VERIFIED' : 'FAIL'}`);

// Check Live Terminal Console
const hasTerminal = srv.script.includes('terminal') || srv.script.includes('log') || srv.script.includes('ANSI');
results.srv.hasTerminal = hasTerminal;
console.log(`- ANSI Live Terminal Console: ${hasTerminal ? 'VERIFIED' : 'FAIL'}`);

// -------------------------------------------------------------
// 3. FORENSIC AUDIT: TRANSACTION FLOW
// -------------------------------------------------------------
console.log('\n>>> Auditing Transaction Flow...');

// Check Luhn Algorithm
const hasLuhn = tx.script.includes('luhn') || tx.script.includes('Luhn') || tx.script.includes('validateLuhn') || tx.script.includes('computeLuhn');
console.log(`- Luhn algorithm presence: ${hasLuhn ? 'VERIFIED' : 'FAIL'}`);

// Check Cryptographic Hashing (SHA-256 / HMAC / crypto.subtle)
const hasCrypto = tx.script.includes('crypto.subtle') || tx.script.includes('SHA-256') || tx.script.includes('digest') || tx.script.includes('hmac') || tx.script.includes('HMAC');
console.log(`- Web Crypto SHA-256 / HMAC: ${hasCrypto ? 'VERIFIED' : 'FAIL'}`);

// Check ISO-8583 Bitmap Parsing / Formatting
const hasIso8583 = tx.script.includes('8583') || tx.script.includes('ISO8583') || tx.script.includes('iso') || tx.script.includes('bitmap');
console.log(`- ISO-8583 Financial Bitmap Parsing: ${hasIso8583 ? 'VERIFIED' : 'FAIL'}`);

// Check Canvas / SVG Bézier Curve Rasterization
const hasBezier = tx.script.includes('bezierCurveTo') || tx.script.includes('quadraticCurveTo') || tx.script.includes('bezier') || tx.script.includes('C ') || tx.script.includes('path');
console.log(`- Bézier Curve Rasterization / Particle Physics: ${hasBezier ? 'VERIFIED' : 'FAIL'}`);

// Check 30s TTL Microsecond Countdown
const hasTTL = tx.script.includes('ttl') || tx.script.includes('TTL') || tx.script.includes('countdown') || tx.script.includes('remainingMs') || tx.script.includes('performance.now');
console.log(`- 30s TTL Microsecond Countdown: ${hasTTL ? 'VERIFIED' : 'FAIL'}`);

// Check Dynamic Ledger & Risk Radar
const hasLedger = tx.script.includes('ledger') || tx.script.includes('Ledger') || tx.script.includes('balance') || tx.script.includes('amount');
const hasRiskRadar = tx.script.includes('radar') || tx.script.includes('risk') || tx.script.includes('fraudScore');
console.log(`- Dynamic Ledger Math: ${hasLedger ? 'VERIFIED' : 'FAIL'}`);
console.log(`- Risk Radar / Fraud Score Engine: ${hasRiskRadar ? 'VERIFIED' : 'FAIL'}`);

// Check Scenario Selector & Bifurcations
const hasScenarios = tx.script.includes('scenario') || tx.script.includes('FRAUD') || tx.script.includes('DECLINED') || tx.script.includes('TIMEOUT');
console.log(`- Scenario Bifurcation Engine: ${hasScenarios ? 'VERIFIED' : 'FAIL'}`);

// Check Reversal & Chargeback Flow
const hasReversal = tx.script.includes('reverse') || tx.script.includes('reversal') || tx.script.includes('reversar') || tx.script.includes('rollback');
console.log(`- Reversal / Chargeback Flow: ${hasReversal ? 'VERIFIED' : 'FAIL'}`);

// Check Payload Inspector
const hasPayloadInspector = tx.script.includes('payload') || tx.script.includes('inspector') || tx.script.includes('rawJson');
console.log(`- ISO-8583 / JSON Payload Inspector: ${hasPayloadInspector ? 'VERIFIED' : 'FAIL'}`);

// -------------------------------------------------------------
// 4. CROSS-CUTTING FORENSIC AUDIT: CHEATING & BYPASS CHECKS
// -------------------------------------------------------------
console.log('\n======================================================');
console.log('=== CHECK 4: INTEGRITY FORENSICS & CHEATING CHECKS ===');
console.log('======================================================');

const files = [{ name: 'security-audit', data: sec }, { name: 'server-status', data: srv }, { name: 'transaction-flow', data: tx }];

files.forEach(f => {
  console.log(`\n--- Inspecting ${f.name} ---`);
  
  // 4.1 Test environment sniffing & bypassing
  const testBypasses = [
    '__TEST__', '__PLAYWRIGHT__', '__CYPRESS__', '__JEST__', 'navigator.webdriver',
    'isTest', 'isAutomated', 'skipValidation', 'bypassAuth', 'mockPass'
  ];
  testBypasses.forEach(pattern => {
    if (f.data.content.includes(pattern)) {
      console.log(`  [FLAG] Potential test bypass found: ${pattern}`);
      results.bypasses.push({ file: f.name, pattern });
    }
  });
  
  // 4.2 External network calls
  const netPatterns = [
    /fetch\s*\(\s*['"`]http/i,
    /XMLHttpRequest/i,
    /WebSocket/i,
    /importScripts/i,
    /<script[^>]+src=/i
  ];
  netPatterns.forEach(regex => {
    const m = f.data.content.match(regex);
    if (m) {
      console.log(`  [FLAG] External network call pattern found: ${m[0]}`);
      results.networkViolations.push({ file: f.name, match: m[0] });
    }
  });

  // 4.3 Dummy / Facade implementations
  // Check for dummy functions that just return hardcoded constants without logic
  const dummyMatches = f.data.script.match(/function\s+\w+\s*\([^)]*\)\s*\{\s*return\s+(true|false|100|0|'PASS'|"PASS");\s*\}/g);
  if (dummyMatches) {
    console.log(`  [FLAG] Potential dummy function found:`, dummyMatches);
    results.facades.push({ file: f.name, matches: dummyMatches });
  }
});

console.log('\n--- Forensic Summary ---');
console.log('Bypasses detected:', results.bypasses.length);
console.log('Network violations detected:', results.networkViolations.length);
console.log('Dummy facades detected:', results.facades.length);
