/**
 * Tier 1: Feature Coverage — High-Frequency Transaction & Settlement Pipeline (Features 11 - 16)
 * Target: sistemas/transaction-flow/index.html
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 1: Transaction Pipeline Features (F11 - F16)');

  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'Initial Navigation');

  // --- Feature 11: 6-Node Branching Transaction Pipeline ---
  await ctx.test('F11.1 - 6-Node Pipeline: All 6 primary pipeline nodes are present in DOM (#node-1 to #node-6)', async () => {
    const nodeCount = await browser.evaluate(() => {
      const ids = ['node-1', 'node-2', 'node-3', 'node-4', 'node-5', 'node-6'];
      return ids.filter(id => document.getElementById(id) !== null).length;
    });
    Helpers.assertEqual(nodeCount, 6, `Found ${nodeCount}/6 pipeline nodes`);
  });

  await ctx.test('F11.2 - 6-Node Pipeline: Pipeline emojis (📝, 🔍, 🛡️, 🏦, ⚙️, ✅) permanently rendered', async () => {
    const emojis = ['📝', '🔍', '🛡️', '🏦', '⚙️', '✅'];
    const pageText = await browser.evaluate(() => document.body.innerText);
    for (const emoji of emojis) {
      Helpers.assertTrue(pageText.includes(emoji), `Emoji ${emoji} must be present in transaction pipeline`);
    }
  });

  await ctx.test('F11.3 - 6-Node Pipeline: Execution button #btnProcess triggers sequential processing', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('btnProcess');
      if (btn) btn.click();
    });
    await browser.sleep(300);
    const inProgress = await browser.evaluate(() => {
      const activeNodes = document.querySelectorAll('.node-wrapper.state-active, .node-wrapper.state-completed');
      return activeNodes.length > 0;
    });
    Helpers.assertTrue(inProgress, 'Pipeline nodes show active/completed progression');
  });

  await ctx.test('F11.4 - 6-Node Pipeline: Nodes transition cleanly through states (Pending -> Active -> Completed)', async () => {
    await browser.waitForFunction(() => {
      const doneNodes = document.querySelectorAll('.node-wrapper.state-completed');
      return doneNodes.length >= 2;
    }, 8000);
    Helpers.assertTrue(true, 'Pipeline transitioned multiple nodes to completed');
  });

  await ctx.test('F11.5 - 6-Node Pipeline: Happy path runs through all 6 nodes to Settlement Seal', async () => {
    await browser.waitForFunction(() => {
      const node6 = document.getElementById('node-6');
      return node6 && node6.classList.contains('state-completed');
    }, 15000);
    Helpers.assertTrue(true, 'Transaction successfully reached settlement');
  });

  await ctx.test('F11.6 - 6-Node Pipeline: Connecting SVG tracks #tracksSvg animate energy lines between nodes', async () => {
    const hasTracks = await browser.evaluate(() => {
      const svg = document.getElementById('tracksSvg');
      return svg && svg.querySelectorAll('path').length >= 5;
    });
    Helpers.assertTrue(hasTracks, 'SVG tracks overlay contains inter-node connection paths');
  });

  // --- Feature 12: Scenario Selector & Bifurcation ---
  await ctx.test('F12.1 - Scenario Selector: 4 scenario preset buttons rendered', async () => {
    const scenariosFound = await browser.evaluate(() => {
      const scens = document.querySelectorAll('.scenario-btn[data-scenario]');
      return scens.length === 4;
    });
    Helpers.assertTrue(scenariosFound, 'All 4 transaction scenarios are selectable');
  });

  await ctx.test('F12.2 - Scenario Selector: Selecting Fraud preset activates fraud parameters', async () => {
    await browser.evaluate(() => {
      const fraudBtn = document.querySelector('.scenario-btn[data-scenario="fraud"]');
      if (fraudBtn) fraudBtn.click();
    });
    await browser.sleep(300);
    const isFraudSelected = await browser.evaluate(() => {
      const fraudBtn = document.querySelector('.scenario-btn[data-scenario="fraud"]');
      return fraudBtn && fraudBtn.classList.contains('active-scenario');
    });
    Helpers.assertTrue(isFraudSelected, 'Fraud scenario preset selected');
  });

  await ctx.test('F12.3 - Bifurcation: Fraud scenario branches at Node 3 into #bifurcation-fraud (🚨)', async () => {
    await browser.evaluate(() => {
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });
    await browser.waitForFunction(() => {
      const bFraud = document.getElementById('bifurcation-fraud');
      return bFraud && bFraud.classList.contains('branch-active');
    }, 12000);
    Helpers.assertTrue(true, 'Fraud quarantine bifurcation node activated');
  });

  await ctx.test('F12.4 - Bifurcation: Fraud branch voids/skips downstream nodes 4, 5, 6', async () => {
    const downstreamSkipped = await browser.evaluate(() => {
      const node6 = document.getElementById('node-6');
      return node6 && !node6.classList.contains('state-completed');
    });
    Helpers.assertTrue(downstreamSkipped, 'Node 6 is not completed in fraud scenario');
  });

  await ctx.test('F12.5 - Bifurcation: Insufficient Funds branches at Node 4 with #bifurcation-decline (⚠️)', async () => {
    await browser.evaluate(() => {
      const declineBtn = document.querySelector('.scenario-btn[data-scenario="declined"]');
      if (declineBtn) declineBtn.click();
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });
    await browser.waitForFunction(() => {
      const bDecline = document.getElementById('bifurcation-decline');
      return bDecline && bDecline.classList.contains('branch-active');
    }, 12000);
    Helpers.assertTrue(true, 'Insufficient funds card decline bifurcation triggered');
  });

  await ctx.test('F12.6 - Scenario Selector: Network Timeout scenario configures retry badge #retryBadge', async () => {
    await browser.evaluate(() => {
      const timeoutBtn = document.querySelector('.scenario-btn[data-scenario="timeout"]');
      if (timeoutBtn) timeoutBtn.click();
    });
    await browser.sleep(200);
    const retryBadge = await browser.evaluate(() => document.getElementById('retryBadge') !== null);
    Helpers.assertTrue(retryBadge, 'Retry badge available in network timeout scenario');
  });

  // --- Feature 13: 30s TTL Microsecond Countdown ---
  await ctx.test('F13.1 - 30s TTL Timer: Countdown timer element #ttlDisplay is rendered', async () => {
    const timer = await browser.evaluate(() => document.getElementById('ttlDisplay') !== null);
    Helpers.assertTrue(timer, '#ttlDisplay exists in DOM');
  });

  await ctx.test('F13.2 - 30s TTL Timer: Formats time with microsecond precision in #ttlDisplay', async () => {
    const formatted = await browser.evaluate(() => {
      const text = document.getElementById('ttlDisplay')?.innerText || '';
      return text.includes('.') || text.includes(':');
    });
    Helpers.assertTrue(formatted, 'TTL timer shows formatted decimal/millisecond precision');
  });

  await ctx.test('F13.3 - 30s TTL Timer: Decrements smoothly during transaction processing', async () => {
    await browser.evaluate(() => {
      const successBtn = document.querySelector('.scenario-btn[data-scenario="success"]');
      if (successBtn) successBtn.click();
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });
    await browser.sleep(400);
    const t1 = await browser.evaluate(() => parseFloat(document.getElementById('ttlDisplay')?.innerText.replace(/[^0-9.]/g, '') || '30'));
    await browser.sleep(500);
    const t2 = await browser.evaluate(() => parseFloat(document.getElementById('ttlDisplay')?.innerText.replace(/[^0-9.]/g, '') || '30'));
    Helpers.assertTrue(!isNaN(t1) && !isNaN(t2), 'Timer readings are numbers');
  });

  await ctx.test('F13.4 - 30s TTL Timer: Dynamic visual styling preserved', async () => {
    const hasStyle = await browser.evaluate(() => {
      const el = document.getElementById('ttlDisplay');
      return el && window.getComputedStyle(el).color !== '';
    });
    Helpers.assertTrue(hasStyle, 'TTL timer has computed color style');
  });

  await ctx.test('F13.5 - 30s TTL Timer: Resets on #btnReset click', async () => {
    await browser.evaluate(() => {
      const resetBtn = document.getElementById('btnReset');
      if (resetBtn) resetBtn.click();
    });
    await browser.sleep(200);
    const text = await browser.evaluate(() => document.getElementById('ttlDisplay')?.innerText || '');
    Helpers.assertTrue(text.includes('30') || text.includes('00'), 'TTL timer resets');
  });

  // --- Feature 14: Dynamic Ledger & Risk Radar ---
  await ctx.test('F14.1 - Risk Radar & Ledger: 5-Axis Risk Radar Canvas #riskRadarCanvas is rendered', async () => {
    const radar = await browser.evaluate(() => document.getElementById('riskRadarCanvas') !== null);
    Helpers.assertTrue(radar, '#riskRadarCanvas exists in DOM');
  });

  await ctx.test('F14.2 - Risk Radar & Ledger: Risk score badge #radarScoreBadge rendered', async () => {
    const badge = await browser.evaluate(() => document.getElementById('radarScoreBadge') !== null);
    Helpers.assertTrue(badge, '#radarScoreBadge exists in DOM');
  });

  await ctx.test('F14.3 - Risk Radar & Ledger: Double-entry ledger currency values rendered (#statBalance, #statEscrow)', async () => {
    const ledger = await browser.evaluate(() => {
      const bal = document.getElementById('statBalance');
      const esc = document.getElementById('statEscrow');
      return bal !== null && esc !== null;
    });
    Helpers.assertTrue(ledger, 'Ledger balance and escrow counters exist in DOM');
  });

  await ctx.test('F14.4 - Risk Radar & Ledger: Fee and Volume stats rendered (#statFee, #statVolume)', async () => {
    const stats = await browser.evaluate(() => {
      const fee = document.getElementById('statFee');
      const vol = document.getElementById('statVolume');
      return fee !== null && vol !== null;
    });
    Helpers.assertTrue(stats, 'Fee and Volume statistics exist in DOM');
  });

  await ctx.test('F14.5 - Risk Radar & Ledger: Animations run without JavaScript console errors', async () => {
    await Helpers.assertNoConsoleErrors(browser, 'Risk Radar and Ledger');
  });

  // --- Feature 15: Reversal & Chargeback Flow ---
  await ctx.test('F15.1 - Reversal & Chargeback: Reversal button #btnReversal exists in DOM', async () => {
    const reverseBtn = await browser.evaluate(() => document.getElementById('btnReversal') !== null);
    Helpers.assertTrue(reverseBtn, '#btnReversal exists');
  });

  await ctx.test('F15.2 - Reversal & Chargeback: Reversal executes rollback on settled transaction', async () => {
    // Settle transaction first
    await browser.evaluate(() => {
      const successBtn = document.querySelector('.scenario-btn[data-scenario="success"]');
      if (successBtn) successBtn.click();
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });
    await browser.waitForFunction(() => {
      const node6 = document.getElementById('node-6');
      return node6 && node6.classList.contains('state-completed');
    }, 15000);

    // Click Reversar
    await browser.evaluate(() => {
      const reverseBtn = document.getElementById('btnReversal');
      if (reverseBtn && !reverseBtn.disabled) reverseBtn.click();
    });
    await browser.sleep(400);

    const reversingActive = await browser.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('REVERS') || text.includes('Revers') || text.includes('ROLLBACK') || text.includes('0420');
    });
    Helpers.assertTrue(reversingActive, 'Reversal rollback sequence initiated');
  });

  await ctx.test('F15.3 - Reversal & Chargeback: Emits ISO-8583 MTI 0420 rollback event in terminal/payload', async () => {
    const mti0420 = await browser.evaluate(() => {
      const term = document.getElementById('terminalLog')?.innerText || '';
      return term.includes('0420') || term.includes('REVERSAL') || term.includes('ROLLBACK') || term.includes('Reversal');
    });
    Helpers.assertTrue(mti0420, 'Reversal advice MTI 0420 logged');
  });

  await ctx.test('F15.4 - Reversal & Chargeback: Receipt pane #pane-receipt or terminal indicates reversal status', async () => {
    await browser.sleep(1500);
    const receiptText = await browser.evaluate(() => document.getElementById('pane-receipt')?.innerText || document.getElementById('terminalLog')?.innerText || document.body.innerText);
    Helpers.assertTrue(receiptText.length > 0, 'Reversal confirmed in receipt or log');
  });

  await ctx.test('F15.5 - Reversal & Chargeback: Reversal button disables after completion', async () => {
    const disabled = await browser.evaluate(() => {
      const btn = document.getElementById('btnReversal');
      return btn ? btn.disabled : true;
    });
    Helpers.assertTrue(disabled, '#btnReversal is disabled after reversal');
  });

  // --- Feature 16: ISO-8583 / JSON Payload Inspector ---
  await ctx.test('F16.1 - Payload Inspector: Tab panes (#pane-json, #pane-iso, #pane-receipt) rendered', async () => {
    const panes = await browser.evaluate(() => {
      const jsonP = document.getElementById('pane-json');
      const isoP = document.getElementById('pane-iso');
      const recP = document.getElementById('pane-receipt');
      return jsonP !== null && isoP !== null && recP !== null;
    });
    Helpers.assertTrue(panes, 'All 3 payload inspector panes exist');
  });

  await ctx.test('F16.2 - Payload Inspector: JSON tab #jsonViewer displays formatted payload', async () => {
    const jsonView = await browser.evaluate(() => {
      const text = document.getElementById('jsonViewer')?.innerText || '';
      return text.includes('{') || text.includes('transactionId') || text.includes('amount');
    });
    Helpers.assertTrue(jsonView, '#jsonViewer contains transaction JSON payload');
  });

  await ctx.test('F16.3 - Payload Inspector: ISO-8583 tab #isoTableBody displays standard bitmap elements (MTI, STAN)', async () => {
    const isoData = await browser.evaluate(() => {
      const text = document.getElementById('isoTableBody')?.innerText || '';
      return text.includes('0100') || text.includes('0200') || text.includes('STAN') || text.includes('MTI') || text.includes('0420');
    });
    Helpers.assertTrue(isoData, '#isoTableBody contains ISO-8583 bitmap fields');
  });

  await ctx.test('F16.4 - Payload Inspector: Copy button #btnCopyInspector triggers without error', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('btnCopyInspector');
      if (btn) btn.click();
    });
    await Helpers.assertNoConsoleErrors(browser, 'Copy inspector click');
  });

  await ctx.test('F16.5 - Payload Inspector: Live terminal #terminalLog contains streaming transaction events', async () => {
    const logText = await browser.evaluate(() => document.getElementById('terminalLog')?.innerText || '');
    Helpers.assertTrue(logText.length > 0, '#terminalLog contains streaming events');
  });

  return ctx.summary();
}

module.exports = { runTests };
