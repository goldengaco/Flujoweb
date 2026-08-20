/**
 * E2E Verification Suite for M1: GCP Serverless Pipeline & Deployer
 */
const { BrowserSession } = require('./runner.js');
const path = require('path');

async function runM1TestSuite() {
  console.log('=== STARTING M1: GCP SERVERLESS PIPELINE E2E TEST SUITE ===');
  const session = new BrowserSession();
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (!condition) {
      console.error(`  ❌ FAILED: ${message}`);
      failed++;
      throw new Error(`Assertion Failed: ${message}`);
    } else {
      console.log(`  ✅ PASSED: ${message}`);
      passed++;
    }
  }

  try {
    await session.launch();
    const filePath = path.resolve(__dirname, '../sistemas/gcp-serverless-pipeline/index.html');
    console.log(`Navigating to: ${filePath}`);
    await session.navigate(filePath);

    // Test 1: Page load & zero console errors
    console.log('\n--- Test 1: Page Load & Clean Console ---');
    const title = await session.evaluate(() => document.title);
    assert(title.includes('Serverless Microservice Pipeline'), `Title matches expected: "${title}"`);
    assert(session.consoleErrors.length === 0, `Console has 0 errors (found: ${session.consoleErrors.length})`);
    assert(session.uncaughtExceptions.length === 0, `0 uncaught exceptions`);

    // Test 2: Verify 5-Stage Stepper & Permanent Emojis
    console.log('\n--- Test 2: 5-Stage Stepper & Permanent Emojis ---');
    const stageBadges = await session.evaluate(() => {
      const badges = [];
      for (let i = 1; i <= 5; i++) {
        const el = document.querySelector(`[data-testid="step-badge-${i}"]`);
        badges.push(el ? el.textContent.trim() : null);
      }
      return badges;
    });
    assert(stageBadges[0] === '📦', 'Stage 1 icon is permanent 📦');
    assert(stageBadges[1] === '🛡️', 'Stage 2 icon is permanent 🛡️');
    assert(stageBadges[2] === '🔑', 'Stage 3 icon is permanent 🔑');
    assert(stageBadges[3] === '🚀', 'Stage 4 icon is permanent 🚀');
    assert(stageBadges[4] === '🔀', 'Stage 5 icon is permanent 🔀');

    // Test 3: Programmatic API & Traffic Splitting Controls
    console.log('\n--- Test 3: Traffic Splitting Controls & Presets ---');
    const apiExists = await session.evaluate(() => typeof window.__GCP_SERVERLESS_PIPELINE__ === 'object');
    assert(apiExists, 'window.__GCP_SERVERLESS_PIPELINE__ is exposed');

    // Test 50/50 preset
    await session.click('[data-testid="preset-50-50"]');
    await session.sleep(200);
    let state = await session.evaluate(() => window.__GCP_SERVERLESS_PIPELINE__.getState());
    assert(state.trafficSplit === 50, `Traffic split set to 50% via button (actual: ${state.trafficSplit})`);

    const splitText = await session.evaluate(() => document.getElementById('traffic-split-text').textContent);
    assert(splitText.includes('v42: 50% | v43: 50%'), `Split display updated: ${splitText}`);

    // Test 100% Blue preset
    await session.click('[data-testid="preset-100-blue"]');
    await session.sleep(200);
    state = await session.evaluate(() => window.__GCP_SERVERLESS_PIPELINE__.getState());
    assert(state.trafficSplit === 100, `Traffic split set to 100% via promote button`);

    // Test 100% Green preset
    await session.click('[data-testid="preset-100-green"]');
    await session.sleep(200);
    state = await session.evaluate(() => window.__GCP_SERVERLESS_PIPELINE__.getState());
    assert(state.trafficSplit === 0, `Traffic split set to 0% (100% green)`);

    // Test Slider input direct
    await session.evaluate(() => {
      const slider = document.getElementById('traffic-slider');
      slider.value = 35;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await session.sleep(200);
    state = await session.evaluate(() => window.__GCP_SERVERLESS_PIPELINE__.getState());
    assert(state.trafficSplit === 35, `Traffic split set to 35% via slider`);

    // Test 4: Cold-Start Latency Gauge & Decomposition
    console.log('\n--- Test 4: Cold-Start Latency Breakdown ---');
    const gaugeValue = await session.evaluate(() => document.getElementById('gauge-number').textContent);
    assert(gaugeValue === '360', `Cold start gauge reports 360 ms`);

    const phaseBreakdown = await session.evaluate(() => {
      return {
        gvisor: document.getElementById('val-phase-gvisor').textContent,
        image: document.getElementById('val-phase-image').textContent,
        secrets: document.getElementById('val-phase-secrets').textContent,
        runtime: document.getElementById('val-phase-runtime').textContent,
        probe: document.getElementById('val-phase-probe').textContent
      };
    });
    assert(phaseBreakdown.gvisor.includes('48'), `gVisor phase is 48ms`);
    assert(phaseBreakdown.image.includes('115'), `Image pull phase is 115ms`);
    assert(phaseBreakdown.secrets.includes('32'), `Secret decryption is 32ms`);
    assert(phaseBreakdown.runtime.includes('153'), `Runtime init is 153ms`);
    assert(phaseBreakdown.probe.includes('12'), `Healthcheck probe is 12ms`);

    // Test 5: MicroVM Instances & Autoscaling Slider
    console.log('\n--- Test 5: MicroVM Instances & Autoscaling ---');
    await session.evaluate(() => {
      const slider = document.getElementById('traffic-load-slider');
      slider.value = 250;
      slider.dispatchEvent(new Event('input', { bubbles: true }));
    });
    await session.sleep(200);
    const instanceCount = await session.evaluate(() => document.querySelectorAll('.instance-card').length);
    assert(instanceCount >= 6, `Autoscaler increased instance pool for 250 RPS (count: ${instanceCount})`);

    // Test 6: Streaming Cloud Logging & Filter Chips
    console.log('\n--- Test 6: Cloud Logging Console & Filters ---');
    const logRowsInitial = await session.evaluate(() => document.querySelectorAll('.log-row').length);
    assert(logRowsInitial > 0, `Log rows rendered initially: ${logRowsInitial}`);

    // Click WARN filter
    await session.click('.filter-chip[data-level="WARN"]');
    await session.sleep(200);
    const warnFilterActive = await session.evaluate(() => {
      const chip = document.querySelector('.filter-chip[data-level="WARN"]');
      return chip.classList.contains('active');
    });
    assert(warnFilterActive, 'WARN filter chip is active');

    // Test JSON Expansion in Log
    await session.click('.filter-chip[data-level="ALL"]');
    await session.sleep(100);
    await session.click('.log-row');
    await session.sleep(150);
    const drawerOpen = await session.evaluate(() => !!document.querySelector('.log-json-drawer'));
    assert(drawerOpen, 'Clicking log row expanded structured JSON drawer');

    // Test 7: Chaos Injections & Rollback
    console.log('\n--- Test 7: Chaos Injections & Instant Rollback ---');
    // Test Fail Build chaos
    await session.click('[data-testid="btn-chaos-build-fail"]');
    await session.sleep(200);
    state = await session.evaluate(() => window.__GCP_SERVERLESS_PIPELINE__.getState());
    assert(state.stageStatus[0] === 'failed', 'Stage 1 marked as failed after Chaos Build Fail');

    const statusBanner = await session.evaluate(() => document.getElementById('pipeline-status-text').textContent);
    assert(statusBanner.includes('FAILED'), `Status banner reflects failure: "${statusBanner}"`);

    // Test Instant Rollback
    await session.click('[data-testid="btn-instant-rollback"]');
    await session.sleep(200);
    state = await session.evaluate(() => window.__GCP_SERVERLESS_PIPELINE__.getState());
    assert(state.trafficSplit === 0, 'Instant rollback shifted 100% traffic to Green (0% blue)');

    // Test 8: Stage Details Modal Drawer
    console.log('\n--- Test 8: Stage Details Drawer ---');
    await session.click('#step-node-2');
    await session.sleep(200);
    const isModalOpen = await session.evaluate(() => document.getElementById('drawer-modal').classList.contains('open'));
    assert(isModalOpen, 'Stage details drawer opened on node click');

    const drawerTitle = await session.evaluate(() => document.getElementById('drawer-title').textContent);
    assert(drawerTitle.includes('Vuln Scan & KMS Signing'), `Drawer title correct: "${drawerTitle}"`);

    await session.click('#btn-close-drawer');
    await session.sleep(200);
    const isModalClosed = await session.evaluate(() => !document.getElementById('drawer-modal').classList.contains('open'));
    assert(isModalClosed, 'Stage details drawer closed properly');

    // Test 9: Responsive Viewports
    console.log('\n--- Test 9: Responsive Viewports (Mobile to 4K) ---');
    // Mobile 400x800
    await session.setViewport(400, 800, 1, true);
    await session.sleep(200);
    let appVisible = await session.evaluate(() => {
      const app = document.querySelector('.app-container');
      const rect = app.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    assert(appVisible, 'App renders correctly at 400px mobile viewport');

    // 4K Ultrawide 3840x2160
    await session.setViewport(3840, 2160, 1, false);
    await session.sleep(200);
    appVisible = await session.evaluate(() => {
      const app = document.querySelector('.app-container');
      const rect = app.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    });
    assert(appVisible, 'App renders correctly at 4K ultrawide viewport');

    console.log(`\n🎉 M1 TEST SUITE SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  } catch (err) {
    console.error('Test execution exception:', err);
    failed++;
  } finally {
    session.close();
  }

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runM1TestSuite();
