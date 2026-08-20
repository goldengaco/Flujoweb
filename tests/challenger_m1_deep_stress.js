/**
 * Comprehensive M1 Empirical Layout & Anti-Collision Stress Suite
 * Viewports: 360px, 412px, 768px, 1024px, 1280px, 1920px, 2560px, 3840px
 * Dashboards: All 15 dashboards in sistemas/
 * Probes: Horizontal Overflow, Element Collisions, Text Clipping, Z-Index Hierarchy, Console Errors
 */

const path = require('path');
const fs = require('fs');
const { BrowserSession } = require('./runner');
const { TestContext, Helpers } = require('./fixtures/helpers');

const VIEWPORTS = [
  { name: 'Mobile Mini (360x640)', width: 360, height: 640, isMobile: true },
  { name: 'Mobile Modern (412x915)', width: 412, height: 915, isMobile: true },
  { name: 'Tablet Portrait (768x1024)', width: 768, height: 1024, isMobile: true },
  { name: 'Tablet Landscape (1024x768)', width: 1024, height: 768, isMobile: false },
  { name: 'Laptop HD (1280x800)', width: 1280, height: 800, isMobile: false },
  { name: 'Full HD Desktop (1920x1080)', width: 1920, height: 1080, isMobile: false },
  { name: '2K QHD (2560x1440)', width: 2560, height: 1440, isMobile: false },
  { name: '4K UHD (3840x2160)', width: 3840, height: 2160, isMobile: false }
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

async function runDeepStressSuite() {
  const browser = new BrowserSession();
  await browser.launch();
  const rootDir = path.resolve(__dirname, '..');

  const detailedFindings = {
    totalDashboards: DASHBOARDS.length,
    passedDashboards: 0,
    failedDashboards: 0,
    results: {}
  };

  console.log('================================================================');
  console.log('🚀 STARTING M1 ADVERSARIAL MULTI-VIEWPORT STRESS SUITE');
  console.log('================================================================\n');

  try {
    for (const name of DASHBOARDS) {
      const filePath = path.join(rootDir, 'sistemas', name, 'index.html');
      if (!fs.existsSync(filePath)) {
        console.error(`[ERROR] File not found: ${filePath}`);
        continue;
      }

      console.log(`\n--- PROBING DASHBOARD: ${name} ---`);
      detailedFindings.results[name] = {
        overflows: [],
        collisions: [],
        clipping: [],
        zIndexAnomalies: [],
        consoleErrors: []
      };

      // 1. Multi-Viewport Horizontal Overflow Check across all 8 viewports
      for (const vp of VIEWPORTS) {
        await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
        await browser.navigate(filePath);
        await browser.sleep(250);

        const overflowDetails = await browser.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientW = Math.max(doc.clientWidth, body.clientWidth);
          const hasOverflow = scrollW > clientW + 3;

          let offendingElements = [];
          if (hasOverflow) {
            // Find all elements that stick out beyond clientW
            const allElements = Array.from(document.querySelectorAll('*'));
            for (const el of allElements) {
              const r = el.getBoundingClientRect();
              if (r.right > clientW + 3 && r.width > 0 && r.height > 0) {
                offendingElements.push({
                  tag: el.tagName.toLowerCase(),
                  id: el.id || undefined,
                  className: typeof el.className === 'string' ? el.className.trim() : undefined,
                  right: Math.round(r.right),
                  width: Math.round(r.width),
                  textSnippet: (el.innerText || el.textContent || '').trim().slice(0, 30)
                });
              }
            }
          }

          return {
            scrollW,
            clientW,
            hasOverflow,
            offendingElements: offendingElements.slice(0, 5) // top 5
          };
        });

        const errs = browser.getConsoleErrors();
        if (errs.length > 0) {
          detailedFindings.results[name].consoleErrors.push(...errs.map(e => `[${vp.name}] ${e.text}`));
        }

        if (overflowDetails.hasOverflow) {
          const finding = {
            viewport: vp.name,
            viewportWidth: vp.width,
            scrollWidth: overflowDetails.scrollW,
            clientWidth: overflowDetails.clientW,
            delta: overflowDetails.scrollW - overflowDetails.clientW,
            offenders: overflowDetails.offendingElements
          };
          detailedFindings.results[name].overflows.push(finding);
          console.log(`  ❌ OVERFLOW [${vp.name}]: scrollWidth (${overflowDetails.scrollW}px) > clientWidth (${overflowDetails.clientW}px) (+${overflowDetails.scrollW - overflowDetails.clientW}px)`);
          if (overflowDetails.offendingElements.length > 0) {
            console.log(`     Top offenders:`, JSON.stringify(overflowDetails.offendingElements));
          }
        } else {
          console.log(`  ✓ NO OVERFLOW [${vp.name}]: ${overflowDetails.clientW}px`);
        }
      }

      // 2. Element Collision & Sibling Bounding Box Overlap at 1920x1080 & 768x1024
      for (const testVp of [{ w: 1920, h: 1080, name: '1920x1080' }, { w: 768, h: 1024, name: '768x1024' }]) {
        await browser.setViewport(testVp.w, testVp.h);
        await browser.navigate(filePath);
        await browser.sleep(250);

        const collisions = await browser.evaluate(() => {
          const containers = Array.from(document.querySelectorAll('.grid, .dashboard-grid, .layout-grid, .panel-grid, .container, main, .main-content, .cockpit-grid, .panels-container, .cards-grid'));
          const found = [];

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

                if (overlapArea > 50) {
                  found.push({
                    el1: children[i].className || children[i].tagName,
                    el2: children[j].className || children[j].tagName,
                    overlapArea: Math.round(overlapArea),
                    r1: { top: r1.top, bottom: r1.bottom, left: r1.left, right: r1.right },
                    r2: { top: r2.top, bottom: r2.bottom, left: r2.left, right: r2.right }
                  });
                }
              }
            }
          });
          return found;
        });

        if (collisions.length > 0) {
          detailedFindings.results[name].collisions.push({ viewport: testVp.name, collisions });
          console.log(`  ❌ COLLISIONS [${testVp.name}]:`, JSON.stringify(collisions));
        } else {
          console.log(`  ✓ NO COLLISIONS [${testVp.name}]`);
        }
      }

      // 3. Text Clipping / Truncation Check at 1280x800
      await browser.setViewport(1280, 800);
      await browser.navigate(filePath);
      await browser.sleep(250);

      const clipped = await browser.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll('h1, h2, h3, .card, .hud-panel, .metric-value, .stepper, .panel-body, .status-card'));
        const list = [];
        candidates.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.overflow === 'hidden' || style.overflowY === 'hidden') {
            if (el.scrollHeight > el.clientHeight + 16 && el.clientHeight > 0) {
              list.push({
                element: el.className || el.tagName,
                scrollHeight: el.scrollHeight,
                clientHeight: el.clientHeight,
                sampleText: (el.innerText || '').slice(0, 40)
              });
            }
          }
        });
        return list;
      });

      if (clipped.length > 0) {
        detailedFindings.results[name].clipping.push(...clipped);
        console.log(`  ❌ TEXT CLIPPING DETECTED:`, JSON.stringify(clipped));
      } else {
        console.log(`  ✓ NO TEXT CLIPPING`);
      }

      // 4. Z-Index Layering Probe
      const zIndexIssues = await browser.evaluate(() => {
        const issues = [];
        const canvasBg = document.querySelector('canvas#bgCanvas, canvas.bg-canvas, canvas.particle-canvas');
        if (canvasBg) {
          const z = parseInt(window.getComputedStyle(canvasBg).zIndex) || 0;
          if (z > 0) issues.push(`Background canvas has z-index ${z} > 0`);
        }

        const cards = Array.from(document.querySelectorAll('.card, .hud-panel, .panel, .node'));
        cards.forEach(c => {
          const z = parseInt(window.getComputedStyle(c).zIndex);
          if (!isNaN(z) && z < 2 && window.getComputedStyle(c).position !== 'static') {
            issues.push(`Card/Panel ${c.className} has z-index ${z} < 2`);
          }
        });

        return issues;
      });

      if (zIndexIssues.length > 0) {
        detailedFindings.results[name].zIndexAnomalies.push(...zIndexIssues);
        console.log(`  ⚠️ Z-INDEX ANOMALIES:`, JSON.stringify(zIndexIssues));
      } else {
        console.log(`  ✓ Z-INDEX LAYERING COMPLIANT`);
      }

      // Evaluation of dashboard
      const hasDefects = detailedFindings.results[name].overflows.length > 0 || 
                         detailedFindings.results[name].collisions.length > 0 || 
                         detailedFindings.results[name].clipping.length > 0;

      if (hasDefects) {
        detailedFindings.failedDashboards++;
      } else {
        detailedFindings.passedDashboards++;
      }
    }

    console.log('\n================================================================');
    console.log(`📊 STRESS SUITE COMPLETE: ${detailedFindings.passedDashboards}/${detailedFindings.totalDashboards} Dashboards fully passed`);
    console.log(`   Defects detected in: ${detailedFindings.failedDashboards} Dashboards`);
    console.log('================================================================\n');

    // Save JSON report for handoff reference
    const reportPath = path.resolve(__dirname, '..', '.agents', 'm1_challenger_1', 'deep_stress_results.json');
    fs.writeFileSync(reportPath, JSON.stringify(detailedFindings, null, 2));
    console.log(`Saved detailed JSON results to: ${reportPath}`);

    return detailedFindings;

  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  runDeepStressSuite().then(results => {
    process.exit(results.failedDashboards > 0 ? 1 : 0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runDeepStressSuite };
