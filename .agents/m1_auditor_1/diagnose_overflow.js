const path = require('path');
const { BrowserSession } = require('../../tests/runner');

const failedSystems = [
  { name: 'apigee-mulesoft-hybrid', file: 'sistemas/apigee-mulesoft-hybrid/index.html' },
  { name: 'emergency-evacuation-v1', file: 'sistemas/emergency-evacuation-v1/index.html' },
  { name: 'emergency-evacuation-v3', file: 'sistemas/emergency-evacuation-v3/index.html' },
  { name: 'gcp-serverless-pipeline', file: 'sistemas/gcp-serverless-pipeline/index.html' },
  { name: 'gcp-event-pubsub', file: 'sistemas/gcp-event-pubsub/index.html' },
  { name: 'gcp-sql-networking', file: 'sistemas/gcp-sql-networking/index.html' },
  { name: 'gcp-iam-security', file: 'sistemas/gcp-iam-security/index.html' },
  { name: 'security-audit', file: 'sistemas/security-audit/index.html' }
];

async function diagnose() {
  const browser = new BrowserSession();
  await browser.launch();
  
  for (const sys of failedSystems) {
    const fullPath = path.resolve(sys.file);
    await browser.setViewport(360, 640, 1, true);
    await browser.navigate(fullPath);
    await browser.sleep(300);
    
    const overflowing = await browser.evaluate(() => {
      const clientW = document.documentElement.clientWidth;
      const allEls = document.querySelectorAll('*');
      const offending = [];
      
      allEls.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right > clientW + 2 && el.offsetWidth > 10) {
          offending.push({
            tag: el.tagName,
            id: el.id,
            className: el.className ? String(el.className).slice(0, 50) : '',
            right: Math.round(rect.right),
            width: Math.round(rect.width),
            scrollWidth: el.scrollWidth
          });
        }
      });
      return {
        docScrollWidth: document.documentElement.scrollWidth,
        bodyScrollWidth: document.body.scrollWidth,
        clientWidth: clientW,
        offendingCount: offending.length,
        topOffenders: offending.slice(0, 8)
      };
    });
    
    console.log(`\n========================================`);
    console.log(`SYSTEM: ${sys.name}`);
    console.log(`docScrollWidth: ${overflowing.docScrollWidth}px | clientWidth: ${overflowing.clientWidth}px`);
    console.log(`Top offending elements:`);
    overflowing.topOffenders.forEach(o => {
      console.log(`  <${o.tag} id="${o.id}" class="${o.className}"> right=${o.right}px width=${o.width}px`);
    });
  }
  
  await browser.close();
}

diagnose().catch(err => {
  console.error(err);
  process.exit(1);
});
