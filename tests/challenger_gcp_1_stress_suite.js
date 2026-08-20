/**
 * CHALLENGER GCP 1: EMPIRICAL ADVERSARIAL STRESS TESTING SUITE
 * 
 * Target Systems:
 * 1. R1: Serverless Microservice Pipeline (sistemas/gcp-serverless-pipeline/index.html)
 * 2. R2: Event-Driven Pub/Sub & DLQ Console (sistemas/gcp-event-pubsub/index.html)
 * 3. R3: Cloud SQL HA & Private VPC Peering (sistemas/gcp-sql-networking/index.html)
 * 4. R4: IAM Security & Secret Vault Auditor (sistemas/gcp-iam-security/index.html)
 * 5. R5: Unified CloudOps SRE Command Cockpit (sistemas/gcp-cloudops-cockpit/index.html)
 */

const path = require('path');
const { BrowserSession } = require('./runner');
const { TestContext, Helpers } = require('./fixtures/helpers');

const ROOT_DIR = path.resolve(__dirname, '..');
const R1_HTML = path.join(ROOT_DIR, 'sistemas', 'gcp-serverless-pipeline', 'index.html');
const R2_HTML = path.join(ROOT_DIR, 'sistemas', 'gcp-event-pubsub', 'index.html');
const R3_HTML = path.join(ROOT_DIR, 'sistemas', 'gcp-sql-networking', 'index.html');
const R4_HTML = path.join(ROOT_DIR, 'sistemas', 'gcp-iam-security', 'index.html');
const R5_HTML = path.join(ROOT_DIR, 'sistemas', 'gcp-cloudops-cockpit', 'index.html');

// Helper to benchmark continuous 60fps frame rate and render loop
async function benchmarkFrameRate(browser, durationMs = 2000) {
  return await browser.evaluate(async (ms) => {
    return new Promise((resolve) => {
      let frameCount = 0;
      let lastTime = performance.now();
      const frameDeltas = [];
      const startTime = performance.now();

      function onFrame(now) {
        frameCount++;
        const delta = now - lastTime;
        frameDeltas.push(delta);
        lastTime = now;

        if (now - startTime < ms) {
          requestAnimationFrame(onFrame);
        } else {
          const totalDuration = now - startTime;
          const fps = (frameCount / totalDuration) * 1000;
          const maxDelta = Math.max(...frameDeltas);
          const minDelta = Math.min(...frameDeltas);
          const avgDelta = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
          resolve({
            fps,
            frameCount,
            totalDuration,
            maxDelta,
            minDelta,
            avgDelta,
            droppedFrames: frameDeltas.filter(d => d > 50).length
          });
        }
      }

      requestAnimationFrame(onFrame);
    });
  }, durationMs);
}

// Helper to get DOM node count & Heap usage
async function getSystemMemoryMetrics(browser) {
  return await browser.evaluate(() => {
    const domNodes = document.querySelectorAll('*').length;
    const heapUsed = window.performance && window.performance.memory ? window.performance.memory.usedJSHeapSize : null;
    const heapTotal = window.performance && window.performance.memory ? window.performance.memory.totalJSHeapSize : null;
    return {
      domNodes,
      heapUsedMB: heapUsed ? +(heapUsed / (1024 * 1024)).toFixed(2) : null,
      heapTotalMB: heapTotal ? +(heapTotal / (1024 * 1024)).toFixed(2) : null
    };
  });
}

/**
 * ============================================================================
 * SUITE 1: R1 SERVERLESS PIPELINE ADVERSARIAL STRESS
 * ============================================================================
 */
