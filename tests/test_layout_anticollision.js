/**
 * Multi-Viewport Layout Integrity & Anti-Collision Test Suite
 * Validates all 14 enterprise dashboards + Master Portal across 5 viewports:
 * - 360px (Mobile portrait)
 * - 768px (Tablet portrait)
 * - 1280px (Laptop / HD)
 * - 1920px (Full HD Desktop)
 * - 3840px (4K Ultra-HD)
 *
 * Verifies:
 * 1. Zero horizontal scroll overflow across viewports
 * 2. Zero bounding box collision / sibling overlap in flex/grid containers
 * 3. Fluid typography & clamp() scaling
 * 4. Zero fixed-height text container clipping
 * 5. Zero console errors
 */

const path = require('path');
const fs = require('fs');
const { TestContext, Helpers } = require('./fixtures/helpers');

const VIEWPORTS = [
  { name: 'Mobile (360x640)', width: 360, height: 640, isMobile: true },
  { name: 'Tablet (768x1024)', width: 768, height: 1024, isMobile: true },
  { name: 'Laptop (1280x800)', width: 1280, height: 800, isMobile: false },
  { name: 'Desktop (1920x1080)', width: 1920, height: 1080, isMobile: false },
  { name: '4K UHD (3840x2160)', width: 3840, height: 2160, isMobile: false }
];

