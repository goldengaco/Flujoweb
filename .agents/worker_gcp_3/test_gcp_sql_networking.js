/**
 * Test Suite for R3: Private VPC Peering & Cloud SQL High-Availability Hub
 * Target: sistemas/gcp-sql-networking/index.html
 */

const path = require('path');
const { BrowserSession } = require('../../tests/runner');
const { TestContext, Helpers } = require('../../tests/fixtures/helpers');

async function run() {
  const htmlPath = path.resolve(__dirname, '../../sistemas/gcp-sql-networking/index.html');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

  console.log('\x1b[36m=================================================================\x1b[0m');
  console.log('\x1b[36m  R3: CLOUD SQL & PRIVATE VPC PEERING HA HUB TEST SUITE\x1b[0m');
  console.log('\x1b[36m  Target: ' + fileUrl + '\x1b[0m');
  console.log('\x1b[36m=================================================================\x1b[0m\n');

  const browser = new BrowserSession();
  await browser.launch();

  const ctx = new TestContext('R3: Cloud SQL HA & VPC Peering');

  try {
    await browser.navigate(fileUrl);
    await browser.sleep(500);

    // Test 1: No Uncaught Console Errors
    await ctx.test('1. Page Navigation: Loads cleanly with zero uncaught JavaScript errors', async () => {
      await Helpers.assertNoConsoleErrors(browser, 'Initial Navigation');
    });

    // Test 2: Global Test Interface
    await ctx.test('2. Interface Contract: window.__GCP_SQL_NETWORKING__ exposed with all methods and state', async () => {
      const hasContract = await browser.evaluate(() => {
        const h = window.__GCP_SQL_NETWORKING__;
        return !!(h && h.app && h.state && typeof h.simulatePrimaryCrash === 'function' &&
          typeof h.reprovisionReplica === 'function' && typeof h.injectBurst === 'function' &&
          typeof h.drainPool === 'function' && typeof h.killQuery === 'function' &&
          typeof h.addIndex === 'function' && typeof h.rotateKmsKey === 'function' &&
          typeof h.exportTelemetry === 'function');
      });
      Helpers.assertTrue(hasContract, 'window.__GCP_SQL_NETWORKING__ must expose complete API contract');
    });

    // Test 3: Permanent Luminous Icons
    await ctx.test('3. Visual Standards: Permanent luminous icons & emojis rendered across all panels', async () => {
      const emojis = ['🐘', '🌐', '⏱️', '🔊', '📥', '🔗', '⚡', '🏊', '🛡️', '🗺️', '🚀', '💥', '🔄', '🧹', '⚠️', '🔍', '🔒', '🔐', '📟'];
      const pageText = await browser.evaluate(() => document.body.innerText);
      for (const emoji of emojis) {
        Helpers.assertTrue(pageText.includes(emoji), `Emoji ${emoji} must be present in DOM`);
      }
    });

    // Test 4: Top KPI Cards
    await ctx.test('4. KPI Strip: 4 telemetry cards rendered with correct initial GCP metrics', async () => {
      const kpiData = await browser.evaluate(() => {
        return {
          peering: document.getElementById('kpiPeeringStatus')?.textContent?.trim(),
          primaryZone: document.getElementById('kpiPrimaryZone')?.textContent?.trim(),
          saturation: document.getElementById('kpiPoolSaturation')?.textContent?.trim(),
          cmek: document.getElementById('kpiCmekStatus')?.textContent?.trim()
        };
      });
      Helpers.assertEqual(kpiData.peering, 'CONNECTED', 'VPC Peering should be CONNECTED');
      Helpers.assertTrue(kpiData.primaryZone.includes('Zone A'), 'Initial primary should be Zone A');
      Helpers.assertTrue(kpiData.saturation.includes('%'), 'Pool saturation should have percentage');
      Helpers.assertTrue(kpiData.cmek.includes('ENCRYPTED'), 'CMEK should be ENCRYPTED');
    });

    // Test 5: Canvas Network Topology
    await ctx.test('5. Topology Engine: Canvas initialized and renders packet routing with speed controls', async () => {
      const canvasOk = await browser.evaluate(() => {
        const cvs = document.getElementById('topologyCanvas');
        return cvs && cvs.width > 0 && cvs.height > 0;
      });
      Helpers.assertTrue(canvasOk, 'Canvas should be initialized with positive dimensions');

      // Test speed toggle
      await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.setPacketSpeed(2.0));
      const speed = await browser.evaluate(() => window.sqlApp.topology.speed);
      Helpers.assertEqual(speed, 2.0, 'Packet speed should update to 2.0');
    });

    // Test 6: Connection Pool Saturation
    await ctx.test('6. Connection Pool & PgBouncer: Inject burst increases active connections & saturation', async () => {
      const initialActive = await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.state.pool.active);
      await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.injectBurst(25));
      const newActive = await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.state.pool.active);
      Helpers.assertTrue(newActive > initialActive, `Active count should increase from ${initialActive} to ${newActive}`);

      // Drain pool
      await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.drainPool());
      const drainedIdle = await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.state.pool.idle);
      Helpers.assertEqual(drainedIdle, 5, 'Idle connections should be drained to 5');
    });

    // Test 7: Slow Query & Lock Contention Table
    await ctx.test('7. Lock Contention Table: Populates active queries, allows explain, kill, and add index', async () => {
      const initialCount = await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.state.queries.length);
      Helpers.assertTrue(initialCount >= 4, `Should have at least 4 queries initially (found ${initialCount})`);

      // Test Explain Plan Modal
      await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.explainQuery(14829));
      const modalOpen = await browser.evaluate(() => document.getElementById('explainModal').classList.contains('open'));
      Helpers.assertTrue(modalOpen, 'Explain modal should be open');
      await browser.evaluate(() => document.getElementById('btnCloseExplainModal').click());

      // Test Add Index optimization
      await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.addIndex(15012));
      const optimizedDuration = await browser.evaluate(() => {
        const q = window.__GCP_SQL_NETWORKING__.state.queries.find(item => item.pid === 15012);
        return q ? q.durationMs : null;
      });
      Helpers.assertEqual(optimizedDuration, 4, 'Query execution time should drop to 4ms after index creation');

      // Test Inject Lock Contention
      await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.injectLockContention());
      const afterInjectCount = await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.state.queries.length);
      Helpers.assertTrue(afterInjectCount > initialCount, 'Inject lock should add blocking query pair');

      // Test Kill PID
      const blockedQuery = await browser.evaluate(() => {
        return window.__GCP_SQL_NETWORKING__.state.queries.find(q => q.blockedBy !== null);
      });
      Helpers.assertTrue(!!blockedQuery, 'Should find a blocked query');
      const blockerPid = blockedQuery.blockedBy;
      await browser.evaluate((pid) => window.__GCP_SQL_NETWORKING__.killQuery(pid), blockerPid);

      // Verify lock released
      const stillBlocked = await browser.evaluate((pid) => {
        return window.__GCP_SQL_NETWORKING__.state.queries.some(q => q.blockedBy === pid);
      }, blockerPid);
      Helpers.assertFalse(stillBlocked, 'No queries should remain blocked after killing the blocker PID');
    });

    // Test 8: Primary Node Crash & 7-Step HA Failover
    await ctx.test('8. HA Failover Simulation: Executes 7-step failover to Zone B with stopwatch', async () => {
      // Trigger crash
      await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.simulatePrimaryCrash());

      // Wait for failover to complete
      await browser.waitForFunction(() => {
        return window.__GCP_SQL_NETWORKING__.state.clusterHealth === 'DEGRADED_SINGLE_ZONE' &&
          window.__GCP_SQL_NETWORKING__.state.activeZone === 'us-east4-b';
      }, 12000);

      const failoverState = await browser.evaluate(() => {
        return {
          clusterHealth: window.__GCP_SQL_NETWORKING__.state.clusterHealth,
          activeZone: window.__GCP_SQL_NETWORKING__.state.activeZone,
          zoneAStatus: window.sqlApp.topology.zoneAStatus,
          zoneBStatus: window.sqlApp.topology.zoneBStatus,
          duration: window.__GCP_SQL_NETWORKING__.state.failoverDuration
        };
      });

      Helpers.assertEqual(failoverState.clusterHealth, 'DEGRADED_SINGLE_ZONE', 'Cluster should be DEGRADED_SINGLE_ZONE');
      Helpers.assertEqual(failoverState.activeZone, 'us-east4-b', 'Active zone should be us-east4-b');
      Helpers.assertEqual(failoverState.zoneAStatus, 'CRASHED', 'Zone A should be CRASHED');
      Helpers.assertEqual(failoverState.zoneBStatus, 'PRIMARY', 'Zone B should be PRIMARY');
      Helpers.assertTrue(parseFloat(failoverState.duration) > 0, 'Failover duration should be recorded');
    });

    // Test 9: Reprovision Zone A Replica
    await ctx.test('9. Replica Reprovisioning: Restores dual-zone HA redundancy in us-east4-a', async () => {
      await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.reprovisionReplica());
      
      await browser.waitForFunction(() => {
        return window.__GCP_SQL_NETWORKING__.state.clusterHealth === 'HEALTHY_DUAL_ZONE';
      }, 8000);

      const restoredHealth = await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.state.clusterHealth);
      Helpers.assertEqual(restoredHealth, 'HEALTHY_DUAL_ZONE', 'Cluster health should be restored to HEALTHY_DUAL_ZONE');
    });

    // Test 10: Cloud KMS CMEK Key Rotation
    await ctx.test('10. Cloud KMS CMEK: Key rotation increments version to v4 and resets countdown', async () => {
      const initialVersion = await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.state.cmek.keyVersion);
      await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.rotateKmsKey());
      const newVersion = await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.state.cmek.keyVersion);
      Helpers.assertEqual(newVersion, 'v4', 'KMS key version should increment from v3 to v4');
    });

    // Test 11: Export Telemetry JSON
    await ctx.test('11. Telemetry Export: Generates valid JSON compliance report schema', async () => {
      const report = await browser.evaluate(() => window.__GCP_SQL_NETWORKING__.exportTelemetry());
      Helpers.assertTrue(!!report, 'Export telemetry should return report object');
      Helpers.assertEqual(report.project, 'prj-prod-payments-9941', 'Project should match');
      Helpers.assertEqual(report.region, 'us-east4', 'Region should match');
      Helpers.assertTrue(Array.isArray(report.activeQueries), 'Active queries should be array');
      Helpers.assertTrue(Array.isArray(report.auditLogs), 'Audit logs should be array');
    });

    // Test 12: Responsiveness Across Viewports
    await ctx.test('12. Responsiveness: Seamlessly adapts across Mobile (400px), Tablet (768px), and 4K (3840px)', async () => {
      const viewports = [
        { width: 400, height: 800 },
        { width: 768, height: 1024 },
        { width: 1920, height: 1080 },
        { width: 3840, height: 2160 }
      ];

      for (const vp of viewports) {
        await browser.setViewport(vp.width, vp.height);
        await browser.sleep(150);
        const layoutOk = await browser.evaluate(() => {
          const app = document.querySelector('.app-container');
          return app && app.clientWidth > 0 && app.clientHeight > 0;
        });
        Helpers.assertTrue(layoutOk, `Layout should render cleanly at ${vp.width}x${vp.height}`);
      }
    });

  } finally {
    browser.close();
  }

  const summary = ctx.summary();
  console.log('\n\x1b[36m=================================================================\x1b[0m');
  console.log(`\x1b[32mPASSED: ${summary.passed}\x1b[0m | \x1b[31mFAILED: ${summary.failed}\x1b[0m | Total: ${summary.total} | Duration: ${summary.duration}ms`);
  console.log('\x1b[36m=================================================================\x1b[0m\n');

  if (summary.failed > 0) {
    process.exit(1);
  }
}

run().catch(err => {
  console.error('\x1b[31mFatal Test Execution Error:\x1b[0m', err);
  process.exit(1);
});
