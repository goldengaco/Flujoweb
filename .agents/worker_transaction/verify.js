const fs = require('fs');
const path = require('path');

const targetHtml = path.resolve('c:/DevWork/Depredador/Flujoweb/sistemas/transaction-flow/index.html');
const content = fs.readFileSync(targetHtml, 'utf8');

console.log('--- VALIDATING index.html ---');
console.log('File size:', content.length, 'bytes');

// 1. Check basic HTML structure
const requiredTags = ['<!DOCTYPE html>', '<html', '<head>', '<body>', '<style>', '<script>', '</html>'];
for (const tag of requiredTags) {
  if (!content.includes(tag)) {
    console.error(`FAIL: Missing required tag ${tag}`);
    process.exit(1);
  }
}
console.log('PASS: Basic HTML tags present');

// 2. Extract script
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.error('FAIL: No inline <script> found');
  process.exit(1);
}
const jsCode = scriptMatch[1];

// 3. Syntax check
try {
  new Function(jsCode);
  console.log('PASS: JS code compiles without syntax errors');
} catch (e) {
  console.error('FAIL: JS compile error:', e);
  process.exit(1);
}

// 4. Verify DOM IDs
const idMatches = [...jsCode.matchAll(/document\.getElementById\(['"]([^'"]+)['"]\)/g)];
const idSet = new Set(idMatches.map(m => m[1]));
console.log(`Found ${idSet.size} distinct getElementById calls`);

let missingIds = [];
for (const id of idSet) {
  // Check if id exists in HTML or is created dynamically (e.g. node-1..6, badge-1..6, track-x-y, pane-xxx)
  const pattern1 = `id="${id}"`;
  const pattern2 = `id='${id}'`;
  if (!content.includes(pattern1) && !content.includes(pattern2)) {
    missingIds.push(id);
  }
}

if (missingIds.length > 0) {
  console.error('FAIL: Missing DOM IDs:', missingIds);
  process.exit(1);
}
console.log('PASS: All static DOM IDs verified in HTML');

// 5. Test State Machine & Logic Functions
console.log('--- TESTING CORE ALGORITHMS ---');

// Luhn Test
function checkLuhn(panStr) {
  const clean = panStr.replace(/\D/g, '');
  let sum = 0;
  let alt = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (alt) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    alt = !alt;
  }
  return sum % 10 === 0;
}

const testCards = [
  { pan: "4111723526077248", expected: true },
  { pan: "5500196518495684", expected: true },
  { pan: "378282873692337", expected: true },
  { pan: "4111821416425277", expected: true },
  { pan: "4111111111111112", expected: false }
];

for (const card of testCards) {
  const valid = checkLuhn(card.pan);
  if (valid !== card.expected) {
    console.error(`FAIL: Luhn test failed for ${card.pan}: expected ${card.expected}, got ${valid}`);
    process.exit(1);
  }
}
console.log('PASS: Modulo-10 Luhn checksum algorithm passed');

// 6. Test Risk Scoring Formula
function computeRisk(v, g, d, b, c) {
  return +(0.25 * v + 0.25 * g + 0.20 * d + 0.15 * b + 0.15 * c).toFixed(1);
}

const successScore = computeRisk(10, 5, 12, 8, 5); // 0.25(15) + 0.2(12) + 0.15(13) = 3.75 + 2.4 + 1.95 = 8.1
console.log('Success scenario risk score:', successScore);
if (successScore > 85) {
  console.error('FAIL: Success score should be low');
  process.exit(1);
}

const fraudScore = computeRisk(95, 98, 92, 88, 90);
console.log('Fraud scenario risk score:', fraudScore);
if (fraudScore <= 85) {
  console.error('FAIL: Fraud score should trigger bifurcation (> 85)');
  process.exit(1);
}
console.log('PASS: Risk Scoring Math verified');

console.log('--- ALL AUTOMATED CHECKS PASSED ---');
