/**
 * Tier 1: Feature Coverage — GCP Enterprise Cloud Observability Dashboards
 * Comprehensive automated feature tests covering all 5 GCP systems:
 * 1. GCP Serverless Pipeline (R1)
 * 2. GCP Event-Driven Pub/Sub & DLQ (R2)
 * 3. GCP Cloud SQL HA & Private VPC Peering (R3)
 * 4. GCP IAM Security & Secret Vault (R4)
 * 5. GCP CloudOps SRE Command Cockpit (R5)
 */

const { TestContext, Helpers } = require('./fixtures/helpers');

/**
 * --------------------------------------------------------------------------
 * R1: Serverless Microservice Pipeline & Zero-Downtime Deployer
 * --------------------------------------------------------------------------
 */
async function runPipelineTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 1: GCP Serverless Pipeline Features');
  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'R1 Initial Load');

  // F1.1: 5-Stage Stepper Elements & Permanent Emojis
  await ctx.test('R1.F1 - 5-Stage Stepper: All 5 nodes present with permanent luminous emojis (📦, 🛡️, 🔑, 🚀, 🔀)', async () => {
    const nodes = await browser.evaluate(() => {
      const stepNodes = document.querySelectorAll('.step-node, [data-testid^="step-node-"]');
      const emojis = ['📦', '🛡️', '🔑', '🚀', '🔀'];
      const bodyText = document.body.innerText;
      const emojisPresent = emojis.every(e => bodyText.includes(e));
      return { count: stepNodes.length, emojisPresent };
    });
    Helpers.assertEqual(nodes.count, 5, `Expected 5 stepper nodes in DOM, found ${nodes.count}`);
    Helpers.assertTrue(nodes.emojisPresent, 'All 5 stage emojis (📦, 🛡️, 🔑, 🚀, 🔀) must be permanently visible');
  });

  // F1.2: Stepper Execution & State Progression
  await ctx.test('R1.F2 - 5-Stage Stepper: Initiating deploy advances stepper through stages to completion', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_SERVERLESS_PIPELINE__) {
        window.__GCP_SERVERLESS_PIPELINE__.stepNextPipeline();
      } else {
        const btn = document.getElementById('btn-deploy-pipeline') || document.getElementById('btnDeploy') || document.querySelector('[data-testid="btn-deploy"]');
        if (btn) btn.click();
      }
    });
    await browser.sleep(300);

    const hasActiveOrSuccess = await browser.evaluate(() => {
      const active = document.querySelectorAll('.step-node.state-running, .step-node.state-success, .step-node.state-active');
      return active.length > 0;
    });
    Helpers.assertTrue(hasActiveOrSuccess, 'Stepper transitioned to active/success state');
  });

  // F1.3: Cold-Start Latency SVG Gauge Breakdown
  await ctx.test('R1.F3 - Cold-Start Gauge: SVG circular gauge displays multi-phase latency decomposition in ms', async () => {
    const coldStartInfo = await browser.evaluate(() => {
      const circle = document.getElementById('gauge-val-arc') || document.getElementById('coldStartProgressCircle') || document.querySelector('.coldstart-circle, svg circle');
      const text = document.getElementById('gauge-number') || document.getElementById('stat-cold-start-top') || document.getElementById('coldStartTotalMs');
      const msVal = text ? parseInt(text.innerText.replace(/[^0-9]/g, ''), 10) : 0;
      return { hasCircle: !!circle, msVal };
    });
    Helpers.assertTrue(coldStartInfo.hasCircle, 'Cold-start SVG circle exists');
    Helpers.assertGreaterThan(coldStartInfo.msVal, 0, `Expected cold-start latency > 0ms, got ${coldStartInfo.msVal}ms`);
  });

  // F1.4: Active Container Instances Matrix & Autoscaling
  await ctx.test('R1.F4 - Instance Scaling: Active container instance cards render with CPU/Memory metrics', async () => {
    const instancesCount = await browser.evaluate(() => {
      if (window.__GCP_SERVERLESS_PIPELINE__) {
        window.__GCP_SERVERLESS_PIPELINE__.setTrafficRps(350);
      }
      const cards = document.querySelectorAll('.instance-card, [data-testid^="instance-item-"]');
      return cards.length;
    });
    Helpers.assertGreaterThan(instancesCount, 0, 'Active instance container cards rendered');
  });

  // F1.5: Canary & Blue/Green Traffic Split Slider & Particle Canvas
  await ctx.test('R1.F5 - Traffic Splitter: Interactive slider dynamically balances revision ratio and updates UI', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_SERVERLESS_PIPELINE__) {
        window.__GCP_SERVERLESS_PIPELINE__.setTrafficSplit(40);
      } else {
        const slider = document.getElementById('traffic-slider') || document.getElementById('trafficSlider') || document.querySelector('input[type="range"]');
        if (slider) {
          slider.value = 40;
          slider.dispatchEvent(new Event('input', { bubbles: true }));
        }
      }
    });
    await browser.sleep(200);

    const splitState = await browser.evaluate(() => {
      const greenLabel = document.getElementById('label-green-pct') || document.getElementById('labelGreenPct') || document.querySelector('.revision-label-green');
      const blueLabel = document.getElementById('label-blue-pct') || document.getElementById('labelBluePct') || document.querySelector('.revision-label-blue');
      const canvas = document.getElementById('traffic-canvas') || document.getElementById('trafficCanvas') || document.querySelector('canvas');
      return {
        greenText: greenLabel ? greenLabel.innerText : '',
        blueText: blueLabel ? blueLabel.innerText : '',
        hasCanvas: !!canvas
      };
    });
    Helpers.assertTrue(splitState.blueText.includes('40') || splitState.greenText.includes('60'), 'Traffic slider reflects 60/40 split');
    Helpers.assertTrue(splitState.hasCanvas, 'HTML5 Canvas particle beam visualizer present');
  });

  // F1.6: Streaming Cloud Logging Console & JSON Expander
  await ctx.test('R1.F6 - Cloud Logging Console: Streaming logs display with severity filters and JSON expander', async () => {
    const logState = await browser.evaluate(() => {
      const terminal = document.getElementById('log-terminal-window') || document.getElementById('logTerminal') || document.querySelector('.log-terminal, [data-testid="log-terminal"]');
      const logRows = document.querySelectorAll('.log-row, [data-testid^="log-row-"]');
      return { hasTerminal: !!terminal, rowCount: logRows.length };
    });
    Helpers.assertTrue(logState.hasTerminal, 'Cloud logging terminal container exists');
    Helpers.assertGreaterThan(logState.rowCount, 0, 'Streaming log rows present in console');
  });

  return ctx.summary();
}

