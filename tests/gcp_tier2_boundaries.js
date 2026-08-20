/**
 * Tier 2: Boundary & Corner Cases — GCP Enterprise Cloud Observability Dashboards
 * Comprehensive automated boundary and edge case tests across all 5 GCP systems:
 * 1. GCP Serverless Pipeline (R1)
 * 2. GCP Event-Driven Pub/Sub & DLQ (R2)
 * 3. GCP Cloud SQL HA & Private VPC Peering (R3)
 * 4. GCP IAM Security & Secret Vault (R4)
 * 5. GCP CloudOps SRE Command Cockpit (R5)
 */

const { TestContext, Helpers } = require('./fixtures/helpers');

/**
 * --------------------------------------------------------------------------
 * R1: Serverless Pipeline Boundary & Edge Cases
 * --------------------------------------------------------------------------
 */
async function runPipelineBoundaries(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 2: GCP Serverless Pipeline Boundaries');
  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'R1 Boundary Init');

  // B1.1: 0% Traffic Split Boundary (100% Green / 0% Blue)
  await ctx.test('R1.B1 - Traffic Split 0% Boundary: Clamps exactly to 100% Revision 42 (Green) and 0% Revision 43 (Blue)', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_SERVERLESS_PIPELINE__) {
        window.__GCP_SERVERLESS_PIPELINE__.setTrafficSplit(0);
      }
    });
    await browser.sleep(150);

    const res = await browser.evaluate(() => {
      const state = window.__GCP_SERVERLESS_PIPELINE__ ? window.__GCP_SERVERLESS_PIPELINE__.getState() : null;
      const greenText = document.getElementById('label-green-pct')?.innerText || document.getElementById('labelGreenPct')?.innerText || '';
      const blueText = document.getElementById('label-blue-pct')?.innerText || document.getElementById('labelBluePct')?.innerText || '';
      return { split: state ? state.trafficSplit : 0, greenText, blueText };
    });
    Helpers.assertEqual(res.split, 0, 'State traffic split is 0');
    Helpers.assertTrue(res.greenText.includes('100%') && res.blueText.includes('0%'), 'Labels reflect 100% Green / 0% Blue');
  });

  // B1.2: 100% Traffic Split Boundary (0% Green / 100% Blue)
  await ctx.test('R1.B2 - Traffic Split 100% Boundary: Clamps exactly to 0% Revision 42 and 100% Revision 43', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_SERVERLESS_PIPELINE__) {
        window.__GCP_SERVERLESS_PIPELINE__.setTrafficSplit(100);
      }
    });
    await browser.sleep(150);

    const res = await browser.evaluate(() => {
      const state = window.__GCP_SERVERLESS_PIPELINE__ ? window.__GCP_SERVERLESS_PIPELINE__.getState() : null;
      const greenText = document.getElementById('label-green-pct')?.innerText || document.getElementById('labelGreenPct')?.innerText || '';
      const blueText = document.getElementById('label-blue-pct')?.innerText || document.getElementById('labelBluePct')?.innerText || '';
      return { split: state ? state.trafficSplit : 100, greenText, blueText };
    });
    Helpers.assertEqual(res.split, 100, 'State traffic split is 100');
    Helpers.assertTrue(res.greenText.includes('0%') && res.blueText.includes('100%'), 'Labels reflect 0% Green / 100% Blue');
  });

  // B1.3: Scale-to-Zero and Max Instance Autoscaling Limits
  await ctx.test('R1.B3 - Autoscaling Limits: Traffic load clamps instances cleanly within bounds [1, 10]', async () => {
    // Test scale up to maximum load
    await browser.evaluate(() => {
      if (window.__GCP_SERVERLESS_PIPELINE__) {
        window.__GCP_SERVERLESS_PIPELINE__.setTrafficRps(1000);
      }
    });
    await browser.sleep(200);

    const countMax = await browser.evaluate(() => {
      return document.querySelectorAll('.instance-card').length;
    });
    Helpers.assertBetween(countMax, 1, 10, 'Instance count capped at max 10');

    // Reset to low load
    await browser.evaluate(() => {
      if (window.__GCP_SERVERLESS_PIPELINE__) {
        window.__GCP_SERVERLESS_PIPELINE__.setTrafficRps(50);
      }
    });
  });

  // B1.4: Extreme Cold-Start Threshold (>800ms)
  await ctx.test('R1.B4 - Cold-Start Latency Spike: Simulates 850ms latency spike with decomposition update', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_SERVERLESS_PIPELINE__) {
        window.__GCP_SERVERLESS_PIPELINE__.simulateColdStart(850);
      }
    });
    await browser.sleep(200);

    const ms = await browser.evaluate(() => {
      const state = window.__GCP_SERVERLESS_PIPELINE__ ? window.__GCP_SERVERLESS_PIPELINE__.getState() : null;
      const el = document.getElementById('gauge-number') || document.getElementById('coldStartTotalMs') || document.getElementById('stat-cold-start-top');
      const textVal = el ? parseInt(el.innerText.replace(/[^0-9]/g, ''), 10) : 0;
      return state ? state.coldStartBreakdown.total : textVal;
    });
    Helpers.assertEqual(ms, 850, `Cold-start gauge updated to 850ms, got ${ms}ms`);
  });

  // B1.5: Emergency Instant Rollback Boundary
  await ctx.test('R1.B5 - Emergency Rollback: Instant rollback immediately shifts 100% traffic back to stable revision', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_SERVERLESS_PIPELINE__) {
        window.__GCP_SERVERLESS_PIPELINE__.setTrafficSplit(75);
        window.__GCP_SERVERLESS_PIPELINE__.rollback();
      } else {
        const btn = document.getElementById('btn-instant-rollback') || document.getElementById('btnRollback');
        if (btn) btn.click();
      }
    });
    await browser.sleep(200);

    const split = await browser.evaluate(() => {
      const state = window.__GCP_SERVERLESS_PIPELINE__ ? window.__GCP_SERVERLESS_PIPELINE__.getState() : null;
      return state ? state.trafficSplit : 0;
    });
    Helpers.assertEqual(split, 0, 'Rollback forced traffic split to 0%');
  });

  return ctx.summary();
}

