const path = require('path');
const { BrowserSession } = require('../../tests/runner');

async function findRootCauses() {
  const browser = new BrowserSession();
  await browser.launch();
  try {
    const file = path.resolve(__dirname, '..', '..', 'sistemas', 'emergency-evacuation-v3', 'index.html');
    await browser.setViewport(360, 640, 1, true);
    await browser.navigate(file);
    await browser.sleep(250);

    const tree = await browser.evaluate(() => {
      // Find top-level children of body and containers that exceed 360
      const issues = [];

      // 1. Header
      const header = document.querySelector('header.tactical-header');
      const hRow = document.querySelector('.header-main-row');
      const brand = document.querySelector('.brand-section');
      const brandTitleGroup = document.querySelector('.brand-title-group');
      const brandSubtitle = document.querySelector('.brand-subtitle');
      const headerControls = document.querySelector('.header-controls');
      const kpiBar = document.querySelector('.kpi-bar');

      issues.push({
        name: 'header',
        scrollWidth: header.scrollWidth,
        clientWidth: header.clientWidth,
        hRowScrollW: hRow.scrollWidth,
        brandScrollW: brand.scrollWidth,
        brandTitleGroupScrollW: brandTitleGroup.scrollWidth,
        brandSubtitleScrollW: brandSubtitle.scrollWidth,
        brandSubtitleChildren: Array.from(brandSubtitle.children).map(c => ({ tag: c.tagName, text: c.innerText, w: c.scrollWidth })),
        headerControlsScrollW: headerControls.scrollWidth,
        kpiBarScrollW: kpiBar.scrollWidth
      });

      // 2. Main Workspace
      const main = document.querySelector('main.app-workspace');
      const leftCol = document.querySelector('.left-column');
      const centerCol = document.querySelector('.center-column');
      const rightCol = document.querySelector('.right-column');

      issues.push({
        name: 'workspace',
        mainScrollW: main.scrollWidth,
        mainClientW: main.clientWidth,
        leftColScrollW: leftCol ? leftCol.scrollWidth : null,
        centerColScrollW: centerCol ? centerCol.scrollWidth : null,
        rightColScrollW: rightCol ? rightCol.scrollWidth : null
      });

      // 3. Inside left column
      if (leftCol) {
        const panels = Array.from(leftCol.querySelectorAll('.tactical-panel'));
        issues.push({
          name: 'leftColPanels',
          panels: panels.map(p => ({
            title: p.querySelector('.panel-title') ? p.querySelector('.panel-title').innerText : '',
            scrollW: p.scrollWidth,
            clientW: p.clientWidth,
            headerScrollW: p.querySelector('.panel-header') ? p.querySelector('.panel-header').scrollWidth : null,
            bodyScrollW: p.querySelector('.panel-body') ? p.querySelector('.panel-body').scrollWidth : null,
            children: Array.from(p.querySelector('.panel-body') ? p.querySelector('.panel-body').children : []).map(c => ({
              cls: c.className,
              id: c.id,
              scrollW: c.scrollWidth,
              clientW: c.clientWidth
            }))
          }))
        });
      }

      // 4. Inside center column
      if (centerCol) {
        issues.push({
          name: 'centerColPanels',
          scrollW: centerCol.scrollWidth,
          header: centerCol.querySelector('.panel-header') ? centerCol.querySelector('.panel-header').scrollWidth : null,
          filterBtns: centerCol.querySelector('.filter-btn-group') ? centerCol.querySelector('.filter-btn-group').scrollWidth : null,
          legend: centerCol.querySelector('.canvas-overlay-legend') ? centerCol.querySelector('.canvas-overlay-legend').scrollWidth : null
        });
      }

      // 5. Inside right column
      if (rightCol) {
        issues.push({
          name: 'rightColPanels',
          scrollW: rightCol.scrollWidth,
          slaGrid: rightCol.querySelector('.sla-summary-grid') ? rightCol.querySelector('.sla-summary-grid').scrollWidth : null,
          terminalHeader: rightCol.querySelector('.terminal-panel .panel-header') ? rightCol.querySelector('.terminal-panel .panel-header').scrollWidth : null
        });
      }

      return issues;
    });

    console.log('--- ROOT CAUSES FOR V3 OVERFLOW ---');
    console.log(JSON.stringify(tree, null, 2));

  } finally {
    await browser.close();
  }
}

findRootCauses();