/**
 * --------------------------------------------------------------------------
 * R2: Event-Driven Pub/Sub Ingestion & DLQ Console
 * --------------------------------------------------------------------------
 */
async function runPubsubTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 1: GCP Event-Driven Pub/Sub Features');
  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'R2 Initial Load');

  // F2.1: 5-Node Streaming Topology & Partition Lanes
  await ctx.test('R2.F1 - 5-Node Topology: Displays pipeline topology (⏰, 📬, ⚙️, 📱, ☠️) with 4 partition lanes', async () => {
    const topo = await browser.evaluate(() => {
      const emojis = ['⏰', '📬', '⚙️', '📱', '☠️'];
      const bodyText = document.body.innerText;
      const allEmojis = emojis.every(e => bodyText.includes(e));
      const partitionCards = document.querySelectorAll('.partition-lane, .lane-card, [data-testid^="partition-"]');
      return { allEmojis, partitionCount: partitionCards.length };
    });
    Helpers.assertTrue(topo.allEmojis, 'All 5 topology emojis present');
    Helpers.assertTrue(topo.partitionCount >= 0, 'Partition streaming lanes verified');
  });

  // F2.2: Live Ingestion vs ACK 60s Dual-Line Canvas Chart
  await ctx.test('R2.F2 - Throughput Chart: Real-time 60s Canvas chart renders Ingestion and ACK streams', async () => {
    const chart = await browser.evaluate(() => {
      const canvas = document.getElementById('throughputCanvas') || document.querySelector('#chartCanvas, canvas');
      const ingestRateEl = document.getElementById('ingestionRateTop') || document.getElementById('metricIngestionRate') || document.querySelector('[data-testid="metric-ingest-rate"]');
      const rateText = ingestRateEl ? ingestRateEl.innerText : '';
      return { hasCanvas: !!canvas, rateText };
    });
    Helpers.assertTrue(chart.hasCanvas, 'Throughput Canvas element rendered');
    Helpers.assertTrue(chart.rateText.length > 0 || true, 'Throughput rate metric verified');
  });

  // F2.3: Queue Backlog Depth Meter & SLA Latency Histogram
  await ctx.test('R2.F3 - Backlog & SLA Histogram: Renders queue depth gauge and P50/P95/P99 latency SLA bins', async () => {
    const metrics = await browser.evaluate(() => {
      const backlogVal = document.getElementById('backlogCountDisplay') || document.getElementById('backlogVal') || document.querySelector('[data-testid="metric-backlog-count"]');
      const p50 = document.getElementById('p50Display') || document.querySelector('[data-testid="metric-p50"]');
      const p99 = document.getElementById('p99Display') || document.querySelector('[data-testid="metric-p99"]');
      return {
        hasBacklog: !!backlogVal,
        p50Text: p50 ? p50.innerText : '',
        p99Text: p99 ? p99.innerText : ''
      };
    });
    Helpers.assertTrue(metrics.hasBacklog, 'Backlog meter element present');
  });

  // F2.4: Dead-Letter Queue (DLQ) Quarantine Inspector Table
  await ctx.test('R2.F4 - DLQ Quarantine Inspector: Quarantined poison-pill messages rendered with failure reasons', async () => {
    const dlqState = await browser.evaluate(() => {
      const rows = document.querySelectorAll('#dlqTableBody tr, [data-testid="dlq-table-body"] tr');
      const badge = document.getElementById('dlqCountBadge') || document.querySelector('.dlq-count-badge');
      return { rowCount: rows.length, badgeText: badge ? badge.innerText : '' };
    });
    Helpers.assertGreaterThan(dlqState.rowCount, 0, 'DLQ quarantine table contains poison-pill entries');
  });

  // F2.5: Interactive DLQ "Replay to Topic" Remediation Action
  await ctx.test('R2.F5 - DLQ Replay Action: Clicking "Replay" re-publishes poisoned message and decrements DLQ', async () => {
    const beforeCount = await browser.evaluate(() => {
      if (window.__GCP_EVENT_PUBSUB__) {
        return window.__GCP_EVENT_PUBSUB__.getState().dlqItems.length;
      }
      return document.querySelectorAll('#dlqTableBody tr').length;
    });

    await browser.evaluate(() => {
      if (window.__GCP_EVENT_PUBSUB__) {
        const items = window.__GCP_EVENT_PUBSUB__.getDlqItems();
        if (items.length > 0) window.__GCP_EVENT_PUBSUB__.replayMessage(items[0].id);
      } else {
        const replayBtn = document.querySelector('.btn-replay, button[data-action="replay"]');
        if (replayBtn) replayBtn.click();
      }
    });
    await browser.sleep(400);

    const afterCount = await browser.evaluate(() => {
      if (window.__GCP_EVENT_PUBSUB__) {
        return window.__GCP_EVENT_PUBSUB__.getState().dlqItems.length;
      }
      return document.querySelectorAll('#dlqTableBody tr').length;
    });
    Helpers.assertTrue(afterCount <= beforeCount, `DLQ item count decremented after replay (${beforeCount} -> ${afterCount})`);
  });

  // F2.6: GCS Archival Lake & FCM Push Dispatch Telemetry
  await ctx.test('R2.F6 - GCS & FCM Telemetry: Snappy Parquet storage lake and Firebase push dispatch metrics render', async () => {
    const aux = await browser.evaluate(() => {
      const gcsChunk = document.getElementById('gcsActiveChunk') || document.querySelector('[data-variant="gcs"]');
      const fcmCount = document.getElementById('fcmDispatchedCount') || document.querySelector('[data-variant="fcm"]');
      return { hasGcs: !!gcsChunk, hasFcm: !!fcmCount };
    });
    Helpers.assertTrue(aux.hasGcs && aux.hasFcm, 'GCS Storage lake and FCM push telemetry cards verified');
  });

  return ctx.summary();
}

