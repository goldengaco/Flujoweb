const { BrowserSession } = require('../../tests/runner');
const path = require('path');

async function findOverflowElements() {
  const browser = new BrowserSession();
  await browser.launch();

  const systems = [
    { name: 'security-audit', path: path.resolve(__dirname, '../../sistemas/security-audit/index.html'), widths: [375] },
    { name: 'server-status', path: path.resolve(__dirname, '../../sistemas/server-status/index.html'), widths: [375, 414, 768] }
  ];

  for (const sys of systems) {
    for (const w of sys.widths) {
      await browser.setViewport(w, 800, 1, true);
      await browser.navigate(sys.path);
      await browser.sleep(300);

      const overflowing = await browser.evaluate((viewportWidth) => {
        const all = document.querySelectorAll('*');
        const list = [];
        for (const el of all) {
          const rect = el.getBoundingClientRect();
          if (rect.right > viewportWidth + 2 || rect.width > viewportWidth + 2) {
            list.push({
              tag: el.tagName,
              id: el.id,
              className: el.className,
              rectRight: Math.round(rect.right),
              rectWidth: Math.round(rect.width),
              overflowAmount: Math.round(rect.right - viewportWidth)
            });
          }
        }
        return list.slice(0, 15);
      }, w);

      console.log(`\n=== Overflowing elements in ${sys.name} at ${w}px ===`);
      console.log(JSON.stringify(overflowing, null, 2));
    }
  }

  await browser.close();
}

findOverflowElements().catch(console.error);
