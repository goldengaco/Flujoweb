const path = require('path');
const { BrowserSession } = require('../../tests/runner');

const VIEWPORTS = [
  { name: '360px', width: 360, height: 640 },
  { name: '412px', width: 412, height: 915 },
  { name: '768px', width: 768, height: 1024 },
  { name: '1024px', width: 1024, height: 768 },
  { name: '1280px', width: 1280, height: 800 },
  { name: '1920px', width: 1920, height: 1080 },
  { name: '2560px', width: 2560, height: 1440 },
  { name: '3840px', width: 3840, height: 2160 }
];

async function check(name) {
  const browser = new BrowserSession();
  await browser.launch();
  try {
    const file = path.resolve(__dirname, '..', '..', 'sistemas', name, 'index.html');
    console.log('=== TESTING ' + name + ' ===');
    for (const vp of VIEWPORTS) {
      await browser.setViewport(vp.width, vp.height, 1, vp.width <= 768);
      await browser.navigate(file);
      await browser.sleep(200);

      const res = await browser.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
        const clientW = Math.max(doc.clientWidth, body.clientWidth);
        const overflow = scrollW > clientW + 3;
        
        const offenders = [];
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
        return { scrollW, clientW, overflow, offenders: offenders.slice(0, 10) };
      });

      if (res.overflow) {
        console.log(`FAIL [${vp.name}]: scrollW=${res.scrollW}, clientW=${res.clientW} (delta: +${res.scrollW - res.clientW})`);
        console.log('  Offenders:', JSON.stringify(res.offenders, null, 2));
      } else {
        console.log(`PASS [${vp.name}]: ${res.clientW}px`);
      }
    }
  } finally {
    await browser.close();
  }
}

(async () => {
  await check('emergency-evacuation-v2');
  await check('emergency-evacuation-v3');
})();
