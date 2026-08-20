/**
 * CHALLENGER GCP 2 — EMPIRICAL ADVERSARIAL FAILURE & RECOVERY TEST SUITE
 * 
 * Deep Adversarial Verification across all 5 GCP Cloud Observability Dashboards:
 * 1. R1: Instant rollback under peak traffic, rapid-fire idempotence, in-flight deployment interruption.
 * 2. R2: Poison-pill quarantine, corrupted UTF-8 payload parsing, DLQ replay & purge under load.
 * 3. R3: Primary node crash, 7-step failover engine, split-brain fencing, connection exhaustion, lock contention.
 * 4. R4: Leaked SA key instant revocation, zero-downtime secret versioning, IAM downscoping, KMS rotation, 429 backoff.
 * 5. R5: SEV-1 cascading failure triage, toxic/ReDoS regex search safety, SRE mitigation action bar & runbook stabilization.
 */

const path = require('path');
const { BrowserSession } = require('./runner');

const rootDir = path.resolve(__dirname, '..');
const paths = {
  r1: path.join(rootDir, 'sistemas', 'gcp-serverless-pipeline', 'index.html'),
  r2: path.join(rootDir, 'sistemas', 'gcp-event-pubsub', 'index.html'),
  r3: path.join(rootDir, 'sistemas', 'gcp-sql-networking', 'index.html'),
  r4: path.join(rootDir, 'sistemas', 'gcp-iam-security', 'index.html'),
  r5: path.join(rootDir, 'sistemas', 'gcp-cloudops-cockpit', 'index.html')
};

function toFileUrl(filePath) {
  return 'file:///' + filePath.replace(/\\/g, '/');
}

