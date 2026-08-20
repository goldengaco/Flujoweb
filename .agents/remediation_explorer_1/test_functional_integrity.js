const path = require('path');
const { BrowserSession } = require('../../tests/runner');

// Let's test full functional suites and layout anti-collision
async function main() {
  const browser = new BrowserSession();
  await browser.launch();

  try {
    console.log('Testing full collision & clipping checks on remediated pages...');
    
    // We will test all 4 systems for:
    // 1. Zero element collisions (bounding box intersections)
    // 2. Zero text clipping (scrollHeight > clientHeight)
    // 3. Fluid clamp() / responsive CSS checks
    
    const targets = [
      { id: 'security-audit', file: path.resolve(__dirname, '../../sistemas/security-audit/index.html') },
      { id: 'gcp-serverless-pipeline', file: path.resolve(__dirname, '../../sistemas/gcp-serverless-pipeline/index.html') },
      { id: 'gcp-event-pubsub', file: path.resolve(__dirname, '../../sistemas/gcp-event-pubsub/index.html') },
      { id: 'gcp-sql-networking', file: path.resolve(__dirname, '../../sistemas/gcp-sql-networking/index.html') }
    ];

    for (const t of targets) {
      await browser.navigate(t.file);
      await browser.sleep(200);

      // Check collision
      const collisions = await browser.evaluate(() => {
        const containers = Array.from(document.querySelectorAll('.grid, .dashboard-grid, .layout-grid, .panel-grid, .container, main, .main-content, .cockpit-grid, .app-container'));
        const cols = [];
        containers.forEach(container => {
          const children = Array.from(container.children).filter(el => {
            const s = window.getComputedStyle(el);
            return s.display !== 'none' && s.visibility !== 'hidden' && s.position !== 'absolute' && s.position !== 'fixed' && el.offsetWidth > 10 && el.offsetHeight > 10;
          });
          for (let i = 0; i < children.length; i++) {
            const r1 = children[i].getBoundingClientRect();
            for (let j = i + 1; j < children.length; j++) {
              const r2 = children[j].getBoundingClientRect();
              const ox = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
              const oy = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
              const area = ox * oy;
              if (area > 50) {
                cols.push({ el1: children[i].className, el2: children[j].className, area: Math.round(area) });
              }
            }
          }
        });
        return cols;
      });

      console.log(`[${t.id}] Collisions: ${collisions.length === 0 ? '0 (PASS)' : JSON.stringify(collisions)}`);

      // Check text clipping
      const clippings = await browser.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll('h1, h2, h3, .card, .hud-panel, .metric-value, .stepper, .panel-body'));
        const clipped = [];
        candidates.forEach(el => {
          const style = window.getComputedStyle(el);
          if (style.overflow === 'hidden' || style.overflowY === 'hidden') {
            if (el.scrollHeight > el.clientHeight + 16 && el.clientHeight > 0) {
              clipped.push({ el: el.className, scrollH: el.scrollHeight, clientH: el.clientHeight });
            }
          }
        });
        return clipped;
      });

      console.log(`[${t.id}] Text Clippings: ${clippings.length === 0 ? '0 (PASS)' : JSON.stringify(clippings)}`);
    }

  } finally {
    await browser.close();
  }
}

main().catch(console.error);