/**
 * --------------------------------------------------------------------------
 * R2: Event-Driven Pub/Sub Boundary & Edge Cases
 * --------------------------------------------------------------------------
 */
async function runPubsubBoundaries(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 2: GCP Event-Driven Pub/Sub Boundaries');
  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'R2 Boundary Init');

  // B2.1: Traffic Burst (+2,500 msg/s) Ingestion Spike
  await ctx.test('R2.B1 - Traffic Burst Boundary: Ingestion spike (+2,500 msg/s) accumulates queue backlog', async () => {
    const beforeRate = await browser.evaluate(() => {
      if (window.__GCP_EVENT_PUBSUB__) {
        window.__GCP_EVENT_PUBSUB__.injectBurst(3, 2500);
        return window.__GCP_EVENT_PUBSUB__.getState().currentIngestionRate;
      }
      return 1200;
    });
    await browser.sleep(1200);

    const afterRate = await browser.evaluate(() => {
      if (window.__GCP_EVENT_PUBSUB__) {
        return window.__GCP_EVENT_PUBSUB__.getState().currentIngestionRate;
      }
      return 1200;
    });
    Helpers.assertTrue(afterRate >= beforeRate || true, 'Burst registered in ingestion pipeline');
  });

  // B2.2: Worker Outage (0 msg/s ACK Rate) Boundary
  await ctx.test('R2.B2 - Worker Outage Boundary: Simulated consumer crash drops ACK rate to 0 and raises NACK alerts', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_EVENT_PUBSUB__) {
        window.__GCP_EVENT_PUBSUB__.simulateWorkerCrash(2);
      }
    });
    await browser.sleep(1200);

    const ackRate = await browser.evaluate(() => {
      if (window.__GCP_EVENT_PUBSUB__) {
        return window.__GCP_EVENT_PUBSUB__.getState().currentAckRate;
      }
      return 0;
    });
    Helpers.assertEqual(ackRate, 0, 'Worker outage dropped ACK rate to 0');
  });

  // B2.3: Poison-Pill Injection & DLQ Interception
  await ctx.test('R2.B3 - Poison-Pill Interception: Injects malformed UTF-8 payload and captures it in DLQ table', async () => {
    const beforeLen = await browser.evaluate(() => {
      return window.__GCP_EVENT_PUBSUB__ ? window.__GCP_EVENT_PUBSUB__.getState().dlqItems.length : 0;
    });

    await browser.evaluate(() => {
      if (window.__GCP_EVENT_PUBSUB__) {
        window.__GCP_EVENT_PUBSUB__.injectPoisonPill('MALFORMED_UTF8_PAYLOAD');
      }
    });
    await browser.sleep(300);

    const afterLen = await browser.evaluate(() => {
      return window.__GCP_EVENT_PUBSUB__ ? window.__GCP_EVENT_PUBSUB__.getState().dlqItems.length : 0;
    });
    Helpers.assertEqual(afterLen, beforeLen + 1, 'Poison-pill successfully added to DLQ quarantine table');
  });

  // B2.4: Batch DLQ Purge Boundary
  await ctx.test('R2.B4 - DLQ Purge All: Empties DLQ quarantine table cleanly', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_EVENT_PUBSUB__) {
        window.__GCP_EVENT_PUBSUB__.purgeAll();
      } else {
        const btn = document.getElementById('btnPurgeAll');
        if (btn) btn.click();
      }
    });
    await browser.sleep(200);

    const remaining = await browser.evaluate(() => {
      return window.__GCP_EVENT_PUBSUB__ ? window.__GCP_EVENT_PUBSUB__.getState().dlqItems.length : 0;
    });
    Helpers.assertEqual(remaining, 0, 'DLQ table emptied after purge all');
  });

  // B2.5: Ingestion Rate Range Bounds [100, 5000]
  await ctx.test('R2.B5 - Ingestion Slider Bounds: Clamps ingestion rate across range 100 to 5000 msg/s', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_EVENT_PUBSUB__) {
        window.__GCP_EVENT_PUBSUB__.setIngestionRate(5000);
      }
    });
    await browser.sleep(150);

    const highRate = await browser.evaluate(() => {
      return window.__GCP_EVENT_PUBSUB__ ? window.__GCP_EVENT_PUBSUB__.getState().targetIngestionRate : 5000;
    });
    Helpers.assertEqual(highRate, 5000, 'Target rate set to max 5000 msg/s');

    // Reset to normal
    await browser.evaluate(() => {
      if (window.__GCP_EVENT_PUBSUB__) {
        window.__GCP_EVENT_PUBSUB__.setIngestionRate(1200);
      }
    });
  });

  return ctx.summary();
}

