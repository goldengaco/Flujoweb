const path = require('path');
const { BrowserSession } = require('../../tests/runner');

async function inspectV3() {
  const browser = new BrowserSession();
  await browser.launch();
  try {
    const file = path.resolve(__dirname, '..', '..', 'sistemas', 'emergency-evacuation-v3', 'index.html');
    await browser.setViewport(360, 640, 1, true);
    await browser.navigate(file);
    await browser.sleep(250);

    const report = await browser.evaluate(() => {
      const items = [];
      const els = Array.from(document.querySelectorAll('*'));
      for (const el of els) {
        const r = el.getBoundingClientRect();
        if (r.right > 363 || r.width > 360) {
          const comp = window.getComputedStyle(el);
          items.push({
            tag: el.tagName.toLowerCase(),
            cls: (el.className || '').toString(),
            id: el.id || '',
            width: Math.round(r.width),
            right: Math.round(r.right),
            left: Math.round(r.left),
            display: comp.display,
            flexWrap: comp.flexWrap,
            minWidth: comp.minWidth,
            maxWidth: comp.maxWidth,
            padding: comp.padding,
            margin: comp.margin,
            gridTemplateColumns: comp.gridTemplateColumns,
            text: (el.innerText || '').slice(0, 35).replace(/\n/g, ' ')
          });
        }
      }
      return items;
    });

    console.log('--- V3 OVERFLOW AT 360px (found ' + report.length + ' elements) ---');
    console.log(JSON.stringify(report, null, 2));

  } finally {
    await browser.close();
  }
}

inspectV3();