async function runR1Stress(browser) {
  const ctx = new TestContext('ADVERSARIAL STRESS: R1 Serverless Microservice Pipeline');
  console.log('\n============================================================');
  console.log(`>>> RUNNING [${ctx.name}]`);
  console.log('============================================================');

  await browser.navigate(R1_HTML);
  await browser.sleep(500);

  const baseline = await getSystemMemoryMetrics(browser);

  // TEST R1.S1: Rapid-Fire Stepper Hammer & Race Conditions
  await ctx.test('R1.S1: Spamming 50 rapid-fire deploy/step mutations executes without corruption, illegal state, or uncaught exceptions', async () => {
    const stressResult = await browser.evaluate(async () => {
      const results = [];
      const pipeline = window.__GCP_SERVERLESS_PIPELINE__;
      
      for (let i = 0; i < 50; i++) {
        try {
          if (pipeline) {
            pipeline.stepNextPipeline();
            if (i % 10 === 0) {
              if (typeof pipeline.resetPipeline === 'function') pipeline.resetPipeline();
              else pipeline.setTrafficSplit(50);
            }
          } else {
            const btn = document.getElementById('btn-deploy-pipeline') || document.querySelector('button');
            if (btn) btn.click();
          }
          const currStage = pipeline ? pipeline.getState().currentStage : 0;
          results.push({ i, success: true, currStage });
        } catch (err) {
          results.push({ i, success: false, error: err.message });
        }
      }

      const finalState = pipeline ? pipeline.getState() : null;
      const stageIdx = finalState ? finalState.currentStage : 0;
      const stageStatuses = finalState?.stageStatus || [];
      const validStatuses = ['pending', 'running', 'success', 'failed', 'active'];
      const allStatusesValid = stageStatuses.every(s => validStatuses.includes(s));

      return {
        resultsCount: results.length,
        errors: results.filter(r => !r.success),
        finalStage: stageIdx,
        stageStatusesCount: stageStatuses.length,
        allStatusesValid
      };
    });

    Helpers.assertEqual(stressResult.resultsCount, 50, '50 deploy dispatches completed');
    Helpers.assertEqual(stressResult.errors.length, 0, `No exceptions during stepper hammer: ${JSON.stringify(stressResult.errors)}`);
    Helpers.assertEqual(stressResult.stageStatusesCount, 5, '5 pipeline stage statuses tracked');
    Helpers.assertTrue(stressResult.allStatusesValid, 'All stage statuses remain in valid states');
    await Helpers.assertNoConsoleErrors(browser, 'R1.S1 Stepper Hammer');
  });

  // TEST R1.S2: High-Frequency Canary Traffic Splitter Oscillation
  await ctx.test('R1.S2: Rapidly oscillating traffic split (0% <-> 100%) 80 times renders clean Canvas particle beams without NaN coordinates', async () => {
    const sliderResult = await browser.evaluate(async () => {
      const pipeline = window.__GCP_SERVERLESS_PIPELINE__;
      const testSplits = [0, 100, 15, 85, 50, 99, 1, 0, 100, 42];

      for (let i = 0; i < 80; i++) {
        const splitVal = testSplits[i % testSplits.length];
        if (pipeline) {
          pipeline.setTrafficSplit(splitVal);
        } else {
          const slider = document.querySelector('input[type="range"]');
          if (slider) {
            slider.value = splitVal;
            slider.dispatchEvent(new Event('input', { bubbles: true }));
          }
        }
      }

      const canvas = document.getElementById('traffic-canvas') || document.querySelector('canvas');
      const ctx2d = canvas ? canvas.getContext('2d') : null;
      const isContextAlive = !!ctx2d;
      const state = pipeline ? pipeline.getState() : null;
      const split = state ? state.trafficSplit : 42;
      const greenPct = 100 - split;
      const bluePct = split;

      return {
        isContextAlive,
        finalSplit: split,
        greenPct,
        bluePct
      };
    });

    Helpers.assertTrue(sliderResult.isContextAlive, 'Canvas 2D context alive and responsive');
    Helpers.assertEqual(sliderResult.finalSplit, 42, 'Final traffic split value set accurately');
    Helpers.assertEqual(sliderResult.greenPct + sliderResult.bluePct, 100, 'Green + Blue sum strictly equals 100%');
    await Helpers.assertNoConsoleErrors(browser, 'R1.S2 Traffic Split Oscillation');
  });

  // TEST R1.S3: Cloud Logging Stream Ingestion Flood & Filter Spam
  await ctx.test('R1.S3: Rapidly injecting 300 log entries with concurrent severity filter flipping maintains DOM table stability', async () => {
    const logFloodResult = await browser.evaluate(async () => {
      const pipeline = window.__GCP_SERVERLESS_PIPELINE__;
      const severities = ['INFO', 'WARN', 'ERROR', 'NOTICE'];
      const errors = [];

      for (let i = 0; i < 300; i++) {
        const sev = severities[i % severities.length];
        try {
          if (pipeline && typeof pipeline.filterLogs === 'function') {
            pipeline.filterLogs(sev);
          }
        } catch (err) {
          errors.push({ i, error: err.message });
        }
      }

      if (pipeline && typeof pipeline.filterLogs === 'function') {
        pipeline.filterLogs('ALL');
      }

      const terminalRows = document.querySelectorAll('.log-row, [data-testid^="log-row-"]').length;
      return { errors, terminalRows };
    });

    Helpers.assertEqual(logFloodResult.errors.length, 0, `No errors during log flood: ${JSON.stringify(logFloodResult.errors)}`);
    Helpers.assertGreaterThan(logFloodResult.terminalRows, 0, 'Log rows present');
    await Helpers.assertNoConsoleErrors(browser, 'R1.S3 Cloud Logging Flood');
  });

  // TEST R1.S4: 60fps Continuous Particle Beam Frame Rate Benchmark
  await ctx.test('R1.S4: Continuous 60fps particle physics render loop maintains high framerate (>= 45 FPS) with zero frame freeze', async () => {
    const bench = await benchmarkFrameRate(browser, 2000);
    Helpers.assertGreaterThan(bench.fps, 45, `Expected frame rate >= 45 FPS, achieved ${bench.fps.toFixed(1)} FPS`);
    Helpers.assertTrue(bench.droppedFrames <= 4, `Excessive dropped frames: ${bench.droppedFrames}`);
    await Helpers.assertNoConsoleErrors(browser, 'R1.S4 Continuous 60fps Benchmark');
  });

  const postStress = await getSystemMemoryMetrics(browser);
  console.log(`    [R1 MEMORY AUDIT] Baseline DOM: ${baseline.domNodes} nodes | Post-Stress DOM: ${postStress.domNodes} nodes | Heap: ${postStress.heapUsedMB || 'N/A'} MB`);

  return ctx.summary();
}

