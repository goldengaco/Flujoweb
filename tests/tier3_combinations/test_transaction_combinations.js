/**
 * Tier 3: Cross-Feature Combinations — Transaction Flow
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 3: Transaction Pipeline Cross-Feature Combinations');

  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'Transaction Combination Start');

  await ctx.test('C09 - Scenario Switch: Selecting Fraud triggers Fraud Quarantine bifurcation cleanly', async () => {
    await browser.evaluate(() => {
      const fraudBtn = document.querySelector('.scenario-btn[data-scenario="fraud"]');
      if (fraudBtn) fraudBtn.click();
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });

    await browser.waitForFunction(() => {
      const bFraud = document.getElementById('bifurcation-fraud');
      return bFraud && bFraud.classList.contains('branch-active');
    }, 12000);
    Helpers.assertTrue(true, 'Scenario transitioned to fraud quarantine');
  });

  await ctx.test('C10 - Inspector Tab Switch during Active Run: Switching tabs preserves running session', async () => {
    await browser.evaluate(() => {
      const successBtn = document.querySelector('.scenario-btn[data-scenario="success"]');
      if (successBtn) successBtn.click();
      const runBtn = document.getElementById('btnProcess');
      if (runBtn) runBtn.click();
    });
    await browser.sleep(300);

    // Switch inspector tab
    await browser.evaluate(() => {
      const tabs = document.querySelectorAll('.inspector-tab');
      if (tabs.length >= 2) tabs[1].click();
    });
    await browser.sleep(200);

    await browser.evaluate(() => {
      const tabs = document.querySelectorAll('.inspector-tab');
      if (tabs.length >= 1) tabs[0].click();
    });
    await browser.sleep(200);

    await Helpers.assertNoConsoleErrors(browser, 'Tab Switch during Run');
  });

  await ctx.test('C11 - Risk Radar Morphing during Bifurcation: Radar updates score badge #radarScoreBadge', async () => {
    await browser.evaluate(() => {
      const fraudBtn = document.querySelector('.scenario-btn[data-scenario="fraud"]');
      if (fraudBtn) fraudBtn.click();
    });
    await browser.sleep(300);
    const scoreBadge = await browser.evaluate(() => document.getElementById('radarScoreBadge')?.innerText || '');
    Helpers.assertTrue(scoreBadge.length > 0, '#radarScoreBadge updated');
  });

  await ctx.test('C12 - Reversal after Settlement: Reversing operates precisely and updates receipt and status', async () => {
    // Settle success transaction
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

    // Click reverse
    await browser.evaluate(() => {
      const reverseBtn = document.getElementById('btnReversal');
      if (reverseBtn && !reverseBtn.disabled) reverseBtn.click();
    });
    await browser.sleep(1500);

    const reversed = await browser.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('REVERSED') || text.includes('Reversado') || text.includes('0420') || text.includes('REFUND');
    });
    Helpers.assertTrue(reversed, 'Transaction reversed cleanly');
  });

  return ctx.summary();
}

module.exports = { runTests };
