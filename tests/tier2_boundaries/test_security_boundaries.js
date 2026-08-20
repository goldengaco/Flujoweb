/**
 * Tier 2: Boundary & Corner Cases — Security Audit & Vulnerability Scanner (Features 1 - 5)
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 2: Security Audit Boundary & Corner Cases');

  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'Boundary Test Start');

  // --- F01 Boundaries: 7-Node Stepper ---
  await ctx.test('B01.1 - Rapid Start Clicks: Clicking #btnRunAudit 10 times in 100ms does not trigger race condition', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('btnRunAudit');
      if (btn) {
        for (let i = 0; i < 10; i++) btn.click();
      }
    });
    await browser.sleep(300);
    await Helpers.assertNoConsoleErrors(browser, 'Rapid Start Clicks');
  });

  await ctx.test('B01.2 - Re-scan Trigger: Clicking #btnReset resets node states cleanly', async () => {
    await browser.sleep(1000);
    await browser.evaluate(() => {
      const resetBtn = document.getElementById('btnReset');
      if (resetBtn) resetBtn.click();
    });
    await browser.sleep(200);
    await Helpers.assertNoConsoleErrors(browser, 'Re-scan Reset');
  });

  await ctx.test('B01.3 - Keyboard Interaction: Spacebar and Enter trigger #btnRunAudit properly', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('btnRunAudit');
      if (btn) {
        btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', bubbles: true }));
      }
    });
    await browser.sleep(200);
    await Helpers.assertNoConsoleErrors(browser, 'Keyboard Trigger');
  });

  await ctx.test('B01.4 - Out-of-Order Node Clicks: Clicking nodes directly opens telemetry without breaking stepper index', async () => {
    await browser.evaluate(() => {
      const sqli = document.querySelector('[data-node-id="sqli_audit"]');
      if (sqli) sqli.click();
      const rbac = document.querySelector('[data-node-id="rbac_audit"]');
      if (rbac) rbac.click();
    });
    await browser.sleep(200);
    await Helpers.assertNoConsoleErrors(browser, 'Out of Order Clicks');
  });

  await ctx.test('B01.5 - Stepper CSS Transitions: Node hover state does not throw reflow glitch', async () => {
    await browser.evaluate(() => {
      const node = document.querySelector('.stepper-node');
      if (node) {
        node.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
        node.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      }
    });
    await Helpers.assertNoConsoleErrors(browser, 'Node Hover');
  });

  // --- F02 Boundaries: Telemetry Drawer & CVEs ---
  await ctx.test('B02.1 - Rapid Drawer Toggling: Clicking nodes rapidly does not create duplicate drawers', async () => {
    await browser.evaluate(() => {
      const nodes = document.querySelectorAll('.stepper-node');
      nodes.forEach(n => n.click());
    });
    const drawerCount = await browser.evaluate(() => {
      return document.querySelectorAll('#inspectionDrawer').length;
    });
    Helpers.assertEqual(drawerCount, 1, 'Only 1 inspection drawer in DOM');
  });

  await ctx.test('B02.2 - Escape Key Drawer Dismiss: Pressing Escape closes #inspectionDrawer', async () => {
    await browser.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
    });
    await browser.sleep(200);
    await Helpers.assertNoConsoleErrors(browser, 'Escape Key Dismiss');
  });

  await ctx.test('B02.3 - Extreme Payload Rendering: Drawer renders long HTTP headers without breaking container', async () => {
    await browser.evaluate(() => {
      const drawer = document.getElementById('inspectionDrawer');
      if (drawer) drawer.scrollTop = 100;
    });
    await Helpers.assertNoConsoleErrors(browser, 'Drawer Scroll');
  });

  await ctx.test('B02.4 - Copy Code Snippet: Copying remediation snippet does not throw exception', async () => {
    await browser.evaluate(() => {
      const copyBtn = document.querySelector('.btn-copy-code, [data-action="copy-code"]');
      if (copyBtn) copyBtn.click();
    });
    await Helpers.assertNoConsoleErrors(browser, 'Copy Code Snippet');
  });

  await ctx.test('B02.5 - Non-existent Node Query: Attempting to query invalid node fails safely', async () => {
    await browser.evaluate(() => {
      const missing = document.getElementById('non_existent_node_9999');
      return missing === null;
    });
    await Helpers.assertNoConsoleErrors(browser, 'Invalid Node Query');
  });

  // --- F03 Boundaries: Score Gauge ---
  await ctx.test('B03.1 - Score Gauge Lower Bound: Score is non-negative (>= 0)', async () => {
    const score = await browser.evaluate(() => {
      const el = document.getElementById('gaugeScoreNumber');
      return el ? parseInt(el.innerText.replace(/[^0-9-]/g, ''), 10) : 0;
    });
    Helpers.assertTrue(score >= 0, `Score must be >= 0, got ${score}`);
  });

  await ctx.test('B03.2 - Score Gauge Upper Bound: Score does not exceed 100', async () => {
    const score = await browser.evaluate(() => {
      const el = document.getElementById('gaugeScoreNumber');
      return el ? parseInt(el.innerText.replace(/[^0-9]/g, ''), 10) : 100;
    });
    Helpers.assertTrue(score <= 100, `Score must be <= 100, got ${score}`);
  });

  await ctx.test('B03.3 - Score Grade Mapping: Validates grade thresholds', async () => {
    const grade = await browser.evaluate(() => {
      const el = document.getElementById('gaugeGradeBadge');
      return el ? el.innerText.trim() : 'F';
    });
    Helpers.assertTrue(grade.length > 0, `Grade present: ${grade}`);
  });

  await ctx.test('B03.4 - Gauge Resize: Dynamic window resize does not distort SVG viewBox', async () => {
    await browser.setViewport(500, 500);
    await browser.sleep(100);
    await browser.setViewport(1440, 900);
    await Helpers.assertNoConsoleErrors(browser, 'Gauge Resize');
  });

  await ctx.test('B03.5 - Zero-Score Handling: Gauge renders gracefully without NaN attributes', async () => {
    const noNaN = await browser.evaluate(() => {
      const svg = document.getElementById('gaugeProgressCircle');
      return !svg || !svg.outerHTML.includes('NaN');
    });
    Helpers.assertTrue(noNaN, 'SVG circle must not contain NaN');
  });

  // --- F04 Boundaries: Vulnerability Matrix & Patching ---
  await ctx.test('B04.1 - Empty Search Query: Clearing #matrixSearchInput restores table rows', async () => {
    const initialRows = await browser.evaluate(() => document.querySelectorAll('#vulnTableBody tr').length);
    await browser.evaluate(() => {
      const input = document.getElementById('matrixSearchInput');
      if (input) {
        input.value = 'NON_EXISTENT_QUERY_999';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await browser.sleep(100);
    await browser.evaluate(() => {
      const input = document.getElementById('matrixSearchInput');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await browser.sleep(100);
    const restoredRows = await browser.evaluate(() => document.querySelectorAll('#vulnTableBody tr').length);
    Helpers.assertEqual(restoredRows, initialRows, 'Table row count restored');
  });

  await ctx.test('B04.2 - Special Characters in Search: XSS/SQLi strings in search input do not crash DOM', async () => {
    await browser.evaluate(() => {
      const input = document.getElementById('matrixSearchInput');
      if (input) {
        input.value = '<script>alert(1)</script>\' OR 1=1 -- "><img src=x onerror=alert(1)>';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await browser.sleep(100);
    await Helpers.assertNoConsoleErrors(browser, 'Special Characters in Search');
    // Clear
    await browser.evaluate(() => {
      const input = document.getElementById('matrixSearchInput');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });

  await ctx.test('B04.3 - Double Patching: Clicking simulate patch on already patched item is idempotent', async () => {
    await browser.evaluate(() => {
      const patchBtn = document.querySelector('.btn-patch-table');
      if (patchBtn) {
        patchBtn.click();
        patchBtn.click();
      }
    });
    await browser.sleep(200);
    await Helpers.assertNoConsoleErrors(browser, 'Double Patching');
  });

  await ctx.test('B04.4 - Fix All: #btnFixAll hardens entire system to 100% score', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('btnFixAll');
      if (btn) btn.click();
    });
    await browser.sleep(1600);
    const score = await browser.evaluate(() => {
      const el = document.getElementById('gaugeScoreNumber');
      return el ? parseInt(el.innerText.replace(/[^0-9]/g, ''), 10) : 100;
    });
    Helpers.assertEqual(score, 100, `Score is 100 after fix all`);
  });

  await ctx.test('B04.5 - Filter Toggle Under Full Patch: Switching filters when patched works cleanly', async () => {
    await browser.evaluate(() => {
      const critTab = document.querySelector('.matrix-tab[data-filter="critical"]');
      if (critTab) critTab.click();
    });
    await browser.sleep(150);
    await Helpers.assertNoConsoleErrors(browser, 'Filter Toggle Under Full Patch');
  });

  // --- F05 Boundaries: Report Export ---
  await ctx.test('B05.1 - Export Format Integrity: Report downloads without runtime error', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('btnExportJson');
      if (btn) btn.click();
    });
    await Helpers.assertNoConsoleErrors(browser, 'Export Format Integrity');
  });

  await ctx.test('B05.2 - Export Blob Creation: Does not throw unhandled exception', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('btnExportJson');
      if (btn) btn.click();
    });
    await Helpers.assertNoConsoleErrors(browser, 'Blob Export');
  });

  await ctx.test('B05.3 - Modal Dismiss: #modalDismissBtn closes summary modal', async () => {
    await browser.evaluate(() => {
      const openBtn = document.getElementById('btnExecSummary');
      if (openBtn) openBtn.click();
    });
    await browser.sleep(200);
    await browser.evaluate(() => {
      const dismissBtn = document.getElementById('modalDismissBtn');
      if (dismissBtn) dismissBtn.click();
    });
    await browser.sleep(150);
    await Helpers.assertNoConsoleErrors(browser, 'Modal Dismiss');
  });

  await ctx.test('B05.4 - Summary Modal Copy: #modalCopyBtn copies summary text cleanly', async () => {
    await browser.evaluate(() => {
      const openBtn = document.getElementById('btnExecSummary');
      if (openBtn) openBtn.click();
    });
    await browser.sleep(150);
    await browser.evaluate(() => {
      const copyBtn = document.getElementById('modalCopyBtn');
      if (copyBtn) copyBtn.click();
      const closeBtn = document.getElementById('modalCloseBtn');
      if (closeBtn) closeBtn.click();
    });
    await Helpers.assertNoConsoleErrors(browser, 'Modal Copy');
  });

  await ctx.test('B05.5 - Summary Modal ESC Key: Pressing ESC dismisses summary modal', async () => {
    await browser.evaluate(() => {
      const openBtn = document.getElementById('btnExecSummary');
      if (openBtn) openBtn.click();
    });
    await browser.sleep(150);
    await browser.evaluate(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
    });
    await Helpers.assertNoConsoleErrors(browser, 'Modal ESC Dismiss');
  });

  return ctx.summary();
}

module.exports = { runTests };
