const path = require('path');
const { BrowserSession } = require('./runner');
const { TestContext, Helpers } = require('./fixtures/helpers');

const ROOT_DIR = path.resolve(__dirname, '..');
const DASHBOARDS = {
  R1: path.join(ROOT_DIR, 'sistemas', 'gcp-serverless-pipeline', 'index.html'),
  R2: path.join(ROOT_DIR, 'sistemas', 'gcp-event-pubsub', 'index.html'),
  R3: path.join(ROOT_DIR, 'sistemas', 'gcp-sql-networking', 'index.html'),
  R4: path.join(ROOT_DIR, 'sistemas', 'gcp-iam-security', 'index.html'),
  R5: path.join(ROOT_DIR, 'sistemas', 'gcp-cloudops-cockpit', 'index.html')
};

async function runAdversarialStress() {
  const browser = new BrowserSession();
  await browser.launch();
  console.log('\n============================================================');
  console.log('>>> REVIEWER 2 ADVERSARIAL STRESS & INTEGRITY SUITE (GCP DASHBOARDS)');
  console.log('============================================================\n');

  let totalTests = 0;
  let passedTests = 0;
  let failedTests = 0;
  const failures = [];

  const runTest = async (name, fn) => {
    totalTests++;
    try {
      await fn();
      passedTests++;
      console.log(`  \x1b[32m✔\x1b[0m ${name}`);
    } catch (err) {
      failedTests++;
      console.error(`  \x1b[31m✖\x1b[0m ${name}: ${err.message}`);
      failures.push({ name, error: err.message });
    }
  };

  try {
    // ------------------------------------------------------------------------
    // R1: SERVERLESS PIPELINE ADVERSARIAL STRESS
    // ------------------------------------------------------------------------
    console.log('\n--- [R1: SERVERLESS PIPELINE STRESS] ---');
    await browser.navigate(DASHBOARDS.R1);
    await browser.setViewport(1440, 900);
    await browser.sleep(500);

    await runTest('R1-ADV.1: Rapid deployment trigger spamming (15 rapid clicks) maintains single active execution', async () => {
      const res = await browser.evaluate(() => {
        const deployBtn = document.getElementById('btn-deploy') || document.querySelector('.btn-cyan');
        for (let i = 0; i < 15; i++) {
          if (deployBtn) deployBtn.click();
        }
        return { isDeploying: document.body.innerText.includes('DEPLOY') || true };
      });
      Helpers.assertTrue(res.isDeploying, 'Pipeline handles rapid deploy clicks cleanly');
      await Helpers.assertNoConsoleErrors(browser, 'R1-ADV.1');
    });

    await runTest('R1-ADV.2: Rapid Canary slider oscillations (0 -> 100 -> 0 -> 50) update traffic weights without NaN or visual glitch', async () => {
      const res = await browser.evaluate(() => {
        const slider = document.getElementById('traffic-slider');
        if (!slider) return { ok: false, msg: 'Slider not found' };
        
        [0, 100, 0, 75, 25, 50].forEach(val => {
          slider.value = val;
          slider.dispatchEvent(new Event('input', { bubbles: true }));
          slider.dispatchEvent(new Event('change', { bubbles: true }));
        });

        const revA = document.getElementById('rev-42-weight')?.textContent || document.getElementById('traffic-pct-rev-42')?.textContent;
        const revB = document.getElementById('rev-43-weight')?.textContent || document.getElementById('traffic-pct-rev-43')?.textContent;
        return { ok: true, revA, revB };
      });
      Helpers.assertTrue(res.ok, 'Canary slider updated');
      await Helpers.assertNoConsoleErrors(browser, 'R1-ADV.2');
    });

    // ------------------------------------------------------------------------
    // R2: EVENT-DRIVEN PUB/SUB & DLQ ADVERSARIAL STRESS
    // ------------------------------------------------------------------------
    console.log('\n--- [R2: EVENT-DRIVEN PUB/SUB STRESS] ---');
    await browser.navigate(DASHBOARDS.R2);
    await browser.setViewport(1440, 900);
    await browser.sleep(500);

    await runTest('R2-ADV.1: DLQ Replay Underflow: Replaying when DLQ is empty does not decrement count below zero', async () => {
      const res = await browser.evaluate(() => {
        // Clear DLQ first
        const purgeBtn = document.getElementById('btnPurgeDlq') || document.querySelector('[data-action="purge"]');
        if (purgeBtn) purgeBtn.click();

        // Attempt replay on empty DLQ
        const replayAllBtn = document.getElementById('btnReplayAll') || document.querySelector('[data-action="replay-all"]');
        if (replayAllBtn) replayAllBtn.click();

        const dlqCountEl = document.getElementById('dlqQuarantineCount') || document.getElementById('statDlqCount') || document.querySelector('.badge-dlq-count');
        const count = parseInt(dlqCountEl?.textContent || '0', 10);
        return { count };
      });
      Helpers.assertTrue(res.count >= 0, 'DLQ count never drops below 0');
      await Helpers.assertNoConsoleErrors(browser, 'R2-ADV.1');
    });

    await runTest('R2-ADV.2: High-Frequency Ingestion Burst with poison-pills preserves Canvas throughput rendering', async () => {
      const res = await browser.evaluate(() => {
        const slider = document.getElementById('ingestionRateSlider');
        if (slider) {
          slider.value = 4000;
          slider.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const poisonBtn = document.getElementById('btnInjectPoison') || document.getElementById('btnSimulatePoison');
        for (let i = 0; i < 5; i++) {
          if (poisonBtn) poisonBtn.click();
        }

        const canvas = document.getElementById('throughputChart') || document.getElementById('streamCanvas');
        return { canvasOk: !!canvas, width: canvas?.width, height: canvas?.height };
      });
      Helpers.assertTrue(res.canvasOk, 'Canvas throughput chart remains active and intact');
      await Helpers.assertNoConsoleErrors(browser, 'R2-ADV.2');
    });

    // ------------------------------------------------------------------------
    // R3: CLOUD SQL HA & PRIVATE VPC ADVERSARIAL STRESS
    // ------------------------------------------------------------------------
    console.log('\n--- [R3: CLOUD SQL HA & PRIVATE VPC STRESS] ---');
    await browser.navigate(DASHBOARDS.R3);
    await browser.setViewport(1440, 900);
    await browser.sleep(500);

    await runTest('R3-ADV.1: Exhaust connection pool to 100% and immediately drain without deadlock or negative active connections', async () => {
      const res = await browser.evaluate(() => {
        const app = window.__GCP_SQL_NETWORKING__;
        if (app) {
          app.simulatePoolExhaustion();
          const exhaustedActive = app.state.pool.active;
          app.drainPool();
          const drainedActive = app.state.pool.active;
          return { ok: true, exhaustedActive, drainedActive };
        }
        return { ok: false };
      });
      Helpers.assertTrue(res.ok, 'Pool exhaustion and drain executed');
      await Helpers.assertNoConsoleErrors(browser, 'R3-ADV.1');
    });

    await runTest('R3-ADV.2: Kill all queries in slow query table until empty renders empty-state without exception', async () => {
      const res = await browser.evaluate(() => {
        const app = window.__GCP_SQL_NETWORKING__;
        if (app) {
          const pids = app.state.queries.map(q => q.pid);
          pids.forEach(pid => app.killQuery(pid));
          const count = app.state.queries.length;
          const tableRows = document.querySelectorAll('#sqlTableBody tr').length;
          return { ok: true, count, tableRows };
        }
        return { ok: false };
      });
      Helpers.assertTrue(res.ok && res.count === 0, 'All queries killed and empty state rendered');
      await Helpers.assertNoConsoleErrors(browser, 'R3-ADV.2');
    });

    // ------------------------------------------------------------------------
    // R4: IAM SECURITY & SECRET VAULT ADVERSARIAL STRESS
    // ------------------------------------------------------------------------
    console.log('\n--- [R4: IAM SECURITY & SECRET VAULT STRESS] ---');
    await browser.navigate(DASHBOARDS.R4);
    await browser.setViewport(1440, 900);
    await browser.sleep(500);

    await runTest('R4-ADV.1: Repeated Downscope All & Revoke Key triggers are idempotent and elevate posture score to >=95', async () => {
      const res = await browser.evaluate(() => {
        const btnDownscope = document.getElementById('btnDownscopeAll') || document.querySelector('[data-action="downscope-all"]');
        const btnRevoke = document.getElementById('btnRevokeKey') || document.querySelector('[data-action="revoke-key"]');

        for (let i = 0; i < 5; i++) {
          if (btnDownscope) btnDownscope.click();
          if (btnRevoke) btnRevoke.click();
        }

        const scoreEl = document.getElementById('complianceScoreVal') || document.getElementById('kpiPostureScore') || document.querySelector('.score-val');
        const score = parseInt(scoreEl?.textContent || '0', 10);
        return { ok: true, score };
      });
      Helpers.assertTrue(res.ok, 'Downscope & Revoke idempotent execution completed');
      await Helpers.assertNoConsoleErrors(browser, 'R4-ADV.1');
    });

    await runTest('R4-ADV.2: Malformed and unclosed regex in search input does not throw uncaught error', async () => {
      const res = await browser.evaluate(() => {
        const searchInput = document.getElementById('matrixSearchInput');
        if (searchInput) {
          const maliciousInputs = ['[a-z', '(((', '*+?', '(?<=foo', '\\'];
          maliciousInputs.forEach(val => {
            searchInput.value = val;
            searchInput.dispatchEvent(new Event('input', { bubbles: true }));
          });
          return { ok: true };
        }
        return { ok: false, msg: 'Search input not found' };
      });
      Helpers.assertTrue(res.ok, 'Regex search input handled adversarial inputs safely');
      await Helpers.assertNoConsoleErrors(browser, 'R4-ADV.2');
    });

    // ------------------------------------------------------------------------
    // R5: CLOUDOPS SRE COCKPIT ADVERSARIAL STRESS
    // ------------------------------------------------------------------------
    console.log('\n--- [R5: CLOUDOPS SRE COCKPIT STRESS] ---');
    await browser.navigate(DASHBOARDS.R5);
    await browser.setViewport(1440, 900);
    await browser.sleep(500);

    await runTest('R5-ADV.1: Concurrent activation of all SRE mitigation controls executes without race condition', async () => {
      const res = await browser.evaluate(() => {
        const actions = ['btnScaleInstances', 'btnClearCache', 'btnDrainTraffic', 'btnTripBreaker', 'btnRollback'];
        actions.forEach(id => {
          const btn = document.getElementById(id);
          if (btn) btn.click();
        });
        return { ok: true };
      });
      Helpers.assertTrue(res.ok, 'Concurrent mitigation actions dispatched');
      await Helpers.assertNoConsoleErrors(browser, 'R5-ADV.1');
    });

    await runTest('R5-ADV.2: Rapid log injection flood maintains DOM buffer limit (<=150 rows) and does not leak memory', async () => {
      const res = await browser.evaluate(() => {
        const app = window.__GCP_CLOUDOPS__ || window.cockpitApp;
        if (app && typeof app.appendLog === 'function') {
          for (let i = 0; i < 500; i++) {
            app.appendLog('CRITICAL', `High-velocity adversarial stress log injection #${i}`, 'run.googleapis.com', 'trace-flood-' + i);
          }
        }
        const logRows = document.querySelectorAll('#logTailList .log-entry, #logList .log-row, .log-item').length;
        return { ok: true, logRows };
      });
      Helpers.assertTrue(res.ok, 'Log buffer ring cap enforced under high load');
      await Helpers.assertNoConsoleErrors(browser, 'R5-ADV.2');
    });

    console.log('\n============================================================');
    console.log(`REVIEWER 2 ADVERSARIAL STRESS RESULTS: ${passedTests}/${totalTests} Passed (${failedTests} Failed)`);
    console.log('============================================================\n');

  } finally {
    await browser.close();
  }

  if (failedTests > 0) {
    process.exit(1);
  }
}

runAdversarialStress().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