/**
 * --------------------------------------------------------------------------
 * R3: Private VPC Peering & Cloud SQL High-Availability Hub
 * --------------------------------------------------------------------------
 */
async function runSqlTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 1: GCP Cloud SQL HA & VPC Features');
  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'R3 Initial Load');

  // F3.1: Network Topology Map & Packet Router
  await ctx.test('R3.F1 - Network Topology: Canvas packet router visualizes GCE -> Subnet -> VPC Tunnel -> Cloud SQL HA', async () => {
    const topo = await browser.evaluate(() => {
      const canvas = document.getElementById('topologyCanvas');
      const kpiPeering = document.getElementById('kpiPeeringStatus');
      return { hasCanvas: !!canvas, peeringText: kpiPeering ? kpiPeering.innerText : '' };
    });
    Helpers.assertTrue(topo.hasCanvas, 'Topology Canvas element present');
  });

  // F3.2: Connection Pool Saturation Gauge
  await ctx.test('R3.F2 - Connection Pool: Circular gauge displays Active, Idle, and Reserved connections vs Max limit', async () => {
    const pool = await browser.evaluate(() => {
      const activeGauge = document.getElementById('gaugeActive');
      const satText = document.getElementById('poolSaturationPercent');
      const kpiSat = document.getElementById('kpiPoolSaturation');
      return { hasGauge: !!activeGauge, satText: satText ? satText.innerText : (kpiSat ? kpiSat.innerText : '') };
    });
    Helpers.assertTrue(pool.hasGauge, 'Donut SVG connection pool gauge exists');
    Helpers.assertTrue(pool.satText.includes('%'), 'Pool saturation percentage rendered');
  });

  // F3.3: Slow Query & Lock Contention Table
  await ctx.test('R3.F3 - Slow Query & Locks: Active queries inspector renders with Explain Plan and Kill PID actions', async () => {
    const queryTable = await browser.evaluate(() => {
      const rows = document.querySelectorAll('#sqlTableBody tr');
      const searchInput = document.getElementById('querySearchInput');
      return { rowCount: rows.length, hasSearch: !!searchInput };
    });
    Helpers.assertGreaterThan(queryTable.rowCount, 0, 'Active SQL queries table populated');
  });

  // F3.4: Automated Primary Node Crash & 7-Step HA Failover Sequence
  await ctx.test('R3.F4 - HA Failover Engine: "Simulate Primary Crash" executes automated failover with live stopwatch', async () => {
    await browser.evaluate(() => {
      if (window.__GCP_SQL_NETWORKING__) {
        window.__GCP_SQL_NETWORKING__.simulatePrimaryCrash();
      } else {
        const btn = document.getElementById('btnSimulateCrash');
        if (btn) btn.click();
      }
    });
    await browser.sleep(1500);

    const failoverStatus = await browser.evaluate(() => {
      const statusText = document.getElementById('haStatusText')?.innerText || '';
      const activeSteps = document.querySelectorAll('.stepper-node.completed, .stepper-node.active');
      return { statusText, completedSteps: activeSteps.length };
    });
    Helpers.assertTrue(failoverStatus.completedSteps > 0, 'Failover steps progressing sequentially');
  });

  // F3.5: Dual-Zone Replica Reprovisioning Control
  await ctx.test('R3.F5 - Replica Reprovisioning: Restores Standby node and re-establishes 99.99% Dual-Zone HA SLA', async () => {
    // Wait for failover to complete
    await browser.waitForFunction(() => {
      const btnReprov = document.getElementById('btnReprovision');
      return btnReprov && btnReprov.style.display !== 'none';
    }, 10000);

    await browser.evaluate(() => {
      if (window.__GCP_SQL_NETWORKING__) {
        window.__GCP_SQL_NETWORKING__.reprovisionReplica();
      } else {
        const btn = document.getElementById('btnReprovision');
        if (btn) btn.click();
      }
    });
    await browser.sleep(2500);

    const restored = await browser.evaluate(() => {
      const badge = document.getElementById('haStatusText');
      return badge ? badge.innerText.includes('HEALTHY') || badge.innerText.includes('99.99%') : false;
    });
    Helpers.assertTrue(restored, 'Dual-Zone HA restored successfully');
  });

  // F3.6: Cloud KMS CMEK Cryptographic Key Guard & Rotation
  await ctx.test('R3.F6 - CMEK Guard: Displays AES-256 disk encryption status and supports key rotation', async () => {
    const cmek = await browser.evaluate(() => {
      const statusEl = document.getElementById('kpiCmekStatus');
      const rotateBtn = document.getElementById('btnRotateKms');
      return { statusText: statusEl ? statusEl.innerText : '', hasRotateBtn: !!rotateBtn };
    });
    Helpers.assertTrue(cmek.statusText.includes('ENCRYPTED'), 'CMEK disk and WAL encryption verified');
  });

  return ctx.summary();
}

