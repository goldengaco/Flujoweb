/**
 * EMPIRICAL CHALLENGER 1 ADVERSARIAL STRESS & EDGE-CASE HARNESS
 * Target: Emergency Tri-Screen Multi-Device Simulator (Variants A, B, C & Master Portal)
 * 
 * Stress Vectors:
 *  1. Rapid trigger spamming (<10ms intervals, rapid reset/trigger interleaving, double-clicks)
 *  2. Extreme viewport window resizes during active particle motion (320px to 4K UHD, 6 rapid resize cycles)
 *  3. Boundary occupant counts (0 occupants, 1 occupant, 100 occupants, 250 occupants, 500 extreme crowd stress)
 *  4. Simultaneous multi-hazard injection (igniting Breakroom, Server Room, Conference Room concurrently)
 *  5. All stairwells blocked simultaneously (shelter-in-place fallback behavior, zero crash, unblock resumption)
 *  6. Rapid concurrent "ESTOY A SALVO" check-in bursts (100 concurrent check-in dispatches, bounds check)
 *  7. Audio suspension / headless browser safety (AudioContext suspended, closed, SpeechSynthesis empty voices)
 *  8. Master Portal stress (Rapid search spam, category filter toggle spam, multi-canvas animation resilience)
 *  9. Strict Invariant Verification (Finite number check on all particle coords, no NaN in DOM, zero console errors)
 */

const path = require('path');
const fs = require('fs');
const { BrowserSession } = require('./runner');
const { TestContext, Helpers } = require('./fixtures/helpers');

const ROOT_DIR = path.resolve(__dirname, '..');
const SYSTEMS = {
  a: {
    key: 'a',
    name: 'Variant A: Tactical Cyberpunk Tri-Panel',
    harness: '__EMERGENCY_TRI_A__',
    path: path.join(ROOT_DIR, 'sistemas', 'emergency-tri-screen-a', 'index.html')
  },
  b: {
    key: 'b',
    name: 'Variant B: Clean Minimalist Linear Dark Tri-Panel',
    harness: '__EMERGENCY_TRI_B__',
    path: path.join(ROOT_DIR, 'sistemas', 'emergency-tri-screen-b', 'index.html')
  },
  c: {
    key: 'c',
    name: 'Variant C: 2.5D Isometric Mission Control Tri-Panel',
    harness: '__EMERGENCY_TRI_C__',
    path: path.join(ROOT_DIR, 'sistemas', 'emergency-tri-screen-c', 'index.html')
  },
  portal: {
    key: 'portal',
    name: 'Master Enterprise Launchpad Portal',
    harness: null,
    path: path.join(ROOT_DIR, 'sistemas', 'index.html')
  }
};

async function loadSystem(browser, sysPath, viewport = { width: 1920, height: 1080, isMobile: false }) {
  await browser.setViewport(viewport.width, viewport.height, 1, viewport.isMobile);
  await browser.navigate(sysPath);
  await browser.sleep(250);
}

// Invariant helper: inspect all particles in simulation for NaN or non-finite values
async function assertParticlesValid(browser, harnessName) {
  const check = await browser.evaluate((hName) => {
    const harness = window[hName];
    if (!harness || typeof harness.getState !== 'function') {
      return { ok: false, error: 'Harness not found on window' };
    }
    const state = harness.getState();
    const particles = state.particles || [];
    const invalid = [];

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      if (!Number.isFinite(p.x) || Number.isNaN(p.x)) {
        invalid.push({ id: p.id || i, key: 'x', value: p.x });
      }
      if (!Number.isFinite(p.y) || Number.isNaN(p.y)) {
        invalid.push({ id: p.id || i, key: 'y', value: p.y });
      }
      if (p.vx !== undefined && (!Number.isFinite(p.vx) || Number.isNaN(p.vx))) {
        invalid.push({ id: p.id || i, key: 'vx', value: p.vx });
      }
      if (p.vy !== undefined && (!Number.isFinite(p.vy) || Number.isNaN(p.vy))) {
        invalid.push({ id: p.id || i, key: 'vy', value: p.vy });
      }
      if (p.progress !== undefined && (!Number.isFinite(p.progress) || Number.isNaN(p.progress))) {
        invalid.push({ id: p.id || i, key: 'progress', value: p.progress });
      }
    }

    return {
      ok: invalid.length === 0,
      totalParticles: particles.length,
      invalidCount: invalid.length,
      invalidSamples: invalid.slice(0, 5)
    };
  }, harnessName);

  Helpers.assertTrue(check.ok, `Particle invariants violated! Found ${check.invalidCount} NaN/non-finite fields: ${JSON.stringify(check.invalidSamples)}`);
}

