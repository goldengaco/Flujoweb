const fs = require('fs');

const tx = fs.readFileSync('sistemas/transaction-flow/index.html', 'utf8');

function extractMethodByPattern(regex, label) {
  console.log(`\n================= METHOD: ${label} =================`);
  const match = tx.match(regex);
  if (!match) {
    console.log('NOT FOUND');
    return;
  }
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
}

extractMethodByPattern(/^\s*buildPayload\s*\([^)]*\)\s*\{/m, 'buildPayload');
extractMethodByPattern(/^\s*async\s+startReversal\s*\([^)]*\)\s*\{/m, 'startReversal');
extractMethodByPattern(/^\s*renderRadar\s*\([^)]*\)\s*\{/m, 'renderRadar');
extractMethodByPattern(/^\s*updateSvgTrackPositions\s*\([^)]*\)\s*\{/m, 'updateSvgTrackPositions');
