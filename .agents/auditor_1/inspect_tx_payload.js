const fs = require('fs');

const tx = fs.readFileSync('sistemas/transaction-flow/index.html', 'utf8');

const match = tx.match(/^\s*buildPayload\s*\([^)]*\)\s*\{/m);
if (match) {
  const idx = match.index;
  let braceCount = 0;
  let started = false;
  let end = idx;
  for (let i = idx; i < tx.length; i++) {
    if (tx[i] === '{') {
      braceCount++;
      started = true;
    } else if (tx[i] === '}') {
      braceCount--;
      if (started && braceCount === 0) {
        end = i + 1;
        break;
      }
    }
  }
  console.log(tx.slice(idx, end));
} else {
  console.log('buildPayload NOT FOUND');
}
