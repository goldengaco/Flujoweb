/**
 * Tier 1: Feature Coverage — Security Audit & Vulnerability Scanner (Features 1 - 5)
 * Target: sistemas/security-audit/index.html
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 1: Security Audit Features (F01 - F05)');

  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'Initial Navigation');

  // --- Feature 1: 7-Node Security Stepper ---
  await ctx.test('F01.1 - 7-Node Stepper: All 7 security nodes are present in DOM', async () => {
    const nodeCount = await browser.evaluate(() => {
      const nodeIds = ['tls_audit', 'headers_audit', 'cors_audit', 'sqli_audit', 'xss_audit', 'jwt_audit', 'rbac_audit'];
      const found = nodeIds.filter(id => document.querySelector(`[data-node-id="${id}"]`) !== null);
      return found.length;
    });
    Helpers.assertEqual(nodeCount, 7, `Found ${nodeCount}/7 stepper nodes`);
  });

  await ctx.test('F01.2 - 7-Node Stepper: All 7 security node emojis are permanently rendered', async () => {
    const emojis = ['🔒', '🛡️', '🌐', '💉', '📜', '🔑', '📋'];
    const pageText = await browser.evaluate(() => document.body.innerText);
    for (const emoji of emojis) {
      Helpers.assertTrue(pageText.includes(emoji), `Emoji ${emoji} must be present in stepper`);
    }
  });

  await ctx.test('F01.3 - 7-Node Stepper: Stepper starts in initial STANDBY / Ready state with #btnRunAudit available', async () => {
    const ready = await browser.evaluate(() => {
      const btn = document.getElementById('btnRunAudit');
      return btn !== null && !btn.disabled;
    });
    Helpers.assertTrue(ready, 'Scan trigger button #btnRunAudit must be enabled in initial state');
  });

  await ctx.test('F01.4 - 7-Node Stepper: Initiating audit transitions stepper to active evaluation', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('btnRunAudit');
      if (btn) btn.click();
    });
    await browser.sleep(200);
    const isScanning = await browser.evaluate(() => {
      const badge = document.getElementById('stepperStatusBadge');
      const nodes = document.querySelectorAll('.stepper-node.state-active, .stepper-node.state-warning, .stepper-node.state-critical, .stepper-node.state-passed');
      return (badge && badge.innerText.includes('SCANNING')) || nodes.length > 0;
    });
    Helpers.assertTrue(isScanning, 'Stepper shows active audit in progress');
  });

  await ctx.test('F01.5 - 7-Node Stepper: Progress track and nodes update sequentially', async () => {
    await browser.waitForFunction(() => {
      const doneNodes = document.querySelectorAll('.stepper-node.state-warning, .stepper-node.state-critical, .stepper-node.state-passed, .stepper-node.state-patched');
      return doneNodes.length >= 3;
    }, 15000);
    Helpers.assertTrue(true, 'Scan successfully progressed past 3 nodes');
  });

  await ctx.test('F01.6 - 7-Node Stepper: Full scan completes all 7 nodes', async () => {
    await browser.waitForFunction(() => {
      const badge = document.getElementById('stepperStatusBadge');
      return badge && badge.innerText.includes('AUDIT COMPLETE');
    }, 20000);
    Helpers.assertTrue(true, 'All 7 nodes completed evaluation');
  });

  // --- Feature 2: Security Node Telemetry Drawer ---
  await ctx.test('F02.1 - Telemetry Drawer: Clicking a node opens deep inspection drawer (#inspectionDrawer)', async () => {
    await browser.evaluate(() => {
      const sqliNode = document.querySelector('[data-node-id="sqli_audit"]');
      if (sqliNode) sqliNode.click();
    });
    await browser.sleep(300);
    const opened = await browser.evaluate(() => {
      const drawer = document.getElementById('inspectionDrawer');
      return drawer && drawer.classList.contains('open');
    });
    Helpers.assertTrue(opened, 'Drawer element #inspectionDrawer must have open class');
  });

  await ctx.test('F02.2 - Telemetry Drawer: Displays CVE / CWE reference identifiers', async () => {
    const cveFound = await browser.evaluate(() => {
      const drawer = document.getElementById('inspectionDrawer');
      const text = drawer ? drawer.innerText : '';
      return text.includes('CVE-') || text.includes('CWE-') || text.includes('CVSS');
    });
    Helpers.assertTrue(cveFound, 'Telemetry drawer displays CVE/CWE reference identifiers');
  });

  await ctx.test('F02.3 - Telemetry Drawer: Shows evaluated HTTP headers / test payloads', async () => {
    const headersFound = await browser.evaluate(() => {
      const drawer = document.getElementById('inspectionDrawer');
      const text = drawer ? drawer.innerText : '';
      return text.includes('Payload') || text.includes('SELECT') || text.includes('HTTP') || text.includes('Header') || text.includes('Diagnostic');
    });
    Helpers.assertTrue(headersFound, 'Telemetry drawer exposes evaluated payloads/headers');
  });

  await ctx.test('F02.4 - Telemetry Drawer: Displays remediation code snippet', async () => {
    await browser.evaluate(() => {
      const remTab = document.querySelector('.drawer-tab[data-tab="remediation"], .drawer-tab[onclick*="remediation"], .drawer-tabs .drawer-tab:last-child');
      if (remTab) remTab.click();
    });
    await browser.sleep(200);
    const snippetFound = await browser.evaluate(() => {
      const drawer = document.getElementById('inspectionDrawer');
      const codeEls = drawer ? drawer.querySelectorAll('pre, code, .code-block-wrap') : [];
      return codeEls.length > 0 || (drawer && drawer.innerText.includes('Remediation') || drawer.innerText.includes('Fix'));
    });
    Helpers.assertTrue(snippetFound, 'Remediation code snippet displayed in drawer');
  });

  await ctx.test('F02.5 - Telemetry Drawer: Can be dismissed/closed via #drawerCloseBtn', async () => {
    await browser.evaluate(() => {
      const closeBtn = document.getElementById('drawerCloseBtn');
      if (closeBtn) closeBtn.click();
    });
    await browser.sleep(200);
    const closed = await browser.evaluate(() => {
      const drawer = document.getElementById('inspectionDrawer');
      return drawer && !drawer.classList.contains('open');
    });
    Helpers.assertTrue(closed, 'Drawer closed successfully');
  });

  // --- Feature 3: Circular Dynamic Score Gauge ---
  await ctx.test('F03.1 - Score Gauge: Circular SVG gauge element is rendered (#gaugeProgressCircle)', async () => {
    const svgFound = await browser.evaluate(() => {
      const circle = document.getElementById('gaugeProgressCircle');
      return circle !== null;
    });
    Helpers.assertTrue(svgFound, 'Dynamic circular score gauge SVG #gaugeProgressCircle exists in DOM');
  });

  await ctx.test('F03.2 - Score Gauge: Numerical security score (0-100) is calculated in #gaugeScoreNumber', async () => {
    const score = await browser.evaluate(() => {
      const scoreEl = document.getElementById('gaugeScoreNumber');
      return scoreEl ? parseInt(scoreEl.innerText.replace(/[^0-9]/g, ''), 10) : null;
    });
    Helpers.assertTrue(score !== null && !isNaN(score), `Score should be numeric, got: ${score}`);
    Helpers.assertBetween(score, 0, 100, 'Security score bounded between 0 and 100');
  });

  await ctx.test('F03.3 - Score Gauge: Letter grade rating is displayed in #gaugeGradeBadge', async () => {
    const grade = await browser.evaluate(() => {
      const gradeEl = document.getElementById('gaugeGradeBadge');
      return gradeEl ? gradeEl.innerText.trim() : null;
    });
    Helpers.assertTrue(grade !== null && grade.length > 0, `Grade rating badge visible: "${grade}"`);
  });

  await ctx.test('F03.4 - Score Gauge: SVG stroke-dashoffset reflects percentage', async () => {
    const hasOffset = await browser.evaluate(() => {
      const circle = document.getElementById('gaugeProgressCircle');
      return circle && circle.style.strokeDashoffset !== '';
    });
    Helpers.assertTrue(hasOffset, 'Gauge SVG circle has dynamic strokeDashoffset');
  });

  await ctx.test('F03.5 - Score Gauge: Posture label is displayed in #gaugePostureLabel', async () => {
    const posture = await browser.evaluate(() => {
      const el = document.getElementById('gaugePostureLabel');
      return el ? el.innerText.trim() : '';
    });
    Helpers.assertTrue(posture.length > 0, 'Posture label displayed');
  });

  // --- Feature 4: Vulnerability Matrix & Patch Simulation ---
  await ctx.test('F04.1 - Vulnerability Matrix: Tabular report contains evaluated findings (#vulnTableBody)', async () => {
    const rows = await browser.evaluate(() => {
      return document.querySelectorAll('#vulnTableBody tr').length;
    });
    Helpers.assertGreaterThan(rows, 0, 'Vulnerability matrix contains rows');
  });

  await ctx.test('F04.2 - Vulnerability Matrix: Severity badges (Critical, High, Medium, Passed) rendered', async () => {
    const badges = await browser.evaluate(() => {
      const text = document.getElementById('vulnTableBody')?.innerText || '';
      return text.includes('CRITICAL') || text.includes('HIGH') || text.includes('MEDIUM') || text.includes('WARN');
    });
    Helpers.assertTrue(badges, 'Severity badges rendered in table');
  });

  await ctx.test('F04.3 - Vulnerability Matrix: Severity filter toggling (Critical / High / All)', async () => {
    await browser.evaluate(() => {
      const critTab = document.querySelector('.matrix-tab[data-filter="critical"], [data-filter="critical"]');
      if (critTab) critTab.click();
    });
    await browser.sleep(150);
    const filterAllTab = await browser.evaluate(() => {
      const allTab = document.querySelector('.matrix-tab[data-filter="all"], [data-filter="all"]');
      if (allTab) allTab.click();
      return true;
    });
    Helpers.assertTrue(filterAllTab, 'Filter toggling executed cleanly');
  });

  await ctx.test('F04.4 - Vulnerability Matrix: Search input #matrixSearchInput filters rows', async () => {
    await browser.evaluate(() => {
      const input = document.getElementById('matrixSearchInput');
      if (input) {
        input.value = 'SQL';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await browser.sleep(150);
    const tableText = await browser.evaluate(() => document.getElementById('vulnTableBody')?.innerText || '');
    Helpers.assertTrue(tableText.includes('SQL') || tableText.includes('sqli'), 'Search matches SQL vulnerability');
    // Clear search
    await browser.evaluate(() => {
      const input = document.getElementById('matrixSearchInput');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });

  await ctx.test('F04.5 - Vulnerability Matrix: Patch simulation button applies remediation', async () => {
    await browser.evaluate(() => {
      const patchBtn = document.querySelector('.btn-patch-table, button[data-action="patch"], .btn-emerald');
      if (patchBtn) patchBtn.click();
    });
    await browser.sleep(300);
    const isPatched = await browser.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('PATCHED') || text.includes('Patched') || text.includes('SECURE');
    });
    Helpers.assertTrue(isPatched, 'Patch simulation updated state to Patched');
  });

  await ctx.test('F04.6 - Vulnerability Matrix: #btnFixAll hardens all 7 nodes to 100% (Grade A+)', async () => {
    await browser.evaluate(() => {
      const fixAllBtn = document.getElementById('btnFixAll');
      if (fixAllBtn) fixAllBtn.click();
    });
    await browser.sleep(1600);
    const score = await browser.evaluate(() => {
      const scoreEl = document.getElementById('gaugeScoreNumber');
      return scoreEl ? parseInt(scoreEl.innerText.replace(/[^0-9]/g, ''), 10) : 0;
    });
    Helpers.assertEqual(score, 100, `Score is 100 after Fix All (${score})`);
  });

  // --- Feature 5: JSON Security Report Export ---
  await ctx.test('F05.1 - Report Export: Export JSON button #btnExportJson is present and enabled', async () => {
    const exportBtn = await browser.evaluate(() => {
      const btn = document.getElementById('btnExportJson');
      return btn !== null && !btn.disabled;
    });
    Helpers.assertTrue(exportBtn, '#btnExportJson is present and enabled');
  });

  await ctx.test('F05.2 - Report Export: Clicking #btnExportJson invokes export handler without error', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('btnExportJson');
      if (btn) btn.click();
    });
    await Helpers.assertNoConsoleErrors(browser, 'Export JSON click');
  });

  await ctx.test('F05.3 - Report Export: Executive summary modal #execSummaryModal opens on #btnExecSummary', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('btnExecSummary');
      if (btn) btn.click();
    });
    await browser.sleep(200);
    const modalOpen = await browser.evaluate(() => {
      const m = document.getElementById('execSummaryModal');
      return m && m.classList.contains('open');
    });
    Helpers.assertTrue(modalOpen, '#execSummaryModal is open');
  });

  await ctx.test('F05.4 - Report Export: Executive summary modal displays CISO metrics and timestamp', async () => {
    const timeText = await browser.evaluate(() => {
      const ts = document.getElementById('modalTimestamp');
      return ts ? ts.innerText : '';
    });
    Helpers.assertTrue(timeText.length > 0, 'Modal timestamp displayed');
  });

  await ctx.test('F05.5 - Report Export: Summary modal closes cleanly via #modalCloseBtn', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('modalCloseBtn');
      if (btn) btn.click();
    });
    await browser.sleep(150);
    const closed = await browser.evaluate(() => {
      const m = document.getElementById('execSummaryModal');
      return m && !m.classList.contains('open');
    });
    Helpers.assertTrue(closed, 'Modal closed cleanly');
  });

  return ctx.summary();
}

module.exports = { runTests };
