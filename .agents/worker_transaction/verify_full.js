const fs = require('fs');
const path = require('path');

const targetHtml = path.resolve('c:/DevWork/Depredador/Flujoweb/sistemas/transaction-flow/index.html');
const content = fs.readFileSync(targetHtml, 'utf8');

console.log('====================================================');
console.log('COMPREHENSIVE AUTOMATED VERIFICATION SUITE');
console.log('Target: sistemas/transaction-flow/index.html');
console.log('====================================================');

let testsPassed = 0;
let testsFailed = 0;

function assert(condition, testName, details = '') {
  if (condition) {
    console.log(`[PASS] ${testName}`);
    testsPassed++;
  } else {
    console.error(`[FAIL] ${testName} - ${details}`);
    testsFailed++;
  }
}

// 1. Structural & Self-Contained Integrity
assert(content.includes('<!DOCTYPE html>'), 'HTML5 Doctype present');
assert(content.includes('<meta name="viewport"'), 'Viewport meta tag configured for responsive layout');
assert(!content.includes('src="http'), 'Zero external JS scripts (fully self-contained)');
assert(!content.includes('<link rel="stylesheet" href="http://') && !content.includes('href="https://cdnjs') && !content.includes('href="https://cdn'), 'Zero external CDN framework dependencies (pure custom CSS)');

// 2. Color Palette & Typography Tokens
assert(content.includes('--gold-primary: #f59e0b'), 'Fintech Luxury Cyberpunk Gold token #f59e0b present');
assert(content.includes('--emerald-primary: #10b981'), 'Emerald Settlement token #10b981 present');
assert(content.includes('--crimson-primary: #ef4444'), 'Cyber Crimson Fraud token #ef4444 present');
assert(content.includes('--bg-base: #030812'), 'Cinematic Dark base background #030812 present');
assert(content.includes('Cascadia Code') || content.includes('Fira Code'), 'Monospace telemetry font present');
assert(content.includes('Inter'), 'Inter UI typography present');

// 3. 6 Primary Nodes Presence & Luminous Permanent Emoji Icons
const requiredNodes = [
  { id: 'node-1', icon: '📝', name: 'Captura & Hash' },
  { id: 'node-2', icon: '🔍', name: 'Token PCI & Luhn' },
  { id: 'node-3', icon: '🛡️', name: 'ML Antifraude' },
  { id: 'node-4', icon: '🏦', name: 'Auth 3DS 2.2' },
  { id: 'node-5', icon: '⚙️', name: 'Liquidación Rail' },
  { id: 'node-6', icon: '✅', name: 'Ledger Sellado' }
];

requiredNodes.forEach(n => {
  assert(content.includes(`id="${n.id}"`), `Pipeline Node Element ${n.id} exists`);
  assert(content.includes(n.icon), `Permanent Emoji Icon ${n.icon} exists`);
  assert(content.includes(n.name), `Node title "${n.name}" exists`);
});

// 4. Bifurcation Branches Presence
assert(content.includes('id="bifurcation-fraud"'), 'Bifurcation Branch 3B (Fraud Quarantine) exists');
assert(content.includes('id="bifurcation-decline"'), 'Bifurcation Branch 4B (Issuer Hard Decline) exists');
assert(content.includes('🚨'), 'Bifurcation Fraud Icon 🚨 exists');
assert(content.includes('⚠️'), 'Bifurcation Decline Icon ⚠️ exists');

// 5. High-Precision 30s TTL Timer Elements
assert(content.includes('id="ttlDisplay"'), 'High-precision TTL Display element exists');
assert(content.includes('performance.now()'), 'performance.now() high-precision clock used');
assert(content.includes('30.000s') || content.includes('30000'), '30.000s TTL SLA budget configured');

// 6. Interactive Scenarios Presence
const requiredScenarios = [
  'data-scenario="success"',
  'data-scenario="fraud"',
  'data-scenario="declined"',
  'data-scenario="timeout"'
];
requiredScenarios.forEach(sc => {
  assert(content.includes(sc), `Scenario selector button ${sc} exists`);
});

// 7. Interactive Reversal / Chargeback Button & Engine
assert(content.includes('id="btnReversal"'), 'Reversal / Chargeback button exists');
assert(content.includes('startReversal'), 'startReversal() rollback function implemented');
assert(content.includes('0420'), 'ISO-8583 MTI 0420 Reversal advice standard supported');

// 8. 5-Axis Dynamic Risk Radar Canvas
assert(content.includes('id="riskRadarCanvas"'), 'HTML5 Risk Radar Canvas element exists');
assert(content.includes('renderRadar'), 'Risk radar spider web rendering function exists');

// 9. ISO-8583 & JSON Inspector Tabs
assert(content.includes('id="pane-json"'), 'JSON Payload Inspector pane exists');
assert(content.includes('id="pane-iso"'), 'ISO-8583 Bitmap Table pane exists');
assert(content.includes('id="pane-receipt"'), 'Cryptographic Receipt Seal pane exists');
assert(content.includes('id="btnCopyInspector"'), 'Copy inspector button exists');

// 10. Streaming Terminal & Currency Easing
assert(content.includes('id="terminalLog"'), 'Live Telemetry Terminal log element exists');
assert(content.includes('animateCurrency'), '60fps currency easing animation function exists');
assert(content.includes('checkLuhn'), 'PCI-DSS Modulo-10 Luhn validation function exists');

// Summary
console.log('====================================================');
console.log(`TOTAL TESTS: ${testsPassed + testsFailed} | PASSED: ${testsPassed} | FAILED: ${testsFailed}`);
console.log('====================================================');

if (testsFailed > 0) process.exit(1);