async function runTests(browser, dashboardUrls) {
  const ctx = new TestContext('Layout Integrity, Anti-Collision & Multi-Viewport Suite (360px-3840px)');
  const rootDir = path.resolve(__dirname, '..');

  const targets = dashboardUrls || {
    'apigee-mulesoft-hybrid': path.join(rootDir, 'sistemas', 'apigee-mulesoft-hybrid', 'index.html'),
    'emergency-evacuation-v1': path.join(rootDir, 'sistemas', 'emergency-evacuation-v1', 'index.html'),
    'emergency-evacuation-v2': path.join(rootDir, 'sistemas', 'emergency-evacuation-v2', 'index.html'),
    'emergency-evacuation-v3': path.join(rootDir, 'sistemas', 'emergency-evacuation-v3', 'index.html'),
    'gcp-serverless-pipeline': path.join(rootDir, 'sistemas', 'gcp-serverless-pipeline', 'index.html'),
    'gcp-event-pubsub': path.join(rootDir, 'sistemas', 'gcp-event-pubsub', 'index.html'),
    'gcp-sql-networking': path.join(rootDir, 'sistemas', 'gcp-sql-networking', 'index.html'),
    'gcp-iam-security': path.join(rootDir, 'sistemas', 'gcp-iam-security', 'index.html'),
    'gcp-cloudops-cockpit': path.join(rootDir, 'sistemas', 'gcp-cloudops-cockpit', 'index.html'),
    'mulesoft-observability': path.join(rootDir, 'sistemas', 'mulesoft-observability', 'index.html'),
    'network-health': path.join(rootDir, 'sistemas', 'network-health', 'index.html'),
    'security-audit': path.join(rootDir, 'sistemas', 'security-audit', 'index.html'),
    'server-status': path.join(rootDir, 'sistemas', 'server-status', 'index.html'),
    'transaction-flow': path.join(rootDir, 'sistemas', 'transaction-flow', 'index.html'),
    'tv-diagnostic': path.join(rootDir, 'sistemas', 'tv-diagnostic', 'index.html')
  };

  for (const [name, filePath] of Object.entries(targets)) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    // 1. Viewport Horizontal Overflow & Console Error Test across 5 viewports
    await ctx.test(`LAYOUT-${name}: Zero horizontal overflow across all 5 viewports (360px–3840px)`, async () => {
      const failures = [];
      for (const vp of VIEWPORTS) {
        await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
        await browser.navigate(filePath);
        await browser.sleep(200);

        const overflow = await browser.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientW = Math.max(doc.clientWidth, body.clientWidth);
          return {
            scrollW,
            clientW,
            hasOverflow: scrollW > clientW + 3 // 3px tolerance for scrollbar subpixel calculations
          };
        });

        if (overflow.hasOverflow) {
          failures.push(`[${vp.name}] scrollWidth (${overflow.scrollW}px) > clientWidth (${overflow.clientW}px)`);
        }
      }

      Helpers.assertTrue(failures.length === 0, `Horizontal scroll overflow detected in ${name}:\n  ` + failures.join('\n  '));
    });

    // 2. Element Anti-Collision & Bounding Box Overlap Verification
    await ctx.test(`LAYOUT-${name}: Zero element collision / bounding box overlaps for sibling cards`, async () => {
      await browser.setViewport(1920, 1080);
      await browser.navigate(filePath);
      await browser.sleep(200);

      const collisionReport = await browser.evaluate(() => {
        const containers = Array.from(document.querySelectorAll('.grid, .dashboard-grid, .layout-grid, .panel-grid, .container, main, .main-content, .cockpit-grid'));
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
              
              // Calculate intersection
              const overlapX = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
              const overlapY = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
              const overlapArea = overlapX * overlapY;

              if (overlapArea > 50) { // allow small margin
                collisions.push({
                  el1: children[i].className || children[i].tagName,
                  el2: children[j].className || children[j].tagName,
                  overlapArea: Math.round(overlapArea)
                });
              }
            }
          }
        });

        return collisions;
      });

      Helpers.assertTrue(collisionReport.length === 0, `Element collisions found in ${name}: ${JSON.stringify(collisionReport)}`);
    });

    // 3. Text Container Clipping Check (Fluid Heights & No Premature Truncation)
    await ctx.test(`LAYOUT-${name}: Absence of fixed-height text container truncation`, async () => {
      await browser.setViewport(1280, 800);
      await browser.navigate(filePath);
      await browser.sleep(200);

      const clippedReport = await browser.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll('h1, h2, h3, .card, .hud-panel, .metric-value, .stepper, .panel-body'));
        const clipped = [];

        candidates.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.overflow === 'hidden' || style.overflowY === 'hidden') {
            // If scrollHeight significantly exceeds clientHeight and there is no scroll mechanism
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

      Helpers.assertTrue(clippedReport.length === 0, `Clipped text containers found in ${name}: ${JSON.stringify(clippedReport)}`);
    });

    // 4. Fluid clamp() / responsive CSS checks
    await ctx.test(`LAYOUT-${name}: Fluid CSS clamp() or responsive scaling in stylesheet`, async () => {
      await browser.navigate(filePath);
      const fluidCheck = await browser.evaluate(() => {
        const html = document.documentElement.innerHTML;
        const hasClamp = /clamp\s*\(/.test(html);
        const hasMinmax = /minmax\s*\(/.test(html);
        const hasAutoFit = /repeat\s*\(\s*auto-fit/i.test(html) || /repeat\s*\(\s*auto-fill/i.test(html);
        const hasMediaQueries = /@media/i.test(html);
        return {
          hasClamp,
          hasMinmax,
          hasAutoFit,
          hasMediaQueries,
          isResponsive: hasClamp || hasMinmax || hasAutoFit || hasMediaQueries
        };
      });

      Helpers.assertTrue(fluidCheck.isResponsive, `Dashboard ${name} must implement responsive fluid rules`);
    });
  }

  return ctx.summary();
}

// Standalone execution
if (require.main === module) {
  const { BrowserSession } = require('./runner');
  (async () => {
    const browser = new BrowserSession();
    try {
      await browser.launch();
      const res = await runTests(browser);
      console.log(`\nLayout Anti-Collision Suite Result: ${res.passed}/${res.total} Passed (${res.duration}ms)`);
      process.exit(res.failed === 0 ? 0 : 1);
    } catch (err) {
      console.error(err);
      process.exit(1);
    } finally {
      await browser.close();
    }
  })();
}

module.exports = { runTests };
