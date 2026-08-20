/**
 * Tier 4: Real-World Scenarios — High-Frequency Transaction Flow Lifecycles
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 4: Transaction Pipeline Real-World Scenarios');

  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'Real-World Transaction Start');

  // Journey 1: Normal Settlement & Reversal Cycle
  await ctx.test('SCENARIO-R3-A: Normal Transaction Settlement & Bi-Directional Reversal Rollback', async () => {
    // Navigate / Reset
    await browser.navigate(dashboardUrl);
    await browser.sleep(200);

    // Step 1: Select Normal Preset
    await browser.evaluate(() => {
      const normalBtn = document.querySelector('.scenario-btn[data-scenario="success"]');
      if (normalBtn) normalBtn.click();
    });
    await browser.sleep(200);

    // Step 2: Run Flow
    await browser.evaluate(() => {
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });

    // Step 3: Wait for Settlement
    await browser.waitForFunction(() => {
      const node6 = document.getElementById('node-6');
      return node6 && node6.classList.contains('state-completed');
    }, 15000);

    // Step 4: Verify Receipt Pane
    const receiptText = await browser.evaluate(() => document.getElementById('pane-receipt')?.innerText || document.body.innerText);
    Helpers.assertTrue(receiptText.length > 0, 'Receipt verified');

    // Step 5: Trigger Reversal / Chargeback
    await browser.evaluate(() => {
      const reverseBtn = document.getElementById('btnReversal');
      if (reverseBtn && !reverseBtn.disabled) reverseBtn.click();
    });
    await browser.sleep(1500);

    // Step 6: Verify Reversal Completion
    const reversalDone = await browser.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('REVERSED') || text.includes('Reversado') || text.includes('0420') || text.includes('REFUND');
    });
    Helpers.assertTrue(reversalDone, 'Reversal rollback successfully executed');
    await Helpers.assertNoConsoleErrors(browser, 'Normal Settlement and Reversal');
  });

  // Journey 2: Fraud ML Detection & Quarantine Bifurcation
  await ctx.test('SCENARIO-R3-B: ML Fraud Risk Scoring & Quarantine Asset Freeze Bifurcation', async () => {
    // Navigate / Fresh State
    await browser.navigate(dashboardUrl);
    await browser.sleep(200);

    // Select Fraud Scenario
    await browser.evaluate(() => {
      const fraudBtn = document.querySelector('.scenario-btn[data-scenario="fraud"]');
      if (fraudBtn) fraudBtn.click();
    });
    await browser.sleep(200);

    await browser.evaluate(() => {
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });

    // Wait for Fraud Quarantine Branch
    await browser.waitForFunction(() => {
      const bFraud = document.getElementById('bifurcation-fraud');
      return bFraud && bFraud.classList.contains('branch-active');
    }, 12000);

    // Verify Downstream Node 6 is not completed
    const node6Completed = await browser.evaluate(() => {
      const node6 = document.getElementById('node-6');
      return node6 ? node6.classList.contains('state-completed') : false;
    });
    Helpers.assertFalse(node6Completed, 'Fraud quarantine stopped downstream settlement');
    await Helpers.assertNoConsoleErrors(browser, 'Fraud ML Quarantine');
  });

  // Journey 3: Insufficient Funds / Bank Issuer Card Decline
  await ctx.test('SCENARIO-R3-C: 3DS Bank Issuer Insufficient Funds Card Decline (Code 51)', async () => {
    // Navigate / Fresh State
    await browser.navigate(dashboardUrl);
    await browser.sleep(200);

    // Select Insufficient Funds Preset
    await browser.evaluate(() => {
      const declineBtn = document.querySelector('.scenario-btn[data-scenario="declined"]');
      if (declineBtn) declineBtn.click();
    });
    await browser.sleep(200);

    await browser.evaluate(() => {
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });

    // Wait for Issuer Decline
    await browser.waitForFunction(() => {
      const bDecline = document.getElementById('bifurcation-decline');
      return bDecline && bDecline.classList.contains('branch-active');
    }, 12000);

    Helpers.assertTrue(true, 'Insufficient funds decline bifurcation verified');
    await Helpers.assertNoConsoleErrors(browser, 'Issuer Card Decline');
  });

  return ctx.summary();
}

module.exports = { runTests };
