/**
 * Deep Independent Verification & Adversarial Stress Suite for Systems 1-8 (Milestone 1)
 * Reviewer: m1_reviewer_r2_1
 */

const fs = require('fs');
const path = require('path');
const { BrowserSession } = require('../../tests/runner');

const SYSTEMS = [
  { id: 1, name: 'tv-diagnostic', path: 'sistemas/tv-diagnostic/index.html' },
  { id: 2, name: 'network-health', path: 'sistemas/network-health/index.html' },
  { id: 3, name: 'security-audit', path: 'sistemas/security-audit/index.html' },
  { id: 4, name: 'server-status', path: 'sistemas/server-status/index.html' },
  { id: 5, name: 'transaction-flow', path: 'sistemas/transaction-flow/index.html' },
  { id: 6, name: 'gcp-serverless-pipeline', path: 'sistemas/gcp-serverless-pipeline/index.html' },
  { id: 7, name: 'gcp-event-pubsub', path: 'sistemas/gcp-event-pubsub/index.html' },
  { id: 8, name: 'gcp-sql-networking', path: 'sistemas/gcp-sql-networking/index.html' }
];

const VIEWPORTS = [
  { name: 'Ultra-Narrow Mobile (360x640)', width: 360, height: 640, isMobile: true },
  { name: 'iPhone SE (375x667)', width: 375, height: 667, isMobile: true },
  { name: 'Modern Android (412x915)', width: 412, height: 915, isMobile: true },
  { name: 'Compact Mobile (480x800)', width: 480, height: 800, isMobile: true },
  { name: 'Phablet / Small Tablet (640x960)', width: 640, height: 960, isMobile: true },
  { name: 'iPad Portrait (768x1024)', width: 768, height: 1024, isMobile: true },
  { name: 'iPad Landscape / Small Laptop (1024x768)', width: 1024, height: 768, isMobile: false },
  { name: 'Standard HD Laptop (1280x800)', width: 1280, height: 800, isMobile: false },
  { name: 'MacBook / QHD (1440x900)', width: 1440, height: 900, isMobile: false },
  { name: 'FHD 1080p Desktop (1920x1080)', width: 1920, height: 1080, isMobile: false },
  { name: 'QHD 1440p Monitor (2560x1440)', width: 2560, height: 1440, isMobile: false },
  { name: '4K UHD Workstation (3840x2160)', width: 3840, height: 2160, isMobile: false }
];