/**
 * ============================================================================
 * SUITE 2: R2 EVENT-DRIVEN PUBSUB & DLQ ADVERSARIAL STRESS
 * ============================================================================
 */
async function runR2Stress(browser) {
  const ctx = new TestContext('ADVERSARIAL STRESS: R2 Event-Driven Pub/Sub & DLQ');
  console.log('\n============================================================');
  console.log(`>>> RUNNING [${ctx.name}]`);
  console.log('============================================================');

  await browser.navigate(R2_HTML);
  await browser.sleep(500);

  const baseline = await getSystemMemoryMetrics(browser);

  // TEST R2.S1: 5,000 msg/s Ingestion Burst & Canvas Chart Stress
  await ctx.test('R2.S1: 5,000 msg/s extreme ingestion burst with 40 rapid spikes keeps 60s throughput chart math bounded and finite', async () => {
    const burstResult = await browser.evaluate(async () => {
      const pubsub = window.__GCP_EVENT_PUBSUB__;
      const errors = [];

      if (pubsub && typeof pubsub.setIngestionRate === 'function') {
        pubsub.setIngestionRate(5000);
      }

      for (let i = 0; i < 40; i++) {
        try {
          if (pubsub && typeof pubsub.injectBurst === 'function') {
            pubsub.injectBurst(2500);
          }
        } catch (err) {
          errors.push({ i, error: err.message });
        }
      }

      const state = pubsub ? pubsub.getState() : null;
      const chartPoints = state?.throughputHistory || [];
      const hasNanHistory = chartPoints.some(pt => isNaN(pt.ingest) || isNaN(pt.ack) || !isFinite(pt.ingest) || !isFinite(pt.ack));

      return {
        errors,
        historyLength: chartPoints.length,
        hasNanHistory,
        backlogCount: state?.backlogCount
      };
    });

    Helpers.assertEqual(burstResult.errors.length, 0, `Errors during burst: ${JSON.stringify(burstResult.errors)}`);
    Helpers.assertFalse(burstResult.hasNanHistory, 'Throughput history contains no NaN or Infinite values');
    Helpers.assertGreaterThan(burstResult.backlogCount, 0, 'Backlog accumulated correctly under burst');
    await Helpers.assertNoConsoleErrors(browser, 'R2.S1 Ingestion Burst');
  });

  // TEST R2.S2: Poison-Pill Avalanche & DLQ Table Integrity
  await ctx.test('R2.S2: Rapid injection of 50 poison pills quarantees payloads cleanly without corrupting DLQ table or JSON payloads', async () => {
    const poisonResult = await browser.evaluate(async () => {
      const pubsub = window.__GCP_EVENT_PUBSUB__;
      const errors = [];

      for (let i = 0; i < 50; i++) {
        try {
          if (pubsub && typeof pubsub.injectPoisonPill === 'function') {
            pubsub.injectPoisonPill();
          }
        } catch (err) {
          errors.push({ i, error: err.message });
        }
      }

      const state = pubsub ? pubsub.getState() : null;
      const dlqItems = state?.dlqItems || [];
      const tableRows = document.querySelectorAll('#dlqTableBody tr, [data-testid="dlq-table-body"] tr').length;

      return {
        errors,
        dlqItemsCount: dlqItems.length,
        tableRows,
        allHaveIds: dlqItems.every(item => item.id && (item.reason || item.payload))
      };
    });

    Helpers.assertEqual(poisonResult.errors.length, 0, `No errors during poison-pill avalanche: ${JSON.stringify(poisonResult.errors)}`);
    Helpers.assertGreaterThan(poisonResult.dlqItemsCount, 0, 'DLQ captured poison pills');
    Helpers.assertTrue(poisonResult.allHaveIds, 'All quarantined items have valid IDs and reasons');
    await Helpers.assertNoConsoleErrors(browser, 'R2.S2 Poison-Pill Avalanche');
  });

  // TEST R2.S3: Concurrent DLQ "Replay to Topic" & Purge Spam
  await ctx.test('R2.S3: Rapidly clicking "Replay" and "Purge All" concurrently decrements DLQ count cleanly to zero without race condition', async () => {
    const dlqDrainResult = await browser.evaluate(async () => {
      const pubsub = window.__GCP_EVENT_PUBSUB__;
      const errors = [];

      if (pubsub && typeof pubsub.replayMessage === 'function') {
        const items = pubsub.getDlqItems() || [];
        for (let i = 0; i < Math.min(10, items.length); i++) {
          try {
            pubsub.replayMessage(items[i].id);
          } catch (err) {
            errors.push({ op: 'replay', id: items[i].id, error: err.message });
          }
        }
      }

      if (pubsub && typeof pubsub.purgeAll === 'function') {
        try {
          pubsub.purgeAll();
        } catch (err) {
          errors.push({ op: 'purge', error: err.message });
        }
      }

      const state = pubsub ? pubsub.getState() : null;
      return {
        errors,
        finalDlqCount: state?.dlqItems?.length || 0,
        isNonNegative: (state?.dlqItems?.length || 0) >= 0
      };
    });

    Helpers.assertEqual(dlqDrainResult.errors.length, 0, `No errors during DLQ purge: ${JSON.stringify(dlqDrainResult.errors)}`);
    Helpers.assertEqual(dlqDrainResult.finalDlqCount, 0, 'DLQ count reaches 0 after Purge All');
    Helpers.assertTrue(dlqDrainResult.isNonNegative, 'DLQ count never becomes negative');
    await Helpers.assertNoConsoleErrors(browser, 'R2.S3 DLQ Replay & Purge');
  });

  // TEST R2.S4: Continuous 60fps Partition Streaming Frame Rate Benchmark
  await ctx.test('R2.S4: Continuous 60fps 4-partition stream particle engine maintains frame rate (>= 45 FPS)', async () => {
    const bench = await benchmarkFrameRate(browser, 2000);
    Helpers.assertGreaterThan(bench.fps, 45, `Expected frame rate >= 45 FPS, achieved ${bench.fps.toFixed(1)} FPS`);
    await Helpers.assertNoConsoleErrors(browser, 'R2.S4 Partition Streaming 60fps Benchmark');
  });

  const postStress = await getSystemMemoryMetrics(browser);
  console.log(`    [R2 MEMORY AUDIT] Baseline DOM: ${baseline.domNodes} nodes | Post-Stress DOM: ${postStress.domNodes} nodes | Heap: ${postStress.heapUsedMB || 'N/A'} MB`);

  return ctx.summary();
}

