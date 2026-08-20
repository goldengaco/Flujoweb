const path = require('path');
const fs = require('fs');
const { BrowserSession } = require('../../tests/runner');
const { Helpers } = require('../../tests/fixtures/helpers');

async function runAdversarialTests() {
  console.log('=== STARTING ADVERSARIAL STRESS TEST SUITE ===\n');
  const browser = new BrowserSession();
  await browser.launch();

  const portalPath = path.resolve(__dirname, '..', '..', 'sistemas', 'index.html');
  const results = { passed: 0, failed: 0, total: 0, errors: [] };

  function record(name, pass, msg) {
    results.total++;
    if (pass) {
      results.passed++;
      console.log(`  ✔ [PASS] ${name}`);
    } else {
      results.failed++;
      results.errors.push({ name, msg });
      console.error(`  ✖ [FAIL] ${name}: ${msg}`);
    }
  }

  try {
    // 1. Multi-Viewport Anti-Collision Stress Test
    console.log('--- Suite 1: Multi-Viewport Anti-Collision & Zero-Overflow ---');
    const viewports = [
      { w: 360, h: 640, name: 'Mobile 360p' },
      { w: 480, h: 800, name: 'Mobile Large 480p' },
      { w: 768, h: 1024, name: 'Tablet 768p' },
      { w: 1024, h: 768, name: 'Desktop 1024p' },
      { w: 1440, h: 900, name: 'Laptop 1440p' },
      { w: 1920, h: 1080, name: 'FHD 1080p' },
      { w: 2560, h: 1440, name: 'QHD 1440p' },
      { w: 3840, h: 2160, name: '4K UHD 2160p' }
    ];

    for (const vp of viewports) {
      await browser.setViewport(vp.w, vp.h);
      await browser.navigate(portalPath);
      await browser.sleep(300);

      const overflowData = await browser.evaluate(() => {
        const docW = document.documentElement.scrollWidth;
        const bodyW = document.body.scrollWidth;
        const winW = window.innerWidth;
        const hasOverflow = docW > winW || bodyW > winW;
        return { docW, bodyW, winW, hasOverflow };
      });

      record(
        `Viewport ${vp.name} (${vp.w}x${vp.h}) Zero-Horizontal Overflow`,
        !overflowData.hasOverflow,
        `Detected overflow: scrollWidth=${overflowData.docW} > innerWidth=${overflowData.winW}`
      );
    }

    // 2. Search Engine Adversarial Stress Testing
    console.log('\n--- Suite 2: Search Engine Adversarial Inputs & Combinations ---');
    await browser.setViewport(1440, 900);
    await browser.navigate(portalPath);
    await browser.sleep(300);

    const searchTestCases = [
      { input: 'LORA', expectedMin: 2, desc: 'Case-insensitive badge/desc substring (LORA)' },
      { input: 'canary', expectedMin: 1, desc: 'Lowercase badge match (canary)' },
      { input: '   gcp   ', expectedMin: 5, desc: 'Search input with leading/trailing whitespace' },
      { input: 'MULESOFT', expectedMin: 2, desc: 'Uppercase keyword match' },
      { input: 'a*', expectedMin: 1, desc: 'Regex special character string (a*)' },
      { input: '[system]', expectedMin: 0, desc: 'Bracket special chars ([system])' },
      { input: 'nonexistent-query-xyz-999', expectedMin: 0, expectedMax: 0, desc: 'Completely un-matched query returns 0 cards cleanly' }
    ];

    for (const tc of searchTestCases) {
      await browser.type('#search-input', tc.input);
      await browser.sleep(150);

      const cardStats = await browser.evaluate(() => {
        const visibleCards = Array.from(document.querySelectorAll('.system-card'))
          .filter(c => window.getComputedStyle(c).display !== 'none');
        return { visibleCount: visibleCards.length };
      });

      let pass = true;
      let msg = '';
      if (tc.expectedMin !== undefined && cardStats.visibleCount < tc.expectedMin) {
        pass = false;
        msg = `Expected at least ${tc.expectedMin} cards, found ${cardStats.visibleCount}`;
      }
      if (tc.expectedMax !== undefined && cardStats.visibleCount > tc.expectedMax) {
        pass = false;
        msg = `Expected at most ${tc.expectedMax} cards, found ${cardStats.visibleCount}`;
      }

      record(`Search Query "${tc.input}" (${tc.desc})`, pass, msg);
    }

    // Reset search
    await browser.type('#search-input', '');
    await browser.sleep(150);

    // 3. Category Filter & Combined Filter Logic
    console.log('\n--- Suite 3: Category Filtering & Compound Filter Verification ---');
    const categoryExpectations = [
      { cat: 'emergencia', expectedCount: 3, selector: '[data-category="emergencia"]' },
      { cat: 'mulesoft', expectedCount: 2, selector: '[data-category="mulesoft"]' },
      { cat: 'gcp-sre', expectedCount: 5, selector: '[data-category="gcp-sre"]' },
      { cat: 'seguridad-fintech', expectedCount: 5, selector: '[data-category="seguridad-fintech"]' },
      { cat: 'all', expectedCount: 15, selector: '[data-category="all"]' }
    ];

    for (const ce of categoryExpectations) {
      await browser.evaluate((sel) => {
        const btn = document.querySelector(sel);
        if (btn) btn.click();
      }, ce.selector);
      await browser.sleep(150);

      const count = await browser.evaluate(() => {
        return Array.from(document.querySelectorAll('.system-card'))
          .filter(c => window.getComputedStyle(c).display !== 'none').length;
      });

      record(
        `Category Filter [${ce.cat}] yields exactly ${ce.expectedCount} cards`,
        count === ce.expectedCount,
        `Expected ${ce.expectedCount}, got ${count}`
      );
    }

    // Compound test: Category 'emergencia' + Search 'v2' -> should yield 1
    await browser.evaluate(() => {
      document.querySelector('[data-category="emergencia"]').click();
    });
    await browser.type('#search-input', 'v2');
    await browser.sleep(150);
    const compoundCount = await browser.evaluate(() => {
      return Array.from(document.querySelectorAll('.system-card'))
        .filter(c => window.getComputedStyle(c).display !== 'none').length;
    });
    record(
      'Compound Filter (Category: emergencia + Search: "v2") yields exactly 1 card',
      compoundCount === 1,
      `Expected 1, got ${compoundCount}`
    );

    // Reset back to all
    await browser.type('#search-input', '');
    await browser.evaluate(() => {
      document.querySelector('[data-category="all"]').click();
    });
    await browser.sleep(150);

    // 4. Slide-Out Architecture Drawer Tabs & Technical Manuals Depth
    console.log('\n--- Suite 4: Technical Manuals Drawer & Content Rendering ---');
    await browser.evaluate(() => {
      const btn = document.getElementById('btn-docs-drawer');
      if (btn) btn.click();
    });
    await browser.sleep(200);

    const docTabsToTest = [
      {
        tabSel: '[data-doc="ideas"]',
        name: 'MuleSoft 80 Ideas Catalog',
        requiredKeywords: ['Master Innovation Catalog', 'Fintech', 'Healthcare', 'Salvar Vidas', 'DataWeave 2.0', 'Apigee']
      },
      {
        tabSel: '[data-doc="cloud-sre"]',
        name: 'Cloud SRE Manual',
        requiredKeywords: ['Google Cloud SRE', 'Four Golden Signals', 'Canary', 'Pub/Sub', 'Cloud SQL HA', 'Least Privilege']
      },
      {
        tabSel: '[data-doc="mulesoft-arch"]',
        name: 'MuleSoft Architecture Manual',
        requiredKeywords: ['MuleSoft', 'API-Led', 'Experience', 'Process', 'System', 'Runtime Fabric', 'Spike Arrest']
      }
    ];

    for (const dt of docTabsToTest) {
      await browser.evaluate((sel) => {
        const tab = document.querySelector(sel);
        if (tab) tab.click();
      }, dt.tabSel);
      await browser.sleep(250);

      const tabText = await browser.evaluate(() => {
        const c = document.getElementById('drawer-content');
        return c ? c.innerText : '';
      });

      let missing = [];
      for (const kw of dt.requiredKeywords) {
        if (!tabText.includes(kw)) {
          missing.push(kw);
        }
      }

      record(
        `Drawer Tab [${dt.name}] renders rich content (${tabText.length} chars)`,
        tabText.length > 2000 && missing.length === 0,
        `Missing keywords: ${missing.join(', ')} (Length: ${tabText.length})`
      );
    }

    // Close drawer
    await browser.evaluate(() => {
      const btnClose = document.getElementById('btn-close-drawer');
      if (btnClose) btnClose.click();
    });
    await browser.sleep(150);

    // 5. Card Links Verification on Live DOM
    console.log('\n--- Suite 5: Live DOM Card Launcher Link Verifications ---');
    const cardLinks = await browser.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.btn-launch, a.system-card'));
      return links.map(l => ({
        href: l.getAttribute('href'),
        text: l.innerText.trim()
      }));
    });

    let validLinkCount = 0;
    const baseDir = path.dirname(portalPath);
    for (const cl of cardLinks) {
      if (!cl.href) continue;
      const targetPath = path.resolve(baseDir, cl.href);
      if (fs.existsSync(targetPath)) {
        validLinkCount++;
      }
    }

    record(
      `All 15 Launch Dashboard links resolve to physical index.html files`,
      validLinkCount === 15,
      `Only ${validLinkCount}/15 resolved to valid files`
    );

    // 6. Console Error Check
    await Helpers.assertNoConsoleErrors(browser, 'Adversarial Portal Session');
    record('Zero JavaScript Console Errors during full adversarial session', true, '');

  } catch (err) {
    console.error('Fatal test error:', err);
    record('Adversarial Execution Completed without fatal exceptions', false, err.message);
  } finally {
    await browser.close();
  }

  console.log(`\n======================================================`);
  console.log(`ADVERSARIAL STRESS SUITE: ${results.passed}/${results.total} PASSED (${results.failed} failed)`);
  console.log(`======================================================\n`);
  return results;
}

runAdversarialTests().then(res => {
  process.exit(res.failed === 0 ? 0 : 1);
});
