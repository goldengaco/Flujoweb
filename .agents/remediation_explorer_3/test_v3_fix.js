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

const FIX_CSS = `
  /* Fix 1: Header Brand Section & Subtitle Wrap */
  .tactical-header {
    padding: clamp(8px, 1.5vw, 14px) clamp(10px, 2vw, 18px);
  }
  .brand-section {
    flex-wrap: wrap;
    min-width: 0;
    max-width: 100%;
  }
  .brand-title-group {
    min-width: 0;
  }
  .brand-subtitle {
    flex-wrap: wrap;
    gap: 6px 10px;
    min-width: 0;
  }
  
  /* Fix 2: App Workspace & Container Min-Widths */
  .app-workspace {
    padding: clamp(10px, 1.5vw, 18px);
    min-width: 0;
    width: 100%;
    box-sizing: border-box;
  }
  .left-column, .center-column, .right-column {
    min-width: 0;
    max-width: 100%;
  }
  .tactical-panel {
    min-width: 0;
    max-width: 100%;
  }
  
  /* Fix 3: Panel Headers & Filter Buttons Wrapping */
  .panel-header {
    flex-wrap: wrap;
    gap: 8px;
  }
  .panel-title {
    min-width: 0;
    word-break: break-word;
  }
  .filter-btn-group {
    flex-wrap: wrap;
    min-width: 0;
  }
  
  /* Fix 4: Carrier Cards & Chaos Panel */
  .carrier-card, .chaos-panel {
    min-width: 0;
    max-width: 100%;
  }
  .carrier-meta {
    flex-wrap: wrap;
    gap: 4px;
  }
  .carrier-metrics-grid {
    min-width: 0;
  }
  .chaos-btn-grid {
    min-width: 0;
  }
  .cb-nodes-row {
    flex-wrap: wrap;
    gap: 4px;
  }
  .cb-meta {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  /* Fix 5: Canvas Overlay Legend & Inspector */
  .canvas-overlay-legend {
    max-width: calc(100% - 20px);
    box-sizing: border-box;
  }
  .canvas-node-inspector {
    max-width: calc(100% - 20px);
    z-index: 100;
  }
  
  /* Fix 6: SLA Summary Grid & Terminal */
  .sla-summary-grid {
    min-width: 0;
  }
  .terminal-controls {
    flex-wrap: wrap;
  }

  /* Z-Index Normalization */
  #particle-canvas {
    z-index: 1;
  }
  .canvas-overlay-legend {
    z-index: 10;
  }
  .canvas-node-inspector {
    z-index: 100;
  }

  @media (max-width: 480px) {
    .app-workspace {
      padding: 10px 8px;
    }
    .sla-summary-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .carrier-metrics-grid {
      grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    }
    .chaos-btn-grid {
      grid-template-columns: 1fr;
    }
  }
`;

async function testFix() {
  const browser = new BrowserSession();
  await browser.launch();
  try {
    const file = path.resolve(__dirname, '..', '..', 'sistemas', 'emergency-evacuation-v3', 'index.html');
    console.log('=== TESTING V3 WITH PROPOSED FIXES ===');
    let allPassed = true;

    for (const vp of VIEWPORTS) {
      await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
      await browser.navigate(file);
      
      // Inject candidate CSS
      await browser.evaluate((css) => {
        const style = document.createElement('style');
        style.id = 'remediation-fix-css';
        style.textContent = css;
        document.head.appendChild(style);
      }, FIX_CSS);

      await browser.sleep(200);

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
                id: el.id || '',
                right: Math.round(r.right),
                width: Math.round(r.width),
                scrollW: el.scrollWidth,
                clientW: el.clientWidth,
                text: (el.innerText || '').slice(0, 30).replace(/\n/g, ' ')
              });
            }
          });
        }
        return { scrollW, clientW, overflow, offenders: offenders.slice(0, 5) };
      });

      if (res.overflow) {
        allPassed = false;
        console.log(`❌ FAIL [${vp.name}]: scrollW=${res.scrollW}, clientW=${res.clientW} (delta: +${res.scrollW - res.clientW})`);
        console.log('   Offenders:', JSON.stringify(res.offenders, null, 2));
      } else {
        console.log(`✓ PASS [${vp.name}]: scrollW=${res.scrollW}, clientW=${res.clientW}`);
      }
    }

    console.log(`\nOVERALL V3 VERDICT: ${allPassed ? 'ALL 8 VIEWPORTS PASSED 100%' : 'FAILURES DETECTED'}`);

  } finally {
    await browser.close();
  }
}

testFix();