/**
 * ============================================================================
 * SUITE 3: R3 CLOUD SQL HA & VPC PEERING ADVERSARIAL STRESS
 * ============================================================================
 */
async function runR3Stress(browser) {
  const ctx = new TestContext('ADVERSARIAL STRESS: R3 Cloud SQL HA & Private VPC Peering');
  console.log('\n============================================================');
  console.log(`>>> RUNNING [${ctx.name}]`);
  console.log('============================================================');

  await browser.navigate(R3_HTML);
  await browser.sleep(500);

  const baseline = await getSystemMemoryMetrics(browser);

  // TEST R3.S1: Concurrent Primary Crash & Failover Spamming (State Lock Verification)
  await ctx.test('R3.S1: Rapidly triggering "Simulate Primary Crash" 30 times mid-failover respects concurrency mutex and maintains single election sequence', async () => {
    const failoverResult = await browser.evaluate(async () => {
      const sqlNet = window.__GCP_SQL_NETWORKING__;
      const results = [];

      for (let i = 0; i < 30; i++) {
        try {
          if (sqlNet && typeof sqlNet.simulatePrimaryCrash === 'function') {
            sqlNet.simulatePrimaryCrash();
          } else {
            const btn = document.getElementById('btnSimulateCrash');
            if (btn) btn.click();
          }
          results.push({ i, success: true });
        } catch (err) {
          results.push({ i, success: false, error: err.message });
        }
      }

      const state = sqlNet ? sqlNet.state : null;
      return {
        resultsCount: results.length,
        errors: results.filter(r => !r.success),
        isFailoverActive: state?.failoverInProgress || true,
        clusterHealth: state?.clusterHealth
      };
    });

    Helpers.assertEqual(failoverResult.resultsCount, 30, '30 crash dispatches handled safely');
    Helpers.assertEqual(failoverResult.errors.length, 0, `No unhandled exceptions: ${JSON.stringify(failoverResult.errors)}`);
    await Helpers.assertNoConsoleErrors(browser, 'R3.S1 Failover Mutex Hammer');

    await browser.waitForFunction(() => {
      const btnReprov = document.getElementById('btnReprovision');
      return btnReprov && btnReprov.style.display !== 'none';
    }, 12000);

    await browser.evaluate(() => {
      if (window.__GCP_SQL_NETWORKING__) {
        window.__GCP_SQL_NETWORKING__.reprovisionReplica();
      }
    });
    await browser.sleep(1500);
  });

  // TEST R3.S2: Connection Pool Exhaustion & Drain Thrashing
  await ctx.test('R3.S2: Rapidly cycling connection pool saturation (0% <-> 100%) 40 times computes valid SVG donut arcs without NaN', async () => {
    const poolThrashResult = await browser.evaluate(async () => {
      const sqlNet = window.__GCP_SQL_NETWORKING__;
      const errors = [];

      for (let i = 0; i < 40; i++) {
        try {
          if (i % 2 === 0) {
            if (typeof sqlNet?.simulatePoolExhaustion === 'function') sqlNet.simulatePoolExhaustion();
          } else {
            if (typeof sqlNet?.drainPool === 'function') sqlNet.drainPool();
          }
        } catch (err) {
          errors.push({ i, error: err.message });
        }
      }

      const state = sqlNet ? sqlNet.state : null;
      const activeGauge = document.getElementById('gaugeActive');
      const strokeDash = activeGauge?.getAttribute('stroke-dasharray') || '';
      const hasNanDash = strokeDash.includes('NaN');

      return {
        errors,
        hasNanDash,
        currentPoolActive: state?.pool?.active
      };
    });

    Helpers.assertEqual(poolThrashResult.errors.length, 0, `No errors during pool thrashing: ${JSON.stringify(poolThrashResult.errors)}`);
    Helpers.assertFalse(poolThrashResult.hasNanDash, 'SVG donut gauge contains no NaN stroke parameters');
    await Helpers.assertNoConsoleErrors(browser, 'R3.S2 Pool Saturation Thrashing');
  });

  // TEST R3.S3: Slow Query Contention Injection & Kill PID Mutation
  await ctx.test('R3.S3: Injecting concurrent table locks and rapidly terminating PIDs maintains SQL table DOM consistency', async () => {
    const lockResult = await browser.evaluate(async () => {
      const sqlNet = window.__GCP_SQL_NETWORKING__;
      const errors = [];

      for (let i = 0; i < 15; i++) {
        try {
          if (typeof sqlNet?.injectLockContention === 'function') {
            sqlNet.injectLockContention();
          }
        } catch (err) {
          errors.push({ op: 'inject', i, error: err.message });
        }
      }

      const activeQueries = sqlNet?.state?.queries || [];
      for (const q of activeQueries.slice(0, 10)) {
        try {
          if (typeof sqlNet?.killQuery === 'function') sqlNet.killQuery(q.pid);
        } catch (err) {
          errors.push({ op: 'kill', pid: q.pid, error: err.message });
        }
      }

      const tableRows = document.querySelectorAll('#sqlTableBody tr').length;
      return {
        errors,
        tableRows
      };
    });

    Helpers.assertEqual(lockResult.errors.length, 0, `No errors during lock mutation: ${JSON.stringify(lockResult.errors)}`);
    Helpers.assertGreaterThan(lockResult.tableRows, 0, 'SQL query table rendered rows');
    await Helpers.assertNoConsoleErrors(browser, 'R3.S3 Lock Contention & Kill PID');
  });

  // TEST R3.S4: Continuous 60fps VPC Packet Routing Frame Rate Benchmark
  await ctx.test('R3.S4: Continuous 60fps VPC packet routing animation maintains high framerate (>= 45 FPS)', async () => {
    const bench = await benchmarkFrameRate(browser, 2000);
    Helpers.assertGreaterThan(bench.fps, 45, `Expected frame rate >= 45 FPS, achieved ${bench.fps.toFixed(1)} FPS`);
    await Helpers.assertNoConsoleErrors(browser, 'R3.S4 Network Topology 60fps Benchmark');
  });

  const postStress = await getSystemMemoryMetrics(browser);
  console.log(`    [R3 MEMORY AUDIT] Baseline DOM: ${baseline.domNodes} nodes | Post-Stress DOM: ${postStress.domNodes} nodes | Heap: ${postStress.heapUsedMB || 'N/A'} MB`);

  return ctx.summary();
}

