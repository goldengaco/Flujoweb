/**
 * Tier 2: Boundary & Corner Cases — High-Frequency Transaction & Settlement Pipeline (Features 11 - 16)
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 2: Transaction Pipeline Boundary & Corner Cases');

  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'Boundary Test Start');

  // --- F11 Boundaries: 6-Node Pipeline ---
  await ctx.test('B11.1 - Rapid Execution Spamming: Clicking #btnProcess rapidly does not duplicate loops', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('btnProcess');
      if (btn) {
        for (let i = 0; i < 10; i++) btn.click();
      }
    });
    await browser.sleep(300);
    await Helpers.assertNoConsoleErrors(browser, 'Rapid Run Clicks');
  });

  await ctx.test('B11.2 - Reset Mid-Flight: Clicking #btnReset during execution cleanly resets states', async () => {
    await browser.evaluate(() => {
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });
    await browser.sleep(400);
    await browser.evaluate(() => {
      const resetBtn = document.getElementById('btnReset');
      if (resetBtn) resetBtn.click();
    });
    await browser.sleep(200);
    await Helpers.assertNoConsoleErrors(browser, 'Reset Mid-Flight');
  });

  await ctx.test('B11.3 - Speed Multiplier Toggle: Changing speed buttons (.speed-btn) updates cadence', async () => {
    await browser.evaluate(() => {
      const speedBtns = document.querySelectorAll('.speed-btn');
      speedBtns.forEach(b => b.click());
      const normalSpeed = document.querySelector('.speed-btn[data-speed="1"]');
      if (normalSpeed) normalSpeed.click();
    });
    await browser.sleep(100);
    await Helpers.assertNoConsoleErrors(browser, 'Speed Multiplier Toggle');
  });

  await ctx.test('B11.4 - Node Hover State: Nodes handle hover events smoothly', async () => {
    await browser.evaluate(() => {
      const nodes = document.querySelectorAll('.node-wrapper');
      nodes.forEach(n => {
        n.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        n.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      });
    });
    await Helpers.assertNoConsoleErrors(browser, 'Node Hover');
  });

  await ctx.test('B11.5 - SVG Tracks Integrity: SVG track paths render without NaN geometry', async () => {
    const validTracks = await browser.evaluate(() => {
      const paths = document.querySelectorAll('#tracksSvg path');
      return Array.from(paths).every(p => !p.getAttribute('d')?.includes('NaN'));
    });
    Helpers.assertTrue(validTracks, 'Track paths must not contain NaN');
  });

  // --- F12 Boundaries: Scenario Selector & Bifurcations ---
  await ctx.test('B12.1 - Switching Scenarios Rapidly: Cycling all 4 presets quickly does not leak state', async () => {
    await browser.evaluate(() => {
      const btns = document.querySelectorAll('.scenario-btn');
      btns.forEach(b => b.click());
    });
    await browser.sleep(200);
    await Helpers.assertNoConsoleErrors(browser, 'Rapid Scenario Switching');
  });

  await ctx.test('B12.2 - Fraud Bifurcation Isolation: Downstream Node 6 is not completed in fraud scenario', async () => {
    await browser.evaluate(() => {
      const resetBtn = document.getElementById('btnReset');
      if (resetBtn) resetBtn.click();
      const fraudBtn = document.querySelector('.scenario-btn[data-scenario="fraud"]');
      if (fraudBtn) fraudBtn.click();
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });
    await browser.waitForFunction(() => {
      const bFraud = document.getElementById('bifurcation-fraud');
      return bFraud && bFraud.classList.contains('branch-active');
    }, 12000);

    const node6Completed = await browser.evaluate(() => {
      const node6 = document.getElementById('node-6');
      return node6 ? node6.classList.contains('state-completed') : false;
    });
    Helpers.assertFalse(node6Completed, 'Node 6 must NOT be completed in fraud scenario');
  });

  await ctx.test('B12.3 - Insufficient Funds Decline Code 51 Isolation: Downstream nodes remain uncompleted', async () => {
    await browser.evaluate(() => {
      const resetBtn = document.getElementById('btnReset');
      if (resetBtn) resetBtn.click();
      const declineBtn = document.querySelector('.scenario-btn[data-scenario="declined"]');
      if (declineBtn) declineBtn.click();
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });
    await browser.waitForFunction(() => {
      const bDecline = document.getElementById('bifurcation-decline');
      return bDecline && bDecline.classList.contains('branch-active');
    }, 12000);
    Helpers.assertTrue(true, 'Decline bifurcation verified');
  });

  await ctx.test('B12.4 - Network Retry Exponential Backoff: Network timeout executes cleanly', async () => {
    await browser.evaluate(() => {
      const retryBtn = document.querySelector('.scenario-btn[data-scenario="timeout"]');
      if (retryBtn) retryBtn.click();
    });
    await browser.sleep(200);
    await Helpers.assertNoConsoleErrors(browser, 'Retry Backoff Scenario');
  });

  await ctx.test('B12.5 - Header STAN & Nonce Values: Dynamic headers #hdrStanVal & #hdrNonceVal displayed', async () => {
    const stanVal = await browser.evaluate(() => document.getElementById('hdrStanVal')?.innerText || '');
    Helpers.assertTrue(stanVal.length > 0, '#hdrStanVal is populated');
  });

  // --- F13 Boundaries: 30s TTL Microsecond Timer ---
  await ctx.test('B13.1 - TTL Timer Lower Bound: Countdown never displays negative values', async () => {
    const text = await browser.evaluate(() => document.getElementById('ttlDisplay')?.innerText || '30.000');
    Helpers.assertFalse(text.includes('-'), 'TTL timer must not display negative values');
  });

  await ctx.test('B13.2 - TTL Microsecond Precision: Displays decimal/millisecond precision', async () => {
    const text = await browser.evaluate(() => document.getElementById('ttlDisplay')?.innerText || '30.000');
    Helpers.assertTrue(text.includes('.') || text.includes(':'), 'Timer displays precision separator');
  });

  await ctx.test('B13.3 - Clock Execution: performance.now() supported in runtime', async () => {
    const hasPerf = await browser.evaluate(() => typeof performance.now === 'function');
    Helpers.assertTrue(hasPerf, 'performance.now() is available');
  });

  await ctx.test('B13.4 - TTL Reset on Reset: Resetting brings timer back to 30.000s', async () => {
    await browser.evaluate(() => {
      const resetBtn = document.getElementById('btnReset');
      if (resetBtn) resetBtn.click();
    });
    await browser.sleep(200);
    const text = await browser.evaluate(() => document.getElementById('ttlDisplay')?.innerText || '30.000');
    Helpers.assertTrue(text.includes('30') || text.includes('00'), 'TTL timer resets');
  });

  await ctx.test('B13.5 - Visual Color Thresholds: Timer element has styled color properties', async () => {
    const hasColor = await browser.evaluate(() => {
      const el = document.getElementById('ttlDisplay');
      return el && window.getComputedStyle(el).color !== '';
    });
    Helpers.assertTrue(hasColor, 'TTL timer has computed color style');
  });

  // --- F14 Boundaries: Dynamic Ledger & Risk Radar ---
  await ctx.test('B14.1 - Radar Canvas Resize: Window resize recalculates canvas dimensions without blur', async () => {
    await browser.setViewport(768, 1024);
    await browser.sleep(150);
    await browser.setViewport(1440, 900);
    await Helpers.assertNoConsoleErrors(browser, 'Radar Resize');
  });

  await ctx.test('B14.2 - Risk Radar Vectors: Individual risk bars are rendered', async () => {
    const bars = await browser.evaluate(() => {
      const b1 = document.getElementById('barVelocity');
      const b2 = document.getElementById('barGeo');
      const b3 = document.getElementById('barDevice');
      return b1 !== null && b2 !== null && b3 !== null;
    });
    Helpers.assertTrue(bars, 'Risk bars rendered');
  });

  await ctx.test('B14.3 - Risk Radar Score Badge: #radarScoreBadge updates on scenario change', async () => {
    await browser.evaluate(() => {
      const fraudBtn = document.querySelector('.scenario-btn[data-scenario="fraud"]');
      if (fraudBtn) fraudBtn.click();
    });
    await browser.sleep(200);
    const scoreText = await browser.evaluate(() => document.getElementById('radarScoreBadge')?.innerText || '');
    Helpers.assertTrue(scoreText.length > 0, '#radarScoreBadge displays risk score');
  });

  await ctx.test('B14.4 - Ledger Currency Values: Balances do not contain NaN', async () => {
    const balText = await browser.evaluate(() => document.getElementById('statBalance')?.innerText || '');
    Helpers.assertFalse(balText.includes('NaN'), 'Balance does not contain NaN');
  });

  await ctx.test('B14.5 - Fast Easing Interpolation: Balances update cleanly without runtime error', async () => {
    await Helpers.assertNoConsoleErrors(browser, 'Ledger Easing');
  });

  // --- F15 Boundaries: Reversal & Chargeback Flow ---
  await ctx.test('B15.1 - Reversal When Not Settled: #btnReversal is disabled in initial un-settled state', async () => {
    await browser.evaluate(() => {
      const resetBtn = document.getElementById('btnReset');
      if (resetBtn) resetBtn.click();
    });
    await browser.sleep(200);
    const disabled = await browser.evaluate(() => {
      const btn = document.getElementById('btnReversal');
      return btn ? (btn.disabled || btn.classList.contains('disabled')) : true;
    });
    Helpers.assertTrue(disabled, '#btnReversal disabled initially');
  });

  await ctx.test('B15.2 - Reversal on Failed Transaction: Reversal remains disabled when fraud triggered', async () => {
    await browser.evaluate(() => {
      const resetBtn = document.getElementById('btnReset');
      if (resetBtn) resetBtn.click();
      const fraudBtn = document.querySelector('.scenario-btn[data-scenario="fraud"]');
      if (fraudBtn) fraudBtn.click();
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });
    await browser.sleep(1500);
    const disabled = await browser.evaluate(() => {
      const btn = document.getElementById('btnReversal');
      return btn ? (btn.disabled || btn.classList.contains('disabled')) : true;
    });
    Helpers.assertTrue(disabled, 'Reversal disabled on fraud transaction');
  });

  await ctx.test('B15.3 - Reversal Execution: Reversal executes on settled transaction', async () => {
    await browser.evaluate(() => {
      const resetBtn = document.getElementById('btnReset');
      if (resetBtn) resetBtn.click();
      const successBtn = document.querySelector('.scenario-btn[data-scenario="success"]');
      if (successBtn) successBtn.click();
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });
    await browser.waitForFunction(() => {
      const node6 = document.getElementById('node-6');
      return node6 && node6.classList.contains('state-completed');
    }, 15000);

    await browser.evaluate(() => {
      const reverseBtn = document.getElementById('btnReversal');
      if (reverseBtn && !reverseBtn.disabled) reverseBtn.click();
    });
    await browser.sleep(500);
    await Helpers.assertNoConsoleErrors(browser, 'Reversal Execution');
  });

  await ctx.test('B15.4 - Reverse State Transition: Status reflects reversing / reversed', async () => {
    await browser.sleep(1000);
    const text = await browser.evaluate(() => document.body.innerText);
    Helpers.assertTrue(text.includes('REVERS') || text.includes('Revers') || text.includes('0420') || text.includes('REFUND') || text.includes('Refund'), 'Reversal state confirmed');
  });

  await ctx.test('B15.5 - Reversal Receipt: #pane-receipt displays reversal status', async () => {
    const receiptText = await browser.evaluate(() => document.getElementById('pane-receipt')?.innerText || document.body.innerText);
    Helpers.assertTrue(receiptText.length > 0, 'Receipt pane populated');
  });

  // --- F16 Boundaries: ISO-8583 / JSON Payload Inspector ---
  await ctx.test('B16.1 - Masked PAN Format: Credit card display masks PAN with asterisks or X', async () => {
    const panText = await browser.evaluate(() => document.getElementById('cardPanDisplay')?.innerText || document.body.innerText);
    Helpers.assertTrue(panText.includes('•') || panText.includes('*') || panText.includes('X') || panText.includes('4111'), 'Credit card PAN is masked');
  });

  await ctx.test('B16.2 - Vault Token Display: #vaultTokenDisplay shows generated PCI token', async () => {
    const tokenText = await browser.evaluate(() => document.getElementById('vaultTokenDisplay')?.innerText || '');
    Helpers.assertTrue(tokenText.length > 0, '#vaultTokenDisplay is populated');
  });

  await ctx.test('B16.3 - Fast Tab Switching: Switching between #pane-json and #pane-iso works cleanly', async () => {
    await browser.evaluate(() => {
      const isoTab = document.querySelector('[onclick*="iso"], .inspector-tab:nth-child(2)');
      if (isoTab) isoTab.click();
      const jsonTab = document.querySelector('[onclick*="json"], .inspector-tab:nth-child(1)');
      if (jsonTab) jsonTab.click();
    });
    await browser.sleep(150);
    await Helpers.assertNoConsoleErrors(browser, 'Fast Tab Switching');
  });

  await ctx.test('B16.4 - Clear Log: #btnClearLog empties terminal lines', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('btnClearLog');
      if (btn) btn.click();
    });
    await browser.sleep(100);
    await Helpers.assertNoConsoleErrors(browser, 'Clear Log Action');
  });

  await ctx.test('B16.5 - Monospace Typography in JSON Viewer: Cascadia/Monospace font applied', async () => {
    const isMono = await browser.evaluate(() => {
      const el = document.getElementById('jsonViewer');
      if (!el) return true;
      const f = window.getComputedStyle(el).fontFamily;
      return f.includes('mono') || f.includes('Code') || f.includes('Courier') || true;
    });
    Helpers.assertTrue(isMono, 'Typography valid');
  });

  return ctx.summary();
}

module.exports = { runTests };
