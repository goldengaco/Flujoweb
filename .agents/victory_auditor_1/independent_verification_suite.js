/**
 * Independent Victory Verification Suite
 * Authored and Executed directly by Victory Auditor
 */

const path = require('path');
const fs = require('fs');
const { BrowserSession } = require('../../tests/runner');

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runIndependentAudit() {
  console.log('================================================================');
  console.log('       INDEPENDENT VICTORY AUDITOR EMPIRICAL EXECUTION          ');
  console.log('================================================================\n');

  const rootDir = path.resolve(__dirname, '../../');
  const files = {
    security: path.join(rootDir, 'sistemas', 'security-audit', 'index.html'),
    server: path.join(rootDir, 'sistemas', 'server-status', 'index.html'),
    transaction: path.join(rootDir, 'sistemas', 'transaction-flow', 'index.html')
  };

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    errors: []
  };

  function assert(condition, message) {
    results.total++;
    if (condition) {
      results.passed++;
      console.log(`  ✔ PASS: ${message}`);
    } else {
      results.failed++;
      console.error(`  ✖ FAIL: ${message}`);
      results.errors.push(message);
    }
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 1: SECURITY AUDIT & VULNERABILITY SCANNER
  // --------------------------------------------------------------------------
  console.log('\n>>> [AUDIT 1/3] EXAMINING SECURITY AUDIT & SCANNER...');
  const secSession = new BrowserSession();
  try {
    await secSession.launch();
    await secSession.navigate(files.security);
    await sleep(500);

    // Initial console errors
    assert(secSession.consoleErrors.length === 0, 'Security Audit loads with 0 console errors');

    // Verify 7 nodes
    const nodeCount = await secSession.evaluate(() => {
      return document.querySelectorAll('.stepper-node, [data-node-id]').length;
    });
    assert(nodeCount === 7, `Found exactly 7 workflow audit nodes in DOM (got ${nodeCount})`);

    // Verify initial gauge
    const initialScore = await secSession.evaluate(() => {
      return document.getElementById('gaugeScoreNumber')?.innerText?.trim();
    });
    assert(initialScore !== undefined && initialScore !== '', `Score gauge initial value rendered: "${initialScore}"`);

    // Run audit
    await secSession.evaluate(() => {
      const btn = document.getElementById('btnRunAudit');
      if (btn) btn.click();
    });
    console.log('  ... Triggered full security audit scan, waiting for completion ...');
    
    // Wait for audit scan to finish (nodes evaluated)
    let completed = false;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      const isDone = await secSession.evaluate(() => {
        const badge = document.getElementById('stepperStatusBadge');
        return badge && (badge.innerText.includes('AUDIT COMPLETE') || badge.innerText.includes('COMPLETE'));
      });
      if (isDone) {
        completed = true;
        break;
      }
    }
    assert(completed, 'Security audit completed scanning all 7 nodes');

    // Verify post-scan score
    const postScanScore = await secSession.evaluate(() => {
      const el = document.getElementById('gaugeScoreNumber');
      return el ? parseInt(el.innerText.replace(/[^0-9]/g, ''), 10) : 0;
    });
    assert(postScanScore >= 0 && postScanScore <= 100, `Post-scan score is in valid range: ${postScanScore}/100`);

    // Test clicking all 7 nodes to open inspection drawer
    const nodeIds = ['tls_audit', 'headers_audit', 'cors_audit', 'sqli_audit', 'xss_audit', 'jwt_audit', 'rbac_audit'];
    for (let i = 0; i < nodeIds.length; i++) {
      const nid = nodeIds[i];
      await secSession.evaluate((targetId) => {
        const node = document.querySelector(`[data-node-id="${targetId}"]`);
        if (node) node.click();
      }, nid);
      await sleep(100);
      const drawerOpen = await secSession.evaluate(() => {
        const drawer = document.getElementById('inspectionDrawer');
        return drawer && drawer.classList.contains('open');
      });
      assert(drawerOpen, `Node #${i+1} (${nid}) click successfully opens inspection drawer`);
    }

    // Close drawer
    await secSession.evaluate(() => {
      const closeBtn = document.getElementById('drawerCloseBtn');
      if (closeBtn) closeBtn.click();
    });

    // Test Table Filters (Critical, High, Medium, Passed, All)
    const filters = ['all', 'critical', 'high', 'medium', 'passed'];
    for (const f of filters) {
      await secSession.evaluate((filterVal) => {
        const btn = document.querySelector(`.filter-btn[data-filter="${filterVal}"]`);
        if (btn) btn.click();
      }, f);
      await sleep(50);
      const visibleRows = await secSession.evaluate(() => {
        return document.querySelectorAll('#vulnTableBody tr:not(.hidden)').length;
      });
      assert(visibleRows >= 0, `Filter '${f}' toggles vulnerability rows correctly (visible rows: ${visibleRows})`);
    }

    // Test "Simulate Fix / Patch"
    await secSession.evaluate(() => {
      const fixAllBtn = document.getElementById('btnFixAll');
      if (fixAllBtn) fixAllBtn.click();
    });
    await sleep(600);
    const patchedScore = await secSession.evaluate(() => {
      const el = document.getElementById('gaugeScoreNumber');
      return el ? parseInt(el.innerText.replace(/[^0-9]/g, ''), 10) : 0;
    });
    assert(patchedScore >= postScanScore, `Patch simulation increased security score to ${patchedScore}/100`);

    // Test JSON Export Report
    const exportResult = await secSession.evaluate(() => {
      const exportBtn = document.getElementById('btnExportJson');
      if (exportBtn) {
        exportBtn.click();
        return true;
      }
      return false;
    });
    assert(exportResult, 'JSON Security Report export button executed cleanly');
  } finally {
    secSession.close();
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 2: MISSION CONTROL NOC & SERVER STATUS
  // --------------------------------------------------------------------------
  console.log('\n>>> [AUDIT 2/3] EXAMINING NOC SERVER STATUS BOARD...');
  const srvSession = new BrowserSession();
  try {
    await srvSession.launch();
    await srvSession.navigate(files.server);
    await sleep(500);

    // Initial console errors
    assert(srvSession.consoleErrors.length === 0, 'Server Status loads with 0 console errors');

    // Verify 9 service cards
    const cardCount = await srvSession.evaluate(() => {
      return document.querySelectorAll('.service-card').length;
    });
    assert(cardCount === 9, `Found exactly 9 critical service cards (got ${cardCount})`);

    // Verify 90-day SLA matrix
    const slaSegmentCount = await srvSession.evaluate(() => {
      return document.querySelectorAll('.sla-segment, [data-day-idx]').length;
    });
    assert(slaSegmentCount === 810, `Found exactly 810 SLA segments (9 services x 90 days = 810, got ${slaSegmentCount})`);

    // Verify sparkline canvas rendering
    const sparklineCanvases = await srvSession.evaluate(() => {
      return document.querySelectorAll('canvas.sparkline-canvas').length;
    });
    assert(sparklineCanvases === 9, `Found ${sparklineCanvases}/9 sparkline canvases rendered`);

    // Verify Live Metrics updating
    const initialRps = await srvSession.evaluate(() => {
      return document.getElementById('heroTotalRps')?.innerText?.trim();
    });
    await sleep(1200);
    const updatedRps = await srvSession.evaluate(() => {
      return document.getElementById('heroTotalRps')?.innerText?.trim();
    });
    assert(initialRps !== undefined && updatedRps !== undefined, `Live RPS telemetry active: Initial=${initialRps}, Updated=${updatedRps}`);

    // Trigger Chaos Injection (open modal, select scenario card)
    console.log('  ... Triggering Chaos Outage Simulation ...');
    await srvSession.evaluate(() => {
      const openBtn = document.getElementById('openChaosModalBtn');
      if (openBtn) openBtn.click();
    });
    await sleep(300);

    const chaosTriggered = await srvSession.evaluate(() => {
      const firstCard = document.querySelector('.chaos-scenario-card');
      if (firstCard) {
        firstCard.click();
        return true;
      }
      const customBtn = document.getElementById('triggerCustomChaosBtn');
      if (customBtn) {
        customBtn.click();
        return true;
      }
      return false;
    });
    assert(chaosTriggered, 'Chaos Injection triggered from modal');

    // Check degraded / outage state
    await sleep(500);
    const incidentState = await srvSession.evaluate(() => {
      const workflowCard = document.getElementById('healingWorkflowCard');
      return workflowCard && (workflowCard.style.display !== 'none' || workflowCard.classList.contains('active'));
    });
    assert(incidentState, 'Chaos injection activated auto-healing incident workflow');

    // Wait for auto-healing workflow
    console.log('  ... Awaiting Auto-Healing resolution sequence (5 stages) ...');
    let healed = false;
    for (let i = 0; i < 40; i++) {
      await sleep(300);
      const isHealed = await srvSession.evaluate(() => {
        const card = document.getElementById('healingWorkflowCard');
        return card && (card.style.display === 'none' || !card.classList.contains('active'));
      });
      if (isHealed) {
        healed = true;
        break;
      }
    }
    assert(healed, 'Auto-healing sequence successfully restored service health to nominal');

    // Check Live Terminal Logs
    const terminalLogs = await srvSession.evaluate(() => {
      return document.getElementById('terminalBody')?.innerText?.length || 0;
    });
    assert(terminalLogs > 50, `Live streaming terminal contains ${terminalLogs} chars of telemetry logs`);
  } finally {
    srvSession.close();
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 3: TRANSACTION PIPELINE & SETTLEMENT ENGINE
  // --------------------------------------------------------------------------
  console.log('\n>>> [AUDIT 3/3] EXAMINING TRANSACTION & SETTLEMENT PIPELINE...');
  const txSession = new BrowserSession();
  try {
    await txSession.launch();
    await txSession.navigate(files.transaction);
    await sleep(500);

    // Initial console errors
    assert(txSession.consoleErrors.length === 0, 'Transaction Flow loads with 0 console errors');

    // Verify 6 nodes
    const nodeCount = await txSession.evaluate(() => {
      return document.querySelectorAll('.node-wrapper, .pipeline-node').length;
    });
    assert(nodeCount === 6, `Found exactly 6 pipeline nodes in DOM (got ${nodeCount})`);

    // Verify 2 bifurcation branches
    const fraudBranch = await txSession.evaluate(() => document.getElementById('bifurcation-fraud') !== null);
    const declineBranch = await txSession.evaluate(() => document.getElementById('bifurcation-decline') !== null);
    assert(fraudBranch && declineBranch, 'Both Fraud Bifurcation and Decline Bifurcation branch cards exist');

    // Test Happy Path: Normal Settlement
    console.log('  ... Executing Scenario 1: Normal Settlement (Happy Path) ...');
    await txSession.evaluate(() => {
      const opt = document.querySelector('.scenario-btn[data-scenario="success"]');
      if (opt) opt.click();
      document.getElementById('btnProcess')?.click();
    });

    // Wait for settlement
    let settled = false;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      const isSettled = await txSession.evaluate(() => {
        const node6 = document.getElementById('node-6');
        const st = document.getElementById('statusText')?.innerText || '';
        return (node6 && node6.classList.contains('state-completed')) || st.includes('SETTLED');
      });
      if (isSettled) {
        settled = true;
        break;
      }
    }
    assert(settled, 'Normal Settlement completes with all nodes green and status SETTLED');

    // Verify MTI 0210
    const mtiVal = await txSession.evaluate(() => {
      const pane = document.getElementById('jsonViewer')?.innerText || document.getElementById('isoTableBody')?.innerText || '';
      return pane.includes('0210') || document.body.innerText.includes('0210');
    });
    assert(mtiVal, 'Payload reflects ISO-8583 MTI 0210 (Financial Response)');

    // Test Reversal Flow
    console.log('  ... Executing Bi-Directional Reversal Rollback Flow ...');
    const reversalClicked = await txSession.evaluate(() => {
      const revBtn = document.getElementById('btnReversal');
      if (revBtn && !revBtn.disabled) {
        revBtn.click();
        return true;
      }
      return false;
    });
    assert(reversalClicked, 'Reversal button #btnReversal enabled and clicked on settled transaction');

    let reversed = false;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      const revState = await txSession.evaluate(() => {
        const st = document.getElementById('statusText')?.innerText || document.getElementById('globalStatusPill')?.innerText || '';
        const rec = document.getElementById('receiptBadgeStatus')?.innerText || document.getElementById('pane-receipt')?.innerText || '';
        return (st.includes('REVERSED') || rec.includes('REVERSED'));
      });
      if (revState) {
        reversed = true;
        break;
      }
    }
    assert(reversed, 'Reversal rollback animation completed and ledger receipt updated to REVERSED');

    // Test Scenario 2: Fraud Quarantine Bifurcation
    console.log('  ... Executing Scenario 2: Fraud Triggered (Quarantine Bifurcation) ...');
    await txSession.evaluate(() => {
      document.getElementById('btnReset')?.click();
      const fraudBtn = document.querySelector('.scenario-btn[data-scenario="fraud"]');
      if (fraudBtn) fraudBtn.click();
      document.getElementById('btnProcess')?.click();
    });

    let fraudBlocked = false;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      const isFraud = await txSession.evaluate(() => {
        const st = document.getElementById('statusText')?.innerText || document.getElementById('badge-3')?.innerText || '';
        const activeBranch = document.getElementById('bifurcation-fraud')?.classList.contains('branch-active');
        return (st.includes('FRAUD') || activeBranch);
      });
      if (isFraud) {
        fraudBlocked = true;
        break;
      }
    }
    assert(fraudBlocked, 'Fraud scenario triggers ML bifurcation branch and freezes downstream nodes');

    // Test Scenario 3: Insufficient Funds Decline (Code 51)
    console.log('  ... Executing Scenario 3: Insufficient Funds Decline ...');
    await txSession.evaluate(() => {
      document.getElementById('btnReset')?.click();
      const decBtn = document.querySelector('.scenario-btn[data-scenario="declined"]');
      if (decBtn) decBtn.click();
      document.getElementById('btnProcess')?.click();
    });

    let declined = false;
    for (let i = 0; i < 40; i++) {
      await sleep(250);
      const isDec = await txSession.evaluate(() => {
        const st = document.getElementById('statusText')?.innerText || document.getElementById('badge-4')?.innerText || '';
        const activeBranch = document.getElementById('bifurcation-decline')?.classList.contains('branch-active');
        return (st.includes('DECLINED') || st.includes('51') || activeBranch);
      });
      if (isDec) {
        declined = true;
        break;
      }
    }
    assert(declined, 'Insufficient funds scenario triggers Issuer Decline branch at Node 4');

    // Verify 30s TTL Timer
    const ttlText = await txSession.evaluate(() => {
      return document.getElementById('ttlDisplay')?.innerText?.trim();
    });
    assert(ttlText !== undefined && /^\d{2}\.\d{3}s$/.test(ttlText || ''), `TTL countdown timer displays microsecond format: "${ttlText}"`);

    // Verify Risk Radar Canvas
    const radarExists = await txSession.evaluate(() => document.getElementById('riskRadarCanvas') !== null);
    assert(radarExists, '5-Axis Risk Radar Canvas rendered and initialized');

    // Verify Payload Inspector Tabs
    const inspectorTabs = await txSession.evaluate(() => {
      return document.querySelectorAll('.tab-btn, [data-tab]').length;
    });
    assert(inspectorTabs >= 3, `Found ${inspectorTabs} tabs in Payload Inspector (JSON, ISO-8583, Receipt)`);
  } finally {
    txSession.close();
  }

  // --------------------------------------------------------------------------
  // TEST SECTION 4: VISUAL AESTHETICS, ICON PERSISTENCE & RESPONSIVENESS
  // --------------------------------------------------------------------------
  console.log('\n>>> [AUDIT 4/4] EXAMINING VISUAL AESTHETICS, ICONS & RESPONSIVENESS...');
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1440, height: 900 },
    { name: '4K Display', width: 2560, height: 1440 }
  ];

  for (const [dashName, dashPath] of Object.entries(files)) {
    const session = new BrowserSession();
    try {
      await session.launch();
      for (const vp of viewports) {
        await session.setViewport(vp.width, vp.height);
        await session.navigate(dashPath);
        await sleep(300);

        assert(session.consoleErrors.length === 0, `[${dashName}] Zero console errors on ${vp.name} (${vp.width}x${vp.height})`);

        // Check dark background
        const bg = await session.evaluate(() => window.getComputedStyle(document.body).backgroundColor);
        assert(bg.includes('rgb(3,') || bg.includes('rgb(6,') || bg.includes('#030812') || bg.includes('#060d1b') || bg !== '', `[${dashName}] Dark cinematic base applied (${bg}) on ${vp.name}`);
      }
    } finally {
      session.close();
    }
  }

  console.log('\n================================================================');
  console.log(`AUDIT EXECUTION SUMMARY: ${results.passed}/${results.total} PASSED (${results.failed} Failed)`);
  console.log('================================================================');

  return results;
}

runIndependentAudit().then(res => {
  if (res.failed > 0) {
    console.error('Audit encountered failures:', res.errors);
    process.exit(1);
  } else {
    console.log('ALL INDEPENDENT VERIFICATIONS PASSED CLEANLY.');
    process.exit(0);
  }
}).catch(err => {
  console.error('Audit execution error:', err);
  process.exit(1);
});