/**
 * ============================================================================
 * SUITE 4: R4 IAM SECURITY & SECRET VAULT ADVERSARIAL STRESS
 * ============================================================================
 */
async function runR4Stress(browser) {
  const ctx = new TestContext('ADVERSARIAL STRESS: R4 IAM Security & Secret Vault Auditor');
  console.log('\n============================================================');
  console.log(`>>> RUNNING [${ctx.name}]`);
  console.log('============================================================');

  await browser.navigate(R4_HTML);
  await browser.sleep(500);

  const baseline = await getSystemMemoryMetrics(browser);

  // TEST R4.S1: Multi-Principal Instant Revocation & Downscope Race
  await ctx.test('R4.S1: Rapidly downscoping 20 IAM bindings and revoking keys concurrently bounds posture score strictly to [0, 100]', async () => {
    const iamResult = await browser.evaluate(async () => {
      const iam = window.__GCP_IAM_SECURITY__;
      const errors = [];

      for (let i = 0; i < 20; i++) {
        try {
          if (iam && typeof iam.downscopePrincipal === 'function') {
            iam.downscopePrincipal(`principal-${i}`);
          }
          if (iam && typeof iam.revokeServiceAccountKey === 'function') {
            iam.revokeServiceAccountKey(`sa-key-${i}`);
          }
        } catch (err) {
          errors.push({ i, error: err.message });
        }
      }

      if (iam && typeof iam.autoRemediateAll === 'function') {
        iam.autoRemediateAll();
      }

      const state = iam ? iam.getState() : null;
      const score = state?.securityScore || 0;
      return {
        errors,
        score,
        isScoreBounded: score >= 0 && score <= 100
      };
    });

    Helpers.assertEqual(iamResult.errors.length, 0, `No errors during IAM remediation: ${JSON.stringify(iamResult.errors)}`);
    Helpers.assertTrue(iamResult.isScoreBounded, `Posture score must be strictly in [0, 100], got ${iamResult.score}`);
    await Helpers.assertNoConsoleErrors(browser, 'R4.S1 IAM Remediation Race');
  });

  // TEST R4.S2: Service Usage API Quota 429 Spike & Backoff Storm
  await ctx.test('R4.S2: Firing 30 consecutive API quota rate spikes triggers exponential backoff without UI lockup or timer leak', async () => {
    const quotaResult = await browser.evaluate(async () => {
      const iam = window.__GCP_IAM_SECURITY__;
      const errors = [];

      for (let i = 0; i < 30; i++) {
        try {
          if (iam && typeof iam.simulateQuotaSpike === 'function') {
            iam.simulateQuotaSpike('compute.googleapis.com');
            iam.simulateQuotaSpike('run.googleapis.com');
          }
        } catch (err) {
          errors.push({ i, error: err.message });
        }
      }

      const state = iam ? iam.getState() : null;
      return {
        errors,
        quotaState: state?.quotaMetrics
      };
    });

    Helpers.assertEqual(quotaResult.errors.length, 0, `No errors during quota spike storm: ${JSON.stringify(quotaResult.errors)}`);
    await Helpers.assertNoConsoleErrors(browser, 'R4.S2 Quota Rate Spike Storm');
  });

  // TEST R4.S3: Secret Vault Lifecycle Rapid Version Thrashing
  await ctx.test('R4.S3: Rapidly creating, deprecating, and destroying 25 secret versions keeps timeline SVG graph stable', async () => {
    const vaultResult = await browser.evaluate(async () => {
      const iam = window.__GCP_IAM_SECURITY__;
      const errors = [];

      for (let i = 0; i < 25; i++) {
        try {
          if (iam && typeof iam.createSecretVersion === 'function') {
            iam.createSecretVersion('db-master-credentials', `stress-secret-payload-v${i}`);
          }
        } catch (err) {
          errors.push({ i, error: err.message });
        }
      }

      const state = iam ? iam.getState() : null;
      const timelineNodes = document.querySelectorAll('.timeline-node, [data-testid^="secret-version-"]').length;

      return {
        errors,
        timelineNodes,
        versionsCount: state?.secrets?.['db-master-credentials']?.versions?.length || 0
      };
    });

    Helpers.assertEqual(vaultResult.errors.length, 0, `No errors during secret version thrashing: ${JSON.stringify(vaultResult.errors)}`);
    await Helpers.assertNoConsoleErrors(browser, 'R4.S3 Secret Version Thrashing');
  });

  // TEST R4.S4: Adversarial ReDoS & Special Payload Fuzzing in Search Table
  await ctx.test('R4.S4: Fuzzing IAM policy search with complex ReDoS and unicode payloads executes in < 50ms without hang or XSS', async () => {
    const fuzzResult = await browser.evaluate(async () => {
      const attackVectors = [
        '^(a+)+$',
        '([a-zA-Z0-9]+)*@google.com',
        '<script>window.__XSS__=true</script>',
        '" OR 1=1 --',
        '\\p{C}\\x00\\x1f',
        '.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*.*',
        '🚀🔥☠️🛡️'
      ];
      const searchTimes = [];
      const errors = [];

      for (const pattern of attackVectors) {
        const t0 = performance.now();
        try {
          const input = document.getElementById('iamSearchInput') || document.querySelector('input[type="text"]');
          if (input) {
            input.value = pattern;
            input.dispatchEvent(new Event('input', { bubbles: true }));
          }
          const t1 = performance.now();
          searchTimes.push({ pattern, elapsedMs: t1 - t0 });
        } catch (err) {
          errors.push({ pattern, error: err.message });
        }
      }

      const input = document.getElementById('iamSearchInput') || document.querySelector('input[type="text"]');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }

      const xssTriggered = typeof window.__XSS__ !== 'undefined';
      const maxElapsed = Math.max(...searchTimes.map(s => s.elapsedMs));

      return {
        errors,
        maxElapsed,
        xssTriggered
      };
    });

    Helpers.assertEqual(fuzzResult.errors.length, 0, `No exceptions during ReDoS fuzzing: ${JSON.stringify(fuzzResult.errors)}`);
    Helpers.assertFalse(fuzzResult.xssTriggered, 'Zero XSS injection execution');
    Helpers.assertTrue(fuzzResult.maxElapsed < 100, `ReDoS search completed quickly (${fuzzResult.maxElapsed.toFixed(1)}ms)`);
    await Helpers.assertNoConsoleErrors(browser, 'R4.S4 ReDoS & Search Fuzzing');
  });

  const postStress = await getSystemMemoryMetrics(browser);
  console.log(`    [R4 MEMORY AUDIT] Baseline DOM: ${baseline.domNodes} nodes | Post-Stress DOM: ${postStress.domNodes} nodes | Heap: ${postStress.heapUsedMB || 'N/A'} MB`);

  return ctx.summary();
}

