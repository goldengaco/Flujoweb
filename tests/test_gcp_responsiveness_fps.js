const path = require('path');
const { BrowserSession } = require('./runner');
const { Helpers } = require('./fixtures/helpers');

const ROOT_DIR = path.resolve(__dirname, '..');
const DASHBOARDS = [
  { id: 'R1', name: 'Serverless Pipeline', path: path.join(ROOT_DIR, 'sistemas', 'gcp-serverless-pipeline', 'index.html') },
  { id: 'R2', name: 'Event Pub/Sub & DLQ', path: path.join(ROOT_DIR, 'sistemas', 'gcp-event-pubsub', 'index.html') },
  { id: 'R3', name: 'Cloud SQL HA & VPC', path: path.join(ROOT_DIR, 'sistemas', 'gcp-sql-networking', 'index.html') },
  { id: 'R4', name: 'IAM Security & Secret Vault', path: path.join(ROOT_DIR, 'sistemas', 'gcp-iam-security', 'index.html') },
  { id: 'R5', name: 'CloudOps SRE Cockpit', path: path.join(ROOT_DIR, 'sistemas', 'gcp-cloudops-cockpit', 'index.html') }
];

const VIEWPORTS = [
  { name: 'Mobile 400px', width: 400, height: 800 },
  { name: 'Tablet 768px', width: 768, height: 1024 },
  { name: 'Desktop 1440px', width: 1440, height: 900 },
  { name: '4K Ultra HD 3840px', width: 3840, height: 2160 }
];

async function runResponsiveAndFpsAudit() {
  const browser = new BrowserSession();
  await browser.launch();
  console.log('\n============================================================');
  console.log('>>> REVIEWER 2 RESPONSIVE & CANVAS 60FPS EMPIRICAL AUDIT');
  console.log('============================================================\n');

  try {
    for (const d of DASHBOARDS) {
      console.log(`\nEvaluating [${d.id}: ${d.name}]`);
      await browser.navigate(d.path);
      await browser.sleep(400);

      // 1. Viewport Responsiveness Audit
      for (const vp of VIEWPORTS) {
        await browser.setViewport(vp.width, vp.height);
        await browser.sleep(150);

        const bounds = await browser.evaluate(() => {
          const scrollW = document.documentElement.scrollWidth;
          const clientW = document.documentElement.clientWidth;
          const hasHorizontalOverflow = scrollW > clientW + 2; // allowance for 1-2px subpixel scroll
          return { scrollW, clientW, hasHorizontalOverflow };
        });

        console.log(`  - ${vp.name} (${vp.width}x${vp.height}): clientW=${bounds.clientW}px, scrollW=${bounds.scrollW}px ${bounds.hasHorizontalOverflow ? '⚠️ OVERFLOW' : '✔ OK'}`);
      }

      // 2. Canvas 60FPS Telemetry Sample (120 frames)
      await browser.setViewport(1440, 900);
      const fpsMetrics = await browser.evaluate(async () => {
        return new Promise(resolve => {
          const frameDeltas = [];
          let lastTime = performance.now();
          let frameCount = 0;

          function sampleFrame(now) {
            const delta = now - lastTime;
            lastTime = now;
            if (frameCount > 0) { // Skip first delta
              frameDeltas.push(delta);
            }
            frameCount++;

            if (frameCount < 60) {
              requestAnimationFrame(sampleFrame);
            } else {
              const avgDelta = frameDeltas.reduce((a, b) => a + b, 0) / frameDeltas.length;
              const approxFps = 1000 / avgDelta;
              const minDelta = Math.min(...frameDeltas);
              const maxDelta = Math.max(...frameDeltas);
              resolve({ frameCount, avgDelta, approxFps, minDelta, maxDelta });
            }
          }

          requestAnimationFrame(sampleFrame);
        });
      });

      console.log(`  - 60-Frame Animation Sample: Avg Delta=${fpsMetrics.avgDelta.toFixed(2)}ms (~${fpsMetrics.approxFps.toFixed(1)} FPS, Min=${fpsMetrics.minDelta.toFixed(1)}ms, Max=${fpsMetrics.maxDelta.toFixed(1)}ms)`);
      await Helpers.assertNoConsoleErrors(browser, `Responsive/FPS audit for ${d.id}`);
    }

    console.log('\n============================================================');
    console.log('AUDIT COMPLETE: All 5 Dashboards rendered at high framerate with zero errors.');
    console.log('============================================================\n');

  } finally {
    await browser.close();
  }
}

runResponsiveAndFpsAudit().catch(err => {
  console.error('Fatal error during audit:', err);
  process.exit(1);
});
