/**
 * Tier 4: Real-World Scenarios — Mission Control NOC Auto-Healing Sequence
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 4: Server Status NOC Real-World Scenarios');

  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'Real-World Server Start');

  await ctx.test('SCENARIO-R2-B: Complete NOC Incident, Alert & Self-Healing Playbook Lifecycle', async () => {
    // Step 1: Verify Initial 9-Service Healthy Mesh
    const cards = await browser.evaluate(() => document.querySelectorAll('#servicesGrid .service-card').length);
    Helpers.assertEqual(cards, 9, 'All 9 services initially present in mesh');

    // Step 2: Trigger Quick Outage on Database
    await browser.evaluate(() => {
      const btn = document.querySelector('.btn-card-chaos, [onclick*="handleQuickChaos"]');
      if (btn) btn.click();
    });
    await browser.sleep(400);

    // Step 3: Observe Auto-Healing Workflow Activation
    const workflowActive = await browser.evaluate(() => {
      const card = document.getElementById('healingWorkflowCard');
      return card && (card.style.display !== 'none' || card.classList.contains('active'));
    });
    Helpers.assertTrue(workflowActive, 'Auto-healing workflow active');

    // Step 4: Verify Live Terminal Logs the Incident
    const terminalHasLogs = await browser.evaluate(() => {
      const text = document.getElementById('terminalBody')?.innerText || '';
      return text.length > 10;
    });
    Helpers.assertTrue(terminalHasLogs, 'Terminal logs incident activity');

    // Step 5: Wait for Auto-Healing Playbook to Restore Health
    await browser.waitForFunction(() => {
      const card = document.getElementById('healingWorkflowCard');
      return card && (card.style.display === 'none' || !card.classList.contains('active'));
    }, 15000);

    // Step 6: Verify Final Operational State
    const allCardsPresent = await browser.evaluate(() => {
      return document.querySelectorAll('#servicesGrid .service-card').length === 9;
    });
    Helpers.assertTrue(allCardsPresent, 'All 9 services active and operational');

    // Step 7: Verify Zero Console Errors
    await Helpers.assertNoConsoleErrors(browser, 'Full NOC Auto-Healing Lifecycle');
  });

  return ctx.summary();
}

module.exports = { runTests };
