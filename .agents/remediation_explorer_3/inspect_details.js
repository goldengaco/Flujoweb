const path = require('path');
const { BrowserSession } = require('../../tests/runner');

async function inspectDetails() {
  const browser = new BrowserSession();
  await browser.launch();
  try {
    const file = path.resolve(__dirname, '..', '..', 'sistemas', 'emergency-evacuation-v3', 'index.html');
    await browser.setViewport(360, 640, 1, true);
    await browser.navigate(file);
    await browser.sleep(250);

    const details = await browser.evaluate(() => {
      const getMinContentWidth = (el) => {
        const clone = el.cloneNode(true);
        clone.style.width = 'min-content';
        clone.style.position = 'absolute';
        clone.style.visibility = 'hidden';
        document.body.appendChild(clone);
        const w = clone.offsetWidth;
        document.body.removeChild(clone);
        return w;
      };

      // Check min-content width of all major components
      const res = {};
      
      const elementsToCheck = [
        ['brand-section', document.querySelector('.brand-section')],
        ['brand-title-group', document.querySelector('.brand-title-group')],
        ['brand-title-h1', document.querySelector('.brand-title-group h1')],
        ['brand-subtitle', document.querySelector('.brand-subtitle')],
        ['header-controls', document.querySelector('.header-controls')],
        ['kpi-bar', document.querySelector('.kpi-bar')],
        ['app-workspace', document.querySelector('.app-workspace')],
        ['left-column', document.querySelector('.left-column')],
        ['carrier-card', document.querySelector('.carrier-card')],
        ['carrier-header', document.querySelector('.carrier-header')],
        ['carrier-meta', document.querySelector('.carrier-meta')],
        ['carrier-metrics-grid', document.querySelector('.carrier-metrics-grid')],
        ['chaos-panel', document.querySelector('.chaos-panel')],
        ['chaos-btn-grid', document.querySelector('.chaos-btn-grid')],
        ['cb-visualizer', document.querySelector('.cb-visualizer')],
        ['cb-nodes-row', document.querySelector('.cb-nodes-row')],
        ['cb-meta', document.querySelector('.cb-meta')],
        ['center-column', document.querySelector('.center-column')],
        ['canvas-panel', document.querySelector('.canvas-panel')],
        ['canvas-toolbar', document.querySelector('.canvas-toolbar')],
        ['filter-btn-group', document.querySelector('.filter-btn-group')],
        ['canvas-overlay-legend', document.querySelector('.canvas-overlay-legend')],
        ['right-column', document.querySelector('.right-column')],
        ['sla-summary-grid', document.querySelector('.sla-summary-grid')],
        ['terminal-controls', document.querySelector('.terminal-controls')]
      ];

      for (const [name, el] of elementsToCheck) {
        if (el) {
          res[name] = {
            scrollWidth: el.scrollWidth,
            clientWidth: el.clientWidth,
            offsetWidth: el.offsetWidth,
            minContentWidth: getMinContentWidth(el)
          };
        }
      }

      return res;
    });

    console.log('--- MIN-CONTENT & WIDTH DETAILS (360px viewport) ---');
    console.log(JSON.stringify(details, null, 2));

  } finally {
    await browser.close();
  }
}

inspectDetails();