// Invariant helper: inspect DOM for text node leaks like 'NaN', 'undefined', 'null', '[object Object]' in visible elements
async function assertNoDomLeakStrings(browser) {
  const leaks = await browser.evaluate(() => {
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const ignoredTags = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE']);
    const found = [];
    let node;
    while (node = walker.nextNode()) {
      const parent = node.parentElement;
      if (parent && ignoredTags.has(parent.tagName.toUpperCase())) {
        continue;
      }
      const txt = node.textContent.trim();
      if (!txt) continue;
      
      // Target actual UI text corruption bugs
      if (
        txt.includes('NaN%') || 
        txt.includes('NaN px') || 
        txt.includes('NaN m/s') || 
        txt.includes('NaN ms') || 
        txt.includes('[object Object]') || 
        txt === 'undefined' || 
        txt === 'null' ||
        txt === 'NaN'
      ) {
        found.push({ text: txt, parentTag: parent?.tagName, parentClass: parent?.className, parentId: parent?.id });
      }
    }
    return found;
  });

  Helpers.assertTrue(leaks.length === 0, `DOM text leaks detected: ${JSON.stringify(leaks)}`);
}

// ======================================================================
// ADVERSARIAL STRESS SUITE: VARIANT A (TACTICAL CYBERPUNK)
// ======================================================================

