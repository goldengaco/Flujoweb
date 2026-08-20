const fs = require('fs');

const tx = fs.readFileSync('sistemas/transaction-flow/index.html', 'utf8');

const classIdx = tx.indexOf('class PipelineEngine');
const endScriptIdx = tx.indexOf('</script>', classIdx);
const classCode = tx.slice(classIdx, endScriptIdx);

const lines = classCode.split('\n');
console.log('Total lines in PipelineEngine:', lines.length);
lines.forEach((line, i) => {
  if (line.match(/^\s*(async\s+)?[a-zA-Z0-9_$]+\s*\([^)]*\)\s*\{/)) {
    console.log(i + ': ' + line.trim());
  }
});
