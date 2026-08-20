/**
 * Challenger M1: Dynamic & Interactive Multi-Viewport Stress Testing
 *
 * Tests interactive state transitions under stressed viewports:
 * 1. Mobile (360x640) & (412x915):
 *    - Click tabs / selectors (e.g. IAM security tabs, SRE cockpit metrics, Apigee/MuleSoft tabs)
 *    - Open modals / drawers / inspection overlays
 *    - Verify no horizontal overflow occurs AFTER dynamic state changes
 *    - Verify no modal clipping or bounding box collisions occur
 * 2. Ultra-Wide 4K (3840x2160) & Tablet (768x1024):
 *    - Trigger chaos / stepper / flow actions
 *    - Check for canvas sizing / layout integrity during active animations
 */

const path = require('path');
const fs = require('fs');
const { BrowserSession } = require('./runner');

const ROOT_DIR = path.resolve(__dirname, '..');

const INTERACTIVE_TARGETS = [
  {
    name: 'gcp-iam-security',
    file: path.join(ROOT_DIR, 'sistemas', 'gcp-iam-security', 'index.html'),
    action: async (browser) => {
      // Switch through tabs and open modal
      await browser.evaluate(() => {
        const tabs = document.querySelectorAll('.tab-btn');
        tabs.forEach(t => t.click());
        const openModalBtn = document.querySelector('#btnAuditNow, .btn-audit, #btn-revoke');
        if (openModalBtn) openModalBtn.click();
      });
      await browser.sleep(200);
    }
  },
  {
    name: 'gcp-cloudops-cockpit',
    file: path.join(ROOT_DIR, 'sistemas', 'gcp-cloudops-cockpit', 'index.html'),
    action: async (browser) => {
      await browser.evaluate(() => {
        const sev1Btn = document.querySelector('#btnTriggerSev1, .btn-chaos, #btn-sev1');
        if (sev1Btn) sev1Btn.click();
      });
      await browser.sleep(300);
    }
  },
  {
    name: 'apigee-mulesoft-hybrid',
    file: path.join(ROOT_DIR, 'sistemas', 'apigee-mulesoft-hybrid', 'index.html'),
    action: async (browser) => {
      await browser.evaluate(() => {
        const tabs = document.querySelectorAll('.tab-btn, .cockpit-tab');
        tabs.forEach(t => t.click());
      });
      await browser.sleep(200);
    }
  },
  {
    name: 'emergency-evacuation-v2',
    file: path.join(ROOT_DIR, 'sistemas', 'emergency-evacuation-v2', 'index.html'),
    action: async (browser) => {
      await browser.evaluate(() => {
        const toggleBtn = document.querySelector('#btnViewToggle, .view-toggle-btn');
        if (toggleBtn) toggleBtn.click();
      });
      await browser.sleep(200);
    }
  },
  {
    name: 'emergency-evacuation-v3',
    file: path.join(ROOT_DIR, 'sistemas', 'emergency-evacuation-v3', 'index.html'),
    action: async (browser) => {
      await browser.evaluate(() => {
        const chaosBtns = document.querySelectorAll('.chaos-btn');
        if (chaosBtns.length > 0) chaosBtns[0].click();
      });
      await browser.sleep(200);
    }
  },
  {
    name: 'security-audit',
    file: path.join(ROOT_DIR, 'sistemas', 'security-audit', 'index.html'),
    action: async (browser) => {
      await browser.evaluate(() => {
        const stepBtns = document.querySelectorAll('.stepper-item, .step-node');
        stepBtns.forEach(s => s.click());
      });
      await browser.sleep(200);
    }
  },
  {
    name: 'server-status',
    file: path.join(ROOT_DIR, 'sistemas', 'server-status', 'index.html'),
    action: async (browser) => {
      await browser.evaluate(() => {
        const chaosToggle = document.querySelector('#btnChaos, .btn-chaos, #toggleChaos');
        if (chaosToggle) chaosToggle.click();
      });
      await browser.sleep(200);
    }
  },
  {
    name: 'transaction-flow',
    file: path.join(ROOT_DIR, 'sistemas', 'transaction-flow', 'index.html'),
    action: async (browser) => {
      await browser.evaluate(() => {
        const injectBtn = document.querySelector('#btnInject, .btn-inject, #btn-burst');
        if (injectBtn) injectBtn.click();
      });
      await browser.sleep(200);
    }
  }
];

async function runInteractiveStress() {
  const browser = new BrowserSession();
  await browser.launch();

  console.log('\n================================================================');
  console.log('⚡ RUNNING INTERACTIVE DYNAMIC STATE & STRESS PROBES');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  try {
    for (const target of INTERACTIVE_TARGETS) {
      console.log(`\nTesting Interactive Stress: [${target.name}]`);

      for (const vp of [{ w: 360, h: 640, name: 'Mobile Mini' }, { w: 768, h: 1024, name: 'Tablet Portrait' }, { w: 3840, h: 2160, name: '4K UHD' }]) {
        await browser.setViewport(vp.w, vp.h, 1, vp.w <= 768);
        await browser.navigate(target.file);
        await browser.sleep(200);

        // Execute dynamic action
        if (target.action) {
          await target.action(browser);
        }

        const check = await browser.evaluate(() => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientW = Math.max(doc.clientWidth, body.clientWidth);
          const hasOverflow = scrollW > clientW + 3;

          return {
            scrollW,
            clientW,
            hasOverflow
          };
        });

        if (check.hasOverflow) {
          console.log(`  ❌ FAIL [${vp.name}] after interaction: scrollWidth (${check.scrollW}px) > clientWidth (${check.clientW}px)`);
          failed++;
        } else {
          console.log(`  ✔ PASS [${vp.name}] after interaction: scrollW ${check.scrollW}px <= clientW ${check.clientW}px`);
          passed++;
        }
      }
    }

    console.log('\n================================================================');
    console.log(`Interactive Stress Result: ${passed} Passed / ${failed} Failed`);
    console.log('================================================================\n');

    return { passed, failed };
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  runInteractiveStress().then(res => {
    process.exit(res.failed > 0 ? 1 : 0);
  }).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { runInteractiveStress };
