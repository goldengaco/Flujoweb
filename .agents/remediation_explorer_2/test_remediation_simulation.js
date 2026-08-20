const path = require('path');
const fs = require('fs');
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

// Proposed CSS fixes to test
const REMEDIATION_CSS = {
  'gcp-iam-security': `
    .app-container {
      min-width: 0;
      max-width: 100%;
      overflow-x: hidden;
    }
    /* Fix 1: Brand section, titles, and subtitle API badges flex-wrapping */
    .brand-section {
      flex-wrap: wrap;
      min-width: 0;
      max-width: 100%;
    }
    .brand-info {
      min-width: 0;
      max-width: 100%;
    }
    .brand-info h1 {
      flex-wrap: wrap;
      min-width: 0;
    }
    .brand-info .subtitle {
      flex-wrap: wrap;
      gap: 6px 10px;
      min-width: 0;
    }
    .threat-banner {
      flex-wrap: wrap;
    }
    .threat-banner-content {
      flex-wrap: wrap;
      min-width: 0;
    }
    .modal-overlay {
      z-index: 100;
    }
    .tabs-nav {
      min-width: 0;
      max-width: 100%;
      width: 100%;
      overflow-x: auto;
    }
    .project-selector-wrapper {
      max-width: 100%;
      min-width: 0;
    }
    .project-select {
      max-width: 100%;
      min-width: 0;
    }
    @media (max-width: 768px) {
      .app-container {
        padding: 12px 12px 36px;
      }
      .app-header {
        padding: 12px 14px;
      }
      .header-controls {
        width: 100%;
      }
      .project-selector-wrapper {
        width: 100%;
      }
      .project-select {
        width: 100%;
        max-width: 100%;
        text-overflow: ellipsis;
      }
    }
    @media (max-width: 480px) {
      .app-container {
        padding: 10px 8px 24px;
      }
      .app-header {
        padding: 10px 12px;
      }
      .tab-btn {
        padding: 6px 10px;
        font-size: 0.72rem;
      }
    }
  `,

  'apigee-mulesoft-hybrid': `
    /* Fix 1: Code card, log card & tab-group wrapping and container padding */
    .code-card, .log-card {
      min-width: 0;
      max-width: 100%;
    }
    .code-card__hdr, .log-card__hdr {
      min-width: 0;
    }
    .tab-group {
      flex-wrap: wrap;
    }
    .log-filters {
      flex-wrap: wrap;
    }
    @media (max-width: 640px) {
      .cockpit-app {
        padding: 12px 10px 32px;
        gap: 14px;
      }
      .hdr {
        padding: 12px 14px;
      }
      .code-card, .log-card {
        padding: 12px 12px;
      }
      .tab-btn {
        padding: 4px 6px;
        font-size: 0.62rem;
      }
      .log-filter-btn {
        padding: 3px 6px;
        font-size: 0.6rem;
      }
      .code-viewer, .log-terminal {
        padding: 10px;
        font-size: 0.65rem;
      }
    }
  `,

  'emergency-evacuation-v1': `
    /* Fix 1: Reset grid columns on smaller screens and override inline grid-column */
    @media (max-width: 1100px) {
      main.tactical-main {
        grid-template-columns: 1fr;
      }
      main.tactical-main > section,
      main.tactical-main > div {
        grid-column: 1 !important;
      }
    }

    /* Fix 2: Strobe overlay and master broadcast banner fluidity */
    #strobe-overlay {
      z-index: 50;
      max-width: 100vw;
    }
    .master-broadcast-banner {
      flex-wrap: wrap;
      min-width: 0;
      max-width: 100%;
    }
    .broadcast-info {
      min-width: 0;
      max-width: 100%;
    }
    .tactical-broadcast-btn {
      max-width: 100%;
    }
    .btn-pulse-ring {
      max-width: 100%;
      box-sizing: border-box;
    }

    @media (max-width: 640px) {
      main.tactical-main {
        padding: 12px 10px;
        gap: 14px;
      }
      header.tactical-header {
        padding: 10px 14px;
      }
      .tactical-broadcast-btn {
        width: 100%;
        white-space: normal;
        text-align: center;
        padding: 12px 16px;
        font-size: 0.82rem;
      }
      .btn-pulse-ring {
        inset: -4px;
      }
      .headcount-grid {
        grid-template-columns: 1fr;
      }
    }
  `
};

async function testSimulatedFixes() {
  const browser = new BrowserSession();
  await browser.launch();
  
  const results = {};
  
  for (const [id, cssPatch] of Object.entries(REMEDIATION_CSS)) {
    const filePath = path.resolve(`sistemas/${id}/index.html`);
    console.log(`\n======================================================`);
    console.log(`VALIDATING REMEDIATION FIX FOR: ${id}`);
    console.log(`======================================================`);
    
    let allPassed = true;
    
    for (const vp of VIEWPORTS) {
      await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
      await browser.navigate(filePath);
      
      // Inject proposed CSS fix
      await browser.evaluate((css) => {
        const style = document.createElement('style');
        style.id = 'remediation-test-patch';
        style.textContent = css;
        document.head.appendChild(style);
      }, cssPatch);
      
      await browser.sleep(250);
      
      const check = await browser.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
        const clientW = Math.max(doc.clientWidth, body.clientWidth);
        const hasOverflow = scrollW > clientW + 2;
        
        let offenders = [];
        if (hasOverflow) {
          const els = Array.from(document.querySelectorAll('*'));
          for (const el of els) {
            const r = el.getBoundingClientRect();
            if (r.right > clientW + 2 && r.width > 0 && r.height > 0) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                id: el.id || undefined,
                className: el.className && typeof el.className === 'string' ? el.className.trim() : undefined,
                right: Math.round(r.right),
                width: Math.round(r.width)
              });
            }
          }
        }
        
        return {
          scrollW,
          clientW,
          hasOverflow,
          offenders: offenders.slice(0, 5)
        };
      });
      
      if (check.hasOverflow) {
        allPassed = false;
        console.log(`❌ [${vp.name}] FAILED: scrollW (${check.scrollW}px) > clientW (${check.clientW}px) (+${check.scrollW - check.clientW}px)`);
        console.log(`   Offenders:`, JSON.stringify(check.offenders));
      } else {
        console.log(`✅ [${vp.name}] PASSED: scrollW (${check.scrollW}px) <= clientW (${check.clientW}px)`);
      }
    }
    
    console.log(`\nResult for ${id}: ${allPassed ? '🎉 100% PASSED ACROSS ALL 8 VIEWPORTS' : '❌ FAILED'}`);
    results[id] = allPassed;
  }
  
  await browser.close();
  return results;
}

testSimulatedFixes().catch(console.error);
