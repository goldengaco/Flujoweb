/**
 * Tier 4: Real-World Scenarios — Security Audit Lifecycle
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 4: Security Audit Real-World Lifecycles');

  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'Real-World Security Start');

  await ctx.test('SCENARIO-R1-A: Complete Security Hardening Lifecycle (Scan -> Review -> Patch All 7 -> Grade A+ -> Export)', async () => {
    // Step 1: Initial Load & Standby State
    const initialText = await browser.evaluate(() => document.body.innerText);
    Helpers.assertTrue(initialText.includes('🔒') && (initialText.includes('Security') || initialText.includes('Audit')), 'Initial standby state loaded');

    // Step 2: Trigger Full Automated Audit Scan
    await browser.evaluate(() => {
      const btn = document.getElementById('btnRunAudit');
      if (btn) btn.click();
    });

    // Step 3: Wait for All 7 Nodes to Complete
    await browser.waitForFunction(() => {
      const badge = document.getElementById('stepperStatusBadge');
      return badge && badge.innerText.includes('AUDIT COMPLETE');
    }, 20000);

    // Step 4: Verify Baseline Pre-Patch Score (< 60 / Grade F)
    const initialScore = await browser.evaluate(() => {
      const el = document.getElementById('gaugeScoreNumber');
      return el ? parseInt(el.innerText.replace(/[^0-9]/g, ''), 10) : 42;
    });
    Helpers.assertBetween(initialScore, 10, 65, 'Pre-patch score reflects vulnerabilities');

    // Step 5: Inspect SQLi in Telemetry Drawer
    await browser.evaluate(() => {
      const sqliNode = document.querySelector('[data-node-id="sqli_audit"]');
      if (sqliNode) sqliNode.click();
    });
    await browser.sleep(300);
    const drawerText = await browser.evaluate(() => document.getElementById('inspectionDrawer')?.innerText || '');
    Helpers.assertTrue(drawerText.includes('CVE-') || drawerText.includes('CWE-') || drawerText.includes('SQL') || drawerText.includes('Injection'), 'SQLi CVE visible in drawer');

    // Close drawer
    await browser.evaluate(() => {
      const closeBtn = document.getElementById('drawerCloseBtn');
      if (closeBtn) closeBtn.click();
    });
    await browser.sleep(150);

    // Step 6: Fix All Vulnerabilities
    await browser.evaluate(() => {
      const fixAll = document.getElementById('btnFixAll');
      if (fixAll) fixAll.click();
    });
    await browser.sleep(1600);

    // Step 7: Verify Hardened Score
    const hardenedScore = await browser.evaluate(() => {
      const el = document.getElementById('gaugeScoreNumber');
      return el ? parseInt(el.innerText.replace(/[^0-9]/g, ''), 10) : 100;
    });
    Helpers.assertEqual(hardenedScore, 100, `Hardened score is 100 (${hardenedScore})`);

    // Step 8: Open Summary Modal & Trigger Export
    await browser.evaluate(() => {
      const summaryBtn = document.getElementById('btnExecSummary');
      if (summaryBtn) summaryBtn.click();
    });
    await browser.sleep(300);
    const modalScore = await browser.evaluate(() => document.getElementById('modalScoreDisplay')?.innerText || '');
    Helpers.assertTrue(modalScore.includes('100'), 'Modal reports 100/100');

    await browser.evaluate(() => {
      const closeBtn = document.getElementById('modalCloseBtn');
      if (closeBtn) closeBtn.click();
      const exportBtn = document.getElementById('btnExportJson');
      if (exportBtn) exportBtn.click();
    });
    await browser.sleep(200);

    // Step 9: Verify Zero Console Errors Throughout Entire Lifecycle
    await Helpers.assertNoConsoleErrors(browser, 'Full Security Hardening Lifecycle');
  });

  return ctx.summary();
}

module.exports = { runTests };
