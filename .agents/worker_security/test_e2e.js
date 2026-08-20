const { spawn } = require('child_process');

async function main() {
  console.log('Starting Headless Edge CDP test runner...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const port = 9333;
  const filePath = 'file:///c:/DevWork/Depredador/Flujoweb/sistemas/security-audit/index.html';

  const edgeProcess = spawn(edgePath, [
    '--headless=new',
    `--remote-debugging-port=${port}`,
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-extensions',
    filePath
  ]);

  edgeProcess.stderr.on('data', () => {});

  let wsUrl = null;
  for (let i = 0; i < 25; i++) {
    await new Promise(r => setTimeout(r, 200));
    try {
      const res = await fetch(`http://127.0.0.1:${port}/json/list`);
      const list = await res.json();
      const pageTarget = list.find(t => t.type === 'page');
      if (pageTarget && pageTarget.webSocketDebuggerUrl) {
        wsUrl = pageTarget.webSocketDebuggerUrl;
        break;
      }
    } catch(e) {}
  }

  if (!wsUrl) {
    console.error('Could not connect to Edge remote debugging!');
    edgeProcess.kill();
    process.exit(1);
  }

  console.log('Connected to Headless Edge Page Target:', wsUrl);

  const WS = globalThis.WebSocket;
  const ws = new WS(wsUrl);

  let id = 1;
  const pending = new Map();
  const consoleLogs = [];
  const errors = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.id && pending.has(msg.id)) {
      const { resolve, reject } = pending.get(msg.id);
      pending.delete(msg.id);
      if (msg.error) reject(msg.error);
      else resolve(msg.result);
    }
    if (msg.method === 'Runtime.consoleAPICalled') {
      consoleLogs.push(msg.params.args.map(a => a.value).join(' '));
    }
    if (msg.method === 'Runtime.exceptionThrown') {
      errors.push(msg.params.exceptionDetails);
    }
  };

  await new Promise(r => {
    ws.onopen = r;
  });

  function send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res.result.value;
  }

  await send('Runtime.enable');
  await send('Page.enable');

  console.log('Navigating to file URL...');
  await send('Page.navigate', { url: filePath });
  await new Promise(r => setTimeout(r, 600));

  // Wait for document to be ready
  for (let i = 0; i < 20; i++) {
    const readyState = await evaluate('document.readyState');
    if (readyState === 'complete') break;
    await new Promise(r => setTimeout(r, 100));
  }

  console.log('Checking stepper nodes in DOM...');
  const debugInfo = await evaluate(`(() => {
    const nodes = document.querySelectorAll('.stepper-node');
    return {
      nodesLength: nodes.length,
      currentUrl: window.location.href,
      htmlTitle: document.title
    };
  })()`);
  console.log('Debug info:', debugInfo);

  console.log('1. Checking Initial DOM state...');
  const initChecks = await evaluate(`(() => {
    const nodes = document.querySelectorAll('.stepper-node');
    const rows = document.querySelectorAll('#vulnTableBody tr');
    const emojis = Array.from(nodes).map(n => {
      const em = n.querySelector('.node-emoji');
      return em ? em.textContent.trim() : 'MISSING';
    });
    const scoreText = document.getElementById('gaugeScoreNumber').textContent.trim();
    return {
      nodeCount: nodes.length,
      rowCount: rows.length,
      emojis: emojis,
      scoreText: scoreText
    };
  })()`);

  console.log('Init state:', initChecks);
  if (initChecks.nodeCount !== 7 || initChecks.rowCount !== 7) {
    throw new Error('Initial node or row count mismatch!');
  }
  if (initChecks.emojis.join('') !== '🔒🛡️🌐💉📜🔑📋') {
    throw new Error('Initial emoji icons mismatch: ' + initChecks.emojis.join(', '));
  }

  console.log('2. Testing Full Audit execution...');
  await evaluate(`auditRunner.runFullAudit()`);
  
  for (let i = 0; i < 50; i++) {
    await new Promise(r => setTimeout(r, 200));
    const isDone = await evaluate(`state.auditComplete`);
    if (isDone) break;
  }

  const postAudit = await evaluate(`(() => {
    return {
      auditComplete: state.auditComplete,
      score: state.calculateTotalScore(),
      grade: gaugeController.getGrade(state.calculateTotalScore()),
      gaugeNumber: document.getElementById('gaugeScoreNumber').textContent.trim(),
      statVulns: document.getElementById('statVulnCount').textContent.trim(),
      maxCvss: document.getElementById('statMaxCvss').textContent.trim()
    };
  })()`);

  console.log('Post-audit state:', postAudit);
  if (!postAudit.auditComplete || postAudit.score !== 42 || postAudit.grade.grade !== 'F') {
    throw new Error('Post-audit score check failed! Expected 42/F, got ' + postAudit.score);
  }

  console.log('3. Testing Drawer drilldown on Node 1 (TLS)...');
  await evaluate(`drawerController.open('tls_audit')`);
  const drawerCheck = await evaluate(`(() => {
    return {
      isOpen: drawerController.isOpen,
      title: document.getElementById('drawerTitle').textContent.trim(),
      hasFlawsTab: !!document.querySelector('.drawer-section')
    };
  })()`);
  console.log('Drawer check:', drawerCheck);
  if (!drawerCheck.isOpen || !drawerCheck.title.includes('SSL / TLS')) {
    throw new Error('Drawer failed to open properly!');
  }
  await evaluate(`drawerController.close()`);

  console.log('4. Testing Matrix Severity Filter (critical)...');
  await evaluate(`(() => {
    document.querySelector('.filter-pill[data-filter="critical"]').click();
  })()`);
  const critRows = await evaluate(`document.querySelectorAll('#vulnTableBody tr').length`);
  console.log('Critical rows count:', critRows);
  if (critRows !== 3) throw new Error('Expected 3 critical rows, got ' + critRows);

  console.log('5. Testing Dynamic Search (CVE-2023-34362)...');
  await evaluate(`(() => {
    document.querySelector('.filter-pill[data-filter="all"]').click();
    const input = document.getElementById('matrixSearchInput');
    input.value = 'CVE-2023-34362';
    input.dispatchEvent(new Event('input'));
  })()`);
  const searchRows = await evaluate(`document.querySelectorAll('#vulnTableBody tr').length`);
  console.log('Search rows count:', searchRows);
  if (searchRows !== 1) throw new Error('Expected 1 search row, got ' + searchRows);

  // Clear search
  await evaluate(`(() => {
    const input = document.getElementById('matrixSearchInput');
    input.value = '';
    input.dispatchEvent(new Event('input'));
  })()`);

  console.log('6. Testing Single Vulnerability Patch Simulation (SQLi)...');
  await evaluate(`auditRunner.togglePatch('sqli_audit')`);
  const patchedScore = await evaluate(`state.calculateTotalScore()`);
  console.log('Score after patching SQLi (+15 pts):', patchedScore);
  if (patchedScore !== 57) throw new Error('Expected score 57 after SQLi patch, got ' + patchedScore);

  console.log('7. Testing Simulate Fix All / Batch Hardening...');
  await evaluate(`auditRunner.simulateFixAll()`);
  await new Promise(r => setTimeout(r, 1600));

  const hardenedState = await evaluate(`(() => {
    return {
      score: state.calculateTotalScore(),
      grade: gaugeController.getGrade(state.calculateTotalScore()),
      compliance: document.getElementById('statCompliance').textContent.trim(),
      patchedCount: state.patchedNodeIds.size,
      allNodesPatchedClass: Array.from(document.querySelectorAll('.stepper-node')).every(n => n.classList.contains('state-patched')),
      emojisStillIntact: Array.from(document.querySelectorAll('.stepper-node')).map(n => n.querySelector('.node-emoji').textContent.trim()).join('')
    };
  })()`);

  console.log('Hardened state:', hardenedState);
  if (hardenedState.score !== 100 || hardenedState.grade.grade !== 'A+' || hardenedState.patchedCount !== 7) {
    throw new Error('Batch hardening failed! Expected 100/A+, got ' + hardenedState.score);
  }
  if (hardenedState.emojisStillIntact !== '🔒🛡️🌐💉📜🔑📋') {
    throw new Error('Emoji preservation check failed after patching: ' + hardenedState.emojisStillIntact);
  }

  console.log('8. Testing Executive Summary Modal...');
  await evaluate(`summaryModal.open()`);
  const modalCheck = await evaluate(`(() => {
    return {
      isOpen: summaryModal.modal.classList.contains('open'),
      scoreText: document.getElementById('modalScoreDisplay').textContent.trim(),
      gradeText: document.getElementById('modalGradeDisplay').textContent.trim()
    };
  })()`);
  console.log('Modal check:', modalCheck);
  if (!modalCheck.isOpen || !modalCheck.scoreText.includes('100')) {
    throw new Error('Summary modal failed to open with 100 score!');
  }
  await evaluate(`summaryModal.close()`);

  console.log('9. Testing Reset functionality...');
  await evaluate(`auditRunner.resetAll()`);
  const resetCheck = await evaluate(`(() => {
    return {
      score: state.calculateTotalScore(),
      patchedCount: state.patchedNodeIds.size,
      gaugeText: document.getElementById('gaugeScoreNumber').textContent.trim()
    };
  })()`);
  console.log('Reset check:', resetCheck);
  if (resetCheck.score !== 0 || resetCheck.patchedCount !== 0 || resetCheck.gaugeText !== '--') {
    throw new Error('Reset failed to restore baseline!');
  }

  console.log('10. Checking for unhandled browser exceptions...');
  if (errors.length > 0) {
    console.error('Browser Exceptions found:', errors);
    throw new Error('Browser console exceptions detected!');
  }

  console.log('\n===============================================================');
  console.log('>>> ALL 10 AUTOMATED E2E BROWSER TESTS PASSED 100% CLEAN! <<<');
  console.log('===============================================================\n');

  ws.close();
  edgeProcess.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('TEST RUNNER FAILED:', err);
  process.exit(1);
});
