/**
 * Challenger M1: Comprehensive 8-Viewport Matrix & Anti-Collision Stress Harness
 *
 * Viewports:
 * 1. 360x640   (Mobile Mini)
 * 2. 412x915   (Mobile Modern)
 * 3. 768x1024  (Tablet Portrait)
 * 4. 1024x768  (Tablet Landscape)
 * 5. 1280x800  (Laptop HD)
 * 6. 1920x1080 (FHD Desktop)
 * 7. 2560x1440 (2K QHD)
 * 8. 3840x2160 (4K UHD)
 *
 * Dashboards: All 15 dashboards in sistemas/
 * Total test matrix runs: 15 dashboards * 8 viewports = 120 viewport executions
 *
 * Probes:
 * - Document horizontal scroll overflow (scrollWidth > innerWidth / clientWidth)
 * - Sibling bounding box collisions (overlap area calculation)
 * - Text container clipping & broken text truncation
 * - Z-Index layering standard compliance
 * - Console errors across all viewports
 */

const path = require('path');
const fs = require('fs');
const { BrowserSession } = require('./runner');
const { TestContext, Helpers } = require('./fixtures/helpers');

const TARGET_VIEWPORTS = [
  { name: '360x640 (Mobile Mini)', width: 360, height: 640, isMobile: true },
  { name: '412x915 (Mobile Modern)', width: 412, height: 915, isMobile: true },
  { name: '768x1024 (Tablet Portrait)', width: 768, height: 1024, isMobile: true },
  { name: '1024x768 (Tablet Landscape)', width: 1024, height: 768, isMobile: false },
  { name: '1280x800 (Laptop HD)', width: 1280, height: 800, isMobile: false },
  { name: '1920x1080 (FHD Desktop)', width: 1920, height: 1080, isMobile: false },
  { name: '2560x1440 (2K QHD)', width: 2560, height: 1440, isMobile: false },
  { name: '3840x2160 (4K UHD)', width: 3840, height: 2160, isMobile: false }
];

const DASHBOARDS = [
  'apigee-mulesoft-hybrid',
  'emergency-evacuation-v1',
  'emergency-evacuation-v2',
  'emergency-evacuation-v3',
  'gcp-cloudops-cockpit',
  'gcp-event-pubsub',
  'gcp-iam-security',
  'gcp-serverless-pipeline',
  'gcp-sql-networking',
  'mulesoft-observability',
  'network-health',
  'security-audit',
  'server-status',
  'transaction-flow',
  'tv-diagnostic'
];

