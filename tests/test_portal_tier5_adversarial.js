/**
 * Tier 5 Master Portal Adversarial Hardening Suite
 * Rigorous empirical stress-testing for 'sistemas/index.html'
 */

const path = require('path');
const fs = require('fs');
const { TestContext, Helpers } = require('./fixtures/helpers');
const { BrowserSession } = require('./runner');

const ADVERSARIAL_VIEWPORTS = [
  { name: 'Mobile Ultra-Compact (360x640)', width: 360, height: 640, isMobile: true },
  { name: 'Mobile Modern (412x915)', width: 412, height: 915, isMobile: true },
  { name: 'Tablet Portrait (768x1024)', width: 768, height: 1024, isMobile: true },
  { name: 'Laptop HD (1280x800)', width: 1280, height: 800, isMobile: false },
  { name: 'Full HD Desktop (1920x1080)', width: 1920, height: 1080, isMobile: false },
  { name: '2K QHD (2560x1440)', width: 2560, height: 1440, isMobile: false },
  { name: '4K UHD (3840x2160)', width: 3840, height: 2160, isMobile: false }
];

async function runTier5PortalTests(browser) {
  const ctx = new TestContext('Tier 5 Master Launchpad Portal Adversarial Hardening');
  const portalPath = path.resolve(__dirname, '..', 'sistemas', 'index.html');

  if (!fs.existsSync(portalPath)) {
    throw new Error(`Portal file not found at ${portalPath}`);
  }

  // ==========================================
  // Section 1: Extreme Viewport Scaling & Card Collisions
  // ==========================================
  await ctx.test('T5-VIEWPORT-01: Zero horizontal overflow & zero card collisions across 7 extreme viewports (360px - 3840px)', async () => {
    const report = [];

    for (const vp of ADVERSARIAL_VIEWPORTS) {
      await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
      await browser.navigate(portalPath);
      await browser.sleep(250);

      const metrics = await browser.evaluate(() => {
        const doc = document.documentElement;
        const body = document.body;
        const scrollW = Math.max(doc.scrollWidth, body.scrollWidth);
        const clientW = Math.max(doc.clientWidth, body.clientWidth);
        const innerW = window.innerWidth;
        const hasOverflow = scrollW > innerW + 3;

        // Check card collisions
        const cards = Array.from(document.querySelectorAll('.system-card, .card')).filter(c => {
          const s = window.getComputedStyle(c);
          return s.display !== 'none' && s.visibility !== 'hidden' && c.offsetWidth > 20 && c.offsetHeight > 20;
        });

        const collisions = [];
        for (let i = 0; i < cards.length; i++) {
          const r1 = cards[i].getBoundingClientRect();
          for (let j = i + 1; j < cards.length; j++) {
            const r2 = cards[j].getBoundingClientRect();
            const overlapX = Math.max(0, Math.min(r1.right, r2.right) - Math.max(r1.left, r2.left));
            const overlapY = Math.max(0, Math.min(r1.bottom, r2.bottom) - Math.max(r1.top, r2.top));
            const overlapArea = overlapX * overlapY;
            if (overlapArea > 50) {
              collisions.push({
                card1: cards[i].getAttribute('data-system') || cards[i].className,
                card2: cards[j].getAttribute('data-system') || cards[j].className,
                area: Math.round(overlapArea)
              });
            }
          }
        }

        return {
          scrollW,
          clientW,
          innerW,
          hasOverflow,
          cardCount: cards.length,
          collisions
        };
      });

      if (metrics.hasOverflow) {
        report.push(`[${vp.name}] Overflow: scrollWidth (${metrics.scrollW}px) > innerWidth (${metrics.innerW}px)`);
      }
      if (metrics.collisions.length > 0) {
        report.push(`[${vp.name}] Card Collisions: ${JSON.stringify(metrics.collisions)}`);
      }
      if (metrics.cardCount !== 15) {
        report.push(`[${vp.name}] Expected 15 visible cards initially, found ${metrics.cardCount}`);
      }
    }

    Helpers.assertTrue(report.length === 0, 'Viewport scaling failures detected:\n  ' + report.join('\n  '));
  });

  // ==========================================
  // Section 2: Real-Time Search Stress Testing
  // ==========================================
  await ctx.test('T5-SEARCH-01: Rapid typing, special characters, regex tokens, and badge/title matching', async () => {
    await browser.setViewport(1440, 900);
    await browser.navigate(portalPath);
    await browser.sleep(250);

    const searchSelector = '#search-input';

    // 1. Keyword search tests against title & technology badges
    const validMatches = [
      { query: 'mulesoft', expectedMin: 2 },
      { query: 'apigee', expectedMin: 1 },
      { query: 'Cloud Run', expectedMin: 1 },
      { query: 'ISO 20022', expectedMin: 1 },
      { query: 'LoRaWAN', expectedMin: 2 },
      { query: 'DataWeave', expectedMin: 2 },
      { query: 'WAF Threat Shield', expectedMin: 1 },
      { query: 'HLS', expectedMin: 1 }
    ];

    for (const vm of validMatches) {
      await browser.type(searchSelector, vm.query);
      await browser.sleep(100);

      const count = await browser.evaluate(() => {
        return Array.from(document.querySelectorAll('.system-card')).filter(c => window.getComputedStyle(c).display !== 'none').length;
      });

      Helpers.assertTrue(count >= vm.expectedMin, `Search for "${vm.query}" expected >= ${vm.expectedMin}, got ${count}`);
    }

    // 2. Empty string reset
    await browser.type(searchSelector, '');
    await browser.sleep(100);
    const resetCount = await browser.evaluate(() => {
      return Array.from(document.querySelectorAll('.system-card')).filter(c => window.getComputedStyle(c).display !== 'none').length;
    });
    Helpers.assertEqual(resetCount, 15, 'Empty string reset must restore exactly 15 cards');

    // 3. Adversarial / Special characters
    const adversarialQueries = [
      '<script>alert(1)</script>',
      '\' OR \'1\'=\'1',
      '" AND "x"="x',
      '\\d+\\w*',
      '.*',
      '[a-z]+',
      'undefined',
      'null',
      'NaN',
      '%20%00',
      '   mulesoft   ',
      '!@#$%^&*()_+{}|:"<>?'
    ];

    for (const advQuery of adversarialQueries) {
      await browser.type(searchSelector, advQuery);
      await browser.sleep(50);
      
      const res = await browser.evaluate((q) => {
        const visible = Array.from(document.querySelectorAll('.system-card')).filter(c => window.getComputedStyle(c).display !== 'none');
        return {
          query: q,
          visibleCount: visible.length
        };
      }, advQuery);

      if (advQuery === '   mulesoft   ') {
        Helpers.assertGreaterThan(res.visibleCount, 0, 'Trimmed search "   mulesoft   " should match');
      }
    }

    // Restore clean state
    await browser.type(searchSelector, '');
    await browser.sleep(50);
  });

  // ==========================================
  // Section 3: Category Filter Stress Testing
  // ==========================================
  await ctx.test('T5-FILTER-01: Rapid category switching & exact partition cardinality', async () => {
    await browser.navigate(portalPath);
    await browser.sleep(200);

    const categories = [
      { key: 'all', expected: 15 },
      { key: 'emergencia', expected: 3 },
      { key: 'mulesoft', expected: 2 },
      { key: 'gcp-sre', expected: 5 },
      { key: 'seguridad-fintech', expected: 5 }
    ];

    // Rapid switching 30 times
    for (let cycle = 0; cycle < 30; cycle++) {
      const target = categories[cycle % categories.length];
      await browser.evaluate((catKey) => {
        const btn = document.querySelector(`[data-category="${catKey}"], [data-filter="${catKey}"]`);
        if (btn) btn.click();
      }, target.key);
      await browser.sleep(30);

      const count = await browser.evaluate(() => {
        return Array.from(document.querySelectorAll('.system-card')).filter(c => window.getComputedStyle(c).display !== 'none').length;
      });

      Helpers.assertEqual(count, target.expected, `Category "${target.key}" in cycle ${cycle} expected ${target.expected} cards, got ${count}`);
    }

    // Cross-filtering: Category + Search combined
    await browser.evaluate(() => {
      const btn = document.querySelector('[data-category="gcp-sre"], [data-filter="gcp-sre"]');
      if (btn) btn.click();
    });
    await browser.type('#search-input', 'serverless');
    await browser.sleep(100);

    const combCount = await browser.evaluate(() => {
      return Array.from(document.querySelectorAll('.system-card')).filter(c => window.getComputedStyle(c).display !== 'none').length;
    });
    Helpers.assertEqual(combCount, 1, 'Category "gcp-sre" + search "serverless" should yield exactly 1 card');

    // Reset filter
    await browser.type('#search-input', '');
    await browser.evaluate(() => {
      const btn = document.querySelector('[data-category="all"], [data-filter="all"]');
      if (btn) btn.click();
    });
  });

  // ==========================================
  // Section 4: Architecture Drawer Stress Testing
  // ==========================================
  await ctx.test('T5-DRAWER-01: Rapid open/close cycles, 3-tab switching, and markdown rendering fidelity', async () => {
    await browser.navigate(portalPath);
    await browser.sleep(200);

    // 1. Rapid open/close cycles (15 cycles)
    for (let i = 0; i < 15; i++) {
      // Open
      await browser.evaluate(() => {
        const btn = document.querySelector('#btn-docs-drawer, .btn-architecture');
        if (btn) btn.click();
      });
      await browser.sleep(40);

      const isOpen = await browser.evaluate(() => {
        const d = document.querySelector('#docs-drawer');
        return d && (d.classList.contains('open') || d.classList.contains('active'));
      });
      Helpers.assertTrue(isOpen, `Cycle ${i}: Drawer should be open after toggle click`);

      // Close
      await browser.evaluate(() => {
        const closeBtn = document.querySelector('#btn-close-drawer, .drawer-close');
        if (closeBtn) closeBtn.click();
      });
      await browser.sleep(40);

      const isClosed = await browser.evaluate(() => {
        const d = document.querySelector('#docs-drawer');
        return d && !d.classList.contains('open') && !d.classList.contains('active');
      });
      Helpers.assertTrue(isClosed, `Cycle ${i}: Drawer should be closed after close click`);
    }

    // 2. Open drawer and verify all 3 documentation tabs render markdown rich elements
    await browser.evaluate(() => {
      const btn = document.querySelector('#btn-docs-drawer, .btn-architecture');
      if (btn) btn.click();
    });
    await browser.sleep(200);

    const docKeys = ['ideas', 'cloud-sre', 'mulesoft-arch'];
    for (const docKey of docKeys) {
      await browser.evaluate((key) => {
        const tab = document.querySelector(`[data-doc="${key}"]`);
        if (tab) tab.click();
      }, docKey);
      await browser.sleep(250);

      const docFidelity = await browser.evaluate(() => {
        const content = document.querySelector('#drawer-content, .drawer-content, .markdown-viewer');
        if (!content) return { exists: false };

        const textLen = (content.innerText || '').length;
        const html = content.innerHTML;
        const h1Count = content.querySelectorAll('h1').length;
        const h2Count = content.querySelectorAll('h2').length;
        const h3Count = content.querySelectorAll('h3').length;
        const tableCount = content.querySelectorAll('table').length;
        const preCount = content.querySelectorAll('pre, code').length;
        const pCount = content.querySelectorAll('p').length;

        return {
          exists: true,
          textLen,
          h1Count,
          h2Count,
          h3Count,
          tableCount,
          preCount,
          pCount,
          hasContent: textLen > 2000
        };
      });

      Helpers.assertTrue(docFidelity.exists, `Doc container must exist for tab "${docKey}"`);
      Helpers.assertTrue(docFidelity.hasContent, `Doc "${docKey}" must render substantive content (>2000 chars, got ${docFidelity.textLen})`);
      Helpers.assertTrue(docFidelity.h1Count + docFidelity.h2Count > 0, `Doc "${docKey}" must contain rendered headings (H1/H2)`);
      Helpers.assertTrue(docFidelity.pCount > 0, `Doc "${docKey}" must contain rendered paragraphs`);
    }

    // Close drawer
    await browser.evaluate(() => {
      const closeBtn = document.querySelector('#btn-close-drawer, .drawer-close');
      if (closeBtn) closeBtn.click();
    });
    await browser.sleep(100);
  });

  // ==========================================
  // Section 5: Disk Targets & Link Integrity
  // ==========================================
  await ctx.test('T5-LINKS-01: Exactly 15 cards rendered with valid, non-broken file links on disk', async () => {
    await browser.navigate(portalPath);
    await browser.sleep(200);

    const cardsManifest = await browser.evaluate(() => {
      const cardEls = Array.from(document.querySelectorAll('.system-card, .card'));
      return cardEls.map(card => {
        const link = card.querySelector('a.btn-launch, a[href]');
        return {
          id: card.getAttribute('data-system'),
          category: card.getAttribute('data-category'),
          title: (card.querySelector('.card-title')?.innerText || '').trim(),
          subtitle: (card.querySelector('.card-subtitle')?.innerText || '').trim(),
          href: link ? link.getAttribute('href') : null
        };
      });
    });

    Helpers.assertEqual(cardsManifest.length, 15, 'Portal must render exactly 15 system cards');

    const baseDir = path.dirname(portalPath);
    const brokenLinks = [];

    for (const card of cardsManifest) {
      Helpers.assertTrue(!!card.href, `Card "${card.id}" must have a launch link href`);
      const targetPath = path.resolve(baseDir, card.href);
      if (!fs.existsSync(targetPath)) {
        brokenLinks.push(`Card ${card.id} (${card.title}) targets missing file: ${targetPath}`);
      }
    }

    Helpers.assertTrue(brokenLinks.length === 0, 'Broken card links detected:\n  ' + brokenLinks.join('\n  '));

    // Check markdown files existence
    const mdFiles = [
      'manual_observabilidad_cloud_sre.md',
      'mulesoft_80_ideas_observabilidad.md',
      'mulesoft_y_arquitectura_sistemas.md'
    ];
    for (const mf of mdFiles) {
      const mfPath = path.resolve(baseDir, mf);
      Helpers.assertTrue(fs.existsSync(mfPath), `Markdown doc file ${mf} must exist on disk at ${mfPath}`);
    }
  });

  return ctx.summary();
}

// Standalone runner
if (require.main === module) {
  (async () => {
    const browser = new BrowserSession();
    try {
      await browser.launch();
      const res = await runTier5PortalTests(browser);
      console.log(`\n======================================================`);
      console.log(`Tier 5 Master Portal Adversarial Result: ${res.passed}/${res.total} Passed (${res.duration}ms)`);
      console.log(`======================================================`);
      process.exit(res.failed === 0 ? 0 : 1);
    } catch (err) {
      console.error('Test Execution Error:', err);
      process.exit(1);
    } finally {
      await browser.close();
    }
  })();
}

module.exports = { runTier5PortalTests };