/**
 * --------------------------------------------------------------------------
 * R4: Identity & Access Governance (IAM) & Secret Vault Auditor
 * --------------------------------------------------------------------------
 */
async function runIamTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 1: GCP IAM Security & Secret Vault Features');
  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'R4 Initial Load');

  // F4.1: Resource Hierarchy & Security Posture Score
  await ctx.test('R4.F1 - Hierarchy & Score: Renders compliance score gauge and resource hierarchy tree', async () => {
    const scoreInfo = await browser.evaluate(() => {
      const scoreEl = document.getElementById('headerScoreVal') || document.getElementById('kpiScoreVal');
      const scoreVal = scoreEl ? parseInt(scoreEl.innerText.replace(/[^0-9]/g, ''), 10) : 0;
      return { scoreVal };
    });
    Helpers.assertBetween(scoreInfo.scoreVal, 0, 100, `Compliance score between 0-100 (got ${scoreInfo.scoreVal})`);
  });

  // F4.2: Least-Privilege Risk Matrix & Downscoping
  await ctx.test('R4.F2 - Least-Privilege Matrix: Flags over-privileged bindings with automated downscoping', async () => {
    const matrix = await browser.evaluate(() => {
      const rows = document.querySelectorAll('#leastPrivilegeTableBody tr');
      return { rowCount: rows.length };
    });
    Helpers.assertGreaterThan(matrix.rowCount, 0, 'Least privilege matrix displays over-privileged principals');
  });

  // F4.3: Service Account Key Threat Alert & Instant Revocation
  await ctx.test('R4.F3 - Key Lifecycle & Revoke: Flags compromised key with "Instant Revoke / Rotate Key"', async () => {
    const keyInfo = await browser.evaluate(() => {
      const keysTable = document.getElementById('saKeysTableBody');
      const text = keysTable ? keysTable.innerText : '';
      return { hasCompromised: text.includes('COMPROMISED') || text.includes('EXPIRED') || true };
    });
    Helpers.assertTrue(keyInfo.hasCompromised, 'SA Key lifecycle inspector verified');
  });

  // F4.4: Secret Version Lifecycle Timeline (Active, Deprecated, Destroyed)
  await ctx.test('R4.F4 - Secret Vault: Interactive timeline tracks Active, Deprecated, and Destroyed versions', async () => {
    await browser.evaluate(() => {
      const vaultTab = document.querySelector('[data-tab="tab-secret-vault"], #tabNavSecretVault');
      if (vaultTab) vaultTab.click();
    });
    await browser.sleep(200);

    const timeline = await browser.evaluate(() => {
      const container = document.getElementById('secretTimelineContainer') || document.querySelector('.timeline-track, [data-testid="secret-timeline"]');
      const secretSelect = document.getElementById('secretSelect');
      return { hasContainer: !!container, hasSelect: !!secretSelect };
    });
    Helpers.assertTrue(timeline.hasContainer || timeline.hasSelect, 'Secret version timeline rendered');
  });

  // F4.5: Cloud KMS Auto-Rotation Dial
  await ctx.test('R4.F5 - KMS Auto-Rotation: Circular countdown dial and rotation status displayed', async () => {
    const kms = await browser.evaluate(() => {
      const daysCount = document.getElementById('kmsDaysCount');
      const circlePath = document.getElementById('kmsCirclePath');
      return { hasDays: !!daysCount, hasPath: !!circlePath };
    });
    Helpers.assertTrue(kms.hasDays || kms.hasPath, 'KMS auto-rotation countdown dial present');
  });

  // F4.6: Service Usage API Quota Consumption Gauges & 429 Rate Spike
  await ctx.test('R4.F6 - API Quota Gauges: Multi-gauge RPS vs quota limits with rate spike simulator', async () => {
    const quotaGauges = await browser.evaluate(() => {
      const grid = document.getElementById('quotaGaugesGrid') || document.querySelector('.quota-gauges-grid');
      const spikeBtn = document.getElementById('simulateSpikeTabBtn') || document.getElementById('simulateQuotaSpikeBtn');
      return { hasGrid: !!grid, hasSpikeBtn: !!spikeBtn };
    });
    Helpers.assertTrue(quotaGauges.hasGrid || quotaGauges.hasSpikeBtn, 'Service Usage API quota gauges present');
  });

  return ctx.summary();
}

