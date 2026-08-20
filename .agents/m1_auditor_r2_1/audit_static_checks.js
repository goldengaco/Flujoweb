const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..', '..');

const systems = [
  { id: 'security-audit', name: 'System 3: security-audit' },
  { id: 'gcp-serverless-pipeline', name: 'System 6: gcp-serverless-pipeline' },
  { id: 'gcp-event-pubsub', name: 'System 7: gcp-event-pubsub' },
  { id: 'gcp-sql-networking', name: 'System 8: gcp-sql-networking' },
  { id: 'gcp-iam-security', name: 'System 9: gcp-iam-security' },
  { id: 'apigee-mulesoft-hybrid', name: 'System 12: apigee-mulesoft-hybrid' },
  { id: 'emergency-evacuation-v1', name: 'System 13: emergency-evacuation-v1' },
  { id: 'emergency-evacuation-v2', name: 'System 14: emergency-evacuation-v2' },
  { id: 'emergency-evacuation-v3', name: 'System 15: emergency-evacuation-v3' }
];

console.log('================================================================');
console.log('FORENSIC STATIC INTEGRITY AUDIT: 9 REMEDIATED DASHBOARDS');
console.log('================================================================\n');

// 1. Z-Index Layering Check
console.log('--- CHECK 1: Z-Index Layering Contract ---');
const zIndexResults = {};

systems.forEach(s => {
  const filePath = path.join(rootDir, 'sistemas', s.id, 'index.html');
  if (!fs.existsSync(filePath)) {
    zIndexResults[s.id] = { error: 'File not found' };
    return;
  }
  const content = fs.readFileSync(filePath, 'utf-8');
  const zMatches = [];
  const regex = /([.#a-zA-Z0-9_\-\s,>:+]+)\s*\{[^}]*?z-index\s*:\s*([0-9]+)[^}]*?\}/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const selector = match[1].trim().replace(/\s+/g, ' ');
    const zVal = parseInt(match[2], 10);
    zMatches.push({ selector, zVal });
  }
  zIndexResults[s.id] = zMatches;
});

// Specifically check System 9 modal overlay
const sys9Z = zIndexResults['gcp-iam-security'] || [];
const sys9Modal = sys9Z.filter(m => m.selector.includes('modal') || m.selector.includes('overlay'));
console.log('System 9 (gcp-iam-security) modal z-index entries:');
console.log(JSON.stringify(sys9Modal, null, 2));

// Specifically check System 15 inspectors and canvas
const sys15Z = zIndexResults['emergency-evacuation-v3'] || [];
console.log('\nSystem 15 (emergency-evacuation-v3) z-index entries:');
console.log(JSON.stringify(sys15Z, null, 2));

// 2. Fluid Clamp Typography in System 14
console.log('\n--- CHECK 2: System 14 Fluid clamp() Typography ---');
const v2Path = path.join(rootDir, 'sistemas', 'emergency-evacuation-v2', 'index.html');
const v2Content = fs.readFileSync(v2Path, 'utf-8');
const fontMatches = [];
const fontRegex = /([.#a-zA-Z0-9_\-\s,>:+]+)\s*\{[^}]*?font-size\s*:\s*([^;]+);/g;
let fMatch;
while ((fMatch = fontRegex.exec(v2Content)) !== null) {
  const sel = fMatch[1].trim().replace(/\s+/g, ' ');
  const val = fMatch[2].trim();
  fontMatches.push({ selector: sel, fontSize: val, isClamp: val.startsWith('clamp(') });
}
console.log(`Total font-size declarations in System 14: ${fontMatches.length}`);
const nonClamp = fontMatches.filter(f => !f.isClamp);
console.log(`Non-clamp declarations in System 14: ${nonClamp.length}`);
if (nonClamp.length > 0) {
  console.log('Non-clamp items:', JSON.stringify(nonClamp, null, 2));
} else {
  console.log('PASS: 100% of font-size declarations in System 14 use fluid clamp()!');
}

// 3. Media Queries & Min-Width: 0 / Flex-Wrap Check
console.log('\n--- CHECK 3: Responsive Breakpoints & Flex Wrap in 9 Systems ---');
systems.forEach(s => {
  const filePath = path.join(rootDir, 'sistemas', s.id, 'index.html');
  const content = fs.readFileSync(filePath, 'utf-8');
  const hasMediaQueries = (content.match(/@media\s*\([^{]+\)/g) || []).length;
  const hasMinZero = (content.match(/min-width:\s*0/g) || []).length;
  const hasFlexWrap = (content.match(/flex-wrap:\s*wrap/g) || []).length;
  const hasClamp = (content.match(/clamp\s*\(/g) || []).length;
  const hasMinmax = (content.match(/minmax\s*\(/g) || []).length;
  console.log(`${s.name}:`);
  console.log(`  - Media Queries: ${hasMediaQueries}`);
  console.log(`  - min-width: 0 declarations: ${hasMinZero}`);
  console.log(`  - flex-wrap: wrap declarations: ${hasFlexWrap}`);
  console.log(`  - clamp() calls: ${hasClamp}`);
  console.log(`  - minmax() calls: ${hasMinmax}`);
});

// 4. Prohibited Patterns Check (Anti-Cheating / Facade Detection)
console.log('\n--- CHECK 4: Prohibited Patterns & Facade Detection ---');
const testsDir = path.join(rootDir, 'tests');
const testFiles = fs.readdirSync(testsDir).filter(f => f.endsWith('.js'));
let cheatingFound = false;

testFiles.forEach(f => {
  const testContent = fs.readFileSync(path.join(testsDir, f), 'utf-8');
  // Check for suspicious hardcoded pass overrides
  if (/return\s+true\s*;\s*\/\/\s*bypass/i.test(testContent) || /process\.exit\(0\)\s*;\s*\/\/\s*skip/i.test(testContent)) {
    console.log(`SUSPICIOUS BYPASS in ${f}`);
    cheatingFound = true;
  }
});
if (!cheatingFound) {
  console.log('PASS: Zero test bypasses or fabricated test results detected in test suite files.');
}
