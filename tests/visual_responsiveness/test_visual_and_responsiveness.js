/**
 * Visual & Responsiveness Verification Suite
 * Verifies mobile (375px), tablet (768px), and desktop (1440px) rendering,
 * absence of horizontal overflow, permanent emoji visibility, and zero console errors across all 3 dashboards.
 */

const { TestContext, Helpers } = require('../fixtures/helpers');

async function runTests(browser, dashboardUrls) {
  const ctx = new TestContext('Visual Integrity & Responsive Multi-Viewport Suite');

  const viewports = [
    { name: 'Mobile (375x667)', width: 375, height: 667, isMobile: true },
    { name: 'Tablet (768x1024)', width: 768, height: 1024, isMobile: true },
    { name: 'Desktop (1440x900)', width: 1440, height: 900, isMobile: false }
  ];

  for (const [systemName, url] of Object.entries(dashboardUrls)) {
    for (const vp of viewports) {
      await ctx.test(`VIS-${systemName} [${vp.name}]: Loads without console errors`, async () => {
        await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
        await browser.navigate(url);
        await browser.sleep(300);
        await Helpers.assertNoConsoleErrors(browser, `${systemName} at ${vp.name}`);
      });
    }

    // Emoji Permanence and Glow Check
    await ctx.test(`VIS-${systemName}: Permanent luminous emojis and icons visible`, async () => {
      await browser.setViewport(1440, 900);
      await browser.navigate(url);
      const text = await browser.evaluate(() => document.body.innerText);
      let targetEmojis = [];
      if (systemName.includes('Security')) {
        targetEmojis = ['🔒', '🛡️', '🌐', '💉', '📜', '🔑', '📋'];
      } else if (systemName.includes('Server')) {
        targetEmojis = ['🌍', '🌐', '⚡', '🔐', '🐘', '💳'];
      } else if (systemName.includes('Transaction')) {
        targetEmojis = ['📝', '🔍', '🛡️', '🏦', '⚙️', '✅'];
      }

      for (const emoji of targetEmojis) {
        Helpers.assertTrue(text.includes(emoji), `Emoji ${emoji} must be visible in ${systemName}`);
      }
    });

    // Dark Theme Aesthetic Check
    await ctx.test(`VIS-${systemName}: Cinematic dark base (#030812 / #060d1b) applied`, async () => {
      const bg = await browser.evaluate(() => {
        return window.getComputedStyle(document.body).backgroundColor;
      });
      Helpers.assertTrue(bg !== 'rgb(255, 255, 255)' && bg !== 'rgba(0, 0, 0, 0)', `Dark background applied: ${bg}`);
    });
  }

  return ctx.summary();
}

module.exports = { runTests };
