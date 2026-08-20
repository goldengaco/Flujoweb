const fs = require('fs');

console.log('=== FIXTURES / HELPERS ===');
if (fs.existsSync('tests/fixtures/helpers.js')) {
  const helpers = fs.readFileSync('tests/fixtures/helpers.js', 'utf8');
  console.log(helpers.slice(0, 1500));
} else {
  console.log('tests/fixtures/helpers.js NOT FOUND');
}

console.log('\n=== RUNNER.JS ===');
if (fs.existsSync('tests/runner.js')) {
  const runner = fs.readFileSync('tests/runner.js', 'utf8');
  console.log(runner.slice(0, 1500));
} else {
  console.log('tests/runner.js NOT FOUND');
}
