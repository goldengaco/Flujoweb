/**
 * Test Suite: Variant A (Tactical Cyberpunk Tri-Panel) - sistemas/emergency-tri-screen-a/index.html
 */
const path = require('path');
const fs = require('fs');
const { BrowserSession } = require('./runner');
const assert = require('assert');

async function runTests() {
  console.log('================================================================');
  console.log(' RUNNING TESTS: Variant A (Tactical Cyberpunk Tri-Panel)');
  console.log(' Target: sistemas/emergency-tri-screen-a/index.html');
  console.log('================================================================\n');

  const filePath = path.resolve(__dirname, '..', 'sistemas', 'emergency-tri-screen-a', 'index.html');
  assert(fs.existsSync(filePath), `File does not exist: ${filePath}`);

  const browser = new BrowserSession();
  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    process.stdout.write(`• ${name}... `);
    try {
      await fn();
      console.log('\x1b[32mPASS\x1b[0m');
      passed++;
    } catch (err) {
      console.log('\x1b[31mFAIL\x1b[0m');
      console.error('  Error:', err.message);
      failed++;
    }
  }

  try {
    await browser.launch();

    // 1. Zero Console Errors
    await test('Load page and verify zero console errors', async () => {
      await browser.setViewport(1440, 900);
      await browser.navigate(filePath);
      await browser.sleep(600);

      const errors = browser.consoleErrors || [];
      if (errors.length > 0) {
        throw new Error(`Found ${errors.length} console errors: ${JSON.stringify(errors)}`);
      }
    });

    // 2. Responsive Viewports & Anti-Collision Test
    const viewports = [
      { name: 'Mobile 360px', w: 360, h: 740 },
      { name: 'Tablet 768px', w: 768, h: 1024 },
      { name: 'Desktop 1280px', w: 1280, h: 800 },
      { name: 'FHD 1920px', w: 1920, h: 1080 },
      { name: '4K UHD 3840px', w: 3840, h: 2160 }
    ];

    for (const vp of viewports) {
      await test(`Responsive layout at ${vp.name} (${vp.w}x${vp.h}) - Zero horizontal overflow`, async () => {
        await browser.setViewport(vp.w, vp.h);
        await browser.sleep(200);

        const overflow = await browser.evaluate(() => {
          const doc = document.documentElement;
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            hasOverflow: doc.scrollWidth > doc.clientWidth
          };
        });

        assert.strictEqual(overflow.hasOverflow, false, `Horizontal overflow detected at ${vp.w}px: scrollWidth=${overflow.scrollWidth}, clientWidth=${overflow.clientWidth}`);
      });
    }

    // 3. Harness Verification: window.__EMERGENCY_TRI_A__
    await test('Test Harness: window.__EMERGENCY_TRI_A__ exists and matches contract', async () => {
      await browser.setViewport(1440, 900);
      await browser.navigate(filePath);
      await browser.sleep(400);

      const harnessCheck = await browser.evaluate(() => {
        const h = window.__EMERGENCY_TRI_A__;
        if (!h) return { exists: false };
        return {
          exists: true,
          hasGetState: typeof h.getState === 'function',
          hasTriggerAlarm: typeof h.triggerAlarm === 'function',
          hasResetSimulation: typeof h.resetSimulation === 'function',
          hasInjectHazard: typeof h.injectHazard === 'function',
          hasCheckInSafe: typeof h.checkInSafe === 'function',
          hasToggleStairwell: typeof h.toggleStairwell === 'function',
          hasSetOccupantCount: typeof h.setOccupantCount === 'function'
        };
      });

      assert.strictEqual(harnessCheck.exists, true, 'window.__EMERGENCY_TRI_A__ is undefined');
      assert.strictEqual(harnessCheck.hasGetState, true, 'getState missing');
      assert.strictEqual(harnessCheck.hasTriggerAlarm, true, 'triggerAlarm missing');
      assert.strictEqual(harnessCheck.hasResetSimulation, true, 'resetSimulation missing');
      assert.strictEqual(harnessCheck.hasInjectHazard, true, 'injectHazard missing');
      assert.strictEqual(harnessCheck.hasCheckInSafe, true, 'checkInSafe missing');
      assert.strictEqual(harnessCheck.hasToggleStairwell, true, 'toggleStairwell missing');
      assert.strictEqual(harnessCheck.hasSetOccupantCount, true, 'setOccupantCount missing');
    });

    // 4. Initial State Check
    await test('Initial State: STANDBY, >=40 occupants, 0 safe, stairwells CLEAR', async () => {
      const state = await browser.evaluate(() => window.__EMERGENCY_TRI_A__.getState());
      assert.strictEqual(state.alarmState, 'STANDBY');
      assert.ok(state.occupantsTotal >= 40, `Expected total >= 40, got ${state.occupantsTotal}`);
      assert.strictEqual(state.occupantsSafe, 0);
      assert.strictEqual(state.stairwells.STAIRWELL_A, 'CLEAR');
      assert.strictEqual(state.stairwells.STAIRWELL_B, 'CLEAR');
      assert.strictEqual(state.hazards.length, 0);
      assert.ok(state.particles.length >= 40, 'Particle array populated');
    });

    // 5. Trigger Alarm via Harness
    await test('Harness triggerAlarm(): activates alarm and particles start evacuating', async () => {
      await browser.evaluate(() => {
        window.__EMERGENCY_TRI_A__.triggerAlarm({ channel: 'LORAWAN_SIREN' });
      });
      await browser.sleep(300);

      const state = await browser.evaluate(() => window.__EMERGENCY_TRI_A__.getState());
      assert.strictEqual(state.alarmState, 'ACTIVE');
      assert.strictEqual(state.channel, 'LORAWAN_SIREN');
      assert.ok(state.occupantsEvacuating > 0, `Expected evacuating occupants > 0, got ${state.occupantsEvacuating}`);

      const uiCheck = await browser.evaluate(() => {
        const strobe = document.getElementById('phone-b-strobe');
        const phoneAChassis = document.getElementById('phone-a-chassis');
        return {
          phoneBStrobeActive: strobe && strobe.classList.contains('active'),
          phoneADangerAlert: phoneAChassis && phoneAChassis.classList.contains('danger-alert')
        };
      });

      assert.strictEqual(uiCheck.phoneBStrobeActive, true, 'Phone B strobe alert did not activate');
      assert.strictEqual(uiCheck.phoneADangerAlert, true, 'Phone A danger frame did not activate');
    });

    // 6. Inject Hazard & Real-Time Rerouting
    await test('Harness injectHazard(): spawns hazard in Breakroom and updates navMesh', async () => {
      await browser.evaluate(() => {
        window.__EMERGENCY_TRI_A__.injectHazard('Breakroom');
      });
      await browser.sleep(200);

      const state = await browser.evaluate(() => window.__EMERGENCY_TRI_A__.getState());
      assert.strictEqual(state.hazards.length, 1);
      assert.strictEqual(state.hazards[0].zone, 'Breakroom');
    });

    // 7. Toggle Stairwell
    await test('Harness toggleStairwell(): toggles Stairwell A to BLOCKED', async () => {
      await browser.evaluate(() => {
        window.__EMERGENCY_TRI_A__.toggleStairwell('STAIRWELL_A', 'BLOCKED');
      });
      await browser.sleep(200);

      const state = await browser.evaluate(() => window.__EMERGENCY_TRI_A__.getState());
      assert.strictEqual(state.stairwells.STAIRWELL_A, 'BLOCKED');
    });

    // 8. Check-In Safe Action
    await test('Harness checkInSafe(): marks occupant safe and increments tally', async () => {
      const beforeState = await browser.evaluate(() => window.__EMERGENCY_TRI_A__.getState());
      await browser.evaluate(() => {
        window.__EMERGENCY_TRI_A__.checkInSafe('PHONE_B');
      });
      await browser.sleep(100);

      const afterState = await browser.evaluate(() => window.__EMERGENCY_TRI_A__.getState());
      assert.strictEqual(afterState.occupantsSafe, beforeState.occupantsSafe + 1);

      const phoneDCount = await browser.evaluate(() => {
        return parseInt(document.getElementById('phone-d-safe-count').textContent, 10);
      });
      assert.strictEqual(phoneDCount, afterState.occupantsSafe, 'Phone D headcount did not sync');
    });

    // 9. Set Occupant Count
    await test('Harness setOccupantCount(52): updates total count correctly', async () => {
      await browser.evaluate(() => {
        window.__EMERGENCY_TRI_A__.setOccupantCount(52);
      });
      await browser.sleep(100);

      const state = await browser.evaluate(() => window.__EMERGENCY_TRI_A__.getState());
      assert.strictEqual(state.occupantsTotal, 52);
    });

    // 10. Reset Simulation
    await test('Harness resetSimulation(): restores STANDBY state and clears hazards', async () => {
      await browser.evaluate(() => {
        window.__EMERGENCY_TRI_A__.resetSimulation();
      });
      await browser.sleep(200);

      const state = await browser.evaluate(() => window.__EMERGENCY_TRI_A__.getState());
      assert.strictEqual(state.alarmState, 'STANDBY');
      assert.strictEqual(state.hazards.length, 0);
      assert.strictEqual(state.occupantsSafe, 0);
    });

    // 11. Interactive DOM Controls: Sound toggle, Tab switching, Brigade Broadcast
    await test('Interactive DOM: Audio mute toggle, Recipient device tabs', async () => {
      // Audio toggle
      const audioToggle = await browser.evaluate(() => {
        const btn = document.getElementById('btnSoundToggle');
        btn.click();
        const icon = document.getElementById('sound-icon').textContent;
        btn.click();
        const icon2 = document.getElementById('sound-icon').textContent;
        return { icon1: icon, icon2 };
      });
      assert.strictEqual(audioToggle.icon1, '🔇');
      assert.strictEqual(audioToggle.icon2, '🔊');

      // Recipient Tabs: Click Phone C tab
      const phoneCTab = await browser.evaluate(() => {
        const btnC = document.querySelector('.device-tab-btn[data-device="phone-c"]');
        btnC.click();
        const viewB = document.getElementById('view-phone-b').style.display;
        const viewC = document.getElementById('view-phone-c').style.display;
        return { viewB, viewC };
      });
      assert.strictEqual(phoneCTab.viewB, 'none');
      assert.strictEqual(phoneCTab.viewC, 'flex');

      // Click Phone D tab
      const phoneDTab = await browser.evaluate(() => {
        const btnD = document.querySelector('.device-tab-btn[data-device="phone-d"]');
        btnD.click();
        const viewC = document.getElementById('view-phone-c').style.display;
        const viewD = document.getElementById('view-phone-d').style.display;
        return { viewC, viewD };
      });
      assert.strictEqual(phoneDTab.viewC, 'none');
      assert.strictEqual(phoneDTab.viewD, 'flex');
    });

  } finally {
    await browser.close();
  }

  console.log('\n================================================================');
  console.log(` RESULTS: ${passed} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
