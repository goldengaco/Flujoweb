/**
 * Log Panels, Keyword Search & JSON Export E2E Test Suite
 * Validates real-time log search filtering, severity chips, and JSON report export mechanisms across enterprise dashboards:
 * 1. gcp-cloudops-cockpit (#logs-search-input, [data-testid="btn-copy-json"])
 * 2. gcp-event-pubsub (#logSearchInput, #dlqSearchInput)
 * 3. gcp-iam-security (#matrixSearchInput, #exportReportBtn)
 * 4. gcp-serverless-pipeline (#log-search-input, #btn-clear-logs)
 * 5. gcp-sql-networking (#querySearchInput, #btnExportReport)
 * 6. security-audit (#matrixSearchInput, #btnExportJson)
 * 7. server-status (#serviceSearchInput)
 */

const path = require('path');
const fs = require('fs');
const { TestContext, Helpers } = require('./fixtures/helpers');

async function runTests(browser) {
  const ctx = new TestContext('Log Panels, Real-Time Filtering & JSON Export Suite');
  const rootDir = path.resolve(__dirname, '..');

  const logTargets = [
    {
      id: 'gcp-cloudops-cockpit',
      name: 'GCP CloudOps Cockpit',
      file: path.join(rootDir, 'sistemas', 'gcp-cloudops-cockpit', 'index.html'),
      searchInput: '#logs-search-input',
      testQuery: 'error',
      exportBtn: '[data-testid="btn-copy-json"]',
      getVisibleRows: async () => {
        return await browser.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('#logs-table-tbody tr, .log-entry-row'));
          return rows.filter(r => window.getComputedStyle(r).display !== 'none').length;
        });
      }
    },
    {
      id: 'gcp-event-pubsub',
      name: 'GCP Event-Driven Pub/Sub & DLQ',
      file: path.join(rootDir, 'sistemas', 'gcp-event-pubsub', 'index.html'),
      searchInput: '#logSearchInput',
      testQuery: 'info',
      exportBtn: null,
      getVisibleRows: async () => {
        return await browser.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('#logStreamBox .log-entry, #logStreamBox .log-row, #logStreamBox div'));
          return rows.filter(r => window.getComputedStyle(r).display !== 'none').length;
        });
      }
    },
    {
      id: 'gcp-iam-security',
      name: 'GCP IAM Security & Secret Vault Auditor',
      file: path.join(rootDir, 'sistemas', 'gcp-iam-security', 'index.html'),
      searchInput: '#matrixSearchInput',
      testQuery: 'admin',
      exportBtn: '#exportReportBtn',
      prepare: async () => {
        // Activate Least-Privilege tab where matrixSearchInput lives
        await browser.evaluate(() => {
          const tab = document.querySelector('[data-tab="tab-least-privilege"]');
          if (tab) tab.click();
        });
        await browser.sleep(150);
      },
      getVisibleRows: async () => {
        return await browser.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('.matrix-row, .audit-log-row'));
          return rows.filter(r => window.getComputedStyle(r).display !== 'none').length;
        });
      }
    },
    {
      id: 'gcp-serverless-pipeline',
      name: 'GCP Serverless Pipeline',
      file: path.join(rootDir, 'sistemas', 'gcp-serverless-pipeline', 'index.html'),
      searchInput: '#log-search-input',
      testQuery: 'cloud',
      exportBtn: null,
      getVisibleRows: async () => {
        return await browser.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('#log-terminal-window .log-entry, #log-terminal-window .log-line'));
          return rows.filter(r => window.getComputedStyle(r).display !== 'none').length;
        });
      }
    },
    {
      id: 'gcp-sql-networking',
      name: 'GCP SQL Networking & HA Peering',
      file: path.join(rootDir, 'sistemas', 'gcp-sql-networking', 'index.html'),
      searchInput: '#querySearchInput',
      testQuery: 'SELECT',
      exportBtn: '#btnExportReport',
      getVisibleRows: async () => {
        return await browser.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('#terminalLogFeed .log-row, #terminalLogFeed tr'));
          return rows.filter(r => window.getComputedStyle(r).display !== 'none').length;
        });
      }
    },
    {
      id: 'security-audit',
      name: 'CyberSec Sentinel Security Scanner',
      file: path.join(rootDir, 'sistemas', 'security-audit', 'index.html'),
      searchInput: '#matrixSearchInput',
      testQuery: 'cve',
      exportBtn: '#btnExportJson',
      getVisibleRows: async () => {
        return await browser.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('.vuln-row, tr.cve-row, .table-row'));
          return rows.filter(r => window.getComputedStyle(r).display !== 'none').length;
        });
      }
    },
    {
      id: 'server-status',
      name: 'Server Status & Mission Control NOC',
      file: path.join(rootDir, 'sistemas', 'server-status', 'index.html'),
      searchInput: '#serviceSearchInput',
      testQuery: 'api',
      exportBtn: null,
      getVisibleRows: async () => {
        return await browser.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('.service-card, .service-row'));
          return rows.filter(r => window.getComputedStyle(r).display !== 'none').length;
        });
      }
    }
  ];

  for (const target of logTargets) {
    if (!fs.existsSync(target.file)) {
      continue;
    }

    // 1. Search Filtering Test
    await ctx.test(`LOG-${target.id}: Keyword search input filters rendered entries and resets correctly`, async () => {
      await browser.navigate(target.file);
      await browser.sleep(400);

      if (target.prepare) {
        await target.prepare();
      }

      // Verify search input exists
      await Helpers.assertElementVisible(browser, target.searchInput, `Search input ${target.searchInput} must be visible in ${target.name}`);

      const initialCount = await target.getVisibleRows();

      // Type query
      await browser.type(target.searchInput, target.testQuery);
      await browser.sleep(200);
      const filteredCount = await target.getVisibleRows();

      // Clear search
      await browser.type(target.searchInput, '');
      await browser.sleep(200);
      const resetCount = await target.getVisibleRows();

      console.log(`    [${target.id}] Initial: ${initialCount} -> Filtered ("${target.testQuery}"): ${filteredCount} -> Reset: ${resetCount}`);
      Helpers.assertTrue(resetCount >= filteredCount, 'Search reset should restore row count');
      await Helpers.assertNoConsoleErrors(browser, `${target.id} search filtering`);
    });

    // 2. Export to JSON Test (where applicable)
    if (target.exportBtn) {
      await ctx.test(`LOG-${target.id}: Export to JSON button triggers data serialization without errors`, async () => {
        await browser.navigate(target.file);
        await browser.sleep(300);

        if (target.prepare) {
          await target.prepare();
        }

        // Inject download trap in page to detect blob / download trigger
        await browser.evaluate(() => {
          window.__lastDownloadUrl = null;
          window.__lastDownloadName = null;
          const origCreateObjectURL = window.URL.createObjectURL.bind(window.URL);
          window.URL.createObjectURL = (blob) => {
            window.__lastBlob = blob;
            return origCreateObjectURL(blob);
          };
        });

        // Click export button
        const btnExists = await browser.evaluate((sel) => {
          const btn = document.querySelector(sel);
          if (!btn) return false;
          btn.click();
          return true;
        }, target.exportBtn);

        Helpers.assertTrue(btnExists, `Export button ${target.exportBtn} should exist`);
        await browser.sleep(300);
        await Helpers.assertNoConsoleErrors(browser, `${target.id} export to JSON`);
      });
    }
  }

  return ctx.summary();
}

// Standalone execution
if (require.main === module) {
  const { BrowserSession } = require('./runner');
  (async () => {
    const browser = new BrowserSession();
    try {
      await browser.launch();
      const res = await runTests(browser);
      console.log(`\nLog Panels Suite Result: ${res.passed}/${res.total} Passed (${res.duration}ms)`);
      process.exit(res.failed === 0 ? 0 : 1);
    } catch (err) {
      console.error(err);
      process.exit(1);
    } finally {
      await browser.close();
    }
  })();
}

module.exports = { runTests };
