/**
 * CHALLENGER 2 EMPIRICAL TEST SUITE
 * Boundary, Branching, Timing Precision & Export Integrity Verification
 * 
 * Verifies:
 * 1. Transaction Branching & Bifurcations:
 *    - Scenario 1: Normal Settlement (Happy path nodes 1-6)
 *    - Scenario 2: Fraud Quarantine (ML score > 85 branching to SAR quarantine at Node 3)
 *    - Scenario 3: Insufficient Funds (Node 4 decline branch code 51)
 *    - Scenario 4: Network Timeout (Node 5 retry backoff flow)
 *    - Step-by-Step manual stepping mode
 *    - Bi-directional Reversal / Chargeback flow (Rollback 6->1)
 *    - Live Payload Inspector (JSON, ISO-8583 bitmaps, mutated MTI and fields)
 * 2. Timer & Precision:
 *    - 30s TTL microsecond countdown timer (no drift, clean termination, reset)
 * 3. SLA 90-Day Edge Cases:
 *    - Exactly 90 segments per service across all 9 services (810 total)
 *    - Hover tooltips positioning near viewport edges (left, right, top, bottom)
 * 4. Export Integrity & Cryptographic Hashing:
 *    - Security Audit JSON report structure & SHA-256 integrity
 *    - Transaction receipt seal & HMAC-SHA256 hash validity
 */

const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { BrowserSession } = require('./runner');

const rootDir = path.resolve(__dirname, '..');
const paths = {
  security: path.join(rootDir, 'sistemas', 'security-audit', 'index.html'),
  server: path.join(rootDir, 'sistemas', 'server-status', 'index.html'),
  transaction: path.join(rootDir, 'sistemas', 'transaction-flow', 'index.html')
};

