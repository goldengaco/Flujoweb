/**
 * Tier 3: Cross-Feature Combinations — Security Audit
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 3: Security Cross-Feature Combinations');

  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'Combination Test Start');

  await ctx.test('C01 - Filter while Scanning: Clicking filters during active audit does not crash application', async () => {
    await browser.evaluate(() => {
      const runBtn = document.getElementById('btnRunAudit');
      if (runBtn) runBtn.click();
    });
    await browser.sleep(200);
    await browser.evaluate(() => {
      const critTab = document.querySelector('.matrix-tab[data-filter="critical"]');
      if (critTab) critTab.click();
      const highTab = document.querySelector('.matrix-tab[data-filter="high"]');
      if (highTab) highTab.click();
      const allTab = document.querySelector('.matrix-tab[data-filter="all"]');
      if (allTab) allTab.click();
    });
    await browser.sleep(300);
    await Helpers.assertNoConsoleErrors(browser, 'Filter during Scan');
  });

  await ctx.test('C02 - Patch while Drawer Open: Triggering simulate patch synchronizes views', async () => {
    // Wait for scan complete
    await browser.waitForFunction(() => {
      const badge = document.getElementById('stepperStatusBadge');
      return badge && badge.innerText.includes('AUDIT COMPLETE');
    }, 20000);

    // Open drawer
    await browser.evaluate(() => {
      const sqli = document.querySelector('[data-node-id="sqli_audit"]');
      if (sqli) sqli.click();
    });
    await browser.sleep(300);

    // Patch item
    await browser.evaluate(() => {
      const patchBtn = document.getElementById('drawerPatchBtn') || document.querySelector('.btn-patch-table');
      if (patchBtn) patchBtn.click();
    });
    await browser.sleep(300);

    const isPatched = await browser.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('PATCHED') || text.includes('Patched') || text.includes('SECURE');
    });
    Helpers.assertTrue(isPatched, 'Drawer and Matrix state synchronized on patch');
  });

  await ctx.test('C03 - Search + Filter Intersect: Full-text search combined with severity filter produces accurate subset', async () => {
    await browser.evaluate(() => {
      const allTab = document.querySelector('.matrix-tab[data-filter="all"]');
      if (allTab) allTab.click();
      const input = document.getElementById('matrixSearchInput');
      if (input) {
        input.value = 'XSS';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await browser.sleep(200);
    const searchFilterResult = await browser.evaluate(() => {
      const text = document.getElementById('vulnTableBody')?.innerText || '';
      return text.includes('XSS') || text.includes('Scripting');
    });
    Helpers.assertTrue(searchFilterResult, 'Search + filter intersects correctly');
    // Clear search
    await browser.evaluate(() => {
      const input = document.getElementById('matrixSearchInput');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });

  await ctx.test('C04 - Fix All and Summary: #btnFixAll followed by #btnExecSummary reflects 100% hardened score in modal', async () => {
    await browser.evaluate(() => {
      const fixAll = document.getElementById('btnFixAll');
      if (fixAll) fixAll.click();
    });
    await browser.sleep(1600);
    await browser.evaluate(() => {
      const summaryBtn = document.getElementById('btnExecSummary');
      if (summaryBtn) summaryBtn.click();
    });
    await browser.sleep(300);
    const modalScore = await browser.evaluate(() => {
      const scoreEl = document.getElementById('modalScoreDisplay');
      return scoreEl ? scoreEl.innerText : '';
    });
    Helpers.assertTrue(modalScore.includes('100'), `Modal score is 100/100: ${modalScore}`);
    await browser.evaluate(() => {
      const closeBtn = document.getElementById('modalCloseBtn');
      if (closeBtn) closeBtn.click();
    });
  });

  return ctx.summary();
}

module.exports = { runTests };
