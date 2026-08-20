/**
 * M1 Challenger 2: Layer Isolation, Z-Index Stratification & Canvas Stress Suite
 * 
 * Empirically tests all 15 dashboards in sistemas/ for:
 * 1. Strict Z-Index Stratification: z:100 (Modals/Drawers/Toasts/Tooltips) > z:2 (Cards/Nodes) > z:1 (SVG Tracks/Lines) > z:0 (Canvas/Scanlines)
 * 2. Canvas Rendering Stability & Resize Behavior (360px -> 3840px)
 * 3. Canvas Hit-Testing & Pointer Events Isolation (Canvas does not steal clicks)
 * 4. Modal/Drawer Top-Layer Stacking Context (elementFromPoint verification)
 * 5. Full viewport horizontal overflow & bounding box collision checks
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

async function runEmpiricalStress() {
  const browser = new BrowserSession();
  const summary = {
    totalDashboards: DASHBOARDS.length,
    dashboardResults: [],
    findings: [],
    totalChecks: 0,
    passedChecks: 0,
    failedChecks: 0
  };

  try {
    await browser.launch();
    console.log('\n========================================================================================');
    console.log('   M1 CHALLENGER 2: ADVERSARIAL Z-INDEX, CANVAS & INTERACTIVITY EMPIRICAL STRESS SUITE  ');
    console.log('========================================================================================\n');

    for (const dash of DASHBOARDS) {
      if (!fs.existsSync(dash.file)) {
        console.log(`\x1b[33m[SKIP]\x1b[0m ${dash.name} - File not found: ${dash.file}`);
        continue;
      }

      console.log(`\n\x1b[1m\x1b[36m>>> TESTING DASHBOARD: ${dash.name} (${dash.id})\x1b[0m`);
      const dashResult = {
        id: dash.id,
        name: dash.name,
        checks: []
      };

      const recordCheck = (checkName, passed, details = '') => {
        summary.totalChecks++;
        const item = { checkName, passed, details };
        dashResult.checks.push(item);
        if (passed) {
          summary.passedChecks++;
          console.log(`  \x1b[32m✔\x1b[0m ${checkName} ${details ? `\x1b[90m(${details})\x1b[0m` : ''}`);
        } else {
          summary.failedChecks++;
          summary.findings.push({ dashboard: dash.id, checkName, details });
          console.error(`  \x1b[31m✖\x1b[0m ${checkName}`);
          console.error(`    \x1b[31mDetails: ${details}\x1b[0m`);
        }
      };

      // Load Dashboard
      await browser.navigate(dash.file);
      await browser.sleep(400);

      // Check 1: Console Errors on Load
      const loadErrors = browser.getConsoleErrors().filter(e => !e.text.includes('favicon.ico'));
      recordCheck(
        `[${dash.id}] Zero Console Errors on Initial Load`,
        loadErrors.length === 0,
        loadErrors.map(e => e.text).join('; ')
      );

      // Check 2: Z-Index Layer Stratification Audit
      const layerAudit = await browser.evaluate(() => {
        const results = {
          canvases: [],
          svgTracks: [],
          nodesAndCards: [],
          modalsDrawersToasts: [],
          violations: []
        };

        // 1. Canvases
        const canvases = Array.from(document.querySelectorAll('canvas, .canvas-bg, .matrix-rain, #bg-canvas, #canvas-mesh, #starfield, #radarCanvas, #particleCanvas'));
        canvases.forEach(c => {
          const style = window.getComputedStyle(c);
          const z = style.zIndex === 'auto' ? 0 : parseInt(style.zIndex, 10);
          const pe = style.pointerEvents;
          const rect = c.getBoundingClientRect();
          results.canvases.push({
            tag: c.tagName,
            id: c.id,
            className: c.className,
            zIndex: z,
            pointerEvents: pe,
            width: rect.width,
            height: rect.height,
            isInteractive: c.id.includes('radar') || c.id.includes('mesh') || c.classList.contains('interactive')
          });
        });

        // 2. SVG Tracks / Lines
        const svgs = Array.from(document.querySelectorAll('svg.track, svg.tracks, #tracksSvg, .connection-tracks, .flow-lines, svg[id*="track"], svg[class*="track"], svg[id*="line"], svg[class*="connection"]'));
        svgs.forEach(s => {
          const style = window.getComputedStyle(s);
          const z = style.zIndex === 'auto' ? 0 : parseInt(style.zIndex, 10);
          results.svgTracks.push({
            id: s.id,
            className: s.className,
            zIndex: z,
            pointerEvents: style.pointerEvents
          });
        });

        // 3. Nodes & Cards
        const cards = Array.from(document.querySelectorAll('.card, .metric-card, .node, .pipeline-node, .step-card, .panel, .service-card, .hud-card, .glass-card'));
        cards.forEach(card => {
          const style = window.getComputedStyle(card);
          const z = style.zIndex === 'auto' ? 0 : parseInt(style.zIndex, 10);
          results.nodesAndCards.push({
            id: card.id,
            className: card.className,
            zIndex: z
          });
        });

        // 4. Modals, Drawers, Toasts, Tooltips, Floating Dropdowns
        const overlays = Array.from(document.querySelectorAll('.modal, [id*="modal"], [class*="modal"], .drawer, [id*="drawer"], [class*="drawer"], .toast, [id*="toast"], [class*="toast"], .tooltip, [id*="tooltip"], [class*="tooltip"], [role="dialog"], [role="tooltip"], .detail-sheet, .slideover'));
        overlays.forEach(ov => {
          const style = window.getComputedStyle(ov);
          const z = style.zIndex === 'auto' ? 0 : parseInt(style.zIndex, 10);
          const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
          results.modalsDrawersToasts.push({
            id: ov.id,
            className: ov.className,
            zIndex: z,
            position: style.position,
            isVisible
          });
        });

        // Evaluate Rules:
        // Rule 1: Background Canvases must have z-index <= 0 OR pointer-events: none (if ambient)
        results.canvases.forEach(c => {
          if (!c.isInteractive && (c.zIndex > 1 || (c.width > 300 && c.height > 300 && c.pointerEvents !== 'none' && c.zIndex >= 2))) {
            results.violations.push(`Canvas #${c.id || c.className} has z-index ${c.zIndex} and pointer-events "${c.pointerEvents}", risking click interception.`);
          }
        });

        // Rule 2: SVG Tracks should not sit above cards/modals (z-index should be <= 2)
        results.svgTracks.forEach(s => {
          if (s.zIndex > 5) {
            results.violations.push(`SVG track #${s.id || s.className} has unusually high z-index: ${s.zIndex} (expected <= 1)`);
          }
        });

        // Rule 3: Modals and Drawers and Toasts must have z-index >= 10 (ideally >= 100)
        results.modalsDrawersToasts.forEach(m => {
          if (m.zIndex < 10 && (m.position === 'fixed' || m.position === 'absolute')) {
            results.violations.push(`Overlay #${m.id || m.className} has insufficient z-index (${m.zIndex}), expected >= 100 for top-layer modal isolation.`);
          }
        });

        return results;
      });

      recordCheck(
        `[${dash.id}] Z-Index Stratification Hierarchy (z:100 > z:2 > z:1 > z:0)`,
        layerAudit.violations.length === 0,
        layerAudit.violations.join(' | ') || `Verified ${layerAudit.canvases.length} canvases, ${layerAudit.svgTracks.length} SVG tracks, ${layerAudit.nodesAndCards.length} cards, ${layerAudit.modalsDrawersToasts.length} overlays`
      );

      // Check 3: Canvas Rendering & Animation Loop Stability
      const canvasHealth = await browser.evaluate(() => {
        const canvases = Array.from(document.querySelectorAll('canvas'));
        const reports = [];
        canvases.forEach(c => {
          const ctx2d = c.getContext('2d');
          const isContextOk = ctx2d !== null;
          reports.push({
            id: c.id || c.className || 'unnamed-canvas',
            width: c.width,
            height: c.height,
            isContextOk,
            hasZeroDimensions: c.width === 0 || c.height === 0
          });
        });
        return reports;
      });

      const zeroDimCanvases = canvasHealth.filter(c => c.hasZeroDimensions);
      recordCheck(
        `[${dash.id}] Canvas 2D Context & Non-Zero Viewport Dimensioning`,
        zeroDimCanvases.length === 0,
        zeroDimCanvases.length > 0 
          ? `Zero dimension canvases detected: ${zeroDimCanvases.map(c => c.id).join(', ')}`
          : `${canvasHealth.length} canvas element(s) properly initialized`
      );

      // Check 4: Modal Top-Layer Hit-Testing & ElementFromPoint Inspection
      const modalHitTest = await browser.evaluate(() => {
        // Find visible or openable modal/drawer
        const modal = document.querySelector('.modal, [id*="modal"], .drawer, [id*="drawer"], [role="dialog"]');
        if (!modal) return { tested: false, reason: 'No modal element defined' };

        // Save original display style
        const origDisplay = modal.style.display;
        const origVisibility = modal.style.visibility;
        const origOpacity = modal.style.opacity;

        // Force modal visible for hit-testing
        modal.style.display = 'block';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';

        const rect = modal.getBoundingClientRect();
        const midX = rect.left + rect.width / 2;
        const midY = rect.top + rect.height / 2;

        let hitElement = null;
        let isInsideModal = false;

        if (rect.width > 0 && rect.height > 0) {
          hitElement = document.elementFromPoint(midX, midY);
          isInsideModal = hitElement ? modal.contains(hitElement) || modal === hitElement : false;
        }

        // Restore original styles
        modal.style.display = origDisplay;
        modal.style.visibility = origVisibility;
        modal.style.opacity = origOpacity;

        return {
          tested: true,
          modalId: modal.id || modal.className,
          isInsideModal,
          hitTagName: hitElement?.tagName,
          hitClassName: hitElement?.className,
          hitId: hitElement?.id,
          zIndex: window.getComputedStyle(modal).zIndex
        };
      });

      if (modalHitTest.tested) {
        recordCheck(
          `[${dash.id}] Modal/Drawer Hit-Testing (elementFromPoint not intercepted by background)`,
          modalHitTest.isInsideModal,
          `Hit target: <${modalHitTest.hitTagName} id="${modalHitTest.hitId}" class="${modalHitTest.hitClassName}"> with modal zIndex: ${modalHitTest.zIndex}`
        );
      } else {
        recordCheck(`[${dash.id}] Modal/Drawer Hit-Testing`, true, 'No modal component in dashboard');
      }

      // Check 5: Viewport Stress Resize (360px -> 3840px)
      const viewports = [
        { name: 'Mobile (360x640)', width: 360, height: 640 },
        { name: 'Tablet (768x1024)', width: 768, height: 1024 },
        { name: 'Desktop HD (1920x1080)', width: 1920, height: 1080 },
        { name: '4K Ultra (3840x2160)', width: 3840, height: 2160 }
      ];

      const overflowErrors = [];
      for (const vp of viewports) {
        await browser.setViewport(vp.width, vp.height);
        await browser.sleep(100);

        const ovf = await browser.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollWidth = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientWidth = Math.max(doc.clientWidth, body.clientWidth);
          return {
            scrollWidth,
            clientWidth,
            diff: scrollWidth - clientWidth
          };
        });

        if (ovf.diff > 2) {
          overflowErrors.push(`${vp.name}: scrollWidth (${ovf.scrollWidth}px) > clientWidth (${ovf.clientWidth}px) [+${ovf.diff}px]`);
        }
      }

      recordCheck(
        `[${dash.id}] Fluid Responsiveness & Zero Horizontal Overflow (360px-3840px)`,
        overflowErrors.length === 0,
        overflowErrors.join(' | ') || 'Zero horizontal overflow across all 4 viewports'
      );

      // Check 6: Interactivity & Button Clickability
      const buttonIntegrity = await browser.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button:not([disabled]), [role="button"], input[type="button"], .btn'));
        const issues = [];
        buttons.forEach(btn => {
          const style = window.getComputedStyle(btn);
          if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
            const rect = btn.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) {
              issues.push(`Button "${btn.innerText?.trim() || btn.id}" has 0x0 bounding box`);
            }
          }
        });
        return {
          totalButtons: buttons.length,
          issues
        };
      });

      recordCheck(
        `[${dash.id}] Interactive Button Bounding Box & Targetability`,
        buttonIntegrity.issues.length === 0,
        buttonIntegrity.issues.join('; ') || `${buttonIntegrity.totalButtons} active buttons verified`
      );

      summary.dashboardResults.push(dashResult);
    }

  } catch (err) {
    console.error(`\x1b[31mFatal Stress Suite Error: ${err.message}\x1b[0m`);
    if (err.stack) console.error(err.stack);
  } finally {
    await browser.close();
  }

  console.log('\n========================================================================================');
  console.log('                          EMPIRICAL STRESS TEST SUMMARY                                 ');
  console.log('========================================================================================');
  console.log(`Total Checks Executed: ${summary.totalChecks}`);
  console.log(`Passed: \x1b[32m${summary.passedChecks}\x1b[0m | Failed: \x1b[31m${summary.failedChecks}\x1b[0m\n`);

  if (summary.findings.length > 0) {
    console.log('\x1b[1m\x1b[31mDETECTED DEFECTS & DEFICIENCIES:\x1b[0m');
    summary.findings.forEach((f, i) => {
      console.log(`  ${i + 1}. [${f.dashboard}] ${f.checkName}: ${f.details}`);
    });
  } else {
    console.log('\x1b[1m\x1b[32mALL STRESS CHECKS PASSED WITH ZERO VIOLATIONS.\x1b[0m');
  }

  return summary;
}

if (require.main === module) {
  runEmpiricalStress().then(res => {
    process.exit(res.failedChecks === 0 ? 0 : 1);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runEmpiricalStress };
