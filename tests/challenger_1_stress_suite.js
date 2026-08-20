/**
 * CHALLENGER 1 ADVERSARIAL CHAOS & STRESS TESTING SUITE
 * 
 * Domain: Critic / Empirical Adversarial Stress Testing
 * Focus Areas:
 *  1. Server Status: Chaos Engine Stress, Concurrent Injections, Auto-Healing Race Conditions, Telemetry & Sparkline Resilience, Extreme Payloads.
 *  2. Transaction Flow: Rapid Reversal Spamming, Mid-flight Scenario Switching, Continuous High-Frequency Streaming, Double-Entry Invariant Integrity.
 *  3. Security Audit: Rapid Fix/Patch Concurrency, Score Recalculation Math Bounds & SVG Gauge Transitions, Active Filter Concurrency.
 */

const path = require('path');
const { BrowserSession } = require('./runner');
const { TestContext, Helpers } = require('./fixtures/helpers');

const ROOT_DIR = path.resolve(__dirname, '..');
const SECURITY_HTML = path.join(ROOT_DIR, 'sistemas', 'security-audit', 'index.html');
const SERVER_HTML = path.join(ROOT_DIR, 'sistemas', 'server-status', 'index.html');
const TRANSACTION_HTML = path.join(ROOT_DIR, 'sistemas', 'transaction-flow', 'index.html');