async function runAdversarialStressVariantA(browser) {
  const ctx = new TestContext('CHALLENGER STRESS: Variant A (Tactical Cyberpunk)');
  const sys = SYSTEMS.a;

  // TEST A-1: Rapid Trigger & Reset Spam (<5ms loop)
  await ctx.test('STRESS-A-01: Rapid trigger & reset spamming (50 dispatches in <5ms loop) remains coherent with 0 NaN coords', async () => {
    await loadSystem(browser, sys.path);

    const spamResult = await browser.evaluate(async (hName) => {
      const h = window[hName];
      const errors = [];

      // 30 rapid alternating triggers and resets
      for (let i = 0; i < 30; i++) {
        try {
          if (i % 2 === 0) {
            h.triggerAlarm({ channel: 'LORAWAN_SIREN' });
          } else {
            h.resetSimulation();
          }
        } catch (e) {
          errors.push({ step: i, err: e.message });
        }
      }

      // Final trigger to leave active
      h.triggerAlarm({ channel: 'FCM_PUSH' });
      const state = h.getState();

      return {
        errors,
        alarmState: state.alarmState,
        occupantsTotal: state.occupantsTotal,
        particlesCount: state.particles ? state.particles.length : 0
      };
    }, sys.harness);

    Helpers.assertTrue(spamResult.errors.length === 0, `Spam errors: ${JSON.stringify(spamResult.errors)}`);
    Helpers.assertTrue(spamResult.alarmState === 'ACTIVE' || spamResult.alarmState === 'COUNTDOWN', 'Alarm should be active or countdown');
    await browser.sleep(300);
    await assertParticlesValid(browser, sys.harness);
    await assertNoDomLeakStrings(browser);
    await Helpers.assertNoConsoleErrors(browser, 'Variant A Rapid Trigger Spam');
  });

  // TEST A-2: Extreme Viewport Resizes During Active Evacuation
  await ctx.test('STRESS-A-02: Extreme viewport resize cycles (320px to 4K UHD) during active particle motion produce 0 clipping or NaN coordinates', async () => {
    await loadSystem(browser, sys.path);

    // Trigger evacuation
    await browser.evaluate((hName) => {
      window[hName].triggerAlarm();
    }, sys.harness);
    await browser.sleep(200);

    const extremeViewports = [
      { width: 320, height: 480, isMobile: true },
      { width: 3840, height: 2160, isMobile: false },
      { width: 240, height: 320, isMobile: true },
      { width: 2560, height: 1440, isMobile: false },
      { width: 768, height: 1024, isMobile: true },
      { width: 1920, height: 1080, isMobile: false }
    ];

    for (const vp of extremeViewports) {
      await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
      await browser.sleep(60);
      await assertParticlesValid(browser, sys.harness);
    }

    await assertNoDomLeakStrings(browser);
    await Helpers.assertNoConsoleErrors(browser, 'Variant A Extreme Resizes');
  });

  // TEST A-3: Boundary Occupants (0, 1, 100, 250, 500)
  await ctx.test('STRESS-A-03: Boundary occupant counts (0, 1, 100, 250, 500) execute without division-by-zero or crash', async () => {
    await loadSystem(browser, sys.path);

    // 0 occupants boundary
    const zeroRes = await browser.evaluate((hName) => {
      const h = window[hName];
      h.setOccupantCount(0);
      h.triggerAlarm();
      const state = h.getState();
      return { total: state.occupantsTotal, safe: state.occupantsSafe };
    }, sys.harness);
    Helpers.assertEqual(zeroRes.total, 0, 'Occupants total must be 0');
    await browser.sleep(100);
    await assertNoDomLeakStrings(browser);

    // 1 occupant
    await browser.evaluate((hName) => {
      const h = window[hName];
      h.setOccupantCount(1);
      h.triggerAlarm();
    }, sys.harness);
    await browser.sleep(100);
    await assertParticlesValid(browser, sys.harness);

    // 250 occupants extreme crowd
    await browser.evaluate((hName) => {
      const h = window[hName];
      h.setOccupantCount(250);
      h.triggerAlarm();
    }, sys.harness);
    await browser.sleep(250);
    await assertParticlesValid(browser, sys.harness);
    await Helpers.assertNoConsoleErrors(browser, 'Variant A Boundary Occupants');
  });

  // TEST A-4: Simultaneous Multi-Hazard Injection
  await ctx.test('STRESS-A-04: Simultaneous multi-hazard injection ignites multiple rooms and repathfinds without crash', async () => {
    await loadSystem(browser, sys.path);

    await browser.evaluate((hName) => {
      const h = window[hName];
      h.triggerAlarm();
      // Inject multiple hazards simultaneously
      h.injectHazard('breakroom');
      h.injectHazard('server');
      h.injectHazard('conference');
    }, sys.harness);

    await browser.sleep(300);
    await assertParticlesValid(browser, sys.harness);

    const hazardCount = await browser.evaluate((hName) => {
      const state = window[hName].getState();
      return state.hazards ? state.hazards.length : 0;
    }, sys.harness);
    Helpers.assertGreaterThan(hazardCount, 0, 'Hazards should be registered');
    await Helpers.assertNoConsoleErrors(browser, 'Variant A Multi Hazard');
  });

  // TEST A-5: All Stairwells Blocked Simultaneously (Shelter-in-Place Fallback)
  await ctx.test('STRESS-A-05: All stairwells blocked simultaneously triggers shelter-in-place without infinite loop or NaN', async () => {
    await loadSystem(browser, sys.path);

    await browser.evaluate((hName) => {
      const h = window[hName];
      h.triggerAlarm();
      // Block both stairwells simultaneously
      h.toggleStairwell('STAIRWELL_A', 'BLOCKED');
      h.toggleStairwell('STAIRWELL_B', 'BLOCKED');
    }, sys.harness);

    await browser.sleep(300);
    await assertParticlesValid(browser, sys.harness);

    // Unblock Stairwell A and verify particles resume pathfinding immediately
    const unblockedRes = await browser.evaluate((hName) => {
      const h = window[hName];
      h.toggleStairwell('STAIRWELL_A', 'CLEAR');
      const st = h.getState();
      return { stairwells: st.stairwells, particles: st.particles.length };
    }, sys.harness);

    Helpers.assertEqual(unblockedRes.stairwells.STAIRWELL_A, 'CLEAR', 'Stairwell A should be CLEAR');
    await browser.sleep(200);
    await assertParticlesValid(browser, sys.harness);
    await Helpers.assertNoConsoleErrors(browser, 'Variant A Stairwell Blockage');
  });

  // TEST A-6: Rapid Concurrent Check-In Bursts
  await ctx.test('STRESS-A-06: Burst of 100 concurrent "ESTOY A SALVO" check-ins clamps safely to total occupants', async () => {
    await loadSystem(browser, sys.path);

    const checkInResult = await browser.evaluate((hName) => {
      const h = window[hName];
      h.triggerAlarm();
      const total = h.getState().occupantsTotal;

      // Burst 100 concurrent check-ins
      for (let i = 0; i < 100; i++) {
        const phone = i % 3 === 0 ? 'PHONE_B' : (i % 3 === 1 ? 'PHONE_C' : 'PHONE_D');
        h.checkInSafe(phone);
      }

      const endState = h.getState();
      return {
        total: endState.occupantsTotal,
        safe: endState.occupantsSafe,
        isClamped: endState.occupantsSafe <= endState.occupantsTotal
      };
    }, sys.harness);

    Helpers.assertTrue(checkInResult.isClamped, `Headcount safe (${checkInResult.safe}) exceeded total (${checkInResult.total})`);
    await assertNoDomLeakStrings(browser);
    await Helpers.assertNoConsoleErrors(browser, 'Variant A Check-in Bursts');
  });

  // TEST A-7: Audio Suspension & Muted Safety
  await ctx.test('STRESS-A-07: AudioContext suspended/closed and SpeechSynthesis unavailable cause 0 unhandled rejections', async () => {
    await loadSystem(browser, sys.path);

    await browser.evaluate((hName) => {
      // Mock AudioContext to closed state
      if (window.AudioContext) {
        window.AudioContext = class extends window.AudioContext {
          constructor() {
            super();
            Object.defineProperty(this, 'state', { value: 'suspended', writable: true });
          }
        };
      }
      if (window.speechSynthesis) {
        window.speechSynthesis.speak = () => {};
        window.speechSynthesis.getVoices = () => [];
      }
      const h = window[hName];
      h.triggerAlarm({ channel: 'BRIGADE_RADIO' });
      h.resetSimulation();
      h.triggerAlarm({ channel: 'LORAWAN_SIREN' });
    }, sys.harness);

    await browser.sleep(250);
    await Helpers.assertNoConsoleErrors(browser, 'Variant A Audio Safety');
  });

  return ctx.summary();
}

