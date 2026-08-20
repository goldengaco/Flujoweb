const path = require('path');
const fs = require('fs');
const { BrowserSession } = require(path.resolve(__dirname, '../../tests/runner'));

const VIEWPORTS = [
  { name: 'Mobile (360x640)', width: 360, height: 640, isMobile: true },
  { name: 'Tablet (768x1024)', width: 768, height: 1024, isMobile: true },
  { name: 'Laptop (1280x800)', width: 1280, height: 800, isMobile: false },
  { name: 'Desktop (1920x1080)', width: 1920, height: 1080, isMobile: false },
  { name: '4K UHD (3840x2160)', width: 3840, height: 2160, isMobile: false }
];

const sistemasDir = path.resolve(__dirname, '../../sistemas');
const apps = [
  'index.html',
  'apigee-mulesoft-hybrid/index.html',
  'emergency-evacuation-v1/index.html',
  'emergency-evacuation-v2/index.html',
  'emergency-evacuation-v3/index.html',
  'gcp-cloudops-cockpit/index.html',
  'gcp-event-pubsub/index.html',
  'gcp-iam-security/index.html',
  'gcp-serverless-pipeline/index.html',
  'gcp-sql-networking/index.html',
  'mulesoft-observability/index.html',
  'network-health/index.html',
  'security-audit/index.html',
  'server-status/index.html',
  'transaction-flow/index.html',
  'tv-diagnostic/index.html'
];

async function main() {
  console.log('Starting Layout, Typography & Z-Index Audit across 16 targets...\n');
  const browser = new BrowserSession();
  await browser.launch();

  const results = [];

  try {
    for (const app of apps) {
      const fullPath = path.join(sistemasDir, app);
      if (!fs.existsSync(fullPath)) {
        console.error(`MISSING: ${fullPath}`);
        results.push({ app, status: 'MISSING' });
        continue;
      }

      const fileContent = fs.readFileSync(fullPath, 'utf8');
      const clampMatches = (fileContent.match(/clamp\s*\(/g) || []).length;
      const zIndexMatches = (fileContent.match(/z-index\s*:\s*(\d+)/g) || []);
      const zIndexValues = zIndexMatches.map(m => parseInt(m.split(':')[1].trim(), 10));

      const appResult = {
        app,
        clampCount: clampMatches,
        zIndexValues: [...new Set(zIndexValues)].sort((a,b)=>a-b),
        overflowFailures: [],
        consoleErrors: [],
        textClippingFailures: []
      };

      // Multi-viewport testing
      for (const vp of VIEWPORTS) {
        await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
        await browser.navigate(fullPath);
        await browser.sleep(150);

        const errors = browser.getConsoleErrors();
        if (errors.length > 0) {
          appResult.consoleErrors.push(...errors.map(e => `[${vp.name}] ${e.text}`));
        }

        const metrics = await browser.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientW = Math.max(doc.clientWidth, body.clientWidth);
          return {
            scrollW,
            clientW,
            hasOverflow: scrollW > clientW + 3
          };
        });

        if (metrics.hasOverflow) {
          appResult.overflowFailures.push(`[${vp.name}] scrollW:${metrics.scrollW}px > clientW:${metrics.clientW}px`);
        }
      }

      // Check text clipping at laptop viewport
      await browser.setViewport(1280, 800);
      await browser.navigate(fullPath);
      await browser.sleep(150);

      const clipped = await browser.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll('h1, h2, h3, .card, .hud-panel, .metric-value, .stepper, .panel-body'));
        const issues = [];
        candidates.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.overflow === 'hidden' || style.overflowY === 'hidden') {
            if (el.scrollHeight > el.clientHeight + 16 && el.clientHeight > 0) {
              issues.push({
                tag: el.tagName,
                class: el.className,
                diff: el.scrollHeight - el.clientHeight
              });
            }
          }
        });
        return issues;
      });

      if (clipped.length > 0) {
        appResult.textClippingFailures.push(...clipped.map(c => `${c.tag}.${c.class} (+${c.diff}px)`));
      }

      results.push(appResult);

      const passStr = appResult.overflowFailures.length === 0 && appResult.consoleErrors.length === 0 && appResult.textClippingFailures.length === 0 ? '✔ PASS' : '✖ FAIL';
      console.log(`[${passStr}] ${app.padEnd(42)} | clamp(): ${String(clampMatches).padStart(2)} | z-indices: [${appResult.zIndexValues.join(', ')}]`);
      if (appResult.overflowFailures.length > 0) {
        console.log(`       Overflows: ${appResult.overflowFailures.join('; ')}`);
      }
      if (appResult.consoleErrors.length > 0) {
        console.log(`       Console Errors: ${appResult.consoleErrors.join('; ')}`);
      }
      if (appResult.textClippingFailures.length > 0) {
        console.log(`       Clipping: ${appResult.textClippingFailures.join('; ')}`);
      }
    }

  } finally {
    await browser.close();
  }

  const allPassed = results.every(r => r.overflowFailures.length === 0 && r.consoleErrors.length === 0 && r.textClippingFailures.length === 0);
  console.log(`\nOverall Layout & Typography Verdict: ${allPassed ? 'ALL CLEAN' : 'VIOLATIONS FOUND'}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