async function runAdversarialStressSuite() {
  const browser = new BrowserSession();
  await browser.launch();
  const rootDir = path.resolve(__dirname, '..');

  const summaryReport = {
    timestamp: new Date().toISOString(),
    totalDashboards: DASHBOARDS.length,
    totalViewportsPerDashboard: TARGET_VIEWPORTS.length,
    totalMatrixRuns: DASHBOARDS.length * TARGET_VIEWPORTS.length,
    passedRuns: 0,
    failedRuns: 0,
    dashboardSummaries: {},
    globalDefects: []
  };

  console.log('========================================================================================');
  console.log('      ADVERSARIAL MULTI-VIEWPORT LAYOUT & ANTI-COLLISION MATRIX STRESS SUITE            ');
  console.log(`      15 Dashboards x 8 Viewports = ${summaryReport.totalMatrixRuns} Test Executions`);
  console.log('========================================================================================\n');

  try {
    for (const dashName of DASHBOARDS) {
      const filePath = path.join(rootDir, 'sistemas', dashName, 'index.html');
      if (!fs.existsSync(filePath)) {
        console.error(`[ERROR] File missing: ${filePath}`);
        summaryReport.globalDefects.push({ dashboard: dashName, error: 'File missing' });
        continue;
      }

      console.log(`\n================================================================`);
      console.log(`🔍 EVALUATING DASHBOARD: [${dashName}]`);
      console.log(`================================================================`);

      summaryReport.dashboardSummaries[dashName] = {
        viewportResults: {},
        allViewportsPassed: true,
        collisionsFound: [],
        textClippingFound: [],
        zIndexIssues: [],
        consoleErrors: []
      };

      const dashRecord = summaryReport.dashboardSummaries[dashName];

      for (const vp of TARGET_VIEWPORTS) {
        await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
        await browser.navigate(filePath);
        await browser.sleep(250);

        // 1. Evaluate Horizontal Overflow
        const overflowEval = await browser.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientW = Math.max(doc.clientWidth, body.clientWidth);
          const innerW = window.innerWidth;
          const maxAllowed = Math.max(clientW, innerW);

          // 3px allowance for subpixel rendering variations on scrollbars
          const hasOverflow = scrollW > maxAllowed + 3;

          let offendingElements = [];
          if (hasOverflow) {
            const allElements = Array.from(document.querySelectorAll('*'));
            for (const el of allElements) {
              const r = el.getBoundingClientRect();
              if (r.right > maxAllowed + 3 && r.width > 0 && r.height > 0) {
                offendingElements.push({
                  tag: el.tagName.toLowerCase(),
                  id: el.id || '',
                  className: (el.className && typeof el.className === 'string') ? el.className.trim() : '',
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                  textSnippet: (el.innerText || el.textContent || '').trim().slice(0, 35)
                });
              }
            }
          }

          return {
            scrollW,
            clientW,
            innerW,
            maxAllowed,
            hasOverflow,
            offendingElements: offendingElements.slice(0, 6)
          };
        });

        // 2. Evaluate Element Sibling Collisions at this viewport
        const collisionEval = await browser.evaluate(() => {
          const containerSelectors = [
            '.grid', '.dashboard-grid', '.layout-grid', '.panel-grid', '.container',
            'main', '.main-content', '.cockpit-grid', '.panels-container', '.cards-grid',
            '.app-workspace', '.tactical-main', '.stepper-container', '.hud-panel',
            '.carrier-card', '.chaos-panel', '.cb-visualizer', '.cmek-grid', '.brand-section'
          ];
          const containers = Array.from(document.querySelectorAll(containerSelectors.join(',')));
          const collisions = [];

          containers.forEach(container => {
            const children = Array.from(container.children).filter(el => {
              const style = window.getComputedStyle(el);
              return style.display !== 'none' &&
                     style.visibility !== 'hidden' &&
                     style.position !== 'absolute' &&
                     style.position !== 'fixed' &&
                     el.offsetWidth > 10 && el.offsetHeight > 10;
            });

            for (let i = 0; i < children.length; i++) {
              const r1 = children[i].getBoundingClientRect();
              for (let j = i + 1; j < children.length; j++) {
                const r2 = children[j].getBoundingClientRect();
                const overlapX = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
                const overlapY = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
                const overlapArea = overlapX * overlapY;

                // Ignore negligible subpixel touch (allow <= 50px area)
                if (overlapArea > 50) {
                  collisions.push({
                    container: container.className || container.tagName,
                    el1: children[i].className || children[i].tagName,
                    el2: children[j].className || children[j].tagName,
                    overlapArea: Math.round(overlapArea),
                    box1: { top: Math.round(r1.top), bottom: Math.round(r1.bottom), left: Math.round(r1.left), right: Math.round(r1.right) },
                    box2: { top: Math.round(r2.top), bottom: Math.round(r2.bottom), left: Math.round(r2.left), right: Math.round(r2.right) }
                  });
                }
              }
            }
          });

          return collisions;
        });

        // 3. Evaluate Text Container Truncation & Clipping
        const clippingEval = await browser.evaluate(() => {
          const candidateSelectors = [
            'h1', 'h2', 'h3', '.card', '.hud-panel', '.metric-value', '.stepper',
            '.panel-body', '.status-card', '.brand-title', '.brand-subtitle',
            '.terminal-header', '.panel-title', '.tactical-broadcast-btn'
          ];
          const candidates = Array.from(document.querySelectorAll(candidateSelectors.join(',')));
          const clipped = [];

          candidates.forEach(el => {
            const style = window.getComputedStyle(el);
            if (style.overflow === 'hidden' || style.overflowY === 'hidden') {
              if (el.scrollHeight > el.clientHeight + 16 && el.clientHeight > 0) {
                clipped.push({
                  element: el.className || el.tagName,
                  scrollHeight: el.scrollHeight,
                  clientHeight: el.clientHeight,
                  sampleText: (el.innerText || '').slice(0, 40)
                });
              }
            }
          });
          return clipped;
        });

        // 4. Capture console errors
        const consoleErrs = browser.getConsoleErrors();
        if (consoleErrs.length > 0) {
          dashRecord.consoleErrors.push(...consoleErrs.map(e => `[${vp.name}] ${e.text}`));
        }

        const isVpPassed = !overflowEval.hasOverflow && collisionEval.length === 0 && clippingEval.length === 0;

        dashRecord.viewportResults[vp.name] = {
          width: vp.width,
          height: vp.height,
          passed: isVpPassed,
          scrollWidth: overflowEval.scrollW,
          clientWidth: overflowEval.clientW,
          innerWidth: overflowEval.innerW,
          hasOverflow: overflowEval.hasOverflow,
          offenders: overflowEval.offendingElements,
          collisions: collisionEval,
          clipping: clippingEval
        };

        if (collisionEval.length > 0) {
          dashRecord.collisionsFound.push({ viewport: vp.name, collisions: collisionEval });
        }
        if (clippingEval.length > 0) {
          dashRecord.textClippingFound.push({ viewport: vp.name, clipping: clippingEval });
        }

        if (isVpPassed) {
          summaryReport.passedRuns++;
          console.log(`  \x1b[32m✔\x1b[0m [${vp.name.padEnd(28)}] scrollW: ${overflowEval.scrollW}px <= clientW: ${overflowEval.clientW}px | Collisions: 0 | Clipping: 0`);
        } else {
          summaryReport.failedRuns++;
          dashRecord.allViewportsPassed = false;
          console.log(`  \x1b[31m✖\x1b[0m [${vp.name.padEnd(28)}] FAIL:`);
          if (overflowEval.hasOverflow) {
            console.log(`     -> OVERFLOW: scrollW (${overflowEval.scrollW}px) > clientW (${overflowEval.clientW}px)`);
            console.log(`        Offenders:`, JSON.stringify(overflowEval.offendingElements));
          }
          if (collisionEval.length > 0) {
            console.log(`     -> SIBLING COLLISIONS (${collisionEval.length}):`, JSON.stringify(collisionEval));
          }
          if (clippingEval.length > 0) {
            console.log(`     -> TEXT CLIPPING (${clippingEval.length}):`, JSON.stringify(clippingEval));
          }
        }
      }

      // 5. Z-Index Layering Audit
      const zIndexHierarchy = await browser.evaluate(() => {
        const issues = [];
        const canvasBg = document.querySelector('canvas#bgCanvas, canvas.bg-canvas, canvas.particle-canvas, #particle-canvas');
        if (canvasBg) {
          const z = parseInt(window.getComputedStyle(canvasBg).zIndex) || 0;
          if (z > 1) issues.push(`Background canvas has z-index ${z} > 1`);
        }

        const cards = Array.from(document.querySelectorAll('.card, .hud-panel, .panel, .tactical-panel'));
        cards.forEach(c => {
          const z = parseInt(window.getComputedStyle(c).zIndex);
          if (!isNaN(z) && z < 1 && window.getComputedStyle(c).position !== 'static') {
            issues.push(`Card/Panel ${c.className} has z-index ${z} < 1`);
          }
        });

        return issues;
      });

      if (zIndexHierarchy.length > 0) {
        dashRecord.zIndexIssues.push(...zIndexHierarchy);
        console.log(`  \x1b[33m⚠ Z-Index Hierarchy Warnings:\x1b[0m`, JSON.stringify(zIndexHierarchy));
      }
    }

    console.log('\n========================================================================================');
    console.log('                          STRESS SUITE EXECUTION SUMMARY                                ');
    console.log('========================================================================================');
    console.log(`  Total Matrix Runs Tested: ${summaryReport.totalMatrixRuns}`);
    console.log(`  Passed Runs:              \x1b[32m${summaryReport.passedRuns}\x1b[0m`);
    console.log(`  Failed Runs:              \x1b[${summaryReport.failedRuns > 0 ? '31' : '32'}m${summaryReport.failedRuns}\x1b[0m`);
    console.log('========================================================================================\n');

    let totalDashboardsPassed = 0;
    for (const [name, summary] of Object.entries(summaryReport.dashboardSummaries)) {
      const status = summary.allViewportsPassed ? '\x1b[32mPASSED (8/8)\x1b[0m' : '\x1b[31mFAILED\x1b[0m';
      if (summary.allViewportsPassed) totalDashboardsPassed++;
      console.log(`  ● ${name.padEnd(30)}: ${status}`);
    }
    console.log(`\nOverall Dashboards Passed: ${totalDashboardsPassed}/${DASHBOARDS.length}`);

    // Return the report
    return summaryReport;

  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  runAdversarialStressSuite().then(res => {
    process.exit(res.failedRuns === 0 ? 0 : 1);
  }).catch(err => {
    console.error('Fatal Test Runner Error:', err);
    process.exit(1);
  });
}

module.exports = { runAdversarialStressSuite };