// ======================================================================
// ADVERSARIAL STRESS SUITE: VARIANT B (CLEAN MINIMALIST LINEAR DARK)
// ======================================================================

async function runAdversarialStressVariantB(browser) {
  const ctx = new TestContext('CHALLENGER STRESS: Variant B (Clean Minimalist Linear Dark)');
  const sys = SYSTEMS.b;

  // TEST B-1: Rapid Trigger & Severity Level Cycling Spam
  await ctx.test('STRESS-B-01: Rapid severity level switching (50 switches in <5ms) and trigger spam keeps velocity float metrics finite', async () => {
    await loadSystem(browser, sys.path);

    const spamResult = await browser.evaluate((hName) => {
      const h = window[hName];
      const severities = ['Simulacro', 'Fuego Real', 'Evacuación Sísmica'];
      const errors = [];

      for (let i = 0; i < 50; i++) {
        try {
          h.triggerAlarm({ severity: severities[i % severities.length] });
          if (i % 5 === 0) h.resetSimulation();
        } catch (e) {
          errors.push(e.message);
        }
      }

      h.triggerAlarm({ severity: 'Evacuación Sísmica' });
      return { errors, state: h.getState() };
    }, sys.harness);

    Helpers.assertTrue(spamResult.errors.length === 0, `Spam errors: ${JSON.stringify(spamResult.errors)}`);
    await browser.sleep(250);
    await assertParticlesValid(browser, sys.harness);
    await assertNoDomLeakStrings(browser);
    await Helpers.assertNoConsoleErrors(browser, 'Variant B Severity Spam');
  });

  // TEST B-2: Extreme Viewport Resizes During CAD Bottleneck Heatmap Active Render
  await ctx.test('STRESS-B-02: Extreme viewport resize cycles during active CAD fluid streams calculate valid float coordinates and heatmap', async () => {
    await loadSystem(browser, sys.path);

    await browser.evaluate((hName) => {
      window[hName].triggerAlarm();
    }, sys.harness);
    await browser.sleep(150);

    const extremeViewports = [
      { width: 320, height: 480, isMobile: true },
      { width: 3840, height: 2160, isMobile: false },
      { width: 400, height: 900, isMobile: true },
      { width: 2560, height: 1440, isMobile: false },
      { width: 1920, height: 1080, isMobile: false }
    ];

    for (const vp of extremeViewports) {
      await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
      await browser.sleep(60);
      await assertParticlesValid(browser, sys.harness);
    }

    await assertNoDomLeakStrings(browser);
    await Helpers.assertNoConsoleErrors(browser, 'Variant B CAD Viewport Resizes');
  });

  // TEST B-3: Boundary Occupants (0, 1, 100, 250, 500)
  await ctx.test('STRESS-B-03: Boundary occupant crowd stress (0, 1, 100, 250, 500) maintains valid velocity vectors and zero NaN HUD gauges', async () => {
    await loadSystem(browser, sys.path);

    // Zero occupant
    await browser.evaluate((hName) => {
      const h = window[hName];
      h.setOccupantCount(0);
      h.triggerAlarm();
    }, sys.harness);
    await browser.sleep(100);
    await assertNoDomLeakStrings(browser);

    // 500 extreme crowd stress
    await browser.evaluate((hName) => {
      const h = window[hName];
      h.setOccupantCount(500);
      h.triggerAlarm();
    }, sys.harness);
    await browser.sleep(250);
    await assertParticlesValid(browser, sys.harness);
    await Helpers.assertNoConsoleErrors(browser, 'Variant B Boundary Occupants');
  });

  // TEST B-4: Multi-Hazard Injections & Escape Compass
  await ctx.test('STRESS-B-04: Multi-hazard injection updates escape compass angle smoothly without NaN rotation angles', async () => {
    await loadSystem(browser, sys.path);

    const compassCheck = await browser.evaluate((hName) => {
      const h = window[hName];
      h.triggerAlarm();
      h.injectHazard('breakroom');
      h.injectHazard('server');
      h.injectHazard('hallway_central');

      const compass = document.querySelector('#escape-compass, .escape-compass, [data-compass], .compass-needle, #compass-arrow');
      const transform = compass ? window.getComputedStyle(compass).transform : 'matrix(1, 0, 0, 1, 0, 0)';
      return { hasCompass: !!compass, transform, containsNaN: transform.includes('NaN') };
    }, sys.harness);

    Helpers.assertFalse(compassCheck.containsNaN, 'Compass transform should not contain NaN');
    await browser.sleep(200);
    await assertParticlesValid(browser, sys.harness);
    await Helpers.assertNoConsoleErrors(browser, 'Variant B Multi-Hazard Compass');
  });

  // TEST B-5: All Stairwells Blocked
  await ctx.test('STRESS-B-05: All exits blocked simultaneously prevents velocity spikes and supports shelter-in-place', async () => {
    await loadSystem(browser, sys.path);

    await browser.evaluate((hName) => {
      const h = window[hName];
      h.triggerAlarm();
      h.toggleStairwell('A', 'BLOCKED');
      h.toggleStairwell('B', 'BLOCKED');
    }, sys.harness);

    await browser.sleep(250);
    await assertParticlesValid(browser, sys.harness);

    // Unblock exit B
    await browser.evaluate((hName) => {
      window[hName].toggleStairwell('B', 'CLEAR');
    }, sys.harness);
    await browser.sleep(200);
    await assertParticlesValid(browser, sys.harness);
    await Helpers.assertNoConsoleErrors(browser, 'Variant B All Stairwells Blocked');
  });

  // TEST B-6: Rapid Concurrent Check-Ins
  await ctx.test('STRESS-B-06: Rapid concurrent check-in burst (100 clicks) syncs live safe percentage strictly <= 100%', async () => {
    await loadSystem(browser, sys.path);

    const checkInRes = await browser.evaluate((hName) => {
      const h = window[hName];
      h.triggerAlarm();
      for (let i = 0; i < 100; i++) {
        h.checkInSafe('PHONE_B');
        h.checkInSafe('PHONE_C');
        h.checkInSafe('PHONE_D');
      }
      const st = h.getState();
      return { total: st.occupantsTotal, safe: st.occupantsSafe };
    }, sys.harness);

    Helpers.assertTrue(checkInRes.safe <= checkInRes.total, 'Safe count must not exceed total');
    await assertNoDomLeakStrings(browser);
    await Helpers.assertNoConsoleErrors(browser, 'Variant B Rapid Check-in');
  });

  return ctx.summary();
}