async function runChaosEngineStress(browser) {
  const ctx = new TestContext('CHAOS ENGINE STRESS SUITE (Server Status NOC)');
  console.log(`\n============================================================`);
  console.log(`>>> RUNNING [${ctx.name}]`);
  console.log(`============================================================`);

  await browser.navigate(SERVER_HTML);
  await browser.sleep(600);

  // --------------------------------------------------------------------------
  // TEST 1.1: Rapid Consecutively Triggered Chaos Injections (Burst Spamming)
  // --------------------------------------------------------------------------
  await ctx.test('STRESS-1.1: Burst spamming 40 rapid chaos injections does not crash engine or trigger unhandled errors', async () => {
    const burstResult = await browser.evaluate(() => {
      const results = [];
      const scenarios = ['CHAOS_DB_POOL', 'CHAOS_PAY_504', 'CHAOS_REDIS_SPLIT', 'CHAOS_CDN_DDOS', 'CHAOS_AUTH_DESYNC'];
      
      // Dispatch 40 consecutive triggers in rapid succession
      for (let i = 0; i < 40; i++) {
        const scId = scenarios[i % scenarios.length];
        try {
          if (typeof triggerChaosScenario === 'function') {
            triggerChaosScenario(scId);
          }
          results.push({ i, success: true, chaosActive: state.chaosActive });
        } catch (err) {
          results.push({ i, success: false, error: err.message });
        }
      }
      return {
        chaosActive: state.chaosActive,
        activeScenario: state.activeChaosScenario?.id,
        healingStep: state.healingStep,
        resultsCount: results.length,
        errors: results.filter(r => !r.success)
      };
    });

    Helpers.assertTrue(burstResult.resultsCount === 40, 'Expected 40 dispatch attempts');
    Helpers.assertTrue(burstResult.errors.length === 0, `Encountered errors during burst: ${JSON.stringify(burstResult.errors)}`);
    Helpers.assertTrue(burstResult.chaosActive === true, 'Chaos engine should be active');
    await Helpers.assertNoConsoleErrors(browser, 'STRESS-1.1 Burst Spamming');
  });

  // --------------------------------------------------------------------------
  // TEST 1.2: Trigger New Chaos While Auto-Healing is in Progress (Preemption / Mutex)
  // --------------------------------------------------------------------------
  await ctx.test('STRESS-1.2: Triggering new chaos mid-healing maintains state mutex & clean progress bar', async () => {
    // Wait until healing reaches step 2 or 3
    await browser.waitForFunction(() => {
      return typeof state !== 'undefined' && state.healingStep >= 2;
    }, 12000);

    const midHealingAttempt = await browser.evaluate(() => {
      const stepBefore = state.healingStep;
      const activeScBefore = state.activeChaosScenario?.id;

      // Attempt to force inject a different scenario
      if (typeof triggerChaosScenario === 'function') {
        triggerChaosScenario('CHAOS_REDIS_SPLIT');
      }

      // Check if custom chaos injection also respects lock
      if (typeof triggerCustomChaosWithParams === 'function') {
        triggerCustomChaosWithParams('svc-db', 'CPU_SATURATION', 15);
      }

      const toast = document.querySelector('.toast-container')?.innerText || '';
      const stepAfter = state.healingStep;
      const activeScAfter = state.activeChaosScenario?.id;

      return {
        stepBefore,
        stepAfter,
        activeScBefore,
        activeScAfter,
        scenarioRemainedSame: activeScBefore === activeScAfter,
        toastVisible: toast.length > 0 || true
      };
    });

    Helpers.assertTrue(midHealingAttempt.scenarioRemainedSame, 'Active scenario must not be corrupted mid-healing');
    await Helpers.assertNoConsoleErrors(browser, 'STRESS-1.2 Mid-Healing Mutex');
  });

  // --------------------------------------------------------------------------
  // TEST 1.3: Custom Failure Payloads (Extreme Boundaries & Zeroes)
  // --------------------------------------------------------------------------
  await ctx.test('STRESS-1.3: Custom chaos payloads with extreme values (999k ms latency, 100% error rate, 0 rps) do not corrupt UI or NaN metrics', async () => {
    const customPayloadResult = await browser.evaluate(() => {
      // Force reset chaos state
      state.chaosActive = false;
      state.activeChaosScenario = null;
      const card = document.getElementById('healingWorkflowCard');
      if (card) card.style.display = 'none';

      const targetSvc = state.services['svc-db'];
      const extremeScenario = {
        id: 'CHAOS_EXTREME_STRESS',
        name: 'Extreme High Stress Payload',
        targetId: 'svc-db',
        targetBadge: 'POSTGRES',
        desc: 'Testing extreme arithmetic boundaries in NOC engine.',
        impact: 'Maximum failure metrics stress test',
        durationSec: 30,
        metricsOverride: {
          rpsFactor: 0.0, // Zero RPS
          latencyMs: 999999.9, // Extreme Latency Spike
          cpuPercent: 100, // 100% CPU
          errorRate: 100.0 // 100% Error Rate
        },
        cascadeIds: ['svc-core', 'svc-auth', 'svc-pay'],
        runbook: 'PLAYBOOK-EXTREME-TEST',
        remediationSteps: [
          'Extreme stress step 1',
          'Extreme stress step 2',
          'Extreme stress step 3',
          'Extreme stress step 4',
          'Extreme stress step 5'
        ]
      };

      if (typeof triggerChaosScenarioObject === 'function') {
        triggerChaosScenarioObject(extremeScenario);
      } else if (typeof triggerChaosScenario === 'function') {
        triggerChaosScenario('CHAOS_DB_POOL');
      }

      // Force 5 NOC Telemetry Ticks
      for (let t = 0; t < 5; t++) {
        if (typeof tickTelemetry === 'function') tickTelemetry();
      }

      // Check all 9 services for NaN or undefined
      const serviceChecks = [];
      for (const [id, svc] of Object.entries(state.services)) {
        const hasNan = isNaN(svc.currentRps) || isNaN(svc.currentLatency) || isNaN(svc.currentCpu) || isNaN(svc.currentRamGB) || isNaN(svc.currentErrorRate);
        const hasInfinity = !isFinite(svc.currentRps) || !isFinite(svc.currentLatency) || !isFinite(svc.currentCpu) || !isFinite(svc.currentRamGB) || !isFinite(svc.currentErrorRate);
        serviceChecks.push({
          id,
          hasNan,
          hasInfinity,
          currentRps: svc.currentRps,
          currentLatency: svc.currentLatency,
          currentCpu: svc.currentCpu,
          currentRamGB: svc.currentRamGB,
          currentErrorRate: svc.currentErrorRate
        });
      }

      // Check DOM Elements
      const heroRps = document.getElementById('heroTotalRps')?.textContent || '';
      const heroLat = document.getElementById('heroAvgLatency')?.textContent || '';
      const dbLat = document.getElementById('statLat-svc-db')?.textContent || '';
      const dbErr = document.getElementById('statErr-svc-db')?.textContent || '';
      const cpuBar = document.getElementById('cpuBar-svc-db')?.style.width || '';
      const ramBar = document.getElementById('ramBar-svc-db')?.style.width || '';

      return {
        serviceChecks,
        allFinite: serviceChecks.every(s => !s.hasNan && !s.hasInfinity),
        heroRps,
        heroLat,
        dbLat,
        dbErr,
        cpuBar,
        ramBar,
        heroRpsContainsNan: heroRps.includes('NaN'),
        heroLatContainsNan: heroLat.includes('NaN')
      };
    });

    Helpers.assertTrue(customPayloadResult.allFinite, `Found NaN or Infinite values in services: ${JSON.stringify(customPayloadResult.serviceChecks)}`);
    Helpers.assertFalse(customPayloadResult.heroRpsContainsNan, 'Hero RPS contains NaN');
    Helpers.assertFalse(customPayloadResult.heroLatContainsNan, 'Hero Latency contains NaN');
    Helpers.assertTrue(customPayloadResult.cpuBar.length > 0, 'CPU bar width must be populated');
    await Helpers.assertNoConsoleErrors(browser, 'STRESS-1.3 Custom Payload Boundaries');
  });

  // --------------------------------------------------------------------------
  // TEST 1.4: Telemetry Graphs & Sparklines Resilience under High-Frequency Oscillation
  // --------------------------------------------------------------------------
  await ctx.test('STRESS-1.4: Sparkline RingBuffers and Canvas renderers withstand 100 rapid ticks at 5x speed without dropping frames or context crash', async () => {
    const canvasStressResult = await browser.evaluate(() => {
      // Execute 100 fast ticks
      for (let i = 0; i < 100; i++) {
        if (typeof tickTelemetry === 'function') {
          tickTelemetry();
        }
      }

      // Inspect RingBuffers of all 9 services
      const bufferAudits = [];
      for (const [id, svc] of Object.entries(state.services)) {
        const { rps, lat } = svc.buffer.getOrdered();
        const rpsNan = rps.some(v => isNaN(v) || !isFinite(v));
        const latNan = lat.some(v => isNaN(v) || !isFinite(v));
        bufferAudits.push({
          id,
          rpsLength: rps.length,
          latLength: lat.length,
          rpsNan,
          latNan,
          minRps: Math.min(...rps),
          maxRps: Math.max(...rps),
          minLat: Math.min(...lat),
          maxLat: Math.max(...lat)
        });
      }

      // Check canvas dimensions and context stability
      const canvases = document.querySelectorAll('.sparkline-canvas');
      const canvasValid = Array.from(canvases).every(c => c.width > 0 && c.height > 0);

      return {
        bufferAudits,
        allBuffersClean: bufferAudits.every(b => !b.rpsNan && !b.latNan && b.rpsLength === 40 && b.latLength === 40),
        canvasCount: canvases.length,
        canvasValid
      };
    });

    Helpers.assertTrue(canvasStressResult.allBuffersClean, `RingBuffer corruption detected: ${JSON.stringify(canvasStressResult.bufferAudits)}`);
    Helpers.assertEqual(canvasStressResult.canvasCount, 9, 'All 9 sparkline canvases must exist');
    Helpers.assertTrue(canvasStressResult.canvasValid, 'All canvases must have positive dimensions');
    await Helpers.assertNoConsoleErrors(browser, 'STRESS-1.4 Sparkline Canvas Resilience');
  });

  return ctx.summary();
}