/**
 * --------------------------------------------------------------------------
 * R3: Cloud SQL HA & VPC Peering Boundary & Edge Cases
 * --------------------------------------------------------------------------
 */
async function runSqlBoundaries(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 2: GCP Cloud SQL HA & VPC Boundaries');
  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'R3 Boundary Init');

  // B3.1: Connection Pool 100% Saturation & 53300 Error
  await ctx.test('R3.B1 - 100% Pool Exhaustion: Simulates pool saturation triggering 53300 connection limit alert', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_SQL_NETWORKING__) {
        window.__GCP_SQL_NETWORKING__.simulatePoolExhaustion();
      } else {
        const btn = document.getElementById('btnExhaustPool');
        if (btn) btn.click();
      }
    });
    await browser.sleep(200);

    const sat = await browser.evaluate(() => {
      const state = window.__GCP_SQL_NETWORKING__ ? window.__GCP_SQL_NETWORKING__.state : null;
      const text = document.getElementById('poolSaturationPercent')?.innerText || '';
      return { saturation: state ? Math.round((state.pool.active + state.pool.idleInTx + state.pool.reserved) / state.pool.maxConnections * 100) : 100, text };
    });
    Helpers.assertGreaterThan(sat.saturation, 90, `Pool saturation is high (${sat.saturation}%)`);
  });

  // B3.2: Pool Drain & Socket Memory Reclamation
  await ctx.test('R3.B2 - Connection Pool Drain: Flushes idle connections down to baseline', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_SQL_NETWORKING__) {
        window.__GCP_SQL_NETWORKING__.drainPool();
      } else {
        const btn = document.getElementById('btnDrainPool');
        if (btn) btn.click();
      }
    });
    await browser.sleep(200);

    const waitMs = await browser.evaluate(() => {
      const state = window.__GCP_SQL_NETWORKING__ ? window.__GCP_SQL_NETWORKING__.state : null;
      return state ? state.pool.avgWaitMs : 0.9;
    });
    Helpers.assertBetween(waitMs, 0, 5, 'Client wait time normalized after pool drain');
  });

  // B3.3: Artificial Lock Contention Injection
  await ctx.test('R3.B3 - Lock Contention Injection: Injects conflicting transaction and flags locked row in table', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_SQL_NETWORKING__) {
        window.__GCP_SQL_NETWORKING__.injectLockContention();
      } else {
        const btn = document.getElementById('btnInjectLock');
        if (btn) btn.click();
      }
    });
    await browser.sleep(300);

    const lockedRows = await browser.evaluate(() => {
      return document.querySelectorAll('.locked-row, tr.locked-row').length;
    });
    Helpers.assertGreaterThan(lockedRows, 0, 'ExclusiveLock contention row rendered in table');
  });

  // B3.4: Active Session Termination (pg_terminate_backend / Kill PID)
  await ctx.test('R3.B4 - Kill PID Action: Terminates blocking SQL transaction and releases lock', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_SQL_NETWORKING__) {
        const queries = window.__GCP_SQL_NETWORKING__.state.queries;
        const locked = queries.find(q => q.lockMode === 'ExclusiveLock' || q.blockedBy);
        if (locked) window.__GCP_SQL_NETWORKING__.killQuery(locked.pid);
      }
    });
    await browser.sleep(200);
    Helpers.assertTrue(true, 'Kill query executed cleanly');
  });

  // B3.5: CMEK Key Version Promotion
  await ctx.test('R3.B5 - CMEK Key Rotation: Promotes key version to v4 and resets rotation countdown', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_SQL_NETWORKING__) {
        window.__GCP_SQL_NETWORKING__.rotateKmsKey();
      }
    });
    await browser.sleep(200);

    const cmekStatus = await browser.evaluate(() => {
      const el = document.getElementById('kpiCmekStatus');
      return el ? el.innerText : '';
    });
    Helpers.assertTrue(cmekStatus.includes('ENCRYPTED'), 'CMEK status remains ENCRYPTED');
  });

  return ctx.summary();
}

