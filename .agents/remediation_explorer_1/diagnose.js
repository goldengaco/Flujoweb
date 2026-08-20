const path = require('path');
const { BrowserSession } = require('../../tests/runner');

const systems = [
  { id: 'security-audit', name: 'System 3: Security Audit', file: path.resolve(__dirname, '../../sistemas/security-audit/index.html') },
  { id: 'gcp-serverless-pipeline', name: 'System 6: GCP Serverless Pipeline', file: path.resolve(__dirname, '../../sistemas/gcp-serverless-pipeline/index.html') },
  { id: 'gcp-event-pubsub', name: 'System 7: GCP Event Pub/Sub', file: path.resolve(__dirname, '../../sistemas/gcp-event-pubsub/index.html') },
  { id: 'gcp-sql-networking', name: 'System 8: GCP SQL Networking', file: path.resolve(__dirname, '../../sistemas/gcp-sql-networking/index.html') }
];

const viewports = [
  { name: 'Mobile 360', width: 360, height: 640 },
  { name: 'Mobile 412', width: 412, height: 915 },
  { name: 'Tablet 768', width: 768, height: 1024 },
  { name: 'Laptop 1280', width: 1280, height: 800 },
  { name: 'Desktop 1920', width: 1920, height: 1080 },
  { name: '4K 3840', width: 3840, height: 2160 }
];

async function main() {
  const browser = new BrowserSession();
  await browser.launch();

  try {
    for (const sys of systems) {
      console.log(`\n========================================`);
      console.log(`ANALYZING ${sys.name}`);
      console.log(`========================================`);

      for (const vp of viewports) {
        await browser.setViewport(vp.width, vp.height, 1, vp.width <= 768);
        await browser.navigate(sys.file);
        await browser.sleep(300);

        const result = await browser.evaluate((vpW) => {
          const doc = document.documentElement;
          const body = document.body;
          const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
          const clientW = Math.max(doc.clientWidth, body.clientWidth);

          // Find elements exceeding viewport width or causing overflow
          const overflowingElements = [];
          const allEls = Array.from(document.querySelectorAll('*'));
          for (const el of allEls) {
            const rect = el.getBoundingClientRect();
            const cs = window.getComputedStyle(el);
            const isHidden = cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0';
            if (isHidden) continue;

            if (rect.right > vpW + 1 || el.scrollWidth > el.clientWidth + 1 && el.clientWidth > vpW) {
              overflowingElements.push({
                tag: el.tagName.toLowerCase(),
                id: el.id,
                className: el.className,
                rectRight: Math.round(rect.right),
                rectWidth: Math.round(rect.width),
                scrollWidth: el.scrollWidth,
                clientWidth: el.clientWidth,
                padding: `${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft}`,
                margin: `${cs.marginTop} ${cs.marginRight} ${cs.marginBottom} ${cs.marginLeft}`,
                display: cs.display,
                flexWrap: cs.flexWrap,
                gridTemplateColumns: cs.gridTemplateColumns,
                textSnippet: (el.textContent || '').trim().slice(0, 40).replace(/\s+/g, ' ')
              });
            }
          }

          return {
            scrollW,
            clientW,
            hasOverflow: scrollW > clientW + 2,
            overflowingElements: overflowingElements.slice(0, 15)
          };
        }, vp.width);

        console.log(`Viewport [${vp.name}]: clientW=${result.clientW}px, scrollW=${result.scrollW}px ${result.hasOverflow ? '🚨 OVERFLOW (+' + (result.scrollW - result.clientW) + 'px)' : '✅ OK'}`);
        if (result.hasOverflow) {
          console.log(`  Top overflowing elements:`);
          for (const el of result.overflowingElements) {
            console.log(`   - <${el.tag} id="${el.id}" class="${el.className}">: right=${el.rectRight}px, w=${el.rectWidth}px, scrollW=${el.scrollWidth}px, text="${el.textSnippet}"`);
          }
        }
      }
    }
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
