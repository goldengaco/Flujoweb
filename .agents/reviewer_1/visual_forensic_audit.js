/**
 * Visual Forensic & Interface Quality Audit
 * Independent Reviewer 1 Audit Script
 */

const path = require('path');
const url = require('url');
const { BrowserSession } = require('../../tests/runner');

const SYSTEMS = {
  security: path.resolve(__dirname, '../../sistemas/security-audit/index.html'),
  server: path.resolve(__dirname, '../../sistemas/server-status/index.html'),
  transaction: path.resolve(__dirname, '../../sistemas/transaction-flow/index.html')
};

async function runForensicAudit() {
  const browser = new BrowserSession();
  await browser.launch();
  console.log('>>> Headless Chromium launched for Visual Forensic Audit');

  const results = {
    themeAndTypography: [],
    emojiPermanence: [],
    animationsAndGauges: [],
    viewportsAndLayout: [],
    adversarialIntegrity: []
  };

  try {
    // =========================================================================
    // 1. SECURITY AUDIT DASHBOARD
    // =========================================================================
    console.log('\n--- Auditing: Security Audit & Vulnerability Scanner ---');
    await browser.navigate(SYSTEMS.security);
    await browser.sleep(500);

    // 1.1 Theme & Typography & Accent Colors
    const secStyle = await browser.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      const headerStyle = window.getComputedStyle(document.querySelector('.app-header') || document.body);
      const root = document.documentElement;
      const rootStyle = window.getComputedStyle(root);

      return {
        bodyBg: bodyStyle.backgroundColor,
        bodyColor: bodyStyle.color,
        bodyFont: bodyStyle.fontFamily,
        headerBg: headerStyle.backgroundColor,
        cssVars: {
          bgDark: rootStyle.getPropertyValue('--bg-dark').trim(),
          bgCard: rootStyle.getPropertyValue('--bg-card').trim(),
          redAlert: rootStyle.getPropertyValue('--red-alert').trim(),
          greenNeon: rootStyle.getPropertyValue('--green-neon').trim(),
          fontUi: rootStyle.getPropertyValue('--font-ui').trim(),
          fontMono: rootStyle.getPropertyValue('--font-mono').trim()
        }
      };
    });

    results.themeAndTypography.push({
      system: 'security-audit',
      ...secStyle,
      validTheme: secStyle.bodyBg === 'rgb(3, 8, 18)' || secStyle.cssVars.bgDark === '#030812'
    });

    // 1.2 Emoji Permanence in Stepper Across Full Lifecycle
    // Baseline state emojis in stepper nodes
    const secBaselineEmojis = await browser.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.stepper-node'));
      const emojis = nodes.map(n => {
        const iconEl = n.querySelector('.node-icon, .step-icon, .icon');
        return {
          id: n.getAttribute('data-node-id') || n.id,
          iconText: iconEl ? iconEl.innerText.trim() : n.innerText.trim().slice(0, 4)
        };
      });
      const requiredEmojis = ['🔒', '🛡️', '🌐', '💉', '📜', '🔑', '📋'];
      const allPresent = requiredEmojis.every(req => emojis.some(e => e.iconText.includes(req)));
      return { count: nodes.length, emojis, allPresent };
    });

    // Start Scan
    await browser.click('#btnRunAudit');
    await browser.sleep(1000);

    // Check emojis during scan
    const secDuringScanEmojis = await browser.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.stepper-node'));
      const emojis = nodes.map(n => {
        const iconEl = n.querySelector('.node-icon, .step-icon, .icon');
        return iconEl ? iconEl.innerText.trim() : '';
      });
      const requiredEmojis = ['🔒', '🛡️', '🌐', '💉', '📜', '🔑', '📋'];
      const allPresent = requiredEmojis.every(req => emojis.some(e => e.includes(req)));
      return { emojis, allPresent };
    });

    // Wait for full audit to complete
    await browser.waitForFunction(() => {
      const badge = document.getElementById('stepperStatusBadge');
      return badge && badge.innerText.includes('AUDIT COMPLETE');
    }, 20000);

    // Check emojis post-scan (ensure no emojis were replaced by tickmarks)
    const secPostScanEmojis = await browser.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.stepper-node'));
      const nodeIcons = nodes.map(n => {
        const iconEl = n.querySelector('.node-icon, .step-icon, .icon');
        const state = n.className;
        return {
          id: n.getAttribute('data-node-id') || n.id,
          state,
          iconText: iconEl ? iconEl.innerText.trim() : ''
        };
      });
      const requiredEmojis = ['🔒', '🛡️', '🌐', '💉', '📜', '🔑', '📋'];
      const allPresent = requiredEmojis.every(req => nodeIcons.some(e => e.iconText.includes(req)));
      const hasTickmarkReplacement = nodeIcons.some(n => n.iconText === '✓' || n.iconText === '✔' || n.iconText === '✔');
      return { nodeIcons, allPresent, hasTickmarkReplacement };
    });

    // Test Patch All / Fix All hardening
    await browser.click('#btnFixAll');
    await browser.sleep(1500);

    const secPostPatchEmojis = await browser.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.stepper-node'));
      const nodeIcons = nodes.map(n => {
        const iconEl = n.querySelector('.node-icon, .step-icon, .icon');
        return {
          id: n.getAttribute('data-node-id') || n.id,
          state: n.className,
          iconText: iconEl ? iconEl.innerText.trim() : ''
        };
      });
      const requiredEmojis = ['🔒', '🛡️', '🌐', '💉', '📜', '🔑', '📋'];
      const allPresent = requiredEmojis.every(req => nodeIcons.some(e => e.iconText.includes(req)));
      const hasTickmarkReplacement = nodeIcons.some(n => n.iconText === '✓' || n.iconText === '✔');
      return { nodeIcons, allPresent, hasTickmarkReplacement };
    });

    results.emojiPermanence.push({
      system: 'security-audit',
      baseline: secBaselineEmojis,
      duringScan: secDuringScanEmojis,
      postScan: secPostScanEmojis,
      postPatch: secPostPatchEmojis,
      emojiIntegrityPreserved: !secPostScanEmojis.hasTickmarkReplacement && !secPostPatchEmojis.hasTickmarkReplacement && secPostPatchEmojis.allPresent
    });

    // 1.3 Animated Gauge & Drawer Verification
    const secGaugeAndDrawer = await browser.evaluate(() => {
      const scoreEl = document.getElementById('gaugeScoreNumber');
      const gradeEl = document.getElementById('gaugeGradeBadge');
      const circleEl = document.getElementById('gaugeProgressCircle');
      const circleStyle = circleEl ? window.getComputedStyle(circleEl) : null;
      return {
        score: scoreEl ? scoreEl.innerText.trim() : null,
        grade: gradeEl ? gradeEl.innerText.trim() : null,
        strokeDasharray: circleEl ? circleEl.getAttribute('stroke-dasharray') : null,
        strokeDashoffset: circleEl ? circleEl.getAttribute('stroke-dashoffset') : null,
        strokeColor: circleStyle ? circleStyle.stroke : null
      };
    });

    results.animationsAndGauges.push({
      system: 'security-audit',
      gauge: secGaugeAndDrawer
    });

    // =========================================================================
    // 2. SERVER STATUS NOC DASHBOARD
    // =========================================================================
    console.log('\n--- Auditing: Server Status & NOC Mission Control ---');
    await browser.navigate(SYSTEMS.server);
    await browser.sleep(500);

    // 2.1 Theme & Typography & Accent Colors
    const srvStyle = await browser.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      const rootStyle = window.getComputedStyle(document.documentElement);
      return {
        bodyBg: bodyStyle.backgroundColor,
        bodyFont: bodyStyle.fontFamily,
        cssVars: {
          bgBase: rootStyle.getPropertyValue('--bg-base').trim(),
          cyanPrimary: rootStyle.getPropertyValue('--cyan-primary').trim(),
          amberWarn: rootStyle.getPropertyValue('--amber-warn').trim(),
          crimsonCrit: rootStyle.getPropertyValue('--crimson-crit').trim(),
          fontSans: rootStyle.getPropertyValue('--font-sans').trim(),
          fontMono: rootStyle.getPropertyValue('--font-mono').trim()
        }
      };
    });

    results.themeAndTypography.push({
      system: 'server-status',
      ...srvStyle,
      validTheme: srvStyle.bodyBg === 'rgb(3, 8, 18)' || srvStyle.cssVars.bgBase === '#030812'
    });

    // 2.2 Permanent Icons & 9 Services
    const srvServiceEmojis = await browser.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.service-card'));
      const cardData = cards.map(c => {
        const icon = c.querySelector('.service-icon, .icon')?.innerText.trim();
        const title = c.querySelector('.service-name, h3, .service-title')?.innerText.trim();
        return { title, icon };
      });
      const requiredEmojis = ['🌍', '🌐', '⚡', '🔐', '🐘', '💳'];
      const allFound = requiredEmojis.every(req => cardData.some(c => (c.icon && c.icon.includes(req)) || (c.title && c.title.includes(req))));
      return { count: cards.length, cardData, allFound };
    });

    // 2.3 Canvas Sparklines & Dynamic Live Metrics
    const srvCanvas = await browser.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      const canvasDetails = canvases.map(cv => ({
        id: cv.id,
        width: cv.width,
        height: cv.height,
        hasContext2d: !!cv.getContext('2d')
      }));
      const uptimeSegments = document.querySelectorAll('.history-segment, .sla-segment, .bar-segment');
      return {
        canvasCount: canvases.length,
        canvasDetails,
        uptimeSegmentsCount: uptimeSegments.length
      };
    });

    // 2.4 Chaos Injection & Auto-Healing Visual Flow
    await browser.evaluate(() => {
      const btn = document.getElementById('openChaosModalBtn');
      if (btn) btn.click();
    });
    await browser.sleep(300);
    await browser.evaluate(() => {
      const scenario = document.querySelector('.chaos-scenario-card') || document.getElementById('triggerCustomChaosBtn');
      if (scenario) scenario.click();
    });
    await browser.sleep(500);

    const srvChaosState = await browser.evaluate(() => {
      const degradedCards = document.querySelectorAll('.status-critical, .status-degraded, .card-outage');
      const progressBar = document.getElementById('healingProgressBar');
      const stepNodes = document.querySelectorAll('#stepNode1, #stepNode2, #stepNode3, #stepNode4, #stepNode5');
      return {
        degradedCount: degradedCards.length,
        hasProgressBar: !!progressBar,
        stepNodesCount: stepNodes.length
      };
    });

    // Wait for auto-healing to finish
    await browser.waitForFunction(() => {
      const card = document.getElementById('healingWorkflowCard');
      return !card || card.style.display === 'none' || !card.classList.contains('active');
    }, 20000);

    const srvPostHealEmojis = await browser.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.service-card'));
      const cardData = cards.map(c => {
        const icon = c.querySelector('.service-icon, .icon')?.innerText.trim();
        return icon;
      });
      const requiredEmojis = ['🌍', '🌐', '⚡', '🔐', '🐘', '💳'];
      const allFound = requiredEmojis.every(req => cardData.some(c => c && c.includes(req)));
      return { cardData, allFound };
    });

    results.emojiPermanence.push({
      system: 'server-status',
      services: srvServiceEmojis,
      postHeal: srvPostHealEmojis,
      emojiIntegrityPreserved: srvServiceEmojis.allFound && srvPostHealEmojis.allFound
    });

    results.animationsAndGauges.push({
      system: 'server-status',
      canvas: srvCanvas,
      chaosSimulation: srvChaosState
    });

    // =========================================================================
    // 3. TRANSACTION FLOW DASHBOARD
    // =========================================================================
    console.log('\n--- Auditing: High-Frequency Transaction & Settlement Pipeline ---');
    await browser.navigate(SYSTEMS.transaction);
    await browser.sleep(500);

    // 3.1 Theme & Typography & Accent Colors
    const txStyle = await browser.evaluate(() => {
      const bodyStyle = window.getComputedStyle(document.body);
      const rootStyle = window.getComputedStyle(document.documentElement);
      return {
        bodyBg: bodyStyle.backgroundColor,
        bodyFont: bodyStyle.fontFamily,
        cssVars: {
          bgBase: rootStyle.getPropertyValue('--bg-base').trim(),
          goldPrimary: rootStyle.getPropertyValue('--gold-primary').trim(),
          emeraldPrimary: rootStyle.getPropertyValue('--emerald-primary').trim(),
          crimsonPrimary: rootStyle.getPropertyValue('--crimson-primary').trim(),
          fontUi: rootStyle.getPropertyValue('--font-ui').trim(),
          fontMono: rootStyle.getPropertyValue('--font-mono').trim()
        }
      };
    });

    results.themeAndTypography.push({
      system: 'transaction-flow',
      ...txStyle,
      validTheme: txStyle.bodyBg === 'rgb(3, 8, 18)' || txStyle.cssVars.bgBase === '#030812'
    });

    // 3.2 Permanent Emojis in Pipeline Nodes across Normal, Reversal, and Branches
    const txBaselineEmojis = await browser.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.node-wrapper'));
      const emojis = nodes.map(n => {
        const iconEl = n.querySelector('.node-icon, .icon');
        return {
          id: n.id,
          iconText: iconEl ? iconEl.innerText.trim() : ''
        };
      });
      const requiredEmojis = ['📝', '🔍', '🛡️', '🏦', '⚙️', '✅'];
      const allPresent = requiredEmojis.every(req => emojis.some(e => e.iconText.includes(req)));
      return { count: nodes.length, emojis, allPresent };
    });

    // Execute Normal Scenario
    await browser.click('#btnProcess');
    await browser.sleep(1000);

    // Check TTL timer decrement and microsecond precision
    const txTimerDuringRun = await browser.evaluate(() => {
      const timer = document.getElementById('ttlDisplay');
      return timer ? timer.innerText.trim() : null;
    });

    // Wait for Normal Settlement to Complete
    await browser.waitForFunction(() => {
      const node6 = document.getElementById('node-6');
      return node6 && node6.classList.contains('state-completed');
    }, 15000);

    const txPostSettlementEmojis = await browser.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.node-wrapper'));
      const nodeIcons = nodes.map(n => {
        const iconEl = n.querySelector('.node-icon, .icon');
        return {
          id: n.id,
          state: n.className,
          iconText: iconEl ? iconEl.innerText.trim() : ''
        };
      });
      const requiredEmojis = ['📝', '🔍', '🛡️', '🏦', '⚙️', '✅'];
      const allPresent = requiredEmojis.every(req => nodeIcons.some(e => e.iconText.includes(req)));
      const hasTickmarkReplacement = nodeIcons.some(n => n.iconText === '✓' || n.iconText === '✔');
      return { nodeIcons, allPresent, hasTickmarkReplacement };
    });

    // Execute Reversal Rollback
    await browser.click('#btnReversal');
    await browser.sleep(2000);

    const txPostReversalEmojis = await browser.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('.node-wrapper'));
      const nodeIcons = nodes.map(n => {
        const iconEl = n.querySelector('.node-icon, .icon');
        return {
          id: n.id,
          state: n.className,
          iconText: iconEl ? iconEl.innerText.trim() : ''
        };
      });
      const requiredEmojis = ['📝', '🔍', '🛡️', '🏦', '⚙️', '✅'];
      const allPresent = requiredEmojis.every(req => nodeIcons.some(e => e.iconText.includes(req)));
      return { nodeIcons, allPresent };
    });

    // Execute Fraud Scenario with Branching
    await browser.click('#btnReset');
    await browser.sleep(300);
    await browser.evaluate(() => {
      const fraudBtn = document.querySelector('.scenario-btn[data-scenario="fraud"]');
      if (fraudBtn) fraudBtn.click();
    });
    await browser.sleep(300);
    await browser.click('#btnProcess');
    await browser.sleep(2500);

    const txFraudBranchCheck = await browser.evaluate(() => {
      const fraudNode = document.getElementById('bifurcation-fraud');
      const fraudIcon = fraudNode ? fraudNode.querySelector('.node-icon, .bifurcation-icon, .icon')?.innerText.trim() : '';
      const radarScore = document.getElementById('radarScoreBadge')?.innerText.trim();
      const node6 = document.getElementById('node-6');
      return {
        fraudActive: fraudNode ? fraudNode.classList.contains('branch-active') || fraudNode.classList.contains('state-active') : false,
        fraudIcon,
        radarScore,
        node6Completed: node6 ? node6.classList.contains('state-completed') : false
      };
    });

    results.emojiPermanence.push({
      system: 'transaction-flow',
      baseline: txBaselineEmojis,
      postSettlement: txPostSettlementEmojis,
      postReversal: txPostReversalEmojis,
      fraudBranch: txFraudBranchCheck,
      emojiIntegrityPreserved: !txPostSettlementEmojis.hasTickmarkReplacement && txPostSettlementEmojis.allPresent && txPostReversalEmojis.allPresent
    });

    // 3.3 Dynamic Risk Radar Canvas & TTL Timer
    const txRadarAndCanvas = await browser.evaluate(() => {
      const radarCanvas = document.getElementById('riskRadarCanvas');
      const tracksSvg = document.getElementById('tracksSvg');
      const paths = tracksSvg ? tracksSvg.querySelectorAll('path') : [];
      const timerEl = document.getElementById('ttlDisplay');
      return {
        hasRadarCanvas: !!radarCanvas,
        radarContext2d: !!(radarCanvas && radarCanvas.getContext('2d')),
        tracksSvgPathsCount: paths.length,
        timerReading: timerEl ? timerEl.innerText.trim() : null
      };
    });

    results.animationsAndGauges.push({
      system: 'transaction-flow',
      radarAndSvg: txRadarAndCanvas
    });

    // =========================================================================
    // 4. MULTI-VIEWPORT RESPONSIVENESS & OVERFLOW AUDIT (375px, 768px, 1440px, 1920px, 3840px)
    // =========================================================================
    console.log('\n--- Auditing: Multi-Viewport Reflow & Responsiveness ---');
    const viewports = [
      { name: 'Mobile Mini (375x667)', width: 375, height: 667, mobile: true },
      { name: 'Mobile Large (414x896)', width: 414, height: 896, mobile: true },
      { name: 'Tablet Portrait (768x1024)', width: 768, height: 1024, mobile: true },
      { name: 'Tablet Landscape (1024x768)', width: 1024, height: 768, mobile: true },
      { name: 'Desktop HD (1440x900)', width: 1440, height: 900, mobile: false },
      { name: 'Desktop Full HD (1920x1080)', width: 1920, height: 1080, mobile: false },
      { name: 'Ultra 4K (3840x2160)', width: 3840, height: 2160, mobile: false }
    ];

    for (const [key, sysPath] of Object.entries(SYSTEMS)) {
      for (const vp of viewports) {
        await browser.setViewport(vp.width, vp.height, 1, vp.mobile);
        await browser.navigate(sysPath);
        await browser.sleep(250);

        const overflowCheck = await browser.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientW = Math.max(doc.clientWidth, body.clientWidth);
          return {
            scrollW,
            clientW,
            overflow: scrollW > clientW + 2 // 2px margin tolerance
          };
        });

        const errors = browser.getConsoleErrors().filter(e => !e.text.includes('favicon.ico'));

        results.viewportsAndLayout.push({
          system: key,
          viewport: vp.name,
          width: vp.width,
          overflow: overflowCheck.overflow,
          scrollW: overflowCheck.scrollW,
          clientW: overflowCheck.clientW,
          consoleErrorsCount: errors.length
        });
      }
    }

    // =========================================================================
    // 5. ADVERSARIAL INTEGRITY CHECKS
    // =========================================================================
    console.log('\n--- Auditing: Adversarial Integrity Checks ---');
    // Check for hardcoding or static fake facades
    // Check if security score changes when unpatching / searching / filtering
    await browser.navigate(SYSTEMS.security);
    await browser.sleep(300);
    const secInitialScore = await browser.evaluate(() => document.getElementById('gaugeScoreNumber')?.innerText);
    await browser.click('#btnRunAudit');
    await browser.waitForFunction(() => {
      const badge = document.getElementById('stepperStatusBadge');
      return badge && badge.innerText.includes('AUDIT COMPLETE');
    }, 20000);
    const secAuditedScore = await browser.evaluate(() => document.getElementById('gaugeScoreNumber')?.innerText);
    await browser.click('#btnFixAll');
    await browser.sleep(1500);
    const secPatchedScore = await browser.evaluate(() => document.getElementById('gaugeScoreNumber')?.innerText);

    results.adversarialIntegrity.push({
      system: 'security-audit',
      check: 'Dynamic mathematical score calculation vs hardcoded facade',
      initialScore: secInitialScore,
      auditedScore: secAuditedScore,
      patchedScore: secPatchedScore,
      dynamicScoreVerified: secInitialScore !== secAuditedScore && secAuditedScore !== secPatchedScore && parseInt(secPatchedScore) === 100
    });

    console.log('\n>>> Visual Forensic Audit Execution Finished Successfully');
    return results;

  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  runForensicAudit().then(res => {
    console.log('\n=== FORENSIC AUDIT RESULTS SUMMARY ===');
    console.log(JSON.stringify(res, null, 2));
  }).catch(err => {
    console.error('Forensic audit failed with error:', err);
    process.exit(1);
  });
}

module.exports = { runForensicAudit };