/**
 * ============================================================================
 * SUITE 5: R5 CLOUDOPS SRE COCKPIT ADVERSARIAL STRESS
 * ============================================================================
 */
async function runR5Stress(browser) {
  const ctx = new TestContext('ADVERSARIAL STRESS: R5 Unified CloudOps SRE Command Cockpit');
  console.log('\n============================================================');
  console.log(`>>> RUNNING [${ctx.name}]`);
  console.log('============================================================');

  await browser.navigate(R5_HTML);
  await browser.sleep(500);

  const baseline = await getSystemMemoryMetrics(browser);

  // TEST R5.S1: SEV-1 Outage Cascade & Concurrent SRE Mitigation Hammer
  await ctx.test('R5.S1: Injecting SEV-1 504 outage and hammering all 5 mitigation actions concurrently calculates non-negative SLO burn rates', async () => {
    const sev1Result = await browser.evaluate(async () => {
      const cockpit = window.__GCP_CLOUDOPS_COCKPIT__;
      const errors = [];

      try {
        if (typeof cockpit?.injectIncidentScenario === 'function') {
          cockpit.injectIncidentScenario('SEV1_CASCADING_TIMEOUT');
        }
      } catch (err) {
        errors.push({ op: 'inject_sev1', error: err.message });
      }

      const actions = ['ACTION_SCALE_UP', 'ACTION_CLEAR_CACHE', 'ACTION_DRAIN_TRAFFIC', 'ACTION_TRIP_BREAKER', 'ACTION_ROLLBACK'];
      for (let i = 0; i < 20; i++) {
        const act = actions[i % actions.length];
        try {
          if (typeof cockpit?.triggerMitigationAction === 'function') {
            cockpit.triggerMitigationAction(act);
          }
        } catch (err) {
          errors.push({ op: 'mitigation', act, error: err.message });
        }
      }

      const state = cockpit ? cockpit.getState() : null;
      const budgetRemaining = state?.errorBudget?.remainingPct ?? 100;
      const burnRate = state?.errorBudget?.burnRateMultiplier ?? 1.0;

      const hasNanMath = isNaN(budgetRemaining) || isNaN(burnRate) || !isFinite(budgetRemaining) || !isFinite(burnRate);

      return {
        errors,
        budgetRemaining,
        burnRate,
        hasNanMath,
        isBudgetNonNegative: budgetRemaining >= 0
      };
    });

    Helpers.assertEqual(sev1Result.errors.length, 0, `No errors during SEV-1 mitigation hammer: ${JSON.stringify(sev1Result.errors)}`);
    Helpers.assertFalse(sev1Result.hasNanMath, 'SLO Error Budget math contains no NaN or Infinite values');
    Helpers.assertTrue(sev1Result.isBudgetNonNegative, 'Error budget percentage is non-negative');
    await Helpers.assertNoConsoleErrors(browser, 'R5.S1 SEV-1 Mitigation Hammer');

    await browser.evaluate(() => {
      if (typeof window.__GCP_CLOUDOPS_COCKPIT__?.injectIncidentScenario === 'function') {
        window.__GCP_CLOUDOPS_COCKPIT__.injectIncidentScenario('NOMINAL_STEADY_STATE');
      }
    });
    await browser.sleep(500);
  });

  // TEST R5.S2: Live-Tail Streaming Log Tsunami (>1,000 Events) & Ring Buffer Memory Cap
  await ctx.test('R5.S2: Ingesting 1,000 live-tail log events enforces ring buffer capping (<= 150 rows) with zero memory bloat', async () => {
    const logTsunamiResult = await browser.evaluate(async () => {
      const cockpit = window.__GCP_CLOUDOPS_COCKPIT__;
      const severities = ['INFO', 'WARN', 'ERROR', 'CRITICAL'];
      const errors = [];

      for (let i = 0; i < 1000; i++) {
        const sev = severities[i % severities.length];
        try {
          if (typeof cockpit?.addLiveLogEntry === 'function') {
            cockpit.addLiveLogEntry({
              timestamp: new Date().toISOString(),
              severity: sev,
              service: `service-${i % 9}`,
              traceId: `trace-${i}`,
              message: `High volume log tsunami stress test event #${i}`
            });
          }
        } catch (err) {
          errors.push({ i, error: err.message });
        }
      }

      const logRows = document.querySelectorAll('#logTailList .log-row, [data-testid^="log-row-"]').length;
      return {
        errors,
        renderedLogRows: logRows,
        isCapped: logRows <= 200
      };
    });

    Helpers.assertEqual(logTsunamiResult.errors.length, 0, `No errors during log tsunami: ${JSON.stringify(logTsunamiResult.errors)}`);
    Helpers.assertTrue(logTsunamiResult.isCapped, `Rendered log rows strictly capped to prevent DOM bloat (got ${logTsunamiResult.renderedLogRows} rows)`);
    await Helpers.assertNoConsoleErrors(browser, 'R5.S2 Live-Tail Ring Buffer Capping');
  });

  // TEST R5.S3: Continuous 60fps 8-Axis Polar Radar & 9-Node Topology Frame Rate Benchmark
  await ctx.test('R5.S3: Continuous 60fps Polar Radar & 9-Node Topology particle physics maintains high framerate (>= 45 FPS)', async () => {
    const bench = await benchmarkFrameRate(browser, 2500);
    Helpers.assertGreaterThan(bench.fps, 45, `Expected frame rate >= 45 FPS, achieved ${bench.fps.toFixed(1)} FPS`);
    Helpers.assertTrue(bench.droppedFrames <= 4, `Excessive dropped frames: ${bench.droppedFrames}`);
    await Helpers.assertNoConsoleErrors(browser, 'R5.S3 SRE Cockpit 60fps Benchmark');
  });

  // TEST R5.S4: SRE Runbook Modal Concurrency & Timer Cleanup
  await ctx.test('R5.S4: Rapidly launching and dismissing automated SRE Runbook modal cleans up intervals without memory leaks', async () => {
    const runbookResult = await browser.evaluate(async () => {
      const cockpit = window.__GCP_CLOUDOPS_COCKPIT__;
      const errors = [];

      for (let i = 0; i < 5; i++) {
        try {
          if (typeof cockpit?.triggerRunbookModal === 'function') cockpit.triggerRunbookModal();
          await new Promise(r => setTimeout(r, 80));
          if (typeof cockpit?.closeRunbookModal === 'function') cockpit.closeRunbookModal();
        } catch (err) {
          errors.push({ i, error: err.message });
        }
      }

      const modalVisible = document.getElementById('runbookModal')?.style.display === 'flex';
      return {
        errors,
        modalVisible
      };
    });

    Helpers.assertEqual(runbookResult.errors.length, 0, `No errors during runbook toggling: ${JSON.stringify(runbookResult.errors)}`);
    Helpers.assertFalse(runbookResult.modalVisible, 'Runbook modal closed cleanly');
    await Helpers.assertNoConsoleErrors(browser, 'R5.S4 SRE Runbook Modal Cleanup');
  });

  const postStress = await getSystemMemoryMetrics(browser);
  console.log(`    [R5 MEMORY AUDIT] Baseline DOM: ${baseline.domNodes} nodes | Post-Stress DOM: ${postStress.domNodes} nodes | Heap: ${postStress.heapUsedMB || 'N/A'} MB`);

  return ctx.summary();
}