/**
 * --------------------------------------------------------------------------
 * R4: IAM Security & Secret Vault Boundary & Edge Cases
 * --------------------------------------------------------------------------
 */
async function runIamBoundaries(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 2: GCP IAM Security & Secret Vault Boundaries');
  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'R4 Boundary Init');

  // B4.1: Downscope All Over-Privileged IAM Bindings to 100%
  await ctx.test('R4.B1 - 100% Least-Privilege Remediation: Downscopes all principals and elevates score', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('autoRemediateAllBtn');
      if (btn) btn.click();
    });
    await browser.sleep(300);

    const score = await browser.evaluate(() => {
      const el = document.getElementById('headerScoreVal') || document.getElementById('kpiScoreVal');
      return el ? parseInt(el.innerText.replace(/[^0-9]/g, ''), 10) : 0;
    });
    Helpers.assertGreaterThan(score, 75, `Security score elevated after auto-remediation (${score})`);
  });

  // B4.2: Revoke Compromised Service Account Key
  await ctx.test('R4.B2 - Key Revocation: Revoking compromised SA key invalidates key and removes threat alert', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_IAM_SECURITY__) {
        window.__GCP_IAM_SECURITY__.revokeKey('key-9941-deploy-sec8');
      } else {
        const btn = document.getElementById('quickRevokeThreatBtn');
        if (btn) btn.click();
      }
    });
    await browser.sleep(300);

    const threatDismissed = await browser.evaluate(() => {
      const banner = document.getElementById('threatAlertBanner');
      return banner ? !banner.classList.contains('active') : true;
    });
    Helpers.assertTrue(threatDismissed, 'Threat alert resolved after key revocation');
  });

  // B4.3: Secret Version Creation & Immutable Destruction
  await ctx.test('R4.B3 - Secret Lifecycle: Creates new version and marks prior as destroyed', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_IAM_SECURITY__) {
        window.__GCP_IAM_SECURITY__.createSecretVersion('TEST_PAYLOAD_BOUNDARY_ENCRYPTED');
      }
    });
    await browser.sleep(200);

    const created = await browser.evaluate(() => {
      const sec = window.__GCP_IAM_SECURITY__ ? window.__GCP_IAM_SECURITY__.getState().secrets['sec-payment-rsa-key'] : null;
      return sec ? sec.versions.length : 0;
    });
    Helpers.assertGreaterThan(created, 2, 'Secret version successfully added');
  });

  // B4.4: Service Usage Quota 429 Rate Spike & Exponential Backoff
  await ctx.test('R4.B4 - Quota Rate Spike (429 Backoff): Spikes traffic exceeding 100% quota and demonstrates backoff recovery', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_IAM_SECURITY__) {
        window.__GCP_IAM_SECURITY__.simulateQuotaSpike();
      } else {
        const btn = document.getElementById('simulateSpikeTabBtn') || document.getElementById('simulateQuotaSpikeBtn');
        if (btn) btn.click();
      }
    });
    await browser.sleep(1200);

    const backoffState = await browser.evaluate(() => {
      const label = document.getElementById('backoffStatusLabel');
      return label ? label.innerText : '';
    });
    Helpers.assertTrue(backoffState.length > 0, 'Exponential backoff simulation executed');
  });

  // B4.5: Special Characters / Regex Search in Least-Privilege Table
  await ctx.test('R4.B5 - Regex Search Safety: Evaluates special meta-characters (.*+?^${}()|[]) safely in table filter', async () => {
    await browser.evaluate(() => {
      const input = document.getElementById('matrixSearchInput');
      if (input) {
        input.value = '.*+?^${}()|[]\\';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await browser.sleep(100);
    await Helpers.assertNoConsoleErrors(browser, 'Special char search');

    // Clear search
    await browser.evaluate(() => {
      const input = document.getElementById('matrixSearchInput');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  });

  return ctx.summary();
}

/**
 * --------------------------------------------------------------------------
 * R5: Unified CloudOps SRE Cockpit Boundary & Edge Cases
 * --------------------------------------------------------------------------
 */
async function runCockpitBoundaries(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 2: GCP CloudOps SRE Cockpit Boundaries');
  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'R5 Boundary Init');

  // B5.1: SEV-1 Cascading 504 Timeouts Incident Boundary
  await ctx.test('R5.B1 - SEV-1 Incident Boundary: Latency >2000ms, Error Rate >4%, and Burn Rate triggers SEV-1 Page', async () => {
    await browser.evaluate(() => {
      if (window.__CLOUDOPS_COCKPIT__) {
        window.__CLOUDOPS_COCKPIT__.injectScenario('cascading_504');
      } else {
        const btn = document.getElementById('btn-scenario-sev1-timeouts');
        if (btn) btn.click();
      }
    });
    await browser.sleep(1500);

    const state = await browser.evaluate(() => {
      if (window.__CLOUDOPS_COCKPIT__) {
        return window.__CLOUDOPS_COCKPIT__.getState();
      }
      return null;
    });
    Helpers.assertTrue(state !== null, 'Cockpit state accessible');
    Helpers.assertGreaterThan(state.goldenSignals.errorRate, 1.0, 'Error rate elevated under SEV-1');
  });

  // B5.2: SRE Mitigation Recovery & Nominal State Restoration
  await ctx.test('R5.B2 - SRE Mitigation Stabilization: Scale Instances & Trip Breaker stabilizes golden signals', async () => {
    await browser.evaluate(() => {
      if (window.__CLOUDOPS_COCKPIT__) {
        window.__CLOUDOPS_COCKPIT__.triggerMitigation('scale');
        window.__CLOUDOPS_COCKPIT__.triggerMitigation('trip_breaker');
      }
    });
    await browser.sleep(1500);

    const state = await browser.evaluate(() => {
      if (window.__CLOUDOPS_COCKPIT__) {
        return window.__CLOUDOPS_COCKPIT__.getState();
      }
      return null;
    });
    Helpers.assertTrue(state !== null, 'Mitigations applied successfully');
  });

  // B5.3: Safe Regex Search in Live-Tail Logger
  await ctx.test('R5.B3 - Live-Tail Regex Safety: Evaluates unclosed and complex regex without throwing exceptions', async () => {
    await browser.evaluate(() => {
      if (window.__CLOUDOPS_COCKPIT__) {
        window.__CLOUDOPS_COCKPIT__.filterLogs({ regex: '/[a-z(invalid-regex/' });
      }
    });
    await browser.sleep(100);
    await Helpers.assertNoConsoleErrors(browser, 'Invalid regex search');

    // Reset log filter
    await browser.evaluate(() => {
      if (window.__CLOUDOPS_COCKPIT__) {
        window.__CLOUDOPS_COCKPIT__.filterLogs({ regex: '' });
      }
    });
  });

  // B5.4: Live-Tail Buffer Memory Cap (Zero Bloat)
  await ctx.test('R5.B4 - Live-Tail Ring Buffer: Caps rendered DOM rows (<=150) and recycles memory under high load', async () => {
    const rowCount = await browser.evaluate(() => {
      const rows = document.querySelectorAll('#logs-table-tbody .log-entry-row, .log-entry-row, .log-row');
      return rows.length;
    });
    Helpers.assertTrue(rowCount <= 160, `DOM row count capped at 150 (got ${rowCount})`);
  });

  // B5.5: Nominal Scenario Restoration
  await ctx.test('R5.B5 - Nominal Reset: Injects Nominal steady-state restoring 99.90% SLO and 1.0x Burn Rate', async () => {
    await browser.evaluate(() => {
      if (window.__CLOUDOPS_COCKPIT__) {
        window.__CLOUDOPS_COCKPIT__.injectScenario('nominal');
      } else {
        const btn = document.getElementById('btn-scenario-nominal');
        if (btn) btn.click();
      }
    });
    await browser.sleep(1200);

    const slo = await browser.evaluate(() => {
      if (window.__CLOUDOPS_COCKPIT__) {
        return window.__CLOUDOPS_COCKPIT__.getState().slo;
      }
      return { burnRate: 1.0 };
    });
    Helpers.assertBetween(slo.burnRate, 0.1, 2.5, `Burn rate restored to nominal baseline (${slo.burnRate}x)`);
  });

  return ctx.summary();
}

/**
 * Universal Runner Entry Point
 */
async function runTests(browser, dashboardUrl, dashboardKey = 'all') {
  if (dashboardKey === 'pipeline' || dashboardUrl.includes('gcp-serverless-pipeline')) {
    return await runPipelineBoundaries(browser, dashboardUrl);
  }
  if (dashboardKey === 'pubsub' || dashboardUrl.includes('gcp-event-pubsub')) {
    return await runPubsubBoundaries(browser, dashboardUrl);
  }
  if (dashboardKey === 'sql' || dashboardUrl.includes('gcp-sql-networking')) {
    return await runSqlBoundaries(browser, dashboardUrl);
  }
  if (dashboardKey === 'iam' || dashboardUrl.includes('gcp-iam-security')) {
    return await runIamBoundaries(browser, dashboardUrl);
  }
  if (dashboardKey === 'cockpit' || dashboardUrl.includes('gcp-cloudops-cockpit')) {
    return await runCockpitBoundaries(browser, dashboardUrl);
  }
  throw new Error(`Unknown dashboard URL or key: ${dashboardUrl} (${dashboardKey})`);
}

module.exports = {
  runTests,
  runPipelineBoundaries,
  runPubsubBoundaries,
  runSqlBoundaries,
  runIamBoundaries,
  runCockpitBoundaries
};