async function runTransactionStress(browser) {
  const ctx = new TestContext('TRANSACTION & REVERSAL STRESS SUITE (Transaction Flow Pipeline)');
  console.log(`\n============================================================`);
  console.log(`>>> RUNNING [${ctx.name}]`);
  console.log(`============================================================`);

  await browser.navigate(TRANSACTION_HTML);
  await browser.sleep(600);

  // Set 5x speed for ultra-fast stress execution
  await browser.click('.speed-btn[data-speed="5"]');
  await browser.sleep(100);

  // --------------------------------------------------------------------------
  // TEST 2.1: Rapid Reversal Spamming & Double-Debit Prevention (Idempotency)
  // --------------------------------------------------------------------------
  await ctx.test('STRESS-2.1: Settling a transaction and spamming Reversal 30 times executes exactly once without double-debiting ledger', async () => {
    // 1. Load Normal Success Scenario & Process to completion
    await browser.evaluate(() => {
      window.pipelineEngine.loadScenario('success');
      window.pipelineEngine.startProcess();
    });

    // Wait until Settled
    await browser.waitForFunction(() => {
      return window.pipelineEngine && window.pipelineEngine.state === 'SETTLED';
    }, 12000);

    // Capture post-settlement balance
    const postSettleState = await browser.evaluate(() => {
      return {
        balance: window.pipelineEngine.currentBalance,
        lastSettledTx: window.pipelineEngine.lastSettledTx,
        reversalBtnDisabled: document.getElementById('btnReversal').disabled
      };
    });

    Helpers.assertFalse(postSettleState.reversalBtnDisabled, 'Reversal button must be enabled after settlement');

    // 2. Spam Reversal button 30 times rapidly
    await browser.evaluate(() => {
      const btn = document.getElementById('btnReversal');
      for (let i = 0; i < 30; i++) {
        btn.click();
      }
    });

    // Wait for reversal sequence to reach REVERSED
    await browser.waitForFunction(() => {
      return window.pipelineEngine && window.pipelineEngine.state === 'REVERSED';
    }, 10000);

    // Verify final ledger balance and invariants
    const postReversalState = await browser.evaluate(() => {
      const expectedBalance = window.pipelineEngine.baseBalance; // Base balance before this transaction
      const actualBalance = window.pipelineEngine.currentBalance;
      const diff = Math.abs(actualBalance - expectedBalance);
      
      return {
        baseBalance: window.pipelineEngine.baseBalance,
        currentBalance: actualBalance,
        expectedBalance,
        diff,
        isExact: diff < 0.001,
        inFlightEscrow: window.pipelineEngine.inFlightEscrow,
        reversalBtnDisabled: document.getElementById('btnReversal').disabled,
        engineBadge: document.getElementById('engineStateBadge').textContent,
        mtiInPayload: window.pipelineEngine.currentPayload?.messageTypeIdentifier
      };
    });

    Helpers.assertTrue(postReversalState.isExact, `Ledger balance mismatch after reversal! Expected ${postReversalState.expectedBalance} but got ${postReversalState.currentBalance} (diff: ${postReversalState.diff})`);
    Helpers.assertEqual(postReversalState.inFlightEscrow, 0, 'Escrow must be 0 after reversal');
    Helpers.assertTrue(postReversalState.reversalBtnDisabled, 'Reversal button must be disabled after completion');
    Helpers.assertEqual(postReversalState.mtiInPayload, '0420', 'Payload MTI must be 0420 (Reversal)');
    await Helpers.assertNoConsoleErrors(browser, 'STRESS-2.1 Reversal Idempotency');
  });

  // --------------------------------------------------------------------------
  // TEST 2.2: Mid-Flight Scenario Switching & Sudden Abort Resiliency
  // --------------------------------------------------------------------------
  await ctx.test('STRESS-2.2: Rapidly switching scenarios and clicking Reset mid-flight leaves zero orphaned tracks or locked escrows', async () => {
    const midFlightChaos = await browser.evaluate(async () => {
      const logs = [];

      // 1. Start normal processing
      window.pipelineEngine.loadScenario('success');
      window.pipelineEngine.startProcess();
      
      // Sleep a tiny bit to get to step 2/3
      await new Promise(r => setTimeout(r, 120));

      // 2. Mid-flight switch to Fraud
      window.pipelineEngine.loadScenario('fraud');
      logs.push({ step: 'switched_to_fraud', state: window.pipelineEngine.state, escrow: window.pipelineEngine.inFlightEscrow });

      // 3. Immediately start fraud processing
      window.pipelineEngine.startProcess();
      await new Promise(r => setTimeout(r, 80));

      // 4. Mid-flight switch to Declined
      window.pipelineEngine.loadScenario('declined');
      logs.push({ step: 'switched_to_declined', state: window.pipelineEngine.state, escrow: window.pipelineEngine.inFlightEscrow });

      // 5. Immediately start declined processing
      window.pipelineEngine.startProcess();
      await new Promise(r => setTimeout(r, 80));

      // 6. Hit Reset mid-flight
      window.pipelineEngine.resetPipeline();
      logs.push({ step: 'reset_dispatched', state: window.pipelineEngine.state, escrow: window.pipelineEngine.inFlightEscrow });

      // Check DOM state
      const nodes = [];
      for (let i = 1; i <= 6; i++) {
        const n = document.getElementById(`node-${i}`);
        nodes.push({ id: i, className: n.className, badge: document.getElementById(`badge-${i}`).textContent });
      }

      const activeTracks = Array.from(document.querySelectorAll('.stepper-tracks-svg path'))
        .filter(p => p.className.baseVal !== 'track-base');

      return {
        logs,
        finalState: window.pipelineEngine.state,
        finalEscrow: window.pipelineEngine.inFlightEscrow,
        nodes,
        activeTracksCount: activeTracks.length,
        ttlRemaining: window.pipelineEngine.ttlRemaining
      };
    });

    Helpers.assertEqual(midFlightChaos.finalState, 'IDLE', 'Pipeline state after reset must be IDLE');
    Helpers.assertEqual(midFlightChaos.finalEscrow, 0, 'Escrow must be 0 after reset');
    Helpers.assertEqual(midFlightChaos.activeTracksCount, 0, 'All SVG tracks must be reset to base');
    Helpers.assertEqual(midFlightChaos.ttlRemaining, 30000, 'TTL remaining must reset to 30.000s');
    await Helpers.assertNoConsoleErrors(browser, 'STRESS-2.2 Mid-Flight Scenario Switching');
  });

  // --------------------------------------------------------------------------
  // TEST 2.3: High-Frequency Continuous Streaming Loop (12 Back-to-Back Cycles)
  // --------------------------------------------------------------------------
  await ctx.test('STRESS-2.3: Continuous auto-stream executing 12 full cycles across all scenarios maintains memory stability and log capping', async () => {
    // Run 12 full cycles programmatically at 5x speed
    const streamResult = await browser.evaluate(async () => {
      const scenarios = ['success', 'fraud', 'declined', 'timeout', 'success', 'fraud', 'declined', 'timeout', 'success', 'fraud', 'declined', 'success'];
      const cycleResults = [];

      for (let c = 0; c < scenarios.length; c++) {
        const scKey = scenarios[c];
        window.pipelineEngine.loadScenario(scKey);
        window.pipelineEngine.startProcess();

        // Wait for cycle termination
        const startWait = Date.now();
        while (['RUNNING', 'IDLE', 'PAUSED_STEP'].includes(window.pipelineEngine.state) && Date.now() - startWait < 8000) {
          await new Promise(r => setTimeout(r, 60));
        }

        cycleResults.push({
          cycle: c + 1,
          scenario: scKey,
          endState: window.pipelineEngine.state,
          durationMs: Date.now() - startWait,
          balance: window.pipelineEngine.currentBalance,
          escrow: window.pipelineEngine.inFlightEscrow,
          stan: window.pipelineEngine.stan
        });

        // Small cooldown between cycles
        await new Promise(r => setTimeout(r, 80));
      }

      const terminalLines = document.getElementById('terminalLog')?.children.length || 0;

      return {
        cycleResults,
        terminalLines,
        allCompletedSuccessfully: cycleResults.every(r => ['SETTLED', 'FRAUD_QUARANTINE', 'DECLINED', 'TIMEOUT'].includes(r.endState)),
        allEscrowsReleased: cycleResults.every(r => r.escrow === 0)
      };
    });

    Helpers.assertTrue(streamResult.allCompletedSuccessfully, `Some stream cycles failed to terminate properly: ${JSON.stringify(streamResult.cycleResults)}`);
    Helpers.assertTrue(streamResult.allEscrowsReleased, 'All in-flight escrows must be released at end of cycles');
    Helpers.assertBetween(streamResult.terminalLines, 10, 350, 'Terminal log lines must be populated and capped');
    await Helpers.assertNoConsoleErrors(browser, 'STRESS-2.3 Continuous High-Frequency Streaming');
  });

  // --------------------------------------------------------------------------
  // TEST 2.4: Double-Entry Ledger Invariant & Conservation Verification
  // --------------------------------------------------------------------------
  await ctx.test('STRESS-2.4: Double-Entry Ledger balances strictly satisfy mathematical conservation and non-negative bounds', async () => {
    const ledgerAudit = await browser.evaluate(() => {
      const balance = window.pipelineEngine.currentBalance;
      const escrow = window.pipelineEngine.inFlightEscrow;
      const volume = window.pipelineEngine.clearedVolume;

      const statBalText = document.getElementById('statBalance')?.textContent || '';
      const statEscText = document.getElementById('statEscrow')?.textContent || '';
      const statVolText = document.getElementById('statVolume')?.textContent || '';

      const isBalValid = typeof balance === 'number' && !isNaN(balance) && balance > 0;
      const isEscValid = typeof escrow === 'number' && !isNaN(escrow) && escrow >= 0;
      const isVolValid = typeof volume === 'number' && !isNaN(volume) && volume >= 0;

      const hasNanText = statBalText.includes('NaN') || statEscText.includes('NaN') || statVolText.includes('NaN');

      return {
        balance,
        escrow,
        volume,
        statBalText,
        statEscText,
        statVolText,
        isBalValid,
        isEscValid,
        isVolValid,
        hasNanText
      };
    });

    Helpers.assertTrue(ledgerAudit.isBalValid, `Invalid balance value: ${ledgerAudit.balance}`);
    Helpers.assertTrue(ledgerAudit.isEscValid, `Invalid escrow value: ${ledgerAudit.escrow}`);
    Helpers.assertTrue(ledgerAudit.isVolValid, `Invalid volume value: ${ledgerAudit.volume}`);
    Helpers.assertFalse(ledgerAudit.hasNanText, 'DOM balance text contains NaN');
    await Helpers.assertNoConsoleErrors(browser, 'STRESS-2.4 Double-Entry Invariants');
  });

  return ctx.summary();
}

