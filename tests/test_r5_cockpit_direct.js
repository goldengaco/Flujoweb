const { BrowserSession } = require('./runner.js');
const path = require('path');

async function testCockpitMaster() {
  const session = new BrowserSession();
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [PASS] ${message}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${message}`);
      failed++;
    }
  }

  try {
    await session.launch();
    console.log('\n===============================================================');
    console.log('  MASTER VERIFICATION: GCP CLOUDOPS SRE COMMAND COCKPIT (R5)');
    console.log('===============================================================\n');

    const targetUrl = path.resolve('sistemas/gcp-cloudops-cockpit/index.html');
    await session.navigate(targetUrl);
    await session.sleep(1200);

    // 1. Initial State & Clean Execution
    console.log('--- 1. Baseline & DOM Verification ---');
    const errors = session.getConsoleErrors();
    assert(errors.length === 0, `0 console errors / uncaught exceptions on load`);

    const titleText = await session.getText('[data-testid="header-title"]');
    assert(titleText && titleText.includes('GCP CloudOps SRE Command Cockpit'), 'Header title renders correctly');

    // 2. Four Golden Signals Initial Verification
    const p50Val = await session.getText('[data-testid="signal-latency-p50"]');
    const p95Val = await session.getText('[data-testid="signal-latency-p95"]');
    const p99Val = await session.getText('[data-testid="signal-latency-p99"]');
    assert(p50Val !== null && !isNaN(parseFloat(p50Val)), `Latency p50 is valid number (${p50Val} ms)`);
    assert(p95Val !== null && p95Val.includes('ms'), `Latency p95 renders (${p95Val})`);
    assert(p99Val !== null && p99Val.includes('ms'), `Latency p99 renders (${p99Val})`);

    const rpsVal = await session.getText('[data-testid="signal-traffic-rps"]');
    const bwIngress = await session.getText('[data-testid="signal-bandwidth-val"]');
    assert(rpsVal !== null && rpsVal.length > 0, `Traffic RPS renders (${rpsVal})`);
    assert(bwIngress !== null && bwIngress.includes('MB/s'), `Ingress bandwidth renders (${bwIngress})`);

    const errRateVal = await session.getText('[data-testid="signal-errors-rate"]');
    const err5xx = await session.getText('[data-testid="signal-5xx-val"]');
    const err4xx = await session.getText('[data-testid="signal-4xx-val"]');
    assert(errRateVal !== null && !isNaN(parseFloat(errRateVal)), `Error rate renders (${errRateVal}%)`);
    assert(err5xx !== null && err5xx.includes('/ sec'), `5xx error counter renders (${err5xx})`);
    assert(err4xx !== null && err4xx.includes('/ sec'), `4xx error counter renders (${err4xx})`);

    const satVal = await session.getText('[data-testid="signal-saturation-val"]');
    const cpuVal = await session.getText('[data-testid="saturation-cpu-val"]');
    const ramVal = await session.getText('[data-testid="saturation-ram-val"]');
    const dbVal = await session.getText('[data-testid="saturation-db-val"]');
    const iopsVal = await session.getText('[data-testid="saturation-iops-val"]');
    assert(satVal !== null && !isNaN(parseFloat(satVal)), `Saturation composite renders (${satVal}%)`);
    assert(cpuVal && ramVal && dbVal && iopsVal, `Resource breakdown metrics render (CPU=${cpuVal}, RAM=${ramVal}, DB=${dbVal}, IOPS=${iopsVal})`);

    // 3. Canvases Initial Verification
    const topoCanvasExists = await session.evaluate(() => {
      const c = document.querySelector('[data-testid="topology-canvas"]');
      return c && c.width > 0 && c.height > 0;
    });
    assert(topoCanvasExists, 'Topology Mesh Canvas initializes with non-zero dimensions');

    const radarCanvasExists = await session.evaluate(() => {
      const c = document.querySelector('[data-testid="radar-canvas"]');
      return c && c.width > 0 && c.height > 0;
    });
    assert(radarCanvasExists, 'Health Radar Canvas initializes with non-zero dimensions');

    // 4. SLO Budget & Burn Rate Initial Verification
    const budgetVal = await session.getText('[data-testid="slo-budget-value"]');
    assert(budgetVal && budgetVal.includes('%'), `SLO remaining budget renders (${budgetVal})`);

    const burnRateVal = await session.getText('[data-testid="slo-burn-rate-value"]');
    assert(burnRateVal && burnRateVal.includes('x'), `Burn Rate multiplier renders (${burnRateVal})`);

    const w1h = await session.getText('[data-testid="slo-window-1h"]');
    const w6h = await session.getText('[data-testid="slo-window-6h"]');
    const w24h = await session.getText('[data-testid="slo-window-24h"]');
    const wd3 = await session.getText('[data-testid="slo-window-3d"]');
    assert(w1h && w6h && w24h && wd3, 'All 4 Google SRE alert windows active in DOM');

    // 5. Test Scenario: Cascading 504s (SEV-1) & Mitigation
    console.log('\n--- 2. Scenario: Cascading 504s (SEV-1) ---');
    await session.click('[data-testid="btn-scenario-sev1-timeouts"]');
    await session.sleep(600);

    const state504 = await session.evaluate(() => window.__CLOUDOPS_COCKPIT__.getState());
    assert(state504.scenario === 'cascading_504', 'Scenario switched to cascading_504');
    assert(state504.goldenSignals.errorRate > 1.0, `Error rate escalated to critical (>1.0%, got ${state504.goldenSignals.errorRate.toFixed(2)}%)`);
    assert(state504.slo.burnRate > 10.0, `Burn rate escalated (>10x, got ${state504.slo.burnRate}x)`);
    assert(state504.slo.alertLevel === 'SEV-1', `SLO Alert Level escalated to SEV-1 (got ${state504.slo.alertLevel})`);

    // Mitigation: Trip Breaker + Scale
    await session.click('[data-testid="btn-action-trip-breaker"]');
    await session.click('[data-testid="btn-action-scale"]');
    await session.sleep(600);

    const stateMitigated = await session.evaluate(() => window.__CLOUDOPS_COCKPIT__.getState());
    assert(stateMitigated.activeMitigations.includes('trip_breaker'), 'trip_breaker registered in activeMitigations');
    assert(stateMitigated.activeMitigations.includes('scale'), 'scale registered in activeMitigations');
    assert(stateMitigated.goldenSignals.errorRate < state504.goldenSignals.errorRate, 'Error rate reduced post-mitigation');

    // 6. Test Scenario: Memory Leak (SEV-2) & Rollback
    console.log('\n--- 3. Scenario: Memory Leak in Pods (SEV-2) ---');
    await session.click('[data-testid="btn-scenario-sev2-leak"]');
    await session.sleep(600);
    const stateLeak = await session.evaluate(() => window.__CLOUDOPS_COCKPIT__.getState());
    assert(stateLeak.scenario === 'memory_leak', 'Scenario switched to memory_leak');
    assert(stateLeak.goldenSignals.saturationRam > 90, `RAM saturation spiked (>90%, got ${stateLeak.goldenSignals.saturationRam}%)`);
    assert(stateLeak.slo.burnRate >= 6.0, `Burn rate reached SEV-2 threshold (>=6.0x, got ${stateLeak.slo.burnRate}x)`);

    await session.click('[data-testid="btn-action-rollback"]');
    await session.sleep(600);
    const stateRollback = await session.evaluate(() => window.__CLOUDOPS_COCKPIT__.getState());
    assert(stateRollback.activeMitigations.includes('rollback'), 'rollback registered in activeMitigations');
    assert(stateRollback.goldenSignals.saturationRam <= 60, `RAM normalized post-rollback (<=60%, got ${stateRollback.goldenSignals.saturationRam}%)`);

    // 7. Test Scenario: Cache Thundering Herd & Warm Cache
    console.log('\n--- 4. Scenario: Cache Thundering Herd ---');
    await session.click('[data-testid="btn-scenario-cache-herd"]');
    await session.sleep(600);
    const stateHerd = await session.evaluate(() => window.__CLOUDOPS_COCKPIT__.getState());
    assert(stateHerd.scenario === 'cache_herd', 'Scenario switched to cache_herd');
    assert(stateHerd.goldenSignals.saturationDb > 85, `DB saturation spiked (>85%, got ${stateHerd.goldenSignals.saturationDb}%)`);

    await session.click('[data-testid="btn-action-clear-cache"]');
    await session.sleep(600);
    const stateCacheCleared = await session.evaluate(() => window.__CLOUDOPS_COCKPIT__.getState());
    assert(stateCacheCleared.activeMitigations.includes('clear_cache'), 'clear_cache registered');
    assert(stateCacheCleared.goldenSignals.saturationDb <= 55, `DB saturation relieved (<=55%, got ${stateCacheCleared.goldenSignals.saturationDb}%)`);

    // 8. Test Scenario: DDoS Bot Wave & Drain Traffic
    console.log('\n--- 5. Scenario: DDoS Bot Wave ---');
    await session.click('[data-testid="btn-scenario-ddos"]');
    await session.sleep(600);

    const stateDDoS = await session.evaluate(() => window.__CLOUDOPS_COCKPIT__.getState());
    assert(stateDDoS.scenario === 'ddos_wave', 'Scenario switched to ddos_wave');
    assert(stateDDoS.goldenSignals.trafficRps > 30000, `Ingress traffic surged (>30k RPS, got ${Math.round(stateDDoS.goldenSignals.trafficRps)})`);

    await session.click('[data-testid="btn-action-drain"]');
    await session.sleep(600);
    const stateDrained = await session.evaluate(() => window.__CLOUDOPS_COCKPIT__.getState());
    assert(stateDrained.goldenSignals.trafficRps < stateDDoS.goldenSignals.trafficRps, 'Traffic throttled/drained successfully');

    // 9. Return to Nominal Scenario
    console.log('\n--- 6. Scenario: Return to Nominal ---');
    await session.click('[data-testid="btn-scenario-nominal"]');
    await session.sleep(600);
    const stateNominal = await session.evaluate(() => window.__CLOUDOPS_COCKPIT__.getState());
    assert(stateNominal.scenario === 'nominal', 'Scenario returned to nominal');
    assert(stateNominal.slo.alertLevel === 'NOMINAL', 'SLO Alert returned to NOMINAL');

    // 10. Interactive Cloud Logging Live-Tail Filters
    console.log('\n--- 7. Cloud Logging Live-Tail Tests ---');
    await session.type('[data-testid="logs-search-input"]', '504');
    await session.sleep(400);
    const logRows504 = await session.evaluate(() => {
      const rows = document.querySelectorAll('[data-testid="log-entry-row"]');
      return Array.from(rows).map(r => r.innerText);
    });
    assert(logRows504.length > 0, `Regex search filtered logs returned ${logRows504.length} rows`);
    assert(logRows504.every(r => r.includes('504')), 'All returned log rows match search query "504"');

    // Clear Regex Search
    await session.evaluate(() => {
      const input = document.querySelector('[data-testid="logs-search-input"]');
      input.value = '';
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await session.sleep(300);

    // Severity Filter Toggles
    await session.click('[data-testid="logs-filter-info"]'); // Toggle INFO off
    await session.sleep(300);
    const rowsWithoutInfo = await session.evaluate(() => {
      const rows = document.querySelectorAll('[data-testid="log-entry-row"]');
      return Array.from(rows).some(r => r.innerText.includes('INFO'));
    });
    assert(!rowsWithoutInfo, 'Toggling INFO filter chip off hides all INFO logs');

    await session.click('[data-testid="logs-filter-info"]'); // Toggle INFO back on
    await session.sleep(300);

    // Stream Controls
    await session.click('[data-testid="logs-stream-toggle"]'); // Pause
    await session.sleep(300);
    const isPaused = await session.evaluate(() => window.__CLOUDOPS_COCKPIT__.getState().logging.isPaused);
    assert(isPaused === true, 'Pause stream toggle pauses logging engine');

    await session.click('[data-testid="logs-clear-btn"]'); // Clear
    await session.sleep(300);
    const rowCountAfterClear = await session.evaluate(() => document.querySelectorAll('[data-testid="log-entry-row"]').length);
    assert(rowCountAfterClear === 0, 'Clear logs button removes all visible rows');

    await session.click('[data-testid="logs-stream-toggle"]'); // Resume
    await session.sleep(600);
    const rowCountAfterResume = await session.evaluate(() => document.querySelectorAll('[data-testid="log-entry-row"]').length);
    assert(rowCountAfterResume > 0, 'Resuming stream repopulates log stream rows');

    // Trace ID Correlation
    await session.click('[data-testid="log-correlate-btn"]');
    await session.sleep(400);
    const traceBadgeVisible = await session.evaluate(() => {
      const container = document.getElementById('active-trace-filter-container');
      return container && container.style.display !== 'none';
    });
    assert(traceBadgeVisible, 'Correlating trace displays active trace filter badge');

    await session.click('[data-testid="btn-clear-trace-filter"]');
    await session.sleep(300);

    // 11. JSON Drawer Inspection
    console.log('\n--- 8. JSON Drawer Inspector Tests ---');
    await session.click('[data-testid="log-entry-row"]');
    await session.sleep(400);
    const isDrawerOpen = await session.evaluate(() => {
      const drawer = document.querySelector('[data-testid="log-detail-drawer"]');
      return drawer && drawer.classList.contains('active');
    });
    assert(isDrawerOpen, 'Clicking log row opens JSON detail drawer');

    const jsonText = await session.evaluate(() => document.getElementById('json-viewer-content')?.textContent);
    assert(jsonText && jsonText.includes('insertId') && jsonText.includes('httpRequest'), 'JSON payload formatted in drawer');

    await session.click('[data-testid="btn-close-drawer"]');
    await session.sleep(300);
    const isDrawerClosed = await session.evaluate(() => {
      const drawer = document.querySelector('[data-testid="log-detail-drawer"]');
      return !drawer.classList.contains('active');
    });
    assert(isDrawerClosed, 'Closing drawer succeeds');

    // 12. Service Node Telemetry Drawer
    console.log('\n--- 9. Service Node Inspector Drawer ---');
    await session.evaluate(() => {
      const node = window.__CLOUDOPS_COCKPIT__.getState().topology.find(n => n.id === 'run_gw');
      window.CockpitEngine.inspectNodeDetails(node);
    });
    await session.sleep(400);

    const isNodeDrawerOpen = await session.evaluate(() => {
      const drawer = document.getElementById('service-node-drawer');
      return drawer && drawer.classList.contains('active');
    });
    assert(isNodeDrawerOpen, 'Node inspector drawer opens when selecting node');

    const nodeTitle = await session.getText('[data-testid="node-details-title"]');
    assert(nodeTitle && nodeTitle.includes('Cloud Run'), `Node details title rendered: "${nodeTitle}"`);

    await session.evaluate(() => window.CockpitEngine.closeAllDrawers());
    await session.sleep(300);

    // 13. Automated SRE Runbook Execution
    console.log('\n--- 10. Automated SRE Runbook Execution Tests ---');
    await session.click('[data-testid="btn-action-runbook"]');
    await session.sleep(500);
    const isModalOpen = await session.evaluate(() => {
      const m = document.querySelector('[data-testid="runbook-terminal-modal"]');
      return m && m.classList.contains('active');
    });
    assert(isModalOpen, 'Runbook button opens terminal execution modal');

    await session.sleep(4500);
    const terminalOutput = await session.evaluate(() => document.getElementById('runbook-terminal-output')?.textContent);
    assert(terminalOutput && terminalOutput.includes('STEP 5/5'), 'Runbook completed all 5 remediation steps');

    await session.evaluate(() => window.CockpitEngine.closeRunbookModal());
    await session.sleep(300);

    // 14. Responsive Viewports Tests
    console.log('\n--- 11. Responsive Viewports Test ---');
    await session.setViewport(400, 800, 1, true);
    await session.sleep(400);
    const mobileErrors = session.getConsoleErrors();
    assert(mobileErrors.length === 0, 'Mobile viewport (400x800) renders cleanly with zero errors');

    await session.setViewport(800, 1024);
    await session.sleep(400);

    await session.setViewport(3840, 2160);
    await session.sleep(400);
    const ultrawideErrors = session.getConsoleErrors();
    assert(ultrawideErrors.length === 0, '4K ultra-wide viewport (3840x2160) renders cleanly with zero errors');

    // 15. Permanent Luminous Icon Visibility Check
    console.log('\n--- 12. Permanent Luminous Icon & Emojis Audit ---');
    const emojisFound = await session.evaluate(() => {
      const bodyText = document.body.innerText;
      const criticalEmojis = ['🛰️', '⚡', '🌊', '🛡️', '📊', '🕸️', '⏱️', '🚨', '🟢', '🔴', '🟠', '🟡', '🟣', '🚀', '🧹', '🔀', '⏪', '📜'];
      return criticalEmojis.every(e => bodyText.includes(e));
    });
    assert(emojisFound, 'All required semantic emojis & luminous icons remain permanently visible in DOM');

    console.log(`\n===============================================================`);
    console.log(`MASTER TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`===============================================================\n`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error('Master Test Execution Error:', err);
    process.exit(1);
  } finally {
    session.close();
  }
}

testCockpitMaster();
