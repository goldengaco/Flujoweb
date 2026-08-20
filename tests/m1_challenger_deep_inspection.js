/**
 * M1 Challenger 2: Deep Modal, Stacking Context & Responsive Overflow Diagnostics
 */

const path = require('path');
const fs = require('fs');
const { BrowserSession } = require('./runner');

const ROOT_DIR = path.resolve(__dirname, '..');

const DASHBOARDS = [
  { id: 'tv-diagnostic', name: 'TV Diagnostic Telemetry', file: path.join(ROOT_DIR, 'sistemas', 'tv-diagnostic', 'index.html') },
  { id: 'network-health', name: 'Network Health Check', file: path.join(ROOT_DIR, 'sistemas', 'network-health', 'index.html') },
  { id: 'security-audit', name: 'Security Audit Scanner', file: path.join(ROOT_DIR, 'sistemas', 'security-audit', 'index.html') },
  { id: 'server-status', name: 'Server Status NOC', file: path.join(ROOT_DIR, 'sistemas', 'server-status', 'index.html') },
  { id: 'transaction-flow', name: 'Transaction Flow Pipeline', file: path.join(ROOT_DIR, 'sistemas', 'transaction-flow', 'index.html') },
  { id: 'gcp-serverless-pipeline', name: 'GCP Serverless Pipeline', file: path.join(ROOT_DIR, 'sistemas', 'gcp-serverless-pipeline', 'index.html') },
  { id: 'gcp-event-pubsub', name: 'GCP Pub/Sub & DLQ', file: path.join(ROOT_DIR, 'sistemas', 'gcp-event-pubsub', 'index.html') },
  { id: 'gcp-sql-networking', name: 'GCP SQL Networking', file: path.join(ROOT_DIR, 'sistemas', 'gcp-sql-networking', 'index.html') },
  { id: 'gcp-iam-security', name: 'GCP IAM Security', file: path.join(ROOT_DIR, 'sistemas', 'gcp-iam-security', 'index.html') },
  { id: 'gcp-cloudops-cockpit', name: 'GCP CloudOps Cockpit', file: path.join(ROOT_DIR, 'sistemas', 'gcp-cloudops-cockpit', 'index.html') },
  { id: 'mulesoft-observability', name: 'MuleSoft Observability', file: path.join(ROOT_DIR, 'sistemas', 'mulesoft-observability', 'index.html') },
  { id: 'apigee-mulesoft-hybrid', name: 'Apigee MuleSoft Hybrid', file: path.join(ROOT_DIR, 'sistemas', 'apigee-mulesoft-hybrid', 'index.html') },
  { id: 'emergency-evacuation-v1', name: 'Emergency Evacuation V1', file: path.join(ROOT_DIR, 'sistemas', 'emergency-evacuation-v1', 'index.html') },
  { id: 'emergency-evacuation-v2', name: 'Emergency Evacuation V2', file: path.join(ROOT_DIR, 'sistemas', 'emergency-evacuation-v2', 'index.html') },
  { id: 'emergency-evacuation-v3', name: 'Emergency Evacuation V3', file: path.join(ROOT_DIR, 'sistemas', 'emergency-evacuation-v3', 'index.html') }
];

async function runDeepDiagnostics() {
  const browser = new BrowserSession();
  const diagnostics = [];

  try {
    await browser.launch();
    console.log('\n========================================================================================');
    console.log('   M1 CHALLENGER 2: DEEP MODAL STACKING CONTEXT & OVERFLOW ROOT-CAUSE DIAGNOSTICS      ');
    console.log('========================================================================================\n');

    for (const dash of DASHBOARDS) {
      if (!fs.existsSync(dash.file)) continue;

      await browser.navigate(dash.file);
      await browser.sleep(300);

      const report = await browser.evaluate((dashId) => {
        const res = {
          id: dashId,
          zLayers: {
            canvases: [],
            svgs: [],
            cards: [],
            modalsAndDrawers: []
          },
          overflowCulprits: []
        };

        // 1. Z-Layers Check
        document.querySelectorAll('canvas').forEach(el => {
          const s = window.getComputedStyle(el);
          res.zLayers.canvases.push({ id: el.id || el.className, z: s.zIndex, position: s.position, pe: s.pointerEvents });
        });

        document.querySelectorAll('svg').forEach(el => {
          const s = window.getComputedStyle(el);
          if (s.position !== 'static' || s.zIndex !== 'auto') {
            res.zLayers.svgs.push({ id: el.id || el.className, z: s.zIndex, position: s.position });
          }
        });

        document.querySelectorAll('.card, .metric-card, .node, .panel').forEach(el => {
          const s = window.getComputedStyle(el);
          if (s.zIndex !== 'auto' && s.zIndex !== '0') {
            res.zLayers.cards.push({ id: el.id || el.className, z: s.zIndex, position: s.position });
          }
        });

        document.querySelectorAll('.modal, .modal-overlay, .drawer, .drawer-overlay, .inspection-drawer, .toast, [role="dialog"], [role="tooltip"]').forEach(el => {
          const s = window.getComputedStyle(el);
          res.zLayers.modalsAndDrawers.push({
            id: el.id || el.className,
            z: s.zIndex,
            position: s.position,
            display: s.display,
            visibility: s.visibility,
            opacity: s.opacity,
            pointerEvents: s.pointerEvents
          });
        });

        // 2. Identify elements causing horizontal overflow when window width is 360px
        const docW = document.documentElement.clientWidth;
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          const rect = el.getBoundingClientRect();
          if (rect.right > docW + 2 && rect.width > 0) {
            const s = window.getComputedStyle(el);
            if (s.display !== 'none' && s.visibility !== 'hidden') {
              res.overflowCulprits.push({
                tag: el.tagName,
                id: el.id,
                className: el.className,
                rectRight: Math.round(rect.right),
                rectWidth: Math.round(rect.width),
                clientWidth: docW,
                overflowPx: Math.round(rect.right - docW)
              });
            }
          }
        });

        // Deduplicate and sort culprits by overflow amount
        res.overflowCulprits.sort((a, b) => b.overflowPx - a.overflowPx);
        res.overflowCulprits = res.overflowCulprits.slice(0, 5);

        return res;
      }, dash.id);

      diagnostics.push(report);

      console.log(`\x1b[1m\x1b[36m[${dash.id}]\x1b[0m`);
      console.log(`  Canvases: ${JSON.stringify(report.zLayers.canvases)}`);
      console.log(`  Modals/Drawers: ${JSON.stringify(report.zLayers.modalsAndDrawers)}`);
      if (report.overflowCulprits.length > 0) {
        console.log(`  \x1b[33mOverflow Culprits (at desktop viewport):\x1b[0m`);
        report.overflowCulprits.forEach(c => {
          console.log(`    - <${c.tag} id="${c.id}" class="${c.className}"> width: ${c.rectWidth}px, right: ${c.rectRight}px (overflow: +${c.overflowPx}px)`);
        });
      } else {
        console.log(`  \x1b[32mNo overflow culprits at initial load\x1b[0m`);
      }
    }

  } catch (err) {
    console.error(`Diagnostic Error: ${err.message}`);
  } finally {
    await browser.close();
  }

  return diagnostics;
}

if (require.main === module) {
  runDeepDiagnostics().then(() => process.exit(0)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runDeepDiagnostics };