async function runReviewerVerification() {
  const rootDir = path.resolve(__dirname, '../..');
  const results = {
    staticAudit: {},
    viewportOverflow: {},
    collisionAudit: {},
    textClippingAudit: {},
    zIndexStratification: {},
    integrityAudit: {},
    adversarialStress: {},
    consoleErrors: {}
  };

  console.log('================================================================');
  console.log('🔍 INDEPENDENT REVIEWER AUDIT: SYSTEMS 1-8 (MILESTONE 1)');
  console.log('================================================================\n');

  // --- PART 1: STATIC CODE AUDIT & INTEGRITY CHECK ---
  console.log('--- 1. STATIC CODE AUDIT & INTEGRITY SCAN ---');
  for (const sys of SYSTEMS) {
    const fullPath = path.join(rootDir, sys.path);
    const content = fs.readFileSync(fullPath, 'utf8');

    // 1. Check clamp() usage
    const clampMatches = content.match(/clamp\([^)]+\)/g) || [];
    // 2. Check z-index declarations
    const zIndexMatches = content.match(/z-index\s*:\s*(-?\d+|auto|inherit|initial|unset)/gi) || [];
    const zIndexValues = zIndexMatches.map(m => {
      const val = m.replace(/z-index\s*:\s*/i, '').trim();
      return parseInt(val, 10);
    }).filter(v => !isNaN(v));

    // 3. Check min-height vs fixed height in cards/panels
    const fixedHeightCards = [];
    const heightRegex = /\.([\w-]+)\s*\{[^}]*?\bheight\s*:\s*(\d+)px[^}]*\}/g;
    let match;
    while ((match = heightRegex.exec(content)) !== null) {
      const cls = match[1];
      const hVal = parseInt(match[2], 10);
      if (hVal > 80 && !cls.includes('canvas') && !cls.includes('svg') && !cls.includes('logo') && !cls.includes('icon') && !cls.includes('slider') && !cls.includes('bar') && !cls.includes('thumb')) {
        fixedHeightCards.push({ class: cls, height: hVal });
      }
    }

    // 4. Check integrity: look for mock short-circuits, fake returns, hardcoded test passes
    const suspiciousPatterns = [
      /window\.__TEST_OVERRIDE/i,
      /if\s*\(\s*window\.__IS_TEST\s*\)\s*return\s*true/i,
      /mockSuccess\s*=\s*true/i,
      /\/\*\s*TEST_PASSED_DUMMY\s*\*\//i
    ];
    const integrityFlags = [];
    suspiciousPatterns.forEach((p, idx) => {
      if (p.test(content)) {
        integrityFlags.push(`Pattern ${idx} matched: ${p}`);
      }
    });

    results.staticAudit[sys.name] = {
      clampCount: clampMatches.length,
      sampleClamps: clampMatches.slice(0, 5),
      zIndexCount: zIndexMatches.length,
      zIndexValues: Array.from(new Set(zIndexValues)).sort((a, b) => a - b),
      fixedHeightCards,
      integrityFlags
    };

    console.log(`[SYS ${sys.id}: ${sys.name}]`);
    console.log(`  - clamp() count: ${clampMatches.length}`);
    console.log(`  - z-index values found: [${Array.from(new Set(zIndexValues)).sort((a, b) => a - b).join(', ')}]`);
    console.log(`  - Suspicious integrity flags: ${integrityFlags.length === 0 ? 'NONE (CLEAN)' : integrityFlags.join(', ')}`);
  }

  // --- PART 2: DYNAMIC PUPPETEER MULTI-VIEWPORT & LAYOUT AUDIT ---
  console.log('\n--- 2. DYNAMIC BROWSER MULTI-VIEWPORT AUDIT (12 VIEWPORTS) ---');
  const browser = new BrowserSession();
  await browser.launch();

  try {
    for (const sys of SYSTEMS) {
      const fullPath = path.join(rootDir, sys.path);
      results.consoleErrors[sys.name] = [];
      results.viewportOverflow[sys.name] = [];
      results.collisionAudit[sys.name] = [];
      results.textClippingAudit[sys.name] = [];
      results.zIndexStratification[sys.name] = [];
      results.adversarialStress[sys.name] = [];

      console.log(`\nEvaluating System ${sys.id}: ${sys.name}...`);

      for (const vp of VIEWPORTS) {
        await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
        await browser.navigate(fullPath);
        await browser.sleep(150);

        // A. Horizontal Overflow Check
        const overflow = await browser.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientW = Math.max(doc.clientWidth, body.clientWidth);
          return {
            scrollW,
            clientW,
            hasOverflow: scrollW > clientW + 2,
            diff: scrollW - clientW
          };
        });

        if (overflow.hasOverflow) {
          results.viewportOverflow[sys.name].push({
            viewport: vp.name,
            scrollW: overflow.scrollW,
            clientW: overflow.clientW,
            diff: overflow.diff
          });
        }
      }

      const overflowFails = results.viewportOverflow[sys.name].length;
      console.log(`  • Viewport Overflow: ${overflowFails === 0 ? '✅ 0/12 overflow (PASSED)' : `❌ ${overflowFails}/12 overflow FAILS`}`);

      // B. Anti-Collision & Bounding Box Overlap Audit at 1920x1080 and 768x1024
      for (const [w, h, vpName] of [[1920, 1080, '1920px'], [768, 1024, '768px'], [375, 667, '375px']]) {
        await browser.setViewport(w, h);
        await browser.navigate(fullPath);
        await browser.sleep(150);

        const collisions = await browser.evaluate(() => {
          const containers = Array.from(document.querySelectorAll('.grid, .dashboard-grid, .layout-grid, .panel-grid, .container, main, .main-content, .cockpit-grid, .stepper-container, .pipeline-grid, .metrics-grid'));
          const found = [];

          containers.forEach(c => {
            const children = Array.from(c.children).filter(el => {
              const s = window.getComputedStyle(el);
              return s.display !== 'none' && s.visibility !== 'hidden' && s.position !== 'absolute' && s.position !== 'fixed' && el.offsetWidth > 10 && el.offsetHeight > 10;
            });

            for (let i = 0; i < children.length; i++) {
              const r1 = children[i].getBoundingClientRect();
              for (let j = i + 1; j < children.length; j++) {
                const r2 = children[j].getBoundingClientRect();
                const overlapX = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
                const overlapY = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
                const area = overlapX * overlapY;
                if (area > 50) {
                  found.push({
                    el1: children[i].className || children[i].tagName,
                    el2: children[j].className || children[j].tagName,
                    area: Math.round(area)
                  });
                }
              }
            }
          });
          return found;
        });

        if (collisions.length > 0) {
          results.collisionAudit[sys.name].push({ viewport: vpName, collisions });
        }
      }
      const collisionFails = results.collisionAudit[sys.name].length;
      console.log(`  • Element Anti-Collision: ${collisionFails === 0 ? '✅ 0 collisions (PASSED)' : `❌ Collisions found: ${JSON.stringify(results.collisionAudit[sys.name])}`}`);

      // C. Text Container Clipping Audit
      await browser.setViewport(1280, 800);
      await browser.navigate(fullPath);
      await browser.sleep(150);
      const clipped = await browser.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll('h1, h2, h3, .card, .hud-panel, .metric-value, .stepper, .panel-body, .panel, .stat-chip, .node-card'));
        const issues = [];
        candidates.forEach(el => {
          const s = window.getComputedStyle(el);
          if (s.overflow === 'hidden' || s.overflowY === 'hidden') {
            if (el.scrollHeight > el.clientHeight + 16 && el.clientHeight > 0) {
              issues.push({
                element: el.className || el.tagName,
                scrollHeight: el.scrollHeight,
                clientHeight: el.clientHeight,
                text: (el.innerText || '').slice(0, 30)
              });
            }
          }
        });
        return issues;
      });
      results.textClippingAudit[sys.name] = clipped;
      console.log(`  • Text Container Clipping: ${clipped.length === 0 ? '✅ 0 clipped text boxes (PASSED)' : `❌ ${clipped.length} clipped elements`}`);

      // D. Z-Index Stratification Verification
      const zStrat = await browser.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        const layering = [];
        elements.forEach(el => {
          const s = window.getComputedStyle(el);
          const z = parseInt(s.zIndex, 10);
          if (!isNaN(z) && s.zIndex !== 'auto') {
            const cls = el.className || el.tagName;
            layering.push({ cls, z, tag: el.tagName, id: el.id });
          }
        });
        return layering;
      });
      results.zIndexStratification[sys.name] = zStrat;
      const invalidZ = zStrat.filter(item => item.z > 1000 || item.z < -10);
      console.log(`  • Z-Index Stratification: ${invalidZ.length === 0 ? '✅ Normalized within bounds (PASSED)' : `⚠️ Anomalous z-indexes: ${JSON.stringify(invalidZ)}`}`);

      // E. Adversarial Stress & Interactive State
      await browser.evaluate(() => {
        // Trigger all buttons, sliders, filters to verify no crashes or layout breakages
        const interactive = Array.from(document.querySelectorAll('button, input[type="range"], input[type="checkbox"], select'));
        interactive.forEach(btn => {
          try {
            if (typeof btn.click === 'function' && !btn.disabled) {
              btn.click();
            }
          } catch(e) {}
        });
      });
      await browser.sleep(100);
      const postStressOverflow = await browser.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        return {
          hasOverflow: Math.max(doc.scrollWidth, body.scrollWidth) > Math.max(doc.clientWidth, body.clientWidth) + 2
        };
      });
      console.log(`  • Adversarial Interactive State: ${!postStressOverflow.hasOverflow ? '✅ Stable post-interaction (PASSED)' : '❌ Overflow after interactions'}`);
    }
  } finally {
    await browser.close();
  }

  // Save audit output to agent directory
  const reportPath = path.join(__dirname, 'independent_audit_results.json');
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2), 'utf8');
  console.log(`\nIndependent Audit Report written to: ${reportPath}`);

  return results;
}

runReviewerVerification().catch(err => {
  console.error('Audit Error:', err);
  process.exit(1);
});