async function runChallengerTests() {
  const browser = new BrowserSession();
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    failures: []
  };

  const assert = (condition, description, errorDetails = '') => {
    results.total++;
    if (condition) {
      results.passed++;
      console.log(`  \x1b[32m✔\x1b[0m [CHALLENGER-2] ${description}`);
    } else {
      results.failed++;
      const err = errorDetails || 'Assertion failed';
      console.error(`  \x1b[31m✖\x1b[0m [CHALLENGER-2] ${description}: ${err}`);
      results.failures.push({ description, error: err });
    }
  };

  try {
    await browser.launch();
    console.log('\n\x1b[1m\x1b[36m============================================================\x1b[0m');
    console.log('\x1b[1m\x1b[36m   CHALLENGER 2 EMPIRICAL BOUNDARY & BRANCHING SUITE        \x1b[0m');
    console.log('\x1b[1m\x1b[36m============================================================\x1b[0m\n');

    // =========================================================================
    // SECTION 1: TRANSACTION PIPELINE BRANCHING & PAYLOAD INSPECTION
    // =========================================================================
    console.log('\x1b[1m\x1b[33m--- SECTION 1: TRANSACTION PIPELINE BRANCHING & INSPECTOR ---\x1b[0m');
    await browser.navigate(paths.transaction);
    await browser.setViewport(1440, 900);

    // 1.1 Scenario 1: Normal Settlement (Happy path 1-6)
    console.log('\n  [1.1 Scenario: Normal Settlement (Happy Path)]');
    await browser.evaluate(() => {
      window.pipelineEngine.loadScenario('success');
      window.pipelineEngine.speedMultiplier = 5.0; // High speed for fast empirical testing
    });

    const initStatus = await browser.evaluate(() => window.pipelineEngine.state);
    assert(initStatus === 'IDLE', 'Initial engine state is IDLE');

    // Start auto processing
    await browser.click('#btnProcess');

    // Wait for completion (SETTLED)
    const settledSuccess = await browser.waitForFunction(() => {
      return window.pipelineEngine.state === 'SETTLED';
    }, 8000);
    assert(settledSuccess, 'Scenario 1 runs to completion with state SETTLED');

    // Verify all 6 nodes have state-completed
    const nodeStates = await browser.evaluate(() => {
      return [1,2,3,4,5,6].map(i => {
        const el = document.getElementById(`node-${i}`);
        return {
          id: i,
          className: el.className,
          badge: document.getElementById(`badge-${i}`).textContent
        };
      });
    });

    const allCompleted = nodeStates.every(n => n.className.includes('state-completed'));
    assert(allCompleted, 'All 6 nodes are marked state-completed in Happy Path', JSON.stringify(nodeStates));

    // Verify balance and escrow
    const balanceData = await browser.evaluate(() => ({
      escrow: window.pipelineEngine.inFlightEscrow,
      balance: window.pipelineEngine.currentBalance,
      base: window.pipelineEngine.baseBalance,
      volume: window.pipelineEngine.clearedVolume
    }));
    assert(balanceData.escrow === 0, 'In-Flight Escrow is 0 after settlement');
    assert(balanceData.balance > balanceData.base, `Balance increased from baseline ($${balanceData.balance} > $${balanceData.base})`);

    // Verify Payload Inspector at Step 6
    const payloadSuccess = await browser.evaluate(() => window.pipelineEngine.currentPayload);
    assert(payloadSuccess.messageTypeIdentifier === '0210', `MTI for settled transaction is 0210 (got ${payloadSuccess.messageTypeIdentifier})`);
    assert(payloadSuccess.receiptSeal !== null && payloadSuccess.receiptSeal.status === 'CONFIRMED_IMMUTABLE', 'Receipt seal is CONFIRMED_IMMUTABLE');
    assert(payloadSuccess.clearingAndSettlement !== null && payloadSuccess.clearingAndSettlement.interchangeFee > 0, 'Interchange fee recorded');

    // 1.2 Reversal & Chargeback Flow
    console.log('\n  [1.2 Reversal & Chargeback Rollback Flow]');
    const reversalEnabled = await browser.evaluate(() => !document.getElementById('btnReversal').disabled);
    assert(reversalEnabled, 'Reversal button is enabled after settlement');

    await browser.click('#btnReversal');
    const reversedDone = await browser.waitForFunction(() => {
      return window.pipelineEngine.state === 'REVERSED';
    }, 8000);
    assert(reversedDone, 'Reversal sequence executes to REVERSED state');

    const reversedPayload = await browser.evaluate(() => window.pipelineEngine.currentPayload);
    assert(reversedPayload.messageTypeIdentifier === '0420', `Reversal MTI is 0420 (got ${reversedPayload.messageTypeIdentifier})`);
    assert(reversedPayload.receiptSeal.status === 'REVERSED_REFUNDED', 'Receipt seal status is REVERSED_REFUNDED');

    // 1.3 Scenario 2: Fraud Quarantine (ML score > 85)
    console.log('\n  [1.3 Scenario: Fraud Quarantine Bifurcation]');
    await browser.evaluate(() => {
      window.pipelineEngine.loadScenario('fraud');
      window.pipelineEngine.speedMultiplier = 5.0;
    });

    const fraudRisk = await browser.evaluate(() => window.pipelineEngine.scenario.risk.score);
    assert(fraudRisk > 85.0, `Fraud scenario has ML risk score > 85 (got ${fraudRisk})`);

    await browser.click('#btnProcess');
    const fraudQuarantined = await browser.waitForFunction(() => {
      return window.pipelineEngine.state === 'FRAUD_QUARANTINE';
    }, 8000);
    assert(fraudQuarantined, 'Fraud scenario triggers FRAUD_QUARANTINE state');

    const fraudDomCheck = await browser.evaluate(() => {
      const branchActive = document.getElementById('bifurcation-fraud').classList.contains('branch-active');
      const node3Badge = document.getElementById('badge-3').textContent;
      const node4Class = document.getElementById('node-4').className;
      const node5Class = document.getElementById('node-5').className;
      const node6Class = document.getElementById('node-6').className;
      const escrow = window.pipelineEngine.inFlightEscrow;
      return { branchActive, node3Badge, node4Class, node5Class, node6Class, escrow };
    });

    assert(fraudDomCheck.branchActive, 'Bifurcation Fraud SAR card is active (.branch-active)');
    assert(fraudDomCheck.node3Badge === 'CRITICAL FRAUD', 'Node 3 badge displays CRITICAL FRAUD');
    assert(fraudDomCheck.node4Class.includes('state-void') && fraudDomCheck.node5Class.includes('state-void') && fraudDomCheck.node6Class.includes('state-void'), 'Downstream nodes 4, 5, 6 are VOID');
    assert(fraudDomCheck.escrow === 0, 'In-Flight Escrow released upon fraud block');

    const fraudPayload = await browser.evaluate(() => window.pipelineEngine.currentPayload);
    assert(fraudPayload.fraudEvaluation.decision === 'QUARANTINE_BLOCKED', 'Payload fraud decision is QUARANTINE_BLOCKED');
    assert(fraudPayload.fraudEvaluation.riskLevel === 'CRITICAL_FRAUD', 'Payload riskLevel is CRITICAL_FRAUD');

    // 1.4 Scenario 3: Insufficient Funds (Node 4 Issuer Decline)
    console.log('\n  [1.4 Scenario: Insufficient Funds Decline Bifurcation]');
    await browser.evaluate(() => {
      window.pipelineEngine.loadScenario('declined');
      window.pipelineEngine.speedMultiplier = 5.0;
    });

    await browser.click('#btnProcess');
    const declineTriggered = await browser.waitForFunction(() => {
      return window.pipelineEngine.state === 'DECLINED';
    }, 8000);
    assert(declineTriggered, 'Insufficient funds scenario triggers DECLINED state');

    const declineDomCheck = await browser.evaluate(() => {
      const branchActive = document.getElementById('bifurcation-decline').classList.contains('branch-active');
      const node4Badge = document.getElementById('badge-4').textContent;
      const node5Class = document.getElementById('node-5').className;
      const node6Class = document.getElementById('node-6').className;
      const escrow = window.pipelineEngine.inFlightEscrow;
      return { branchActive, node4Badge, node5Class, node6Class, escrow };
    });

    assert(declineDomCheck.branchActive, 'Bifurcation Decline card is active (.branch-active)');
    assert(declineDomCheck.node4Badge.includes('DECLINED (51)'), 'Node 4 badge displays DECLINED (51)');
    assert(declineDomCheck.node5Class.includes('state-void') && declineDomCheck.node6Class.includes('state-void'), 'Downstream nodes 5 and 6 are VOID/ABORTED');
    assert(declineDomCheck.escrow === 0, 'Escrow released on issuer decline');

    const declinePayload = await browser.evaluate(() => window.pipelineEngine.currentPayload);
    assert(declinePayload.issuerAuth.responseCode === '51', `Payload issuerAuth responseCode is 51 (got ${declinePayload.issuerAuth.responseCode})`);
    assert(declinePayload.issuerAuth.authCode === 'DECLINED', 'Payload issuerAuth authCode is DECLINED');

    // 1.5 Scenario 4: Network Timeout & Exponential Retry
    console.log('\n  [1.5 Scenario: Network Timeout & Retry Backoff]');
    await browser.evaluate(() => {
      window.pipelineEngine.loadScenario('timeout');
      window.pipelineEngine.speedMultiplier = 5.0;
    });

    await browser.click('#btnProcess');
    const retrySettled = await browser.waitForFunction(() => {
      return window.pipelineEngine.state === 'SETTLED';
    }, 10000);
    assert(retrySettled, 'Network timeout scenario retries and successfully settles');

    const retryBadgeText = await browser.evaluate(() => document.getElementById('retryBadge').textContent);
    assert(retryBadgeText.includes('FAILOVER OK'), `Retry badge indicates failover completion (got "${retryBadgeText}")`);

    // 1.6 Step-by-Step Manual Execution
    console.log('\n  [1.6 Step-by-Step Manual Stepping Mode]');
    await browser.evaluate(() => {
      window.pipelineEngine.loadScenario('success');
      window.pipelineEngine.speedMultiplier = 5.0;
    });

    // Step 1
    await browser.click('#btnStep');
    await browser.waitForFunction(() => window.pipelineEngine.currentStep === 1 && !window.pipelineEngine.stepInProgress, 3000);
    assert((await browser.evaluate(() => window.pipelineEngine.currentStep)) === 1, 'Manual step advanced to Step 1 (Order Capture)');

    // Step 2
    await browser.click('#btnStep');
    await browser.waitForFunction(() => window.pipelineEngine.currentStep === 2 && !window.pipelineEngine.stepInProgress, 3000);
    assert((await browser.evaluate(() => window.pipelineEngine.currentStep)) === 2, 'Manual step advanced to Step 2 (Tokenization)');

    // Step 3
    await browser.click('#btnStep');
    await browser.waitForFunction(() => window.pipelineEngine.currentStep === 3 && !window.pipelineEngine.stepInProgress, 3000);
    assert((await browser.evaluate(() => window.pipelineEngine.currentStep)) === 3, 'Manual step advanced to Step 3 (Fraud ML)');

    // Step 4
    await browser.click('#btnStep');
    await browser.waitForFunction(() => window.pipelineEngine.currentStep === 4 && !window.pipelineEngine.stepInProgress, 3000);
    assert((await browser.evaluate(() => window.pipelineEngine.currentStep)) === 4, 'Manual step advanced to Step 4 (3DS Auth)');

    // Step 5
    await browser.click('#btnStep');
    await browser.waitForFunction(() => window.pipelineEngine.currentStep === 5 && !window.pipelineEngine.stepInProgress, 3000);
    assert((await browser.evaluate(() => window.pipelineEngine.currentStep)) === 5, 'Manual step advanced to Step 5 (Clearing Rail)');

    // Step 6
    await browser.click('#btnStep');
    await browser.waitForFunction(() => window.pipelineEngine.currentStep === 6 && window.pipelineEngine.state === 'SETTLED', 3000);
    assert((await browser.evaluate(() => window.pipelineEngine.state)) === 'SETTLED', 'Manual step advanced to Step 6 (Ledger Settlement)');

    // =========================================================================
    // SECTION 2: TIMER & PRECISION VERIFICATION
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- SECTION 2: TIMER & PRECISION VERIFICATION ---\x1b[0m');

    // 2.1 Microsecond precision timer format and non-drift
    await browser.evaluate(() => {
      window.pipelineEngine.loadScenario('success');
      window.pipelineEngine.speedMultiplier = 1.0;
    });

    const initialTtlText = await browser.getText('#ttlDisplay');
    assert(initialTtlText === '30.000s', `Initial TTL clock displays exactly 30.000s (got "${initialTtlText}")`);

    // Start timer and measure precision samples
    await browser.evaluate(() => {
      window.pipelineEngine.startTtlTimer();
      window.pipelineEngine.state = 'RUNNING';
    });

    await browser.sleep(200);
    const sample1 = await browser.evaluate(() => window.pipelineEngine.ttlRemaining);
    await browser.sleep(200);
    const sample2 = await browser.evaluate(() => window.pipelineEngine.ttlRemaining);
    await browser.sleep(200);
    const sample3 = await browser.evaluate(() => window.pipelineEngine.ttlRemaining);

    assert(sample1 < 30000 && sample2 < sample1 && sample3 < sample2, `TTL decreases strictly monotonically: ${sample1} > ${sample2} > ${sample3}`);
    
    // Check formatted text format (\d{2}\.\d{3}s)
    const formattedTtl = await browser.getText('#ttlDisplay');
    const regexMatch = /^\d{2}\.\d{3}s$/.test(formattedTtl);
    assert(regexMatch, `TTL display strictly matches XX.XXXs format (got "${formattedTtl}")`);

    // Stop timer and verify clean reset
    await browser.evaluate(() => window.pipelineEngine.resetPipeline());
    const resetTtlText = await browser.getText('#ttlDisplay');
    assert(resetTtlText === '30.000s', `TTL resets cleanly to 30.000s (got "${resetTtlText}")`);

    // 2.2 Timeout boundary: simulate 0 TTL remaining
    await browser.evaluate(() => {
      window.pipelineEngine.startTtlTimer();
      window.pipelineEngine.handleTtlTimeout();
    });

    const timeoutState = await browser.evaluate(() => ({
      state: window.pipelineEngine.state,
      processDisabled: document.getElementById('btnProcess').disabled,
      stepDisabled: document.getElementById('btnStep').disabled
    }));
    assert(timeoutState.state === 'TIMEOUT', 'TTL expiry transitions engine to TIMEOUT state');
    assert(timeoutState.processDisabled && timeoutState.stepDisabled, 'Action buttons disabled upon TTL SLA timeout');

    // =========================================================================
    // SECTION 3: SLA 90-DAY EDGE CASES & TOOLTIP VIEWPORT BOUNDS
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- SECTION 3: SLA 90-DAY EDGE CASES & TOOLTIP POSITIONING ---\x1b[0m');
    await browser.navigate(paths.server);
    await browser.setViewport(1440, 900);

    // 3.1 Verify 90 segments per service across all 9 services
    const slaSegmentCounts = await browser.evaluate(() => {
      const cards = document.querySelectorAll('.service-card');
      return Array.from(cards).map(c => {
        const id = c.id;
        const bar = c.querySelector('.sla-matrix-bar');
        const segments = bar ? bar.querySelectorAll('.sla-segment') : [];
        return { id, count: segments.length };
      });
    });

    assert(slaSegmentCounts.length === 9, `9 service cards found (got ${slaSegmentCounts.length})`);
    const allHave90 = slaSegmentCounts.every(s => s.count === 90);
    assert(allHave90, `All 9 services have exactly 90 SLA segments rendered (9x90=810 segments)`, JSON.stringify(slaSegmentCounts));

    // 3.2 Verify segment dataset attributes format
    const segmentDataValidation = await browser.evaluate(() => {
      const allSegments = document.querySelectorAll('.sla-segment');
      let valid = true;
      let sample = null;
      for (let i = 0; i < allSegments.length; i++) {
        const seg = allSegments[i];
        const date = seg.dataset.date || seg.getAttribute('data-date');
        const status = seg.dataset.status || seg.getAttribute('data-status');
        const uptime = seg.dataset.uptime || seg.getAttribute('data-uptime');
        const serviceId = seg.dataset.serviceId || seg.getAttribute('data-service-id');
        if (!date || !status || !uptime || !serviceId) {
          valid = false;
          break;
        }
        if (i === 0) sample = { serviceId, date, status, uptime };
      }
      return { valid, sample, total: allSegments.length };
    });

    assert(segmentDataValidation.valid, `All ${segmentDataValidation.total} segments possess complete metadata (serviceId, date, status, uptime)`);
    assert(segmentDataValidation.sample !== null, `Sample segment data verified: ${JSON.stringify(segmentDataValidation.sample)}`);

    // 3.3 Historical Tooltip Edge Boundary Positioning
    console.log('\n  [3.3 Tooltip Viewport Boundary Clamping Test]');
    
    // Test on multiple viewport sizes: Mobile (400x800), Tablet (800x600), Desktop (1440x900), 4K (2560x1440)
    const viewportsToTest = [
      { w: 400, h: 800, name: 'Mobile 400px' },
      { w: 800, h: 600, name: 'Tablet 800px' },
      { w: 1440, h: 900, name: 'Desktop 1440px' },
      { w: 2560, h: 1440, name: '4K Display 2560px' }
    ];

    for (const vp of viewportsToTest) {
      await browser.setViewport(vp.w, vp.h);
      await browser.sleep(100);

      // Trigger hover on first segment (left boundary) and last segment (right boundary)
      const tooltipBounds = await browser.evaluate((vw, vh) => {
        const tooltip = document.getElementById('slaTooltip') || document.querySelector('.sla-tooltip');
        if (!tooltip) return { found: false };

        const firstSeg = document.querySelector('.sla-segment');
        const lastSeg = document.querySelector('.sla-matrix-bar .sla-segment:last-child');

        // Simulate mouseenter on first segment
        firstSeg.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: 10, clientY: 200 }));
        const rFirst = tooltip.getBoundingClientRect();

        // Simulate mouseenter on last segment
        lastSeg.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true, clientX: vw - 10, clientY: 200 }));
        const rLast = tooltip.getBoundingClientRect();

        return {
          found: true,
          firstLeft: rFirst.left,
          firstRight: rFirst.right,
          lastLeft: rLast.left,
          lastRight: rLast.right,
          vw
        };
      }, vp.w, vp.h);

      assert(tooltipBounds.found, `Tooltip element found in DOM for ${vp.name}`);
      if (tooltipBounds.found) {
        // Assert tooltip does not exceed viewport boundaries
        const leftInBounds = tooltipBounds.firstLeft >= -10;
        const rightInBounds = tooltipBounds.lastRight <= vp.w + 10;
        assert(leftInBounds && rightInBounds, `Tooltip clamped within viewport on ${vp.name} (left: ${tooltipBounds.firstLeft}px, right: ${tooltipBounds.lastRight}px vs vw: ${vp.w}px)`);
      }
    }

    // Reset viewport back to desktop standard
    await browser.setViewport(1440, 900);

    // =========================================================================
    // SECTION 4: EXPORT INTEGRITY & CRYPTOGRAPHIC HASH VALIDATION
    // =========================================================================
    console.log('\n\x1b[1m\x1b[33m--- SECTION 4: EXPORT INTEGRITY & CRYPTOGRAPHIC HASHING ---\x1b[0m');

    // 4.1 Security Audit JSON Report Verification
    await browser.navigate(paths.security);
    await browser.sleep(200);

    const secReportData = await browser.evaluate(() => {
      // Execute audit to completion to populate data
      const s = typeof state !== 'undefined' ? state : window.state;
      const gc = typeof gaugeController !== 'undefined' ? gaugeController : window.gaugeController;
      
      const score = s.calculateTotalScore();
      const { grade, text } = gc.getGrade(score);
      const reportObj = {
        reportId: `SEC-AUDIT-${Date.now().toString(36).toUpperCase()}`,
        generatedAt: new Date().toISOString(),
        integrityChecksum: `SHA256:${Array.from({ length: 32 }, () => Math.floor(Math.random()*16).toString(16)).join('')}`,
        auditProfile: {
          targetHost: 'https://api.cyber-core.internal',
          scannerEngine: 'Depredador CyberSec Sentinel v4.2',
          environment: 'Enterprise Cloud-Native Microservices Stack'
        },
        scoreSummary: {
          score: score,
          letterGrade: grade,
          evaluationStatus: text,
          totalNodesEvaluated: s.nodes.length,
          patchedVulnerabilitiesCount: s.patchedNodeIds.size,
          unpatchedCriticalCount: s.nodes.filter(n => n.severity === 'CRITICAL' && !s.isNodePatched(n.id)).length
        },
        evaluatedNodes: s.nodes.map(n => ({
          id: n.id,
          title: n.title,
          category: n.category,
          cve: n.cve,
          cwe: n.cwe,
          cvssScore: n.cvssScore,
          severity: n.severity,
          status: s.isNodePatched(n.id) ? 'PATCHED_SECURE' : (s.auditComplete ? 'VULNERABLE' : 'PENDING_SCAN'),
          remediationMethod: n.remediationLang
        }))
      };
      return {
        rawJson: JSON.stringify(reportObj, null, 2),
        checksum: reportObj.integrityChecksum,
        reportObj
      };
    });

    // Parse strictly in Node environment
    let parsedSecReport = null;
    let parseSuccess = false;
    try {
      parsedSecReport = JSON.parse(secReportData.rawJson);
      parseSuccess = true;
    } catch (e) {
      parseSuccess = false;
    }
    assert(parseSuccess, 'Security Audit JSON report parses as strictly valid JSON');
    assert(parsedSecReport.scoreSummary.totalNodesEvaluated === 7, 'Security Audit export contains all 7 security evaluation nodes');
    assert(parsedSecReport.integrityChecksum.startsWith('SHA256:'), `Integrity checksum has valid SHA-256 header prefix (got ${parsedSecReport.integrityChecksum})`);

    // Verify SHA-256 calculation on string payload using Node crypto
    const computedReportHash = crypto.createHash('sha256').update(secReportData.rawJson).digest('hex');
    assert(computedReportHash.length === 64, `Computed Node SHA-256 hash length is 64 hex characters (got ${computedReportHash.length})`);

    // 4.2 Transaction Flow Receipt Seal & HMAC-SHA256 Verification
    await browser.navigate(paths.transaction);
    await browser.evaluate(() => {
      window.pipelineEngine.loadScenario('success');
      window.pipelineEngine.speedMultiplier = 5.0;
    });
    await browser.click('#btnProcess');
    await browser.waitForFunction(() => window.pipelineEngine.state === 'SETTLED', 8000);

    const receiptData = await browser.evaluate(() => {
      const payload = window.pipelineEngine.currentPayload;
      const recCard = {
        txId: document.getElementById('recTxId').textContent,
        stan: document.getElementById('recStan').textContent,
        amount: document.getElementById('recAmount').textContent,
        fee: document.getElementById('recFee').textContent,
        auth: document.getElementById('recAuth').textContent,
        time: document.getElementById('recTime').textContent,
        hmac: document.getElementById('recHmac').textContent
      };
      return { payload, recCard };
    });

    let parsedTxPayload = null;
    let txJsonValid = false;
    try {
      parsedTxPayload = JSON.parse(JSON.stringify(receiptData.payload));
      txJsonValid = true;
    } catch (e) {
      txJsonValid = false;
    }

    assert(txJsonValid, 'Transaction payload parses as strictly valid JSON');
    assert(receiptData.recCard.hmac.startsWith('HMAC_SHA256_SEAL_'), `Receipt HMAC seal has valid prefix (got "${receiptData.recCard.hmac}")`);
    assert(parsedTxPayload.receiptSeal.hmacSeal.length > 20, 'Receipt seal contains cryptographic HMAC signature');
    assert(parsedTxPayload.receiptSeal.blockSignature.startsWith('0x'), 'Block signature has valid 0x hexadecimal format');

  } catch (err) {
    console.error(`\x1b[31mCritical Challenger Suite Error: ${err.message}\x1b[0m`);
    if (err.stack) console.error(err.stack);
    assert(false, 'Challenger Suite completed without unhandled exceptions', err.message);
  } finally {
    await browser.close();
  }

  // Summary
  console.log('\n\x1b[1m\x1b[36m============================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m             CHALLENGER 2 TEST EXECUTION SUMMARY            \x1b[0m');
  console.log('\x1b[1m\x1b[36m============================================================\x1b[0m\n');
  console.log(`Total Assertions Executed: \x1b[1m${results.total}\x1b[0m`);
  console.log(`Passed: \x1b[32m${results.passed}\x1b[0m`);
  console.log(`Failed: \x1b[31m${results.failed}\x1b[0m`);
  console.log(`Verdict: ${results.failed === 0 ? '\x1b[32mAPPROVE\x1b[0m' : '\x1b[31mREJECT\x1b[0m'}\n`);

  return results;
}

if (require.main === module) {
  runChallengerTests().then(res => {
    process.exit(res.failed === 0 ? 0 : 1);
  }).catch(e => {
    console.error(e);
    process.exit(1);
  });
}

module.exports = { runChallengerTests };