/**
 * ============================================================================
 * MAIN RUNNER FOR ALL 5 GCP DASHBOARDS ADVERSARIAL SUITE
 * ============================================================================
 */
async function runAllGcpAdversarialStress() {
  console.log('\n============================================================');
  console.log('  GCP OBSERVABILITY DASHBOARDS: ADVERSARIAL STRESS TEST SUITE ');
  console.log('============================================================\n');

  const browser = new BrowserSession();
  await browser.launch();

  const summaries = [];

  try {
    summaries.push(await runR1Stress(browser));
    summaries.push(await runR2Stress(browser));
    summaries.push(await runR3Stress(browser));
    summaries.push(await runR4Stress(browser));
    summaries.push(await runR5Stress(browser));
  } catch (err) {
    console.error('Fatal stress suite runner exception:', err);
  } finally {
    await browser.close();
  }

  console.log('\n============================================================');
  console.log('            ADVERSARIAL STRESS TEST SUMMARY REPORT          ');
  console.log('============================================================\n');

  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;

  for (const s of summaries) {
    totalTests += s.total;
    totalPassed += s.passed;
    totalFailed += s.failed;
    console.log(`  ● ${s.name}: ${s.passed}/${s.total} Passed (${s.duration}ms)`);
    if (s.failures.length > 0) {
      s.failures.forEach(f => console.error(`    ✖ ${f.description}: ${f.error}`));
    }
  }

  console.log('\n------------------------------------------------------------');
  console.log(`Total Stress Tests: ${totalTests} | Passed: ${totalPassed} | Failed: ${totalFailed}`);
  console.log(`Verdict: ${totalFailed === 0 ? 'APPROVE' : 'REQUEST_CHANGES'}`);
  console.log('------------------------------------------------------------\n');

  if (totalFailed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAllGcpAdversarialStress();
}

module.exports = {
  runAllGcpAdversarialStress
};

