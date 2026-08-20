const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '../..');

const testFiles = [
  'tests/gcp_e2e_suite.js',
  'tests/gcp_tier1_features.js',
  'tests/gcp_tier2_boundaries.js',
  'tests/gcp_tier3_combinations.js',
  'tests/gcp_tier4_scenarios.js',
  'tests/runner.js'
];

console.log('===============================================================');
console.log('=== TEST SUITE AUTHENTICITY AUDIT ===');
console.log('===============================================================\n');

testFiles.forEach(tf => {
  const fullPath = path.join(projectRoot, tf);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${tf}`);
    return;
  }
  const content = fs.readFileSync(fullPath, 'utf8');
  console.log(`--- [${tf}] (${content.length} bytes) ---`);
  
  // Check for genuine assertions
  const assertMatches = content.match(/assert\s*\([^)]*\)|assert\.\w+\([^)]*\)|expect\([^)]*\)/g) || [];
  console.log(`  Assertion count: ${assertMatches.length}`);
  
  // Check for DOM queries / CDP evaluations
  const domEvaluations = content.match(/evaluate\s*\(|querySelector|getElementById|querySelectorAll|page\.click|click\(|type\(|input\(/g) || [];
  console.log(`  DOM / CDP evaluations count: ${domEvaluations.length}`);
  
  // Check for suspicious tautological / dummy assertions (e.g. assert(true), assert(1 === 1), etc.)
  const dummyAsserts = content.match(/assert\s*\(\s*(true|1\s*===?\s*1|['"][^'"]*['"]\s*===?\s*['"][^'"]*['"])\s*\)/g) || [];
  console.log(`  Dummy/Tautological assertions: ${dummyAsserts.length > 0 ? dummyAsserts.join(', ') : '0 (CLEAN)'}`);
  
  // Look for hardcoded mock returns
  const fakeReturns = content.match(/return\s+\{\s*passed:\s*true\s*\}|return\s+true;?\s*\/\/.*fake/gi) || [];
  console.log(`  Hardcoded fake pass returns: ${fakeReturns.length > 0 ? fakeReturns.join(', ') : '0 (CLEAN)'}`);
  console.log('');
});