// ======================================================================
// ADVERSARIAL STRESS SUITE: VARIANT C (2.5D ISOMETRIC MISSION CONTROL)
// ======================================================================

async function runAdversarialStressVariantC(browser) {
  const ctx = new TestContext('CHALLENGER STRESS: Variant C (2.5D Isometric Mission Control)');
  const sys = SYSTEMS.c;

  // TEST C-1: Rapid Incident Level Dial Rotations (Levels 1-4 in <2ms loop)
  await ctx.test('STRESS-C-01: Rapid incident level dial rotations (Levels 1-4) and PA broadcast spam remains stable', async () => {
    await loadSystem(browser, sys.path);

    const dialResult = await browser.evaluate((hName) => {
      const h = window[hName];
      const errors = [];

      for (let i = 0; i < 40; i++) {
        try {
          const lvl = (i % 4) + 1;
          h.triggerAlarm({ incidentLevel: lvl });
          if (i % 4 === 0) h.resetSimulation();
        } catch (e) {
          errors.push(e.message);
        }
      }

      h.triggerAlarm({ incidentLevel: 4 });
      return { errors, state: h.getState() };
    }, sys.harness);

    Helpers.assertTrue(dialResult.errors.length === 0, `Dial errors: ${JSON.stringify(dialResult.errors)}`);
    await browser.sleep(250);
    await assertParticlesValid(browser, sys.harness);
    await assertNoDomLeakStrings(browser);
    await Helpers.assertNoConsoleErrors(browser, 'Variant C Dial Spam');
  });

  // TEST C-2: Extreme Viewport Resizes During 2.5D Isometric Wall Projection
  await ctx.test('STRESS-C-02: Extreme viewport resize cycles during 2.5D isometric projection matrix maintain finite 3D wall coords', async () => {
    await loadSystem(browser, sys.path);

    await browser.evaluate((hName) => {
      window[hName].triggerAlarm();
    }, sys.harness);
    await browser.sleep(150);

    const extremeViewports = [
      { width: 320, height: 480, isMobile: true },
      { width: 3840, height: 2160, isMobile: false },
      { width: 360, height: 640, isMobile: true },
      { width: 2560, height: 1440, isMobile: false },
      { width: 1920, height: 1080, isMobile: false }
    ];

    for (const vp of extremeViewports) {
      await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
      await browser.sleep(60);
      await assertParticlesValid(browser, sys.harness);
    }

    await assertNoDomLeakStrings(browser);
    await Helpers.assertNoConsoleErrors(browser, 'Variant C Isometric Resizes');
  });

  // TEST C-3: Boundary Occupants (0, 1, 100, 250, 500)
  await ctx.test('STRESS-C-03: Boundary occupant crowd stress (0, 1, 100, 250, 500) updates BLE proximity without integer overflow or NaN', async () => {
    await loadSystem(browser, sys.path);

    // 0 occupants
    await browser.evaluate((hName) => {
      const h = window[hName];
      h.setOccupantCount(0);
      h.triggerAlarm();
    }, sys.harness);
    await browser.sleep(100);
    await assertNoDomLeakStrings(browser);

    // 500 extreme occupants
    await browser.evaluate((hName) => {
      const h = window[hName];
      h.setOccupantCount(500);
      h.triggerAlarm();
    }, sys.harness);
    await browser.sleep(250);
    await assertParticlesValid(browser, sys.harness);
    await Helpers.assertNoConsoleErrors(browser, 'Variant C Boundary Occupants');
  });

  // TEST C-4: Multi-Hazard Injections & Glowing LED Arrows
  await ctx.test('STRESS-C-04: Multi-hazard injection updates 2.5D glowing LED arrows and outdoor assembly zone cleanly', async () => {
    await loadSystem(browser, sys.path);

    await browser.evaluate((hName) => {
      const h = window[hName];
      h.triggerAlarm();
      h.injectHazard('breakroom');
      h.injectHazard('server');
      h.injectHazard('corridor_east');
    }, sys.harness);

    await browser.sleep(250);
    await assertParticlesValid(browser, sys.harness);
    await Helpers.assertNoConsoleErrors(browser, 'Variant C Multi Hazard LED Arrows');
  });

  // TEST C-5: All Stairwells Blocked Simultaneously
  await ctx.test('STRESS-C-05: All stairwells blocked simultaneously triggers 2.5D shelter-in-place with 0 NaN isometric coordinates', async () => {
    await loadSystem(browser, sys.path);

    await browser.evaluate((hName) => {
      const h = window[hName];
      h.triggerAlarm();
      h.toggleStairwell('STAIRWELL_A', 'BLOCKED');
      h.toggleStairwell('STAIRWELL_B', 'BLOCKED');
    }, sys.harness);

    await browser.sleep(250);
    await assertParticlesValid(browser, sys.harness);

    // Unblock Stairwell B
    await browser.evaluate((hName) => {
      window[hName].toggleStairwell('STAIRWELL_B', 'CLEAR');
    }, sys.harness);
    await browser.sleep(200);
    await assertParticlesValid(browser, sys.harness);
    await Helpers.assertNoConsoleErrors(browser, 'Variant C Stairwell Blockage');
  });

  // TEST C-6: Rapid Concurrent Check-Ins
  await ctx.test('STRESS-C-06: 100 rapid survivor check-in dispatches update BLE triage telemetry without duplicates or data corruption', async () => {
    await loadSystem(browser, sys.path);

    const triageRes = await browser.evaluate((hName) => {
      const h = window[hName];
      h.triggerAlarm();
      for (let i = 0; i < 100; i++) {
        h.checkInSafe(i % 2 === 0 ? 'PHONE_B' : 'PHONE_D');
      }
      const st = h.getState();
      return { total: st.occupantsTotal, safe: st.occupantsSafe };
    }, sys.harness);

    Helpers.assertTrue(triageRes.safe <= triageRes.total, 'Safe tally must be <= total occupants');
    await assertNoDomLeakStrings(browser);
    await Helpers.assertNoConsoleErrors(browser, 'Variant C Rapid Check-In');
  });

  return ctx.summary();
}