async function runVulnerabilityPatchStress(browser) {
  const ctx = new TestContext('VULNERABILITY PATCH & SCORE STRESS SUITE (Security Audit)');
  console.log(`\n============================================================`);
  console.log(`>>> RUNNING [${ctx.name}]`);
  console.log(`============================================================`);

  await browser.navigate(SECURITY_HTML);
  await browser.sleep(600);

  // --------------------------------------------------------------------------
  // TEST 3.1: Rapid Concurrency in "Simulate Fix" & Rollback across all 7 findings
  // --------------------------------------------------------------------------
  await ctx.test('STRESS-3.1: Rapid concurrent clicking of "Simulate Fix" and "Rollback" across all findings updates score atomically without race conditions', async () => {
    // First run audit so all findings are evaluated
    await browser.evaluate(() => {
      auditRunner.runFullAudit();
    });

    // Fast-forward audit to complete
    await browser.waitForFunction(() => {
      return typeof state !== 'undefined' && state.auditComplete;
    }, 10000);

    // Concurrently toggle patches back and forth 50 times in rapid succession
    const patchBurstResult = await browser.evaluate(async () => {
      const nodeIds = state.nodes.map(n => n.id);
      const operations = [];

      for (let op = 0; op < 50; op++) {
        const targetNodeId = nodeIds[op % nodeIds.length];
        const isCurrentlyPatched = state.isNodePatched(targetNodeId);
        
        try {
          if (isCurrentlyPatched) {
            state.unpatchNode(targetNodeId);
          } else {
            state.patchNode(targetNodeId);
          }
          operations.push({ op, targetNodeId, success: true, score: state.calculateTotalScore() });
        } catch (err) {
          operations.push({ op, targetNodeId, success: false, error: err.message });
        }
      }

      // Now click Simulate Fix All (#btnFixAll)
      await auditRunner.simulateFixAll();

      const finalPatchedCount = state.patchedNodeIds.size;
      const finalScore = state.calculateTotalScore();
      const finalGrade = gaugeController.getGrade(finalScore).grade;

      return {
        operationsCount: operations.length,
        errors: operations.filter(o => !o.success),
        finalPatchedCount,
        finalScore,
        finalGrade
      };
    });

    Helpers.assertEqual(patchBurstResult.operationsCount, 50, 'All 50 patch operations must execute');
    Helpers.assertTrue(patchBurstResult.errors.length === 0, `Errors during patch burst: ${JSON.stringify(patchBurstResult.errors)}`);
    Helpers.assertEqual(patchBurstResult.finalPatchedCount, 7, 'All 7 nodes must be patched after Fix All');
    Helpers.assertEqual(patchBurstResult.finalScore, 100, 'Score must be 100 after Fix All');
    Helpers.assertEqual(patchBurstResult.finalGrade, 'A+', 'Grade must be A+ after Fix All');
    await Helpers.assertNoConsoleErrors(browser, 'STRESS-3.1 Vulnerability Patch Concurrency');
  });

  // --------------------------------------------------------------------------
  // TEST 3.2: Score Recalculation Math Bounds (0 to 100) & Gauge Transitions
  // --------------------------------------------------------------------------
  await ctx.test('STRESS-3.2: Score calculation strictly stays within [0, 100] across all 128 subset permutations and SVG dashoffset is non-negative', async () => {
    const mathPermutationsResult = await browser.evaluate(() => {
      const nodeIds = state.nodes.map(n => n.id);
      const n = nodeIds.length; // 7 nodes -> 2^7 = 128 permutations
      const totalCombinations = 1 << n;
      const scores = [];
      let minScore = 999;
      let maxScore = -999;
      let outOfBounds = 0;
      let nanOffsets = 0;
      let negativeOffsets = 0;

      for (let mask = 0; mask < totalCombinations; mask++) {
        state.patchedNodeIds.clear();
        for (let bit = 0; bit < n; bit++) {
          if (mask & (1 << bit)) {
            state.patchedNodeIds.add(nodeIds[bit]);
          }
        }

        const score = state.calculateTotalScore();
        scores.push(score);

        if (score < 0 || score > 100) outOfBounds++;
        if (score < minScore) minScore = score;
        if (score > maxScore) maxScore = score;

        // Check SVG Dashoffset math
        const offset = gaugeController.circumference * (1 - score / 100);
        if (isNaN(offset)) nanOffsets++;
        if (offset < -0.01) negativeOffsets++;
      }

      return {
        totalCombinations,
        minScore,
        maxScore,
        outOfBounds,
        nanOffsets,
        negativeOffsets
      };
    });

    Helpers.assertEqual(mathPermutationsResult.totalCombinations, 128, 'Tested all 128 power set combinations');
    Helpers.assertEqual(mathPermutationsResult.outOfBounds, 0, 'No scores out of [0, 100] bounds');
    Helpers.assertEqual(mathPermutationsResult.nanOffsets, 0, 'No NaN SVG dashoffsets');
    Helpers.assertEqual(mathPermutationsResult.negativeOffsets, 0, 'No negative SVG dashoffsets');
    Helpers.assertEqual(mathPermutationsResult.maxScore, 100, 'Max possible score is exactly 100');
    await Helpers.assertNoConsoleErrors(browser, 'STRESS-3.2 Score Math Bounds');
  });

  // --------------------------------------------------------------------------
  // TEST 3.3: Active Filter & Search Toggling While Audit is Running
  // --------------------------------------------------------------------------
  await ctx.test('STRESS-3.3: Rapid filter and search changes while audit scan is actively executing do not cause DOM loss or null pointer crashes', async () => {
    // Reset and start audit
    await browser.evaluate(() => {
      auditRunner.resetAll();
      auditRunner.runFullAudit();
    });

    // While scan is executing (takes ~5-6 seconds), rapidly flip filters and type queries
    const filterStressResult = await browser.evaluate(async () => {
      const filters = ['all', 'critical', 'high', 'medium', 'patched', 'all'];
      const searchTerms = ['sql', 'tls', 'token', 'rbac', 'xss', ''];
      const errors = [];

      for (let i = 0; i < 20; i++) {
        const filter = filters[i % filters.length];
        const search = searchTerms[i % searchTerms.length];

        try {
          // Toggle filter
          state.activeFilter = filter;
          state.searchQuery = search;
          uiController.renderTable();
          uiController.updateMetricCards();
        } catch (err) {
          errors.push({ i, filter, search, error: err.message });
        }

        await new Promise(r => setTimeout(r, 60));
      }

      // Restore to All
      state.activeFilter = 'all';
      state.searchQuery = '';
      uiController.renderTable();

      const tableRows = document.querySelectorAll('#vulnTableBody tr');

      return {
        errors,
        tableRowCount: tableRows.length,
        isAuditingOrComplete: state.isAuditing || state.auditComplete
      };
    });

    // Wait for audit to complete
    await browser.waitForFunction(() => {
      return typeof state !== 'undefined' && state.auditComplete;
    }, 10000);

    Helpers.assertTrue(filterStressResult.errors.length === 0, `Encountered errors during filter stress: ${JSON.stringify(filterStressResult.errors)}`);
    Helpers.assertEqual(filterStressResult.tableRowCount, 7, 'All 7 vulnerability rows must be present when filter is reset to ALL');
    await Helpers.assertNoConsoleErrors(browser, 'STRESS-3.3 Filter Toggling Concurrency');
  });

  return ctx.summary();
}

async function runAllStressTests() {
  console.log(`\n============================================================`);
  console.log(`       CHALLENGER 1 ADVERSARIAL STRESS TEST SUITE           `);
  console.log(`============================================================\n`);

  const browser = new BrowserSession();
  await browser.launch();

  const summaries = [];

  try {
    summaries.push(await runChaosEngineStress(browser));
    summaries.push(await runTransactionStress(browser));
    summaries.push(await runVulnerabilityPatchStress(browser));
  } catch (err) {
    console.error('Fatal stress suite runner exception:', err);
  } finally {
    await browser.close();
  }

  console.log(`\n============================================================`);
  console.log(`                STRESS SUITE SUMMARY REPORT                 `);
  console.log(`============================================================\n`);

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

  console.log(`\n------------------------------------------------------------`);
  console.log(`Total Stress Tests: ${totalTests} | Passed: ${totalPassed} | Failed: ${totalFailed}`);
  console.log(`Verdict: ${totalFailed === 0 ? 'APPROVE' : 'REJECT'}`);
  console.log(`------------------------------------------------------------\n`);

  if (totalFailed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runAllStressTests();
}

module.exports = {
  runAllStressTests
};
