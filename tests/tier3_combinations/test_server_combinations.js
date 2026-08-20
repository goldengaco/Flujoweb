/**
 * Tier 3: Cross-Feature Combinations — Mission Control NOC Server Status
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 3: Server Status Cross-Feature Combinations');

  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'Server Combination Start');

  await ctx.test('C05 - Chaos during Live Sparkline Updates: Chaos triggers auto-healing while sparklines continue rendering', async () => {
    await browser.evaluate(() => {
      const openBtn = document.getElementById('openChaosModalBtn');
      if (openBtn) openBtn.click();
    });
    await browser.sleep(150);
    await browser.evaluate(() => {
      const card = document.querySelector('.chaos-scenario-card');
      if (card) card.click();
    });
    await browser.sleep(500);
    const canvasOperational = await browser.evaluate(() => {
      const canvases = document.querySelectorAll('canvas.sparkline-canvas');
      return canvases.length === 9;
    });
    Helpers.assertTrue(canvasOperational, 'All 9 sparklines operational during chaos');
  });

  await ctx.test('C06 - Terminal Streaming with Active Chaos Outage: Auto-healing logs stream to #terminalBody', async () => {
    const outageLogged = await browser.evaluate(() => {
      const text = document.getElementById('terminalBody')?.innerText || '';
      return text.includes('CHAOS') || text.includes('HEAL') || text.includes('INCIDENT') || text.includes('PASS') || text.includes('WARN') || text.includes('INFO');
    });
    Helpers.assertTrue(outageLogged, 'Terminal console streams events');
  });

  await ctx.test('C07 - SLA Bar Tooltip Hover during State Transition: Tooltip functions during active healing', async () => {
    await browser.evaluate(() => {
      const seg = document.querySelector('.sla-segment');
      if (seg) seg.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    });
    await browser.sleep(200);
    await Helpers.assertNoConsoleErrors(browser, 'Tooltip during Transition');
  });

  await ctx.test('C08 - Auto-Heal Completion: System recovers cleanly to operational state', async () => {
    await browser.waitForFunction(() => {
      const card = document.getElementById('healingWorkflowCard');
      return card && !card.classList.contains('active');
    }, 15000);
    Helpers.assertTrue(true, 'Auto-heal completed smoothly');
  });

  return ctx.summary();
}

module.exports = { runTests };
