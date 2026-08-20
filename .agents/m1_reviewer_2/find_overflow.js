const path = require('path');
const { BrowserSession } = require('../../tests/runner');

async function findOverflowElements() {
  const browser = new BrowserSession();
  await browser.launch({ headless: true });

  const targets = [
    { name: 'apigee-mulesoft-hybrid', file: 'sistemas/apigee-mulesoft-hybrid/index.html' },
    { name: 'emergency-evacuation-v1', file: 'sistemas/emergency-evacuation-v1/index.html' },
    { name: 'emergency-evacuation-v3', file: 'sistemas/emergency-evacuation-v3/index.html' },
    { name: 'gcp-iam-security', file: 'sistemas/gcp-iam-security/index.html' }
  ];

  for (const t of targets) {
    const filePath = path.resolve(__dirname, '..', '..', t.file);
    await browser.setViewport(360, 640, 1, true);
    await browser.navigate(filePath);
    await browser.sleep(300);

    const result = await browser.evaluate(() => {
      const docW = document.documentElement.clientWidth;
      const elements = Array.from(document.querySelectorAll('*'));
      const overflowing = [];

      for (const el of elements) {
        const rect = el.getBoundingClientRect();
        if (rect.right > docW + 2 || rect.width > docW + 2) {
          overflowing.push({
            tag: el.tagName,
            id: el.id,
            className: (el.className && typeof el.className === 'string') ? el.className.trim() : '',
            rect: { left: Math.round(rect.left), right: Math.round(rect.right), width: Math.round(rect.width) }
          });
        }
      }
      return {
        docClientW: docW,
        docScrollW: document.documentElement.scrollWidth,
        bodyScrollW: document.body.scrollWidth,
        overflowCount: overflowing.length,
        topOffenders: overflowing.slice(0, 10)
      };
    });

    console.log(`\n=== [${t.name}] ===`);
    console.log(`Doc clientWidth: ${result.docClientW}px, scrollWidth: ${result.docScrollW}px, body scrollWidth: ${result.bodyScrollW}px`);
    console.log(`Total overflowing elements: ${result.overflowCount}`);
    result.topOffenders.forEach((o, i) => {
      console.log(`  #${i+1}: <${o.tag} id="${o.id}" class="${o.className}"> width: ${o.rect.width}px, right: ${o.rect.right}px`);
    });
  }

  await browser.close();
}

findOverflowElements().catch(err => {
  console.error(err);
  process.exit(1);
});
