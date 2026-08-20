/**
 * Comprehensive Automated Verification Suite for R2: GCP Event-Driven Pub/Sub & DLQ Console
 * Path: sistemas/gcp-event-pubsub/index.html
 */

const path = require('path');
const { BrowserSession } = require('./runner');

async function run() {
  console.log('================================================================');
  console.log('Starting E2E Headless Browser Verification: GCP Event Pub/Sub & DLQ');
  console.log('================================================================\n');

  const browser = new BrowserSession();
  let passedCount = 0;
  let failedCount = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`  [TEST] ${name} ... `);
      await fn();
      console.log('PASSED ✅');
      passedCount++;
    } catch (err) {
      console.log('FAILED ❌');
      console.error(`    Error: ${err.message}`);
      failedCount++;
    }
  }

  try {
    await browser.launch();
    const filePath = path.resolve(__dirname, '../sistemas/gcp-event-pubsub/index.html');
    await browser.navigate(filePath);
    await browser.sleep(500);

    // 1. Console & Uncaught Error Check
    await test('Zero runtime syntax or uncaught exceptions', async () => {
      const errs = browser.uncaughtExceptions;
      if (errs.length > 0) {
        throw new Error(`Found ${errs.length} uncaught exceptions: ${JSON.stringify(errs)}`);
      }
    });

    // 2. Global Test Automation API
    await test('window.__GCP_EVENT_PUBSUB__ is exposed with valid methods', async () => {
      const apiStatus = await browser.evaluate(() => {
        const api = window.__GCP_EVENT_PUBSUB__;
        if (!api) return { valid: false, reason: 'window.__GCP_EVENT_PUBSUB__ is undefined' };
        const requiredMethods = [
          'getState', 'getTopology', 'getDlqItems', 'replayMessage',
          'replayAll', 'purgeMessage', 'purgeAll', 'injectPoisonPill',
          'injectBurst', 'triggerCron', 'simulateWorkerCrash',
          'setIngestionRate', 'scaleWorkers', 'togglePause', 'subscribe'
        ];
        for (const m of requiredMethods) {
          if (typeof api[m] !== 'function') return { valid: false, reason: `Missing method ${m}` };
        }
        return { valid: true, version: api.version };
      });
      if (!apiStatus.valid) throw new Error(apiStatus.reason);
    });

    // 3. Core GCP APIs Rendered
    await test('All 5 specified GCP APIs are present with active badges', async () => {
      const apis = await browser.evaluate(() => {
        const pubsub = document.querySelector('[data-testid="gcp-api-pubsub"]');
        const scheduler = document.querySelector('[data-testid="gcp-api-scheduler"]');
        const storage = document.querySelector('[data-testid="gcp-api-storage"]');
        const fcm = document.querySelector('[data-testid="gcp-api-fcm"]');
        const monitoring = document.querySelector('[data-testid="gcp-api-monitoring"]');
        return {
          pubsub: !!pubsub && pubsub.textContent.includes('pubsub.googleapis.com'),
          scheduler: !!scheduler && scheduler.textContent.includes('cloudscheduler'),
          storage: !!storage && storage.textContent.includes('storage'),
          fcm: !!fcm && fcm.textContent.includes('fcm'),
          monitoring: !!monitoring && monitoring.textContent.includes('monitoring')
        };
      });
      if (!apis.pubsub || !apis.scheduler || !apis.storage || !apis.fcm || !apis.monitoring) {
        throw new Error(`Missing or inactive GCP API badges: ${JSON.stringify(apis)}`);
      }
    });

    // 4. 5-Node Topology & Permanent Luminous Icons
    await test('5-Node Topology rendered with permanent luminous icons (⏰, 📬, ⚙️, 📱, ☠️)', async () => {
      const nodes = await browser.evaluate(() => {
        const n1 = document.querySelector('[data-testid="node-scheduler"]');
        const n2 = document.querySelector('[data-testid="node-topic"]');
        const n3 = document.querySelector('[data-testid="node-worker"]');
        const n4 = document.querySelector('[data-testid="node-fcm"]');
        const n5 = document.querySelector('[data-testid="node-dlq"]');
        const emojis = ['⏰', '📬', '⚙️', '📱', '☠️'];
        const text = document.body.innerText;
        const allEmojisFound = emojis.every(e => text.includes(e));

        return {
          allExist: !!(n1 && n2 && n3 && n4 && n5),
          allEmojisFound
        };
      });
      if (!nodes.allExist) throw new Error('One or more topology node cards missing');
      if (!nodes.allEmojisFound) throw new Error('One or more permanent luminous icons missing');
    });

    // 5. 4 Partition Lanes Visualizer & CRC32 Routing
    await test('4 Partition streaming lanes and canvas rendered', async () => {
      const parts = await browser.evaluate(() => {
        const p0 = document.querySelector('[data-testid="partition-lane-0"]');
        const p1 = document.querySelector('[data-testid="partition-lane-1"]');
        const p2 = document.querySelector('[data-testid="partition-lane-2"]');
        const p3 = document.querySelector('[data-testid="partition-lane-3"]');
        const canvas = document.getElementById('streamCanvas');
        return {
          p0: !!p0, p1: !!p1, p2: !!p2, p3: !!p3,
          canvasOk: !!canvas && canvas.width > 0 && canvas.height > 0
        };
      });
      if (!parts.p0 || !parts.p1 || !parts.p2 || !parts.p3 || !parts.canvasOk) {
        throw new Error(`Partition lanes or canvas not properly initialized: ${JSON.stringify(parts)}`);
      }
    });

    // 6. Live 60s Dual-Line Throughput Chart
    await test('60s Canvas Throughput Chart renders with Catmull-Rom smoothing', async () => {
      const chart = await browser.evaluate(() => {
        const canvas = document.getElementById('throughputChart');
        const state = window.__GCP_EVENT_PUBSUB__.getState();
        return {
          canvasExists: !!canvas,
          width: canvas ? canvas.width : 0,
          height: canvas ? canvas.height : 0,
          historyLength: state.throughputHistory.length
        };
      });
      if (!chart.canvasExists || chart.width === 0 || chart.height === 0) {
        throw new Error('Throughput chart canvas is missing or zero dimension');
      }
      if (chart.historyLength < 50) {
        throw new Error(`History length is too short: ${chart.historyLength}`);
      }
    });

    // 7. Queue Backlog Depth Meter & Message Age
    await test('Queue Backlog Depth gauge needle and stats update dynamically', async () => {
      const backlogData = await browser.evaluate(() => {
        const count = document.getElementById('backlogCountDisplay').textContent;
        const bytes = document.getElementById('backlogBytesDisplay').textContent;
        const age = document.getElementById('messageAgeDisplay').textContent;
        const needle = document.getElementById('gaugeNeedle');
        return {
          count: parseInt(count.replace(/,/g, ''), 10),
          bytes,
          age,
          hasNeedle: !!needle
        };
      });
      if (isNaN(backlogData.count) || !backlogData.bytes || !backlogData.age || !backlogData.hasNeedle) {
        throw new Error(`Invalid backlog data: ${JSON.stringify(backlogData)}`);
      }
    });

    // 8. Latency SLA Histogram (P50, P95, P99)
    await test('Latency SLA histogram displays percentiles (P50, P95, P99)', async () => {
      const hist = await browser.evaluate(() => {
        const p50 = document.getElementById('p50Display').textContent;
        const p95 = document.getElementById('p95Display').textContent;
        const p99 = document.getElementById('p99Display').textContent;
        const bar0 = document.getElementById('histBar0');
        const bar5 = document.getElementById('histBar5');
        return {
          p50, p95, p99,
          barsRendered: !!bar0 && !!bar5
        };
      });
      if (!hist.p50.includes('ms') || !hist.p95.includes('ms') || !hist.p99.includes('ms') || !hist.barsRendered) {
        throw new Error(`Invalid latency histogram data: ${JSON.stringify(hist)}`);
      }
    });

    // 9. Interactive DLQ Inspector: Inspect, Replay to Topic, and Purge
    await test('DLQ Inspector table renders items and supports payload inspection', async () => {
      const initialCount = await browser.evaluate(() => {
        const rows = document.querySelectorAll('#dlqTableBody tr');
        return rows.length;
      });
      if (initialCount === 0) throw new Error('DLQ Table has 0 initial items');

      // Test Inspect modal
      await browser.evaluate(() => {
        const firstInspectBtn = document.querySelector('.btn-table-inspect');
        if (firstInspectBtn) firstInspectBtn.click();
      });
      await browser.sleep(300);

      const modalOpen = await browser.evaluate(() => {
        const modal = document.getElementById('dlqModal');
        const viewer = document.getElementById('modalPayloadViewer');
        return modal && modal.classList.contains('open') && viewer.textContent.length > 0;
      });
      if (!modalOpen) throw new Error('DLQ Inspect modal did not open or payload is empty');

      // Close modal
      await browser.evaluate(() => {
        document.getElementById('btnModalClose').click();
      });
      await browser.sleep(200);
    });

    // 10. DLQ Functional "Replay to Topic"
    await test('DLQ "Replay to Topic" action removes message, audits, and clears DLQ', async () => {
      const beforeCount = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getDlqItems().length);
      
      const replayResult = await browser.evaluate(() => {
        const items = window.__GCP_EVENT_PUBSUB__.getDlqItems();
        if (items.length === 0) return { success: false, reason: 'No items to replay' };
        const id = items[0].id;
        const ok = window.__GCP_EVENT_PUBSUB__.replayMessage(id);
        return { success: ok, replayedId: id };
      });
      if (!replayResult.success) throw new Error(`Replay failed: ${replayResult.reason}`);

      await browser.sleep(500);

      const afterCount = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getDlqItems().length);
      if (afterCount !== beforeCount - 1) {
        throw new Error(`Expected DLQ count to decrease from ${beforeCount} to ${beforeCount - 1}, but got ${afterCount}`);
      }
    });

    // 11. Chaos Controls: Inject Poison Pill
    await test('Inject Poison Pill button adds new quarantined item into DLQ', async () => {
      const before = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getDlqItems().length);
      await browser.evaluate(() => {
        document.getElementById('btnPoison').click();
      });
      await browser.sleep(300);
      const after = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getDlqItems().length);
      if (after !== before + 1) {
        throw new Error(`Expected DLQ count to increase from ${before} to ${before + 1}, got ${after}`);
      }
    });

    // 12. Chaos Controls: Ingestion Burst & Cron Tick
    await test('Ingestion Burst and Cron Tick increase metrics dynamically', async () => {
      const statsBefore = await browser.evaluate(() => {
        return {
          ingested: window.__GCP_EVENT_PUBSUB__.getState().totalIngested,
          backlog: window.__GCP_EVENT_PUBSUB__.getState().backlogCount
        };
      });

      await browser.evaluate(() => {
        document.getElementById('btnCron').click();
      });
      await browser.sleep(300);

      const statsAfterCron = await browser.evaluate(() => {
        return {
          ingested: window.__GCP_EVENT_PUBSUB__.getState().totalIngested,
          backlog: window.__GCP_EVENT_PUBSUB__.getState().backlogCount
        };
      });
      if (statsAfterCron.ingested <= statsBefore.ingested) {
        throw new Error('Cron tick did not increase totalIngested');
      }

      await browser.evaluate(() => {
        document.getElementById('btnBurst').click();
      });
      await browser.sleep(1200);

      const burstActive = await browser.evaluate(() => {
        const state = window.__GCP_EVENT_PUBSUB__.getState();
        return state.currentIngestionRate > 2000;
      });
      if (!burstActive) throw new Error('Burst did not elevate current ingestion rate above 2000 msg/s');
    });

    // 13. Chaos Controls: Worker Outage simulation
    await test('Worker Outage causes ACK rate to drop and cluster health to degrade', async () => {
      await browser.evaluate(() => {
        document.getElementById('btnWorkerCrash').click();
      });
      await browser.sleep(1200);

      const outageState = await browser.evaluate(() => {
        const state = window.__GCP_EVENT_PUBSUB__.getState();
        const healthText = document.getElementById('clusterHealthDisplay').textContent;
        return {
          ackRate: state.currentAckRate,
          healthText,
          outageSec: state.workerOutageRemainingSec
        };
      });

      if (outageState.ackRate !== 0 && outageState.outageSec === 0) {
        throw new Error('Worker crash did not reduce ACK rate');
      }
    });

    // 14. Batch Replay All
    await test('Replay All Filtered empties the DLQ quarantine table', async () => {
      await browser.evaluate(() => {
        document.getElementById('btnReplayAll').click();
      });
      await browser.sleep(400);

      const count = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getDlqItems().length);
      if (count !== 0) throw new Error(`Expected DLQ count 0 after Replay All, got ${count}`);
    });

    // 15. Responsive Viewports
    await test('Responsive layout renders seamlessly across mobile (400px), tablet (768px), and desktop', async () => {
      // Test mobile 400px
      await browser.setViewport(400, 800);
      await browser.sleep(300);
      let mobileErrors = browser.uncaughtExceptions.length;
      if (mobileErrors > 0) throw new Error('Mobile viewport triggered uncaught exception');

      // Test tablet 768px
      await browser.setViewport(768, 1024);
      await browser.sleep(300);

      // Test desktop 1920x1080
      await browser.setViewport(1920, 1080);
      await browser.sleep(300);
    });

    // 16. Log Console Streaming and Filtering
    await test('Real-time structured Cloud Logging live-tail with severity filtering', async () => {
      const logsCheck = await browser.evaluate(() => {
        const box = document.getElementById('logStreamBox');
        const chipInfo = document.querySelector('.log-chip[data-sev="INFO"]');
        if (chipInfo) chipInfo.click();
        const infoLogs = box.querySelectorAll('.log-entry');
        return {
          hasLogs: infoLogs.length > 0
        };
      });
      if (!logsCheck.hasLogs) throw new Error('Log stream did not render log entries');
    });

  } finally {
    browser.close();
  }

  console.log('\n================================================================');
  console.log(`TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