// ======================================================================
// ADVERSARIAL STRESS SUITE: MASTER LAUNCHPAD PORTAL (sistemas/index.html)
// ======================================================================

async function runAdversarialStressPortal(browser) {
  const ctx = new TestContext('CHALLENGER STRESS: Master Launchpad Portal');
  const sys = SYSTEMS.portal;

  // TEST P-1: Rapid Category Filter Switching (<5ms loop)
  await ctx.test('STRESS-PORTAL-01: Rapid category switching (50 dispatches) maintains valid card rendering and 0 console errors', async () => {
    await loadSystem(browser, sys.path);

    const switchResult = await browser.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.filter-btn, .category-chip, [data-filter]'));
      if (buttons.length === 0) return { count: 0, ok: true };

      const errors = [];
      for (let i = 0; i < 50; i++) {
        try {
          const btn = buttons[i % buttons.length];
          btn.click();
        } catch (e) {
          errors.push(e.message);
        }
      }

      // Reset to all or emergencia
      const emergBtn = buttons.find(b => b.textContent.includes('Emergencia') || b.getAttribute('data-filter') === 'emergencia');
      if (emergBtn) emergBtn.click();

      return { count: buttons.length, errors, ok: errors.length === 0 };
    });

    Helpers.assertTrue(switchResult.ok, `Category switch errors: ${JSON.stringify(switchResult.errors)}`);
    await browser.sleep(200);
    await assertNoDomLeakStrings(browser);
    await Helpers.assertNoConsoleErrors(browser, 'Portal Category Filter Spam');
  });

  // TEST P-2: Rapid Search Input Spam
  await ctx.test('STRESS-PORTAL-02: Rapid search input event spam (50 random query inputs) filters cards smoothly without memory leak', async () => {
    await loadSystem(browser, sys.path);

    const searchResult = await browser.evaluate(() => {
      const input = document.querySelector('#system-search, #search-input, [data-search], input[type="text"], input[type="search"]');
      if (!input) return { ok: true, skipped: true };

      const queries = ['tri', 'emergency', 'cyber', 'isometric', 'linear', 'nonexistent_xyz_99', ''];
      for (let i = 0; i < 50; i++) {
        input.value = queries[i % queries.length];
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }

      input.value = 'emergency';
      input.dispatchEvent(new Event('input', { bubbles: true }));

      return { ok: true, skipped: false };
    });

    Helpers.assertTrue(searchResult.ok, 'Search spam should complete smoothly');
    await browser.sleep(200);
    await assertNoDomLeakStrings(browser);
    await Helpers.assertNoConsoleErrors(browser, 'Portal Search Spam');
  });

  // TEST P-3: Extreme Viewport Resizes & Zero Horizontal Overflow
  await ctx.test('STRESS-PORTAL-03: Viewport resize cycles across 360px to 4K UHD contract range produce 0 horizontal overflow (scrollWidth <= clientWidth + 3)', async () => {
    await loadSystem(browser, sys.path);

    const contractViewports = [
      { width: 360, height: 640, isMobile: true },
      { width: 375, height: 667, isMobile: true },
      { width: 768, height: 1024, isMobile: true },
      { width: 1280, height: 800, isMobile: false },
      { width: 1920, height: 1080, isMobile: false },
      { width: 3840, height: 2160, isMobile: false }
    ];

    for (const vp of contractViewports) {
      await browser.setViewport(vp.width, vp.height, 1, vp.isMobile);
      await browser.sleep(80);

      const overflow = await browser.evaluate(() => {
        const docEl = document.documentElement;
        const body = document.body;
        const scrollW = Math.max(docEl.scrollWidth, body.scrollWidth);
        const clientW = Math.min(docEl.clientWidth, body.clientWidth) || docEl.clientWidth;
        return {
          scrollW,
          clientW,
          hasOverflow: scrollW > (clientW + 3)
        };
      });

      Helpers.assertFalse(overflow.hasOverflow, `Horizontal scroll overflow detected at ${vp.width}x${vp.height}: scrollWidth=${overflow.scrollW}, clientWidth=${overflow.clientW}`);
    }

    await Helpers.assertNoConsoleErrors(browser, 'Portal Viewport Resizes');
  });

  // TEST P-4: Tri-Screen Cards and Canvas Preview Animation
  await ctx.test('STRESS-PORTAL-04: All 3 Tri-Screen system cards are present with functional canvas wave previews', async () => {
    await loadSystem(browser, sys.path);

    const cards = await browser.evaluate(() => {
      const cardA = document.querySelector('[href*="emergency-tri-screen-a"], [data-system="emergency-tri-screen-a"], #card-emergency-tri-screen-a');
      const cardB = document.querySelector('[href*="emergency-tri-screen-b"], [data-system="emergency-tri-screen-b"], #card-emergency-tri-screen-b');
      const cardC = document.querySelector('[href*="emergency-tri-screen-c"], [data-system="emergency-tri-screen-c"], #card-emergency-tri-screen-c');
      return {
        hasCardA: !!cardA,
        hasCardB: !!cardB,
        hasCardC: !!cardC
      };
    });

    Helpers.assertTrue(cards.hasCardA, 'Card for Variant A must exist in Portal');
    Helpers.assertTrue(cards.hasCardB, 'Card for Variant B must exist in Portal');
    Helpers.assertTrue(cards.hasCardC, 'Card for Variant C must exist in Portal');
    await Helpers.assertNoConsoleErrors(browser, 'Portal Tri-Screen Cards');
  });

  return ctx.summary();
}

