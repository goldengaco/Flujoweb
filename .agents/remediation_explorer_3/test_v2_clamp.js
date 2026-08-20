const path = require('path');
const { BrowserSession } = require('../../tests/runner');

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

const V2_CLAMP_CSS = `
  /* Headings & Main HUD Titles */
  .strobe-title {
    font-size: clamp(11.5px, 1.1vw, 15px);
  }
  .hazard-level-badge {
    font-size: clamp(9px, 0.8vw, 11px);
    padding: clamp(1px, 0.3vw, 3px) clamp(4px, 0.6vw, 8px);
  }
  .strobe-message-box {
    font-size: clamp(10.5px, 0.95vw, 13px);
  }
  .strobe-target-route {
    font-size: clamp(10px, 0.9vw, 12.5px);
  }
  
  /* Blueprint & Controls */
  .blueprint-title {
    font-size: clamp(11px, 1vw, 14px);
  }
  .blueprint-coords {
    font-size: clamp(9px, 0.8vw, 11px);
  }
  .tool-btn {
    font-size: clamp(9px, 0.85vw, 11.5px);
  }
  .preset-selector-select {
    font-size: clamp(9px, 0.85vw, 11.5px);
  }
  .btn-tactical-icon {
    font-size: clamp(10px, 0.9vw, 12px);
  }
  .view-mode-toggle {
    font-size: clamp(9px, 0.85vw, 11.5px);
  }
  
  /* Telemetry & Guidance */
  .tel-label {
    font-size: clamp(8.5px, 0.75vw, 10.5px);
  }
  .tel-value {
    font-size: clamp(11px, 1vw, 14px);
  }
  .guidance-title {
    font-size: clamp(10px, 0.9vw, 13px);
  }
  .step-item {
    font-size: clamp(10.5px, 0.95vw, 13px);
  }
  .step-num {
    font-size: clamp(9px, 0.85vw, 11.5px);
  }
  
  /* Action Buttons & Subtext */
  .btn-action-primary {
    font-size: clamp(12px, 1.1vw, 15px);
  }
  .btn-action-sos {
    font-size: clamp(12px, 1.1vw, 15px);
  }
  .btn-action-subtext {
    font-size: clamp(8.5px, 0.8vw, 11px);
  }
  
  /* Mesh Network Simulator */
  .mesh-title {
    font-size: clamp(10px, 0.9vw, 13px);
  }
  .mesh-toggle-btn {
    font-size: clamp(8.5px, 0.8vw, 11px);
  }
  .mesh-stats-row {
    font-size: clamp(8.5px, 0.8vw, 11px);
  }
  
  /* Life Safety Assets & Terminal */
  .asset-name {
    font-size: clamp(9.5px, 0.85vw, 12px);
  }
  .asset-dist {
    font-size: clamp(8.5px, 0.8vw, 11px);
  }
  .terminal-drawer {
    font-size: clamp(9px, 0.85vw, 11.5px);
  }
  .terminal-header {
    font-size: clamp(8px, 0.75vw, 10.5px);
  }
  
  /* Modals & Dialogs */
  .modal-title {
    font-size: clamp(12px, 1.1vw, 15px);
  }
  .btn-modal-close {
    font-size: clamp(16px, 1.5vw, 22px);
  }
  .sos-opt-label {
    font-size: clamp(10px, 0.9vw, 13px);
  }
  .sos-opt-desc {
    font-size: clamp(8px, 0.75vw, 10.5px);
  }
  .sos-textarea {
    font-size: clamp(10px, 0.9vw, 12.5px);
  }
  .btn-transmit-sos {
    font-size: clamp(12px, 1.1vw, 15px);
  }
  .cert-heading {
    font-size: clamp(14px, 1.4vw, 19px);
  }
  .cert-details-table {
    font-size: clamp(9.5px, 0.85vw, 12px);
  }
  .btn-safe-close {
    font-size: clamp(11px, 1vw, 14px);
  }
  .toast-msg {
    font-size: clamp(10.5px, 0.95vw, 13px);
  }
`;

async function testV2() {
  const browser = new BrowserSession({ port: 9800 + Math.floor(Math.random() * 100) });
  await browser.launch();
  try {
    const file = path.resolve(__dirname, '..', '..', 'sistemas', 'emergency-evacuation-v2', 'index.html');
    console.log('=== TESTING V2 WITH PROPOSED CLAMP() TYPOGRAPHY ===');
    let allPassed = true;

    for (const vp of VIEWPORTS) {
      await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
      await browser.navigate(file);
      
      // Inject candidate clamp CSS
      await browser.evaluate((css) => {
        const style = document.createElement('style');
        style.id = 'remediation-clamp-css';
        style.textContent = css;
        document.head.appendChild(style);
      }, V2_CLAMP_CSS);

      await browser.sleep(200);

      // Check overflow and page URL
      const res = await browser.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
        const clientW = Math.max(doc.clientWidth, body.clientWidth);
        const overflow = scrollW > clientW + 3;
        
        let offenders = [];
        if (overflow) {
          document.querySelectorAll('*').forEach(el => {
            const r = el.getBoundingClientRect();
            if (r.right > clientW + 3 && r.width > 0 && r.height > 0) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                cls: (el.className || '').toString().slice(0, 40),
                right: Math.round(r.right),
                width: Math.round(r.width),
                text: (el.innerText || '').slice(0, 30).replace(/\n/g, ' ')
              });
            }
          });
        }
        return { url: window.location.href, title: document.title, scrollW, clientW, overflow, offenders: offenders.slice(0, 5) };
      });

      if (res.overflow) {
        allPassed = false;
        console.log(`❌ FAIL [${vp.name}]: title="${res.title}" scrollW=${res.scrollW}, clientW=${res.clientW} (delta: +${res.scrollW - res.clientW})`);
        console.log('   Offenders:', JSON.stringify(res.offenders, null, 2));
      } else {
        console.log(`✓ PASS [${vp.name}]: title="${res.title.slice(0, 20)}..." scrollW=${res.scrollW}, clientW=${res.clientW}`);
      }
    }

    console.log(`\nOVERALL V2 VERDICT: ${allPassed ? 'ALL 8 VIEWPORTS PASSED 100%' : 'FAILURES DETECTED'}`);

  } finally {
    await browser.close();
  }
}

testV2();
