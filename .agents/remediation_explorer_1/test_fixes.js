const path = require('path');
const { BrowserSession } = require('../../tests/runner');

const tests = [
  {
    id: 'security-audit',
    name: 'System 3: Security Audit',
    file: path.resolve(__dirname, '../../sistemas/security-audit/index.html'),
    cssFix: `
      /* Fix for System 3: Security Audit */
      .app-container {
        max-width: 1400px;
        box-sizing: border-box;
      }
      .app-header {
        flex-wrap: wrap;
      }
      .brand-section {
        flex-wrap: wrap;
        max-width: 100%;
      }
      .brand-titles {
        max-width: 100%;
        min-width: 0;
      }
      .brand-titles h1 {
        flex-wrap: wrap;
      }
      .brand-titles p {
        flex-wrap: wrap;
        word-break: break-word;
      }
      .stepper-container {
        grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        gap: 8px;
      }
      .matrix-search-wrap {
        min-width: 0;
        width: 100%;
      }
      @media (max-width: 600px) {
        .app-container {
          padding: 12px 10px 40px;
        }
        .app-header {
          padding: 14px 12px;
        }
        .stepper-section {
          padding: 14px 12px;
        }
        .matrix-panel {
          padding: 14px 12px;
        }
        .stepper-container {
          grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
          gap: 6px;
        }
        .node-title {
          font-size: 0.68rem;
        }
      }
    `
  },
  {
    id: 'gcp-serverless-pipeline',
    name: 'System 6: GCP Serverless Pipeline',
    file: path.resolve(__dirname, '../../sistemas/gcp-serverless-pipeline/index.html'),
    cssFix: `
      /* Fix for System 6: GCP Serverless Pipeline */
      .app-container {
        box-sizing: border-box;
      }
      .stat-chip {
        min-width: 0;
        overflow: hidden;
      }
      .stat-value {
        word-break: break-all;
        overflow-wrap: anywhere;
      }
      .section-title-row {
        flex-wrap: wrap;
      }
      .phase-meta {
        flex-wrap: wrap;
      }
      .slider-labels-row {
        flex-wrap: wrap;
        gap: 4px;
      }
      @media (max-width: 600px) {
        .app-container {
          padding: 10px 8px 30px;
        }
        .header {
          padding: 10px 12px;
        }
        .card, .pipeline-card {
          padding: 12px 10px;
        }
        .quick-stats-bar {
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          gap: 8px;
        }
        .stat-chip {
          padding: 8px 10px;
        }
        .split-slider-container {
          padding: 10px;
        }
        .stat-value {
          font-size: 13px;
        }
      }
    `
  },
  {
    id: 'gcp-event-pubsub',
    name: 'System 7: GCP Event Pub/Sub',
    file: path.resolve(__dirname, '../../sistemas/gcp-event-pubsub/index.html'),
    cssFix: `
      /* Fix for System 7: GCP Event Pub/Sub */
      .app-container {
        box-sizing: border-box;
      }
      .brand-section {
        flex-wrap: wrap;
        max-width: 100%;
      }
      .brand-titles {
        min-width: 0;
        max-width: 100%;
      }
      .brand-title-row {
        flex-wrap: wrap;
      }
      .brand-subtitle {
        flex-wrap: wrap;
      }
      .gcp-api-badges {
        flex-wrap: wrap;
      }
      .api-badge {
        word-break: break-all;
        max-width: 100%;
      }
      .slider-group {
        min-width: 0;
        width: 100%;
      }
      @media (max-width: 600px) {
        .app-container {
          padding: 10px 8px 40px;
        }
        .app-header {
          padding: 10px 12px;
        }
        .dlq-section-card {
          padding: 12px 10px;
        }
        .log-console-card {
          padding: 12px 10px;
        }
        .aux-card {
          padding: 12px 10px;
        }
      }
    `
  },
  {
    id: 'gcp-sql-networking',
    name: 'System 8: GCP SQL Networking',
    file: path.resolve(__dirname, '../../sistemas/gcp-sql-networking/index.html'),
    cssFix: `
      /* Fix for System 8: GCP SQL Networking */
      .app-container {
        box-sizing: border-box;
      }
      .ambient-glow {
        max-width: 100vw;
        overflow: hidden;
      }
      .dashboard-grid > * {
        min-width: 0;
      }
      .panel {
        min-width: 0;
        max-width: 100%;
      }
      .panel-header {
        flex-wrap: wrap;
      }
      .panel-title {
        flex-wrap: wrap;
        word-break: break-word;
        overflow-wrap: anywhere;
      }
      .panel-controls {
        flex-wrap: wrap;
      }
      .stepper-progress-list {
        grid-template-columns: repeat(auto-fit, minmax(95px, 1fr));
        gap: 6px;
      }
      .terminal-header {
        flex-wrap: wrap;
        gap: 6px;
      }
      .terminal-header span {
        word-break: break-all;
        overflow-wrap: anywhere;
      }
      .cmek-info-val {
        word-break: break-all;
        overflow-wrap: anywhere;
      }
      .cmek-grid {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
      .failover-actions-bar {
        flex-wrap: wrap;
      }
      .kpi-strip {
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      }
      .topology-stats-overlay {
        max-width: 90%;
        word-break: break-word;
      }
      @media (max-width: 600px) {
        .app-container {
          padding: 10px 8px 30px;
        }
        .header-bar {
          padding: 10px 12px;
        }
        .panel {
          padding: 12px 10px;
        }
        .stepper-progress-list {
          grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
        }
        .brand-text h1 {
          flex-wrap: wrap;
        }
        .brand-subtitle {
          flex-wrap: wrap;
        }
        .header-badges {
          flex-wrap: wrap;
        }
        .header-actions {
          flex-wrap: wrap;
        }
      }
    `
  }
];

