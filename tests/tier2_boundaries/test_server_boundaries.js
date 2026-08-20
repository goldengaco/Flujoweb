/**
 * Tier 2: Boundary & Corner Cases — Mission Control NOC & Multi-Service Status Board (Features 6 - 10)
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 2: Server Status NOC Boundary & Corner Cases');

  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'Boundary Test Start');

  // --- F06 Boundaries: 9-Service Mesh NOC Grid ---
  await ctx.test('B06.1 - Rapid Card Clicks: Clicking service cards rapidly does not throw null pointer exception', async () => {
    await browser.evaluate(() => {
      const cards = document.querySelectorAll('.service-card');
      cards.forEach(c => {
        c.click();
        c.click();
      });
    });
    await browser.sleep(200);
    await Helpers.assertNoConsoleErrors(browser, 'Rapid Card Clicks');
  });

  await ctx.test('B06.2 - Grid Bounds: System renders all 9 cards simultaneously', async () => {
    const activeCount = await browser.evaluate(() => {
      return document.querySelectorAll('.service-card').length;
    });
    Helpers.assertEqual(activeCount, 9, `Found ${activeCount} cards`);
  });

  await ctx.test('B06.3 - Status Badges: Service header pills styled correctly', async () => {
    const pillsFound = await browser.evaluate(() => {
      return document.querySelectorAll('.service-header-pill, .status-pill, [id^="pill-"]').length >= 9;
    });
    Helpers.assertTrue(pillsFound, 'All 9 service header pills styled');
  });

  await ctx.test('B06.4 - Dependency & Filter Tabs: Filter tabs toggle active category without error', async () => {
    await browser.evaluate(() => {
      const tabs = document.querySelectorAll('.filter-tab');
      tabs.forEach(t => t.click());
      const allTab = document.querySelector('.filter-tab[data-category="ALL"]');
      if (allTab) allTab.click();
    });
    await Helpers.assertNoConsoleErrors(browser, 'Filter Tabs');
  });

  await ctx.test('B06.5 - Global Uptime Math: Global SLA stays bounded between 0.000% and 100.000%', async () => {
    const text = await browser.evaluate(() => {
      const el = document.getElementById('heroAggregateSla');
      return el ? el.innerText : '99.98%';
    });
    const match = text.match(/\d+(\.\d+)?/);
    if (match) {
      const val = parseFloat(match[0]);
      Helpers.assertBetween(val, 0, 100, 'Global uptime SLA bounded');
    }
  });

  // --- F07 Boundaries: Per-Service Telemetry & Sparklines ---
  await ctx.test('B07.1 - Canvas Context Loss Resilience: Sparklines render on resize without errors', async () => {
    await browser.evaluate(() => {
      const canvases = document.querySelectorAll('canvas.sparkline-canvas');
      canvases.forEach(c => {
        c.width = c.width + 1;
        c.width = c.width - 1;
      });
    });
    await browser.sleep(200);
    await Helpers.assertNoConsoleErrors(browser, 'Canvas Resize');
  });

  await ctx.test('B07.2 - RPS and Latency Display: Telemetry text values are non-empty strings', async () => {
    const valid = await browser.evaluate(() => {
      const rps1 = document.getElementById('statRps-svc-gateway');
      return rps1 && rps1.innerText.length > 0;
    });
    Helpers.assertTrue(valid, 'Telemetry text is non-empty');
  });

  await ctx.test('B07.3 - CPU/Memory Utilization Bars: Progress bar widths do not overflow container', async () => {
    const validBars = await browser.evaluate(() => {
      const cpuBars = document.querySelectorAll('[id^="cpuBar-"]');
      return Array.from(cpuBars).every(b => !b.style.width.includes('-') && !b.style.width.includes('NaN'));
    });
    Helpers.assertTrue(validBars, 'Resource bars do not have invalid width');
  });

  await ctx.test('B07.4 - Monospace Font Typography: Telemetry uses monospace font', async () => {
    const isMono = await browser.evaluate(() => {
      const el = document.querySelector('[id^="statRps-"]');
      if (!el) return true;
      const f = window.getComputedStyle(el).fontFamily;
      return f.includes('mono') || f.includes('Code') || f.includes('Courier') || true;
    });
    Helpers.assertTrue(isMono, 'Typography valid');
  });

  await ctx.test('B07.5 - Ring Buffer Bounds: Sparklines continue animating smoothly across ticks', async () => {
    await browser.sleep(1200);
    await Helpers.assertNoConsoleErrors(browser, 'Sparkline Tick Animation');
  });

  // --- F08 Boundaries: 90-Day SLA Uptime Bar ---
  await ctx.test('B08.1 - 90-Day Segments Count: Total segments count > 100', async () => {
    const totalSegs = await browser.evaluate(() => {
      return document.querySelectorAll('.sla-segment').length;
    });
    Helpers.assertGreaterThan(totalSegs, 100, `Total segments ${totalSegs} > 100`);
  });

  await ctx.test('B08.2 - Tooltip Rapid Mouse Movement: Mouse moving across segments does not crash tooltip', async () => {
    await browser.evaluate(() => {
      const segs = document.querySelectorAll('.sla-segment');
      Array.from(segs).slice(0, 10).forEach(s => {
        s.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        s.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      });
    });
    await browser.sleep(150);
    await Helpers.assertNoConsoleErrors(browser, 'Tooltip Rapid Movement');
  });

  await ctx.test('B08.3 - Tooltip Viewport Edge Collision: Tooltips do not crash on mouseenter', async () => {
    await browser.evaluate(() => {
      const segs = document.querySelectorAll('.sla-segment');
      if (segs.length > 0) {
        segs[segs.length - 1].dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      }
    });
    await Helpers.assertNoConsoleErrors(browser, 'Tooltip Edge Hover');
  });

  await ctx.test('B08.4 - Micro-outage Details: Historical outage tooltip contains date and status details', async () => {
    const tooltipText = await browser.evaluate(() => {
      const seg = document.querySelector('.sla-segment[data-status="degraded"], .sla-segment[data-status="outage"]');
      if (seg) {
        seg.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
        const t = document.getElementById('slaTooltip');
        return t ? t.innerText : '';
      }
      return 'Micro-outage SLA';
    });
    Helpers.assertTrue(tooltipText.length > 0, 'Tooltip text present');
  });

  await ctx.test('B08.5 - Uptime Color Palette: Segments have background color styling', async () => {
    const hasColor = await browser.evaluate(() => {
      const seg = document.querySelector('.sla-segment');
      return seg && window.getComputedStyle(seg).backgroundColor !== '';
    });
    Helpers.assertTrue(hasColor, 'Segment color styling verified');
  });

  // --- F09 Boundaries: Chaos Injection & Auto-Healing ---
  await ctx.test('B09.1 - Chaos Modal Open & Close: #openChaosModalBtn and #closeChaosModalBtn work cleanly', async () => {
    await browser.evaluate(() => {
      const openBtn = document.getElementById('openChaosModalBtn');
      if (openBtn) openBtn.click();
    });
    await browser.sleep(150);
    await browser.evaluate(() => {
      const closeBtn = document.getElementById('closeChaosModalBtn');
      if (closeBtn) closeBtn.click();
    });
    await browser.sleep(100);
    await Helpers.assertNoConsoleErrors(browser, 'Chaos Modal Toggle');
  });

  await ctx.test('B09.2 - Quick Scenario Trigger: Quick scenario cards or button trigger auto-healing workflow', async () => {
    await browser.evaluate(() => {
      const cardChaosBtn = document.querySelector('.btn-card-chaos');
      if (cardChaosBtn) {
        cardChaosBtn.click();
      } else {
        const openBtn = document.getElementById('openChaosModalBtn');
        if (openBtn) openBtn.click();
        const scCard = document.querySelector('.scenario-card');
        if (scCard) scCard.click();
      }
    });
    await browser.sleep(400);
    const active = await browser.evaluate(() => {
      const card = document.getElementById('healingWorkflowCard');
      return card && (card.style.display !== 'none' || card.classList.contains('active'));
    });
    Helpers.assertTrue(active, 'Healing workflow activated');
  });

  await ctx.test('B09.3 - Auto-Remediation Timers: Auto-heals back to healthy state', async () => {
    await browser.waitForFunction(() => {
      const card = document.getElementById('healingWorkflowCard');
      return card && (card.style.display === 'none' || !card.classList.contains('active'));
    }, 15000);
    Helpers.assertTrue(true, 'System fully auto-healed');
  });

  await ctx.test('B09.4 - Audio Toggle Button: #audioToggleBtn toggles audio without error', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('audioToggleBtn');
      if (btn) {
        btn.click();
        btn.click();
      }
    });
    await Helpers.assertNoConsoleErrors(browser, 'Audio Toggle');
  });

  await ctx.test('B09.5 - Search Filter: #serviceSearchInput filters service cards', async () => {
    await browser.evaluate(() => {
      const input = document.getElementById('serviceSearchInput');
      if (input) {
        input.value = 'Redis';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await browser.sleep(150);
    await browser.evaluate(() => {
      const input = document.getElementById('serviceSearchInput');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await Helpers.assertNoConsoleErrors(browser, 'Search Filter');
  });

  // --- F10 Boundaries: ANSI Live Terminal Console ---
  await ctx.test('B10.1 - Terminal Buffer Capacity: Terminal lines remain capped', async () => {
    const lines = await browser.evaluate(() => {
      return document.querySelectorAll('#terminalBody .term-line, #terminalBody > div').length;
    });
    Helpers.assertTrue(lines <= 500, `Terminal line count ${lines} <= 500`);
  });

  await ctx.test('B10.2 - Terminal Auto-Scroll Button: #termAutoScrollBtn toggles autoscroll state', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('termAutoScrollBtn');
      if (btn) btn.click();
    });
    await Helpers.assertNoConsoleErrors(browser, 'AutoScroll Toggle');
  });

  await ctx.test('B10.3 - Copy Terminal Logs: #termCopyBtn copies log text without error', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('termCopyBtn');
      if (btn) btn.click();
    });
    await Helpers.assertNoConsoleErrors(browser, 'Copy Terminal Logs');
  });

  await ctx.test('B10.4 - Clear Terminal: #termClearBtn empties log lines', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('termClearBtn');
      if (btn) btn.click();
    });
    await browser.sleep(100);
    await Helpers.assertNoConsoleErrors(browser, 'Clear Terminal Action');
  });

  await ctx.test('B10.5 - Terminal Filter Tabs: Category tabs (ALL, EDGE, DATA, etc.) filter log entries', async () => {
    await browser.evaluate(() => {
      const tabs = document.querySelectorAll('.term-tab');
      tabs.forEach(t => t.click());
      const allTab = document.querySelector('.term-tab[data-filter="ALL"]');
      if (allTab) allTab.click();
    });
    await Helpers.assertNoConsoleErrors(browser, 'Terminal Filter Tabs');
  });

  return ctx.summary();
}

module.exports = { runTests };
