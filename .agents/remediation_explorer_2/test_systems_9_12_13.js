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

const TARGETS = [
  { id: 'gcp-iam-security', path: 'sistemas/gcp-iam-security/index.html' },
  { id: 'apigee-mulesoft-hybrid', path: 'sistemas/apigee-mulesoft-hybrid/index.html' },
  { id: 'emergency-evacuation-v1', path: 'sistemas/emergency-evacuation-v1/index.html' }
];

async function inspectSystems() {
  const browser = new BrowserSession();
  await browser.launch();
  
  const results = {};
  
  for (const target of TARGETS) {
    const fullPath = path.resolve(target.path);
    console.log(`\n======================================================`);
    console.log(`ANALYZING SYSTEM: ${target.id}`);
    console.log(`File: ${fullPath}`);
    console.log(`======================================================`);
    
    results[target.id] = { overflows: [], zIndex: [] };
    
    for (const vp of VIEWPORTS) {
      await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
      await browser.navigate(fullPath);
      await browser.sleep(250);
      
      const evalResult = await browser.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
        const clientW = Math.max(doc.clientWidth, body.clientWidth);
        const overflow = scrollW > clientW + 2;
        
        const offenders = [];
        if (overflow) {
          const els = Array.from(document.querySelectorAll('*'));
          for (const el of els) {
            const r = el.getBoundingClientRect();
            if (r.right > clientW + 2 && r.width > 0 && r.height > 0) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                id: el.id || undefined,
                className: el.className && typeof el.className === 'string' ? el.className.trim() : undefined,
                right: Math.round(r.right),
                width: Math.round(r.width),
                scrollWidth: el.scrollWidth,
                text: (el.innerText || '').slice(0, 35).replace(/\n/g, ' ')
              });
            }
          }
        }
        
        return {
          scrollW,
          clientW,
          overflow,
          offenders: offenders.slice(0, 8)
        };
      });
      
      if (evalResult.overflow) {
        console.log(`❌ [${vp.name}] scrollW: ${evalResult.scrollW}px > clientW: ${evalResult.clientW}px (+${evalResult.scrollW - evalResult.clientW}px)`);
        evalResult.offenders.forEach(o => {
          console.log(`   <${o.tag} id="${o.id || ''}" class="${o.className || ''}"> right=${o.right}px width=${o.width}px scrollW=${o.scrollWidth}px text="${o.text}"`);
        });
        results[target.id].overflows.push({ viewport: vp.name, ...evalResult });
      } else {
        console.log(`✓ [${vp.name}] No overflow (${evalResult.clientW}px)`);
      }
    }
  }
  
  await browser.close();
  return results;
}

inspectSystems().catch(console.error);
