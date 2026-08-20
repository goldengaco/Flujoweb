const path = require('path');
const fs = require('fs');
const { BrowserSession } = require('./tests/runner');

async function checkLayout() {
  const browser = new BrowserSession();
  await browser.launch();

  const base = path.resolve(__dirname, 'sistemas');
  const dirs = fs.readdirSync(base).filter(d => fs.statSync(path.join(base, d)).isDirectory());
  
  const viewports = [
    { name: 'Mobile 360px', width: 360, height: 640, isMobile: true },
    { name: 'Tablet 768px', width: 768, height: 1024, isMobile: true },
    { name: 'Laptop 1280px', width: 1280, height: 800, isMobile: false },
    { name: 'Desktop 1920px', width: 1920, height: 1080, isMobile: false },
    { name: '4K 3840px', width: 3840, height: 2160, isMobile: false }
  ];

  console.log(`Checking layout across ${dirs.length} dashboards and 5 viewports...`);

  for (const d of dirs) {
    const htmlPath = path.join(base, d, 'index.html');
    if (!fs.existsSync(htmlPath)) continue;

    console.log(`\n=== Testing ${d} ===`);
    for (const vp of viewports) {
      await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
      await browser.navigate(htmlPath);
      await browser.sleep(300);

      const overflow = await browser.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
        const clientW = Math.max(doc.clientWidth, body.clientWidth);
        return {
          scrollW,
          clientW,
          hasOverflow: scrollW > clientW + 2
        };
      });

      const clipping = await browser.evaluate(() => {
        const textElements = Array.from(document.querySelectorAll('h1, h2, h3, p, span, .card, .hud-panel, .metric-value'));
        const clipped = [];
        for (const el of textElements) {
          const style = window.getComputedStyle(el);
          if (style.overflow === 'hidden' || style.overflowY === 'hidden') {
            if (el.scrollHeight > el.clientHeight + 8 && el.clientHeight > 0) {
              clipped.push({
                tag: el.tagName,
                class: el.className,
                scrollHeight: el.scrollHeight,
                clientHeight: el.clientHeight,
                text: el.innerText.slice(0, 30)
              });
            }
          }
        }
        return clipped.slice(0, 3);
      });

      console.log(`  [${vp.name}] Overflow: ${overflow.hasOverflow ? 'FAIL (' + overflow.scrollW + ' > ' + overflow.clientW + ')' : 'OK'} | Clipped text elements: ${clipping.length}`);
    }
  }

  await browser.close();
}

checkLayout().catch(console.error);
