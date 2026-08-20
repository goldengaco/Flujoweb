const fs = require('fs');

const tx = fs.readFileSync('sistemas/transaction-flow/index.html', 'utf8');

function printFunction(name) {
  console.log(`\n================= METHOD: ${name} =================`);
  const idx = tx.indexOf(name);
  if (idx === -1) {
    console.log('NOT FOUND');
    return;
  }
  // Find closing brace of method
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
}

printFunction('checkLuhn(panStr)');
printFunction('buildPayload(step');
printFunction('startReversal()');
printFunction('updateSvgTrackPositions()');
printFunction('renderRadar()');
printFunction('animateCurrency(');
printFunction('generateNonce()');