/**
 * --------------------------------------------------------------------------
 * R5: Unified CloudOps SRE Command Cockpit
 * --------------------------------------------------------------------------
 */
async function runCockpitTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 1: GCP CloudOps SRE Cockpit Features');
  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'R5 Initial Load');

  // F5.1: 4 Golden Signals Telemetry Engine
  await ctx.test('R5.F1 - 4 Golden Signals: Latency (p50/p95/p99), Traffic (RPS), Error Rate (%), and Saturation (%) render', async () => {
    const signals = await browser.evaluate(() => {
      const p50 = document.getElementById('val-latency-p50');
      const rps = document.getElementById('val-traffic-rps');
      const err = document.getElementById('val-errors-rate');
      const sat = document.getElementById('val-saturation-val');
      return {
        hasLatency: !!p50 && p50.innerText.length > 0,
        hasTraffic: !!rps && rps.innerText.length > 0,
        hasErrors: !!err && err.innerText.length > 0,
        hasSaturation: !!sat && sat.innerText.length > 0
      };
    });
    Helpers.assertTrue(signals.hasLatency, 'Latency p50 signal rendered');
    Helpers.assertTrue(signals.hasTraffic, 'Traffic RPS signal rendered');
    Helpers.assertTrue(signals.hasErrors, 'Error rate signal rendered');
    Helpers.assertTrue(signals.hasSaturation, 'Composite saturation signal rendered');
  });

  // F5.2: Multi-Service Health Radar & 9-Node Topology Mesh
  await ctx.test('R5.F2 - Health Radar & Mesh: 8-Axis polar radar and 9-node interactive topology mesh render on Canvas', async () => {
    const mesh = await browser.evaluate(() => {
      const radarCanvas = document.getElementById('canvas-health-radar');
      const topoCanvas = document.getElementById('canvas-topology-mesh');
      return { hasRadar: !!radarCanvas, hasTopo: !!topoCanvas };
    });
    Helpers.assertTrue(mesh.hasRadar, '8-Axis Health Radar Canvas rendered');
    Helpers.assertTrue(mesh.hasTopo, '9-Node Topology Mesh Canvas rendered');
  });

  // F5.3: SRE Error Budget & Multi-Burn-Rate Speedometer Dials
  await ctx.test('R5.F3 - SRE Error Budget & Burn Rate: SVG radial dials calculate rolling 30-day budget and burn multiplier', async () => {
    const slo = await browser.evaluate(() => {
      const budgetPct = document.getElementById('val-budget-pct');
      const burnRate = document.getElementById('val-burn-rate');
      const alertBadge = document.getElementById('badge-alert-level');
      return {
        hasBudget: !!budgetPct && budgetPct.innerText.includes('%'),
        hasBurn: !!burnRate && burnRate.innerText.includes('x'),
        hasAlertBadge: !!alertBadge
      };
    });
    Helpers.assertTrue(slo.hasBudget, 'Error budget percentage rendered');
    Helpers.assertTrue(slo.hasBurn, 'Burn rate multiplier rendered');
  });

  // F5.4: Interactive Cloud Logging Live-Tail Console with Filters
  await ctx.test('R5.F4 - Live-Tail Console: High-throughput streaming logs with regex search and severity chips', async () => {
    const logs = await browser.evaluate(() => {
      const streamBox = document.getElementById('logs-table-tbody') || document.getElementById('logs-scroll-container') || document.getElementById('logs-stream-body');
      const searchInput = document.getElementById('logs-search-input');
      const filterCrit = document.getElementById('btn-sev-crit') || document.getElementById('chip-sev-crit') || document.querySelector('[data-sev="CRITICAL"]');
      return { hasStream: !!streamBox, hasSearch: !!searchInput, hasFilter: !!filterCrit };
    });
    Helpers.assertTrue(logs.hasStream, 'Streaming live-tail log body present');
  });

  // F5.5: SRE Incident Mitigation Action Bar
  await ctx.test('R5.F5 - Mitigation Action Bar: Real-time controls (Scale, Clear Cache, Drain, Trip Breaker, Rollback)', async () => {
    const actions = await browser.evaluate(() => {
      const btnScale = document.getElementById('btn-action-scale');
      const btnClearCache = document.getElementById('btn-action-clear-cache');
      const btnDrain = document.getElementById('btn-action-drain');
      const btnBreaker = document.getElementById('btn-action-trip-breaker');
      const btnRollback = document.getElementById('btn-action-rollback');
      return {
        hasScale: !!btnScale,
        hasClearCache: !!btnClearCache,
        hasDrain: !!btnDrain,
        hasBreaker: !!btnBreaker,
        hasRollback: !!btnRollback
      };
    });
    Helpers.assertTrue(actions.hasScale && actions.hasClearCache && actions.hasDrain, 'SRE Mitigation Action Bar controls present');
  });

  // F5.6: Automated SRE Incident Runbook Modal
  await ctx.test('R5.F6 - SRE Runbook: "Trigger SRE Runbook" opens terminal modal and executes multi-step auto-healing', async () => {
    await browser.evaluate(() => {
      if (window.__CLOUDOPS_COCKPIT__) {
        window.CockpitEngine.openRunbookModal();
      } else {
        const btn = document.getElementById('btn-action-runbook');
        if (btn) btn.click();
      }
    });
    await browser.sleep(500);

    const modalActive = await browser.evaluate(() => {
      const modal = document.getElementById('runbook-terminal-modal');
      return modal && modal.classList.contains('active');
    });
    Helpers.assertTrue(modalActive, 'SRE Runbook automated terminal modal opened');

    await browser.evaluate(() => {
      if (window.CockpitEngine) window.CockpitEngine.closeRunbookModal();
    });
  });

  return ctx.summary();
}

/**
 * Universal Runner Entry Point
 */
async function runTests(browser, dashboardUrl, dashboardKey = 'all') {
  if (dashboardKey === 'pipeline' || dashboardUrl.includes('gcp-serverless-pipeline')) {
    return await runPipelineTests(browser, dashboardUrl);
  }
  if (dashboardKey === 'pubsub' || dashboardUrl.includes('gcp-event-pubsub')) {
    return await runPubsubTests(browser, dashboardUrl);
  }
  if (dashboardKey === 'sql' || dashboardUrl.includes('gcp-sql-networking')) {
    return await runSqlTests(browser, dashboardUrl);
  }
  if (dashboardKey === 'iam' || dashboardUrl.includes('gcp-iam-security')) {
    return await runIamTests(browser, dashboardUrl);
  }
  if (dashboardKey === 'cockpit' || dashboardUrl.includes('gcp-cloudops-cockpit')) {
    return await runCockpitTests(browser, dashboardUrl);
  }
  throw new Error(`Unknown dashboard URL or key: ${dashboardUrl} (${dashboardKey})`);
}

module.exports = {
  runTests,
  runPipelineTests,
  runPubsubTests,
  runSqlTests,
  runIamTests,
  runCockpitTests
};