const viewports = [
  { name: 'Mobile 360', width: 360, height: 640 },
  { name: 'Mobile 412', width: 412, height: 915 },
  { name: 'Tablet 768', width: 768, height: 1024 },
  { name: 'Tablet 1024', width: 1024, height: 768 },
  { name: 'Laptop 1280', width: 1280, height: 800 },
  { name: 'Desktop 1920', width: 1920, height: 1080 },
  { name: 'QHD 2560', width: 2560, height: 1440 },
  { name: '4K 3840', width: 3840, height: 2160 }
];

async function run() {
  const browser = new BrowserSession();
  await browser.launch();

  let allPassed = true;

  try {
    for (const target of tests) {
      console.log(`\n========================================`);
      console.log(`TESTING REMEDIATED ${target.name}`);
      console.log(`========================================`);

      for (const vp of viewports) {
        await browser.setViewport(vp.width, vp.height, 1, vp.width <= 768);
        await browser.navigate(target.file);

        // Inject the proposed candidate CSS into head
        await browser.evaluate((css) => {
          const style = document.createElement('style');
          style.id = 'remediation-style-fix';
          style.textContent = css;
          document.head.appendChild(style);
        }, target.cssFix);

        await browser.sleep(150);

        const check = await browser.evaluate(() => {
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

        if (check.hasOverflow) {
          console.log(`  ❌ [${vp.name} (${vp.width}x${vp.height})]: scrollW (${check.scrollW}px) > clientW (${check.clientW}px) (+${check.diff}px)`);
          allPassed = false;
        } else {
          console.log(`  ✅ [${vp.name} (${vp.width}x${vp.height})]: clientW=${check.clientW}px, scrollW=${check.scrollW}px (No overflow)`);
        }
      }
    }
  } finally {
    await browser.close();
  }

  console.log(`\nSummary: ${allPassed ? 'ALL VIEWPORT TESTS PASSED 100%' : 'SOME TESTS FAILED'}`);
}

run().catch(console.error);
