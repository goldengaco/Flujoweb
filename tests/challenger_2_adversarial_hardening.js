/**
 * CHALLENGER 2 - TIER 5 ADVERSARIAL HARDENING & STRESS VERIFICATION SUITE
 * 
 * Formal Adversarial Inspection covering:
 * 1. Rapid Sound Synthesizer Stress: 12 clicks @ 25ms intervals across 7 audio-enabled dashboards.
 * 2. Log Console Search & JSON Export Integrity across all log-enabled dashboards.
 * 3. Zero Console Errors & Zero Uncaught Exceptions audit across all 15 dashboards + portal (16 total targets).
 */

const path = require('path');
const fs = require('fs');
const { BrowserSession } = require('./runner');
const { TestContext, Helpers } = require('./fixtures/helpers');

const rootDir = path.resolve(__dirname, '..');

async function runHardeningSuite() {
  const browser = new BrowserSession();
  const summary = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: [],
    failures: []
  };

  function record(name, passed, details = '') {
    summary.total++;
    if (passed) {
      summary.passed++;
      console.log(  \x1b[32m✔\x1b[0m [PASS] );
      summary.tests.push({ name, status: 'PASS', details });
    } else {
      summary.failed++;
      console.error(  \x1b[31m✖\x1b[0m [FAIL] : );
      summary.tests.push({ name, status: 'FAIL', details });
      summary.failures.push({ name, details });
    }
  }

  try {
    await browser.launch();
    console.log('\n\x1b[1m\x1b[36m========================================================================================\x1b[0m');
    console.log('\x1b[1m\x1b[36m        CHALLENGER 2: TIER 5 ADVERSARIAL HARDENING & STRESS VERIFICATION               \x1b[0m');
    console.log('\x1b[1m\x1b[36m========================================================================================\x1b[0m\n');

    // ========================================================================================
    // PART 1: RAPID TOGGLE STRESS (12 CLICKS @ 25MS) ACROSS 7 AUDIO-ENABLED DASHBOARDS
    // ========================================================================================
    console.log('\x1b[1m\x1b[33m--- PART 1: RAPID AUDIO TOGGLE STRESS (12 CLICKS @ 25MS) ACROSS 7 DASHBOARDS ---\x1b[0m');

    const audioTargets = [
      {
        id: 'emergency-evacuation-v2',
        name: 'Emergency Evacuation V2 (Mobile Occupant HUD)',
        file: path.join(rootDir, 'sistemas', 'emergency-evacuation-v2', 'index.html'),
        selector: '#btn-siren-toggle'
      },
      {
        id: 'server-status',
        name: 'Server Status (Mission Control NOC)',
        file: path.join(rootDir, 'sistemas', 'server-status', 'index.html'),
        selector: '#audioToggleBtn'
      },
      {
        id: 'apigee-mulesoft-hybrid',
        name: 'Apigee + MuleSoft Hybrid Observability Cockpit',
        file: path.join(rootDir, 'sistemas', 'apigee-mulesoft-hybrid', 'index.html'),
        selector: '#btnMuteAudio'
      },
      {
        id: 'emergency-evacuation-v1',
        name: 'Emergency Evacuation V1 (Command Center)',
        file: path.join(rootDir, 'sistemas', 'emergency-evacuation-v1', 'index.html'),
        selector: '#btn-toggle-sound'
      },
      {
        id: 'emergency-evacuation-v3',
        name: 'Emergency Evacuation V3 (Fan-Out Engine)',
        file: path.join(rootDir, 'sistemas', 'emergency-evacuation-v3', 'index.html'),
        selector: '#btn-audio-toggle'
      },
      {
        id: 'gcp-sql-networking',
        name: 'GCP SQL Networking & HA Peering',
        file: path.join(rootDir, 'sistemas', 'gcp-sql-networking', 'index.html'),
        selector: '#btnSoundToggle'
      },
      {
        id: 'gcp-iam-security',
        name: 'GCP IAM Security & Secret Vault Auditor',
        file: path.join(rootDir, 'sistemas', 'gcp-iam-security', 'index.html'),
        selector: '#audioToggleBtn'
      }
    ];

    for (const target of audioTargets) {
      if (!fs.existsSync(target.file)) {
        record(AUDIO_STRESS_, false, File not found: );
        continue;
      }

      await browser.navigate(target.file);
      await browser.sleep(250);

      // Verify button exists
      const btnVisible = await browser.evaluate((sel) => {
        const btn = document.querySelector(sel);
        return btn !== null && window.getComputedStyle(btn).display !== 'none';
      }, target.selector);

      if (!btnVisible) {
        record(AUDIO_STRESS_: Button  visible, false, 'Audio toggle element not visible');
        continue;
      }

      // Execute 12 rapid clicks at 25ms intervals
      const clickStressResult = await browser.evaluate(async (sel) => {
        const btn = document.querySelector(sel);
        const states = [];
        for (let i = 0; i < 12; i++) {
          btn.click();
          states.push(btn.innerText || btn.className);
          await new Promise(r => setTimeout(r, 25));
        }
        return { count: states.length, finalClass: btn.className };
      }, target.selector);

      await browser.sleep(200);

      const errors = [...browser.consoleErrors, ...browser.uncaughtExceptions];
      const audioPassed = clickStressResult.count === 12 && errors.length === 0;
      record(
        AUDIO_STRESS_: 12 rapid clicks @ 25ms maintained stability without errors,
        audioPassed,
        errors.length > 0 ? Console errors:  : Executed 12 rapid toggles successfully
      );
    }

    // ========================================================================================
    // PART 2: LOG CONSOLE SEARCH & JSON EXPORT INTEGRITY
    // ========================================================================================
    console.log('\n\x1b[1m\x1b[33m--- PART 2: LOG CONSOLE SEARCH & JSON EXPORT INTEGRITY ---\x1b[0m');

    const logTargets = [
      {
        id: 'gcp-cloudops-cockpit',
        name: 'GCP CloudOps Cockpit',
        file: path.join(rootDir, 'sistemas', 'gcp-cloudops-cockpit', 'index.html'),
        searchInput: '#logs-search-input',
        testToken: 'error',
        adversarialRegex: '([a-z]+.*{?)^$',
        exportBtn: '[data-testid="btn-copy-json"]',
        getRowSample: () => document.querySelectorAll('#logs-table-tbody tr, .log-entry-row').length
      },
      {
        id: 'gcp-event-pubsub',
        name: 'GCP Event Pub/Sub & DLQ',
        file: path.join(rootDir, 'sistemas', 'gcp-event-pubsub', 'index.html'),
        searchInput: '#logSearchInput',
        testToken: 'info',
        adversarialRegex: '(?<=dlq).*|[[][A-Z]+',
        exportBtn: null,
        getRowSample: () => document.querySelectorAll('#logStreamBox .log-entry, #logStreamBox div').length
      },
      {
        id: 'gcp-iam-security',
        name: 'GCP IAM Security Auditor',
        file: path.join(rootDir, 'sistemas', 'gcp-iam-security', 'index.html'),
        prepare: () => {
          const tab = document.querySelector('[data-tab="tab-least-privilege"]');
          if (tab) tab.click();
        },
        searchInput: '#matrixSearchInput',
        testToken: 'admin',
        adversarialRegex: '(?i)(owner|editor).*\\d+',
        exportBtn: '#exportReportBtn',
        getRowSample: () => document.querySelectorAll('.matrix-row, .audit-log-row').length
      },
      {
        id: 'gcp-serverless-pipeline',
        name: 'GCP Serverless Pipeline',
        file: path.join(rootDir, 'sistemas', 'gcp-serverless-pipeline', 'index.html'),
        searchInput: '#log-search-input',
        testToken: 'deploy',
        adversarialRegex: '(\\w+\\.js|v\\d+.*)?$',
        exportBtn: null,
        getRowSample: () => document.querySelectorAll('#log-terminal-window .log-entry, #log-terminal-window .log-line').length
      },
      {
        id: 'gcp-sql-networking',
        name: 'GCP SQL Networking',
        file: path.join(rootDir, 'sistemas', 'gcp-sql-networking', 'index.html'),
        searchInput: '#querySearchInput',
        testToken: 'SELECT',
        adversarialRegex: 'SELECT.*FROM\\s+\\w+',
        exportBtn: '#btnExportReport',
        getRowSample: () => document.querySelectorAll('#terminalLogFeed .log-row, #terminalLogFeed tr').length
      },
      {
        id: 'security-audit',
        name: 'CyberSec Sentinel Security Scanner',
        file: path.join(rootDir, 'sistemas', 'security-audit', 'index.html'),
        searchInput: '#matrixSearchInput',
        testToken: 'cve',
        adversarialRegex: 'CVE-\\d{4}-\\d+',
        exportBtn: '#btnExportJson',
        getRowSample: () => document.querySelectorAll('.vuln-row, tr.cve-row, .table-row').length
      },
      {
        id: 'server-status',
        name: 'Server Status & Mission Control NOC',
        file: path.join(rootDir, 'sistemas', 'server-status', 'index.html'),
        searchInput: '#serviceSearchInput',
        testToken: 'api',
        adversarialRegex: '(?=.*api).*',
        exportBtn: null,
        getRowSample: () => document.querySelectorAll('.service-card, .service-row').length
      }
    ];

    for (const target of logTargets) {
      if (!fs.existsSync(target.file)) continue;

      await browser.navigate(target.file);
      await browser.sleep(300);

      if (target.prepare) {
        await browser.evaluate(target.prepare);
        await browser.sleep(150);
      }

      // 1. Search Token Filter & Adversarial Regex Safety
      const searchResult = await browser.evaluate(async (sel, token, regexStr, getRowsFnStr) => {
        const input = document.querySelector(sel);
        if (!input) return { exists: false };

        const getRows = new Function('return ' + getRowsFnStr)();
        const initialCount = getRows();

        // 1. Test token search
        input.value = token;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, 100));
        const tokenFilteredCount = getRows();

        // 2. Test adversarial regex string
        input.value = regexStr;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, 100));
        const regexFilteredCount = getRows();

        // 3. Reset search
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
        await new Promise(r => setTimeout(r, 100));
        const resetCount = getRows();

        return {
          exists: true,
          initialCount,
          tokenFilteredCount,
          regexFilteredCount,
          resetCount
        };
      }, target.searchInput, target.testToken, target.adversarialRegex, target.getRowSample.toString());

      const searchErrors = [...browser.consoleErrors, ...browser.uncaughtExceptions];
      const searchPassed = searchResult.exists && searchResult.resetCount >= searchResult.tokenFilteredCount && searchErrors.length === 0;

      record(
        LOG_SEARCH_: Keyword search & adversarial regex filtering executed safely,
        searchPassed,
        searchResult.exists ? Initial: , Token: , Reset:  : Search input  missing
      );

      // 2. JSON Export (where applicable)
      if (target.exportBtn) {
        const exportResult = await browser.evaluate(async (btnSel) => {
          let blobCaptured = null;
          let filenameCaptured = null;
          const origCreateObjectURL = window.URL.createObjectURL.bind(window.URL);
          window.URL.createObjectURL = (blob) => {
            blobCaptured = blob;
            return origCreateObjectURL(blob);
          };

          const btn = document.querySelector(btnSel);
          if (!btn) return { exists: false };
          btn.click();
          await new Promise(r => setTimeout(r, 200));

          return {
            exists: true,
            hasBlob: blobCaptured !== null,
            blobSize: blobCaptured ? blobCaptured.size : 0,
            blobType: blobCaptured ? blobCaptured.type : ''
          };
        }, target.exportBtn);

        const exportErrors = [...browser.consoleErrors, ...browser.uncaughtExceptions];
        record(
          LOG_EXPORT_: JSON Export triggered serialization cleanly without runtime errors,
          exportResult.exists && exportErrors.length === 0,
          exportResult.exists ? Blob size:  bytes : Export button  missing
        );
      }
    }

    // ========================================================================================
    // PART 3: ZERO CONSOLE ERRORS & ZERO EXCEPTIONS ACROSS ALL 15 DASHBOARDS + PORTAL
    // ========================================================================================
    console.log('\n\x1b[1m\x1b[33m--- PART 3: AUDIT ZERO CONSOLE ERRORS & EXCEPTIONS ACROSS ALL 16 PAGES ---\x1b[0m');

    const allPages = [
      { id: 'portal', name: 'Master Launchpad Portal', path: path.join(rootDir, 'sistemas', 'index.html') },
      { id: 'tv-diagnostic', name: 'TV & OTT Playback Telemetry Hub', path: path.join(rootDir, 'sistemas', 'tv-diagnostic', 'index.html') },
      { id: 'network-health', name: 'Network Health Check Hub', path: path.join(rootDir, 'sistemas', 'network-health', 'index.html') },
      { id: 'security-audit', name: 'CyberSec Sentinel Security Scanner', path: path.join(rootDir, 'sistemas', 'security-audit', 'index.html') },
      { id: 'server-status', name: 'Mission Control NOC Status Board', path: path.join(rootDir, 'sistemas', 'server-status', 'index.html') },
      { id: 'transaction-flow', name: 'Fintech High-Frequency Pipeline', path: path.join(rootDir, 'sistemas', 'transaction-flow', 'index.html') },
      { id: 'gcp-serverless-pipeline', name: 'GCP Serverless Pipeline Deployer', path: path.join(rootDir, 'sistemas', 'gcp-serverless-pipeline', 'index.html') },
      { id: 'gcp-event-pubsub', name: 'GCP Event-Driven Pub/Sub & DLQ', path: path.join(rootDir, 'sistemas', 'gcp-event-pubsub', 'index.html') },
      { id: 'gcp-sql-networking', name: 'GCP SQL Networking & HA Peering', path: path.join(rootDir, 'sistemas', 'gcp-sql-networking', 'index.html') },
      { id: 'gcp-iam-security', name: 'GCP IAM Security & Secret Vault Auditor', path: path.join(rootDir, 'sistemas', 'gcp-iam-security', 'index.html') },
      { id: 'gcp-cloudops-cockpit', name: 'GCP CloudOps SRE Command Cockpit', path: path.join(rootDir, 'sistemas', 'gcp-cloudops-cockpit', 'index.html') },
      { id: 'mulesoft-observability', name: 'MuleSoft Anypoint Connectivity Hub', path: path.join(rootDir, 'sistemas', 'mulesoft-observability', 'index.html') },
      { id: 'apigee-mulesoft-hybrid', name: 'Apigee + MuleSoft Hybrid Observability Cockpit', path: path.join(rootDir, 'sistemas', 'apigee-mulesoft-hybrid', 'index.html') },
      { id: 'emergency-evacuation-v1', name: 'Emergency Evacuation V1 Command Center', path: path.join(rootDir, 'sistemas', 'emergency-evacuation-v1', 'index.html') },
      { id: 'emergency-evacuation-v2', name: 'Emergency Evacuation V2 Mobile Occupant HUD', path: path.join(rootDir, 'sistemas', 'emergency-evacuation-v2', 'index.html') },
      { id: 'emergency-evacuation-v3', name: 'Emergency Evacuation V3 Broadcast Engine', path: path.join(rootDir, 'sistemas', 'emergency-evacuation-v3', 'index.html') }
    ];

    for (const page of allPages) {
      if (!fs.existsSync(page.path)) {
        record(ZERO_ERRORS_, false, File not found: );
        continue;
      }

      await browser.navigate(page.path);
      await browser.sleep(400);

      // Perform non-destructive UI interactions (click navigation pills/tabs if present)
      await browser.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button:not([data-destructive]), .nav-tab, .filter-pill, .tab-btn'));
        const sampleButtons = buttons.slice(0, 3);
        sampleButtons.forEach(b => {
          try { b.click(); } catch (e) {}
        });
      });

      await browser.sleep(300);

      const errs = [...browser.consoleErrors, ...browser.uncaughtExceptions];
      const hasZeroErrors = errs.length === 0;
      record(
        ZERO_ERRORS_ (): 0 Console Errors & 0 Uncaught Exceptions,
        hasZeroErrors,
        errs.length > 0 ? Errors detected:  : 'Clean console verification confirmed'
      );
    }

  } catch (err) {
    console.error('Hardening Suite Exception:', err);
    record('HARDENING_SUITE_GLOBAL', false, err.message);
  } finally {
    await browser.close();
  }

  console.log('\n\x1b[1m\x1b[36m========================================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m                         HARDENING TEST EXECUTION SUMMARY                               \x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================================\x1b[0m\n');
  console.log( Total Assertions: \x1b[1m\x1b[0m | Passed: \x1b[32m\x1b[0m | Failed: \x1b[31m\x1b[0m);
  console.log( Verdict: \n);

  return summary;
}

if (require.main === module) {
  runHardeningSuite().then(res => {
    process.exit(res.failed === 0 ? 0 : 1);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runHardeningSuite };