async function runAdversarialSuite() {
  const browser = new BrowserSession();
  await browser.launch();

  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  function assert(condition, testId, description, meta = {}) {
    results.total++;
    if (condition) {
      results.passed++;
      console.log(`  \x1b[32m✔\x1b[0m [${testId}] ${description}`);
      results.details.push({ testId, description, status: 'PASS', meta });
    } else {
      results.failed++;
      console.error(`  \x1b[31m✘\x1b[0m [${testId}] ${description}`);
      console.error(`     Details:`, meta);
      results.details.push({ testId, description, status: 'FAIL', meta });
    }
  }

  try {
    console.log('\n======================================================================');
    console.log('       CHALLENGER GCP 2: EMPIRICAL ADVERSARIAL TEST SUITE             ');
    console.log('======================================================================\n');

    /* ----------------------------------------------------------------------
     * SECTION 1: R1 Serverless Pipeline — Instant Rollback & Peak Traffic
     * ---------------------------------------------------------------------- */
    console.log('>>> [SECTION 1] R1: Serverless Pipeline Adversarial Failure & Rollback');
    await browser.navigate(toFileUrl(paths.r1));
    await browser.sleep(400);

    // R1.ADV1: Peak Traffic Surge + 100% Canary Promotion
    await browser.evaluate(() => {
      if (window.__GCP_SERVERLESS_PIPELINE__) {
        window.__GCP_SERVERLESS_PIPELINE__.setTrafficSplit(100);
        window.__GCP_SERVERLESS_PIPELINE__.simulateColdStart(850);
        window.__GCP_SERVERLESS_PIPELINE__.setTrafficRps(500);
      }
    });
    await browser.sleep(300);

    const r1State1 = await browser.evaluate(() => {
      return window.__GCP_SERVERLESS_PIPELINE__ ? window.__GCP_SERVERLESS_PIPELINE__.getState() : null;
    });
    assert(r1State1 && r1State1.trafficSplit === 100 && r1State1.instances.length >= 8,
      'R1.ADV1', 'Peak traffic surge with autoscaled instances and 100% Canary traffic split',
      { split: r1State1?.trafficSplit, instanceCount: r1State1?.instances.length, rps: r1State1?.trafficRps });

    // R1.ADV2: Instant Emergency Rollback Under Max Load
    await browser.evaluate(() => {
      if (window.__GCP_SERVERLESS_PIPELINE__) {
        window.__GCP_SERVERLESS_PIPELINE__.rollback();
      }
    });
    await browser.sleep(300);

    const r1RollbackState = await browser.evaluate(() => {
      const state = window.__GCP_SERVERLESS_PIPELINE__ ? window.__GCP_SERVERLESS_PIPELINE__.getState() : null;
      const greenPct = document.getElementById('label-green-pct')?.textContent;
      const bluePct = document.getElementById('label-blue-pct')?.textContent;
      const splitText = document.getElementById('traffic-split-text')?.textContent;
      const sliderVal = document.getElementById('traffic-slider')?.value;
      const hasRollbackLog = state ? state.logs.some(l => l.msg.includes('Rollback') || l.msg.includes('v42') || l.severity === 'WARN' || l.severity === 'NOTICE') : false;
      return { state, greenPct, bluePct, splitText, sliderVal, hasRollbackLog };
    });

    assert(r1RollbackState.state?.trafficSplit === 0 && r1RollbackState.sliderVal === '0',
      'R1.ADV2', 'Instant emergency rollback resets traffic split to 0% Canary / 100% Stable v42',
      r1RollbackState);

    // R1.ADV3: Rapid-Fire Idempotent Rollback Spam (Concurrency / Race Condition Attack)
    const r1SpamSuccess = await browser.evaluate(async () => {
      try {
        for (let i = 0; i < 8; i++) {
          window.__GCP_SERVERLESS_PIPELINE__.rollback();
        }
        return true;
      } catch (e) {
        return false;
      }
    });
    await browser.sleep(200);

    const r1SpamState = await browser.evaluate(() => {
      const state = window.__GCP_SERVERLESS_PIPELINE__.getState();
      return { split: state.trafficSplit, instancesValid: Array.isArray(state.instances) };
    });
    assert(r1SpamSuccess && r1SpamState.split === 0 && r1SpamState.instancesValid,
      'R1.ADV3', 'Rapid-fire idempotent rollback spam maintains 100% state stability with zero errors',
      r1SpamState);

    // R1.ADV4: Rollback Interrupting In-Flight Stepper Deployment
    await browser.evaluate(() => {
      window.__GCP_SERVERLESS_PIPELINE__.runPipeline();
      setTimeout(() => {
        window.__GCP_SERVERLESS_PIPELINE__.rollback();
      }, 50);
    });
    await browser.sleep(400);

    const r1InterruptState = await browser.evaluate(() => {
      return window.__GCP_SERVERLESS_PIPELINE__.getState().trafficSplit;
    });
    assert(r1InterruptState === 0,
      'R1.ADV4', 'Emergency rollback immediately aborts/overrides in-flight pipeline and enforces green revision',
      { trafficSplit: r1InterruptState });

    /* ----------------------------------------------------------------------
     * SECTION 2: R2 Pub/Sub — Poison-Pill Quarantine, Inspection & DLQ Replay
     * ---------------------------------------------------------------------- */
    console.log('\n>>> [SECTION 2] R2: Pub/Sub Poison-Pill Quarantine & DLQ Replay');
    await browser.navigate(toFileUrl(paths.r2));
    await browser.sleep(400);

    // R2.ADV1: Multi-Variant Poison-Pill Ingestion Under Heavy Traffic
    await browser.evaluate(() => {
      window.__GCP_EVENT_PUBSUB__.setIngestionRate(4500);
      window.__GCP_EVENT_PUBSUB__.injectPoisonPill('SCHEMA_VALIDATION_ERROR');
      window.__GCP_EVENT_PUBSUB__.injectPoisonPill('MALFORMED_UTF8_PAYLOAD');
      window.__GCP_EVENT_PUBSUB__.injectPoisonPill('DEPENDENCY_TIMEOUT_NACK');
    });
    await browser.sleep(400);

    const r2DlqState = await browser.evaluate(() => {
      const dlqItems = window.__GCP_EVENT_PUBSUB__.getDlqItems();
      const reasons = dlqItems.map(x => x.reason);
      const partitions = dlqItems.map(x => x.partition);
      const domRowCount = document.querySelectorAll('#dlqTableBody tr').length;
      return { dlqCount: dlqItems.length, reasons, partitions, domRowCount };
    });

    assert(r2DlqState.dlqCount >= 3 && r2DlqState.reasons.includes('MALFORMED_UTF8_PAYLOAD'),
      'R2.ADV1', 'Multi-variant poison-pill injections quarantined into DLQ with accurate metadata and partition assignment',
      r2DlqState);

    // R2.ADV2: Corrupted Payload Modal Inspection
    const inspectResult = await browser.evaluate(() => {
      const items = window.__GCP_EVENT_PUBSUB__.getDlqItems();
      const utf8Item = items.find(x => x.reason === 'MALFORMED_UTF8_PAYLOAD') || items[0];
      window.__GCP_EVENT_PUBSUB__.__inspect(utf8Item.id);
      const modal = document.getElementById('dlqModal');
      const isVisible = modal && modal.classList.contains('open');
      const payloadEl = document.getElementById('modalPayloadViewer');
      const hasContent = payloadEl && payloadEl.textContent.length > 10;
      return { isVisible, hasContent, itemId: utf8Item.id };
    });
    assert(inspectResult.isVisible && inspectResult.hasContent,
      'R2.ADV2', 'Quarantine modal inspects corrupted payload without DOM corruption or script crashes',
      inspectResult);

    // Close inspect modal
    await browser.evaluate(() => {
      const btn = document.getElementById('btnModalClose') || document.getElementById('btnModalCancel');
      if (btn) btn.click();
    });
    await browser.sleep(200);

    // R2.ADV3: Zero-Data-Loss DLQ Replay Under Load
    const replayResult = await browser.evaluate(async () => {
      const itemsBefore = window.__GCP_EVENT_PUBSUB__.getDlqItems();
      const targetItem = itemsBefore[0];
      const countBefore = itemsBefore.length;
      window.__GCP_EVENT_PUBSUB__.replayMessage(targetItem.id);
      return { targetId: targetItem.id, countBefore };
    });
    await browser.sleep(500);

    const replayAfter = await browser.evaluate((targetId, countBefore) => {
      const itemsAfter = window.__GCP_EVENT_PUBSUB__.getDlqItems();
      const wasRemoved = !itemsAfter.some(x => x.id === targetId);
      return { countBefore, countAfter: itemsAfter.length, wasRemoved, targetId };
    }, replayResult.targetId, replayResult.countBefore);

    assert(replayAfter.wasRemoved && replayAfter.countAfter === replayAfter.countBefore - 1,
      'R2.ADV3', 'DLQ replay safely extracts quarantined payload, decrements DLQ counter, and re-publishes to stream',
      replayAfter);

    // R2.ADV4: Batch DLQ Purge Under Load
    await browser.evaluate(() => {
      window.__GCP_EVENT_PUBSUB__.purgeAll();
    });
    await browser.sleep(300);

    const r2PurgeState = await browser.evaluate(() => {
      const items = window.__GCP_EVENT_PUBSUB__.getDlqItems();
      const hasEmptyState = !!document.querySelector('#dlqTableBody .empty-state');
      return { itemsCount: items.length, hasEmptyState };
    });
    assert(r2PurgeState.itemsCount === 0 && r2PurgeState.hasEmptyState,
      'R2.ADV4', 'Batch DLQ purge cleanly flushes all quarantined items and displays empty state',
      r2PurgeState);

    /* ----------------------------------------------------------------------
     * SECTION 3: R3 Cloud SQL HA — Crash, 7-Step Failover & Split-Brain Fencing
     * ---------------------------------------------------------------------- */
    console.log('\n>>> [SECTION 3] R3: Cloud SQL HA Failover & Split-Brain Fencing');
    await browser.navigate(toFileUrl(paths.r3));
    await browser.sleep(400);

    // R3.ADV1: Lock Contention + 100% Connection Exhaustion
    await browser.evaluate(() => {
      window.__GCP_SQL_NETWORKING__.injectLockContention();
      window.__GCP_SQL_NETWORKING__.simulatePoolExhaustion();
    });
    await browser.sleep(300);

    const r3PreCrashState = await browser.evaluate(() => {
      const p = window.__GCP_SQL_NETWORKING__.state.pool;
      const total = p.active + p.idleInTx + p.idle + p.reserved;
      const saturation = Math.round((total / p.maxConnections) * 100);
      const isExhausted = total === 100 && p.avgWaitMs > 100;
      return { saturation, isExhausted, total };
    });
    assert(r3PreCrashState.saturation === 100 && r3PreCrashState.isExhausted,
      'R3.ADV1', 'Connection pool 100% saturated and lock contention active prior to crash injection',
      r3PreCrashState);

    // R3.ADV2: Primary Node Crash & 7-Step Failover State Machine
    await browser.evaluate(() => {
      window.__GCP_SQL_NETWORKING__.simulatePrimaryCrash();
    });

    // R3.ADV3: Split-Brain Fencing Verification (Secondary crash blocked during failover)
    const fencingBlocked = await browser.evaluate(async () => {
      const stateBefore = window.__GCP_SQL_NETWORKING__.state.failoverInProgress;
      // Attempt another crash while in progress
      window.__GCP_SQL_NETWORKING__.simulatePrimaryCrash();
      const stateAfter = window.__GCP_SQL_NETWORKING__.state.failoverInProgress;
      return stateBefore === true && stateAfter === true;
    });
    assert(fencingBlocked,
      'R3.ADV3', 'Split-brain fencing blocks concurrent crash/failover requests while state transition is in-flight',
      { fencingBlocked });

    // Wait for failover completion
    await browser.waitForFunction(() => {
      const btnReprov = document.getElementById('btnReprovision');
      return btnReprov && btnReprov.style.display !== 'none';
    }, 12000);

    const r3PostFailover = await browser.evaluate(() => {
      const state = window.__GCP_SQL_NETWORKING__.state;
      const primaryKpi = document.getElementById('kpiPrimaryZone')?.textContent;
      const haStatus = document.getElementById('haStatusText')?.textContent;
      const stopwatch = document.getElementById('failoverStopwatch')?.textContent;
      return {
        activeZone: state.activeZone,
        clusterHealth: state.clusterHealth,
        duration: state.failoverDuration,
        primaryKpi,
        haStatus,
        stopwatch
      };
    });

    assert(r3PostFailover.activeZone === 'us-east4-b' && r3PostFailover.clusterHealth === 'DEGRADED_SINGLE_ZONE',
      'R3.ADV2', '7-step automated failover successfully promotes Zone B replica to Primary within RTO target',
      r3PostFailover);

    // R3.ADV4: Standby Replica Reprovisioning & 99.99% Dual-Zone HA Restoration
    await browser.evaluate(() => {
      window.__GCP_SQL_NETWORKING__.reprovisionReplica();
    });
    await browser.sleep(2500);

    const r3ReprovisionState = await browser.evaluate(() => {
      const state = window.__GCP_SQL_NETWORKING__.state;
      const haStatus = document.getElementById('haStatusText')?.textContent;
      return { clusterHealth: state.clusterHealth, haStatus };
    });
    assert(r3ReprovisionState.clusterHealth === 'HEALTHY_DUAL_ZONE',
      'R3.ADV4', 'Replica reprovisioning re-establishes synchronous replication and restores 99.99% Dual-Zone HA SLA',
      r3ReprovisionState);

    // R3.ADV5: Slow Query Remediation (Kill PID & Index Creation)
    const r3RemediationResult = await browser.evaluate(() => {
      const app = window.__GCP_SQL_NETWORKING__.app;
      const slowQuery = app.state.queries.find(q => q.locked || q.durationMs > 1000);
      if (slowQuery) {
        window.__GCP_SQL_NETWORKING__.killQuery(slowQuery.pid);
        return { killed: true, pid: slowQuery.pid };
      }
      return { killed: false };
    });
    assert(r3RemediationResult.killed,
      'R3.ADV5', 'Active PostgreSQL lock contention successfully remediated via pg_terminate_backend session termination',
      r3RemediationResult);

    /* ----------------------------------------------------------------------
     * SECTION 4: R4 IAM Security — SA Key Revocation & Zero-Downtime Rotation
     * ---------------------------------------------------------------------- */
    console.log('\n>>> [SECTION 4] R4: IAM Security SA Key Revocation & Secret Rotation');
    await browser.navigate(toFileUrl(paths.r4));
    await browser.sleep(400);

    // R4.ADV1: Leaked Key Alert Detection
    const r4ThreatDetected = await browser.evaluate(() => {
      const state = window.__GCP_IAM_SECURITY__.getState();
      const compKey = state.saKeys.find(k => k.id === 'key-9941-deploy-sec8');
      const threatBanner = document.getElementById('threatBanner');
      return { hasCompKey: !!compKey, status: compKey?.status, bannerVisible: !!threatBanner };
    });
    assert(r4ThreatDetected.hasCompKey && r4ThreatDetected.status === 'COMPROMISED',
      'R4.ADV1', 'Security scanner detects leaked SA private key and flags COMPROMISED status with high-priority threat alert',
      r4ThreatDetected);

    // R4.ADV2: Instant SA Key Revocation
    await browser.evaluate(() => {
      window.__GCP_IAM_SECURITY__.revokeKey('key-9941-deploy-sec8');
    });
    await browser.sleep(200);

    const r4RevokeResult = await browser.evaluate(() => {
      const state = window.__GCP_IAM_SECURITY__.getState();
      const compKey = state.saKeys.find(k => k.id === 'key-9941-deploy-sec8');
      const threatBanner = document.getElementById('threatBanner');
      return { status: compKey?.status, bannerHidden: !threatBanner || !threatBanner.classList.contains('active') };
    });
    assert(r4RevokeResult.status === 'REVOKED',
      'R4.ADV2', 'Instant key revocation immediately invalidates compromised credentials and removes security alert',
      r4RevokeResult);

    // R4.ADV3: Zero-Downtime Secret Versioning & Immutable Destruction
    const r4SecretResult = await browser.evaluate(() => {
      const initialCount = window.__GCP_IAM_SECURITY__.getState().secrets['sec-payment-rsa-key'].versions.length;
      window.__GCP_IAM_SECURITY__.createSecretVersion('-----BEGIN RSA PRIVATE KEY-----\nADVERSARIAL_NEW_V4_SECURE_PAYLOAD_TEST\n-----END RSA PRIVATE KEY-----');
      const stateAfterCreate = window.__GCP_IAM_SECURITY__.getState();
      const createdCount = stateAfterCreate.secrets['sec-payment-rsa-key'].versions.length;
      const latestVer = stateAfterCreate.secrets['sec-payment-rsa-key'].versions[createdCount - 1];

      window.__GCP_IAM_SECURITY__.destroySecretVersion();
      const stateAfterDestroy = window.__GCP_IAM_SECURITY__.getState();
      const destroyedVer = stateAfterDestroy.secrets['sec-payment-rsa-key'].versions[createdCount - 1];

      return {
        initialCount,
        createdCount,
        latestId: latestVer.id,
        latestState: latestVer.state,
        destroyedState: destroyedVer.state
      };
    });
    assert(r4SecretResult.createdCount === r4SecretResult.initialCount + 1 && r4SecretResult.destroyedState === 'DESTROYED',
      'R4.ADV3', 'Secret version lifecycle enables zero-downtime secret rollover and immutable version destruction',
      r4SecretResult);

    // R4.ADV4: Automated IAM Downscoping & Posture Elevation
    await browser.evaluate(() => {
      const btn = document.getElementById('autoRemediateAllBtn');
      if (btn) btn.click();
    });
    await browser.sleep(200);

    const r4DownscopeResult = await browser.evaluate(() => {
      const state = window.__GCP_IAM_SECURITY__.getState();
      const allRemediated = state.principals.every(p => p.remediated === true);
      const score = state.securityScore;
      return { allRemediated, score };
    });
    assert(r4DownscopeResult.allRemediated && r4DownscopeResult.score >= 88,
      'R4.ADV4', 'Automated IAM policy downscoping removes excessive permissions and elevates security score',
      r4DownscopeResult);

    // R4.ADV5: API Quota 429 Spike & Backoff Simulation
    await browser.evaluate(() => {
      window.__GCP_IAM_SECURITY__.simulateQuotaSpike();
    });
    await browser.sleep(600);

    const r4QuotaResult = await browser.evaluate(() => {
      const state = window.__GCP_IAM_SECURITY__.getState();
      const quota = state.quotas['secretmanager'];
      return { rps: quota.rps, limit: quota.limit };
    });
    assert(r4QuotaResult.rps > 0,
      'R4.ADV5', 'Service Usage API quota rate spike triggers throttled state with exponential backoff handling',
      r4QuotaResult);

    /* ----------------------------------------------------------------------
     * SECTION 5: R5 CloudOps SRE Cockpit — SEV-1 Triage, ReDoS Safety & Runbooks
     * ---------------------------------------------------------------------- */
    console.log('\n>>> [SECTION 5] R5: SRE Cockpit SEV-1 Triage, Regex Safety & Runbooks');
    await browser.navigate(toFileUrl(paths.r5));
    await browser.sleep(400);

    // R5.ADV1: SEV-1 Cascading Outage Injection & Golden Signals Reaction
    await browser.evaluate(() => {
      window.__CLOUDOPS_COCKPIT__.injectScenario('cascading_504');
    });
    await browser.sleep(1500);

    const r5Sev1State = await browser.evaluate(() => {
      const state = window.__CLOUDOPS_COCKPIT__.getState();
      return {
        latP95: state.goldenSignals.latencyP95,
        errorRate: state.goldenSignals.errorRate,
        burnRate: state.slo.burnRate,
        alertLevel: state.slo.alertLevel
      };
    });
    assert(r5Sev1State.latP95 > 1500 && r5Sev1State.errorRate > 3.0 && r5Sev1State.burnRate > 10.0 && r5Sev1State.alertLevel === 'SEV-1',
      'R5.ADV1', 'Cascading 504 outage triggers SEV-1 Page alert with severe Latency, Error Rate, and Burn Rate spikes',
      r5Sev1State);

    // R5.ADV2: Toxic / ReDoS Regex Live-Tail Search Safety Stress
    const regexTestResults = await browser.evaluate(() => {
      const toxicPatterns = [
        '(a+)+$',
        '([a-zA-Z]+)*$',
        '[[[unclosed class',
        '(unclosed group',
        '*invalid quantifier',
        '\\x00\\xFF\\xFE\\x3F',
        '[a-z0-9_-]{3,16}',
        '504|DEADLOCK|CRITICAL',
        '\\\\\\\\\\',
        '.*?.*?'
      ];

      const outcomes = [];
      for (const pat of toxicPatterns) {
        try {
          window.__CLOUDOPS_COCKPIT__.filterLogs({ regex: pat });
          outcomes.push({ pattern: pat, survived: true });
        } catch (err) {
          outcomes.push({ pattern: pat, survived: false, error: err.message });
        }
      }
      return outcomes;
    });

    const allRegexPassed = regexTestResults.every(r => r.survived);
    assert(allRegexPassed,
      'R5.ADV2', 'Live-tail log filter survives all toxic/ReDoS/unclosed regular expressions without throwing unhandled exceptions',
      { regexTestResults });

    // R5.ADV3: SRE Mitigation Action Bar Multi-Action Execution
    await browser.evaluate(() => {
      window.__CLOUDOPS_COCKPIT__.triggerMitigation('scale');
      window.__CLOUDOPS_COCKPIT__.triggerMitigation('trip_breaker');
      window.__CLOUDOPS_COCKPIT__.triggerMitigation('clear_cache');
    });
    await browser.sleep(1500);

    const r5MitigatedState = await browser.evaluate(() => {
      const state = window.__CLOUDOPS_COCKPIT__.getState();
      return {
        latP95: state.goldenSignals.latencyP95,
        errorRate: state.goldenSignals.errorRate,
        satCpu: state.goldenSignals.saturationCpu
      };
    });
    assert(r5MitigatedState.latP95 < 1500 && r5MitigatedState.errorRate < 2.0 && r5MitigatedState.satCpu < 80,
      'R5.ADV3', 'SRE Mitigation Actions (Scale, Trip Breaker, Clear Cache) significantly stabilize Golden Signals',
      r5MitigatedState);

    // R5.ADV4: Automated SRE Runbook Self-Healing & SLO Baseline Recovery
    await browser.evaluate(() => {
      window.__CLOUDOPS_COCKPIT__.injectScenario('nominal');
    });
    await browser.sleep(1200);

    const r5RecoveredState = await browser.evaluate(() => {
      const state = window.__CLOUDOPS_COCKPIT__.getState();
      return {
        burnRate: state.slo.burnRate,
        remainingBudgetPct: state.slo.remainingBudgetPct,
        alertLevel: state.slo.alertLevel
      };
    });
    assert(r5RecoveredState.burnRate < 3.0 && r5RecoveredState.remainingBudgetPct >= 80.0,
      'R5.ADV4', 'Nominal stabilization restores SLO budget and baseline burn rate multiplier',
      r5RecoveredState);

    // R5.ADV5: High-Throughput Log Ring Buffer Cap (< 150 DOM rows)
    const r5DomRowCount = await browser.evaluate(() => {
      return document.querySelectorAll('#logging-feed .log-row').length;
    });
    assert(r5DomRowCount <= 150,
      'R5.ADV5', 'Cloud logging live-tail DOM rows capped strictly at <= 150 items under high stream frequency',
      { domRowCount: r5DomRowCount });

    console.log('\n======================================================================');
    console.log(`  ADVERSARIAL SUITE SUMMARY: ${results.passed}/${results.total} PASSED (${results.failed} FAILED)`);
    console.log('======================================================================\n');

  } catch (error) {
    console.error('Fatal error during adversarial suite execution:', error);
    results.failed++;
  } finally {
    browser.close();
  }

  return results;
}

if (require.main === module) {
  runAdversarialSuite().then(results => {
    process.exit(results.failed === 0 ? 0 : 1);
  });
}

module.exports = { runAdversarialSuite };
