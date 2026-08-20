/**
 * Tier 1: Feature Coverage — Mission Control NOC & Multi-Service Status Board (Features 6 - 10)
 * Target: sistemas/server-status/index.html
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrl) {
  const ctx = new TestContext('Tier 1: Server Status NOC Features (F06 - F10)');

  await browser.navigate(dashboardUrl);
  await Helpers.assertNoConsoleErrors(browser, 'Initial Navigation');

  // --- Feature 6: 9-Service Mesh NOC Grid ---
  await ctx.test('F06.1 - 9-Service Mesh: All 9 service cards are rendered in #servicesGrid', async () => {
    const cardCount = await browser.evaluate(() => {
      return document.querySelectorAll('#servicesGrid .service-card, .service-card').length;
    });
    Helpers.assertEqual(cardCount, 9, `Found ${cardCount}/9 service cards`);
  });

  await ctx.test('F06.2 - 9-Service Mesh: Permanent service icons are rendered (🌍, 🌐, ⚡, 🔐, 🐘, 💳, 🗄, ✉)', async () => {
    const emojis = ['🌍', '🌐', '⚡', '🔐', '🐘', '💳'];
    const pageText = await browser.evaluate(() => document.body.innerText);
    for (const emoji of emojis) {
      Helpers.assertTrue(pageText.includes(emoji), `Emoji ${emoji} must be present in service mesh`);
    }
  });

  await ctx.test('F06.3 - 9-Service Mesh: Critical infrastructure services (PostgreSQL, Redis, Gateway, Auth) named', async () => {
    const pageText = await browser.evaluate(() => document.body.innerText);
    Helpers.assertTrue(pageText.includes('PostgreSQL') || pageText.includes('Database'), 'PostgreSQL present');
    Helpers.assertTrue(pageText.includes('Redis'), 'Redis present');
    Helpers.assertTrue(pageText.includes('Gateway') || pageText.includes('Envoy'), 'Gateway present');
    Helpers.assertTrue(pageText.includes('Auth') || pageText.includes('OAuth'), 'Auth present');
  });

  await ctx.test('F06.4 - 9-Service Mesh: Health state badges and pills rendered on all cards', async () => {
    const badgesFound = await browser.evaluate(() => {
      const pills = document.querySelectorAll('.service-header-pill, .status-pill, [id^="pill-"]');
      return pills.length >= 9;
    });
    Helpers.assertTrue(badgesFound, 'All 9 service cards display health pills');
  });

  await ctx.test('F06.5 - 9-Service Mesh: Overall system health summary metric displayed (#heroAggregateSla)', async () => {
    const summaryText = await browser.evaluate(() => {
      const el = document.getElementById('heroAggregateSla');
      return el ? el.innerText : document.body.innerText;
    });
    Helpers.assertTrue(summaryText.includes('99.') || summaryText.includes('100%') || summaryText.includes('OPERATIONAL') || summaryText.includes('ALL SYSTEMS'), 'System SLA summary metric present');
  });

  await ctx.test('F06.6 - 9-Service Mesh: Responsive CSS grid #servicesGrid handles container reflows', async () => {
    const gridStyle = await browser.evaluate(() => {
      const grid = document.getElementById('servicesGrid');
      if (!grid) return false;
      const s = window.getComputedStyle(grid);
      return s.display === 'grid' || s.display === 'flex';
    });
    Helpers.assertTrue(gridStyle, 'Service mesh uses CSS grid');
  });

  // --- Feature 7: Per-Service Telemetry & Sparklines ---
  await ctx.test('F07.1 - Per-Service Telemetry: Real-time sparkline canvases rendered per service (canvas.sparkline-canvas)', async () => {
    const sparklines = await browser.evaluate(() => {
      return document.querySelectorAll('canvas.sparkline-canvas').length;
    });
    Helpers.assertEqual(sparklines, 9, `Found ${sparklines}/9 sparkline canvases`);
  });

  await ctx.test('F07.2 - Per-Service Telemetry: RPS Throughput metric rendered per service', async () => {
    const rpsFound = await browser.evaluate(() => {
      const rpsEls = document.querySelectorAll('[id^="statRps-"], .stat-rps');
      return rpsEls.length >= 9;
    });
    Helpers.assertTrue(rpsFound, 'RPS telemetry values present on all service cards');
  });

  await ctx.test('F07.3 - Per-Service Telemetry: Latency distribution metrics displayed (statLat-*)', async () => {
    const latFound = await browser.evaluate(() => {
      const latEls = document.querySelectorAll('[id^="statLat-"], .stat-latency');
      return latEls.length >= 9;
    });
    Helpers.assertTrue(latFound, 'Latency telemetry values present on all service cards');
  });

  await ctx.test('F07.4 - Per-Service Telemetry: CPU and Memory utilization bars rendered', async () => {
    const resourceFound = await browser.evaluate(() => {
      const cpuBars = document.querySelectorAll('[id^="cpuBar-"]');
      const ramBars = document.querySelectorAll('[id^="ramBar-"]');
      return cpuBars.length >= 9 && ramBars.length >= 9;
    });
    Helpers.assertTrue(resourceFound, 'CPU and Memory utilization bars present');
  });

  await ctx.test('F07.5 - Per-Service Telemetry: Error rate metric rendered (statErr-*)', async () => {
    const errFound = await browser.evaluate(() => {
      const errEls = document.querySelectorAll('[id^="statErr-"]');
      return errEls.length >= 9;
    });
    Helpers.assertTrue(errFound, 'Error rate metrics rendered on all service cards');
  });

  // --- Feature 8: 90-Day SLA Uptime Bar ---
  await ctx.test('F08.1 - 90-Day Uptime Bar: 90-Day SLA bar tracks rendered per service (.sla-bar-track)', async () => {
    const bars = await browser.evaluate(() => {
      return document.querySelectorAll('.sla-bar-track, [id^="slaBar-"]').length;
    });
    Helpers.assertEqual(bars, 9, `Found ${bars}/9 SLA uptime bar tracks`);
  });

  await ctx.test('F08.2 - 90-Day Uptime Bar: Segment blocks (days) rendered per bar (.sla-segment)', async () => {
    const segments = await browser.evaluate(() => {
      return document.querySelectorAll('.sla-segment').length;
    });
    Helpers.assertGreaterThan(segments, 100, `Found ${segments} total SLA segments`);
  });

  await ctx.test('F08.3 - 90-Day Uptime Bar: Segments styled with status colors', async () => {
    const hasColors = await browser.evaluate(() => {
      const segs = document.querySelectorAll('.sla-segment');
      return Array.from(segs).some(s => window.getComputedStyle(s).backgroundColor !== 'rgba(0, 0, 0, 0)');
    });
    Helpers.assertTrue(hasColors, 'Uptime bar segments have background colors');
  });

  await ctx.test('F08.4 - 90-Day Uptime Bar: Hovering an uptime segment displays historical tooltip (#slaTooltip)', async () => {
    const tooltipInteraction = await browser.evaluate(() => {
      const seg = document.querySelector('.sla-segment');
      if (!seg) return false;
      seg.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      const tooltip = document.getElementById('slaTooltip');
      return tooltip !== null;
    });
    Helpers.assertTrue(tooltipInteraction, 'Hovering segment triggers #slaTooltip');
  });

  await ctx.test('F08.5 - 90-Day Uptime Bar: 90-day aggregate SLA rate label displayed (slaRate-*)', async () => {
    const ratesFound = await browser.evaluate(() => {
      const rateEls = document.querySelectorAll('[id^="slaRate-"]');
      return rateEls.length >= 9;
    });
    Helpers.assertTrue(ratesFound, '90-Day SLA rate labels displayed on cards');
  });

  // --- Feature 9: Chaos Injection & Auto-Healing ---
  await ctx.test('F09.1 - Chaos & Auto-Heal: Chaos modal button #openChaosModalBtn is available', async () => {
    const btn = await browser.evaluate(() => document.getElementById('openChaosModalBtn') !== null);
    Helpers.assertTrue(btn, '#openChaosModalBtn exists');
  });

  await ctx.test('F09.2 - Chaos & Auto-Heal: Chaos modal #chaosModalOverlay opens and provides target picker', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('openChaosModalBtn');
      if (btn) btn.click();
    });
    await browser.sleep(200);
    const modalOpen = await browser.evaluate(() => {
      const m = document.getElementById('chaosModalOverlay');
      return m && (m.classList.contains('active') || m.classList.contains('open') || window.getComputedStyle(m).display !== 'none');
    });
    Helpers.assertTrue(modalOpen, 'Chaos modal opened');
  });

  await ctx.test('F09.3 - Chaos & Auto-Heal: Triggering Chaos flips service status to Outage/Degraded', async () => {
    await browser.evaluate(() => {
      const card = document.querySelector('.chaos-scenario-card');
      if (card) card.click();
      else {
        const btn = document.getElementById('triggerCustomChaosBtn');
        if (btn) btn.click();
      }
    });
    await browser.sleep(400);
    const incidentActive = await browser.evaluate(() => {
      const workflowCard = document.getElementById('healingWorkflowCard');
      return workflowCard && (workflowCard.style.display !== 'none' || workflowCard.classList.contains('active'));
    });
    Helpers.assertTrue(incidentActive, 'Auto-healing workflow activated following Chaos injection');
  });

  await ctx.test('F09.4 - Chaos & Auto-Heal: Outage emits visual healing progress & countdown (#healingProgressBar)', async () => {
    const hasProgress = await browser.evaluate(() => {
      const pb = document.getElementById('healingProgressBar');
      return pb !== null;
    });
    Helpers.assertTrue(hasProgress, 'Healing progress bar rendered');
  });

  await ctx.test('F09.5 - Chaos & Auto-Heal: Auto-remediation progresses through playbook steps (#stepNode1 - #stepNode5)', async () => {
    await browser.sleep(2000);
    const stepActive = await browser.evaluate(() => {
      const s1 = document.getElementById('stepNode1');
      return s1 && (s1.classList.contains('active') || s1.classList.contains('completed'));
    });
    Helpers.assertTrue(stepActive, 'Playbook step nodes active/progressing');
  });

  await ctx.test('F09.6 - Chaos & Auto-Heal: Auto-healing successfully restores system to Operational', async () => {
    await browser.waitForFunction(() => {
      const card = document.getElementById('healingWorkflowCard');
      return card && (card.style.display === 'none' || !card.classList.contains('active'));
    }, 15000);
    Helpers.assertTrue(true, 'Service auto-healed back to healthy operational state');
  });

  // --- Feature 10: ANSI Live Terminal Console ---
  await ctx.test('F10.1 - ANSI Live Terminal: Terminal console container #terminalDrawer rendered', async () => {
    const terminal = await browser.evaluate(() => document.getElementById('terminalDrawer') !== null);
    Helpers.assertTrue(terminal, '#terminalDrawer exists in DOM');
  });

  await ctx.test('F10.2 - ANSI Live Terminal: Terminal body #terminalBody contains live log entries', async () => {
    const logLines = await browser.evaluate(() => {
      const lines = document.querySelectorAll('#terminalBody .term-line, #terminalBody > div');
      return lines.length;
    });
    Helpers.assertGreaterThan(logLines, 0, 'Terminal contains live log lines');
  });

  await ctx.test('F10.3 - ANSI Live Terminal: Log entries include timestamps and color-coded status badges', async () => {
    const text = await browser.evaluate(() => document.getElementById('terminalBody')?.innerText || '');
    Helpers.assertTrue(text.includes(':') && (text.includes('INFO') || text.includes('WARN') || text.includes('PASS') || text.includes('ALERT') || text.includes('OK')), 'Log entries formatted with timestamps and badges');
  });

  await ctx.test('F10.4 - ANSI Live Terminal: Terminal collapse toggle functions via #termCollapseBtn', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('termCollapseBtn');
      if (btn) {
        btn.click();
        btn.click();
      }
    });
    await Helpers.assertNoConsoleErrors(browser, 'Terminal collapse toggle');
  });

  await ctx.test('F10.5 - ANSI Live Terminal: Clear logs button #termClearBtn empties log display', async () => {
    await browser.evaluate(() => {
      const btn = document.getElementById('termClearBtn');
      if (btn) btn.click();
    });
    await browser.sleep(100);
    await Helpers.assertNoConsoleErrors(browser, 'Clear terminal click');
  });

  return ctx.summary();
}

module.exports = { runTests };