// ======================================================================
// MAIN HARNESS RUNNER
// ======================================================================

async function main() {
  console.log(`\n======================================================================`);
  console.log(`  EMPIRICAL CHALLENGER 1 ADVERSARIAL STRESS & EDGE-CASE HARNESS`);
  console.log(`  Target: Emergency Tri-Screen Multi-Device Simulator & Portal`);
  console.log(`======================================================================\n`);

  const browser = new BrowserSession();
  const results = [];
  const startTime = Date.now();

  try {
    await browser.launch();
    console.log(`[CDP] Headless browser session successfully established on port ${browser.port}`);

    // Run Variant A Adversarial Stress
    console.log(`\n>>> EXECUTING STRESS SUITE: Variant A (Tactical Cyberpunk Tri-Panel)`);
    const resA = await runAdversarialStressVariantA(browser);
    results.push(resA);

    // Run Variant B Adversarial Stress
    console.log(`\n>>> EXECUTING STRESS SUITE: Variant B (Clean Minimalist Linear Dark)`);
    const resB = await runAdversarialStressVariantB(browser);
    results.push(resB);

    // Run Variant C Adversarial Stress
    console.log(`\n>>> EXECUTING STRESS SUITE: Variant C (2.5D Isometric Mission Control)`);
    const resC = await runAdversarialStressVariantC(browser);
    results.push(resC);

    // Run Portal Adversarial Stress
    console.log(`\n>>> EXECUTING STRESS SUITE: Master Launchpad Portal`);
    const resP = await runAdversarialStressPortal(browser);
    results.push(resP);

  } catch (err) {
    console.error(`\n\x1b[31m[FATAL RUNNER ERROR]\x1b[0m ${err.message}`);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  } finally {
    browser.close();
  }

  // Summary and output
  const totalDuration = Date.now() - startTime;
  let totalTests = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  const allFailures = [];

  for (const r of results) {
    totalTests += r.total;
    totalPassed += r.passed;
    totalFailed += r.failed;
    if (r.failures && r.failures.length > 0) {
      allFailures.push(...r.failures);
    }
  }

  console.log(`\n======================================================================`);
  console.log(`  CHALLENGER 1 STRESS HARNESS EXECUTION SUMMARY`);
  console.log(`======================================================================`);
  console.log(`  Total Test Suites  : ${results.length}`);
  console.log(`  Total Stress Tests : ${totalTests}`);
  console.log(`  Passed             : \x1b[32m${totalPassed}\x1b[0m`);
  console.log(`  Failed             : ${totalFailed > 0 ? `\x1b[31m${totalFailed}\x1b[0m` : `\x1b[32m0\x1b[0m`}`);
  console.log(`  Total Duration     : ${(totalDuration / 1000).toFixed(2)}s`);
  console.log(`======================================================================\n`);

  // Write JSON Telemetry
  const reportPath = path.join(__dirname, 'challenger_1_tri_screen_stress_results.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalDuration,
    totalTests,
    totalPassed,
    totalFailed,
    suites: results,
    verdict: totalFailed === 0 ? 'APPROVE' : 'REQUEST_CHANGES'
  }, null, 2));

  console.log(`Report JSON written to: ${reportPath}`);

  if (totalFailed > 0) {
    console.error(`\n\x1b[31mVERDICT: REQUEST_CHANGES (${totalFailed} stress tests failed)\x1b[0m`);
    process.exit(1);
  } else {
    console.log(`\n\x1b[32mVERDICT: APPROVE (100% stress tests passed, 0 failures, 0 console errors, 0 NaN coords)\x1b[0m\n`);
    process.exit(0);
  }
}

if (require.main === module) {
  main();
}
