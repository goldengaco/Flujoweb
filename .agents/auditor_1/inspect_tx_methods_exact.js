const fs = require('fs');

const tx = fs.readFileSync('sistemas/transaction-flow/index.html', 'utf8');

function extractMethod(signature) {
  console.log(`\n================= METHOD: ${signature} =================`);
  const idx = tx.indexOf(signature);
  if (idx === -1) {
    console.log('NOT FOUND');
    return;
  }
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

extractMethod('buildPayload(step, isFraud');
extractMethod('async startReversal()');
extractMethod('executeStep(stepIndex, isAuto)');
extractMethod('renderRadar()');
extractMethod('updateSvgTrackPositions()');
extractMethod('animateCurrency(element, targetVal)');
