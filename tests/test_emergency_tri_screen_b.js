const { BrowserSession } = require('./runner.js');
const path = require('path');

async function runTests() {
  console.log('--- Starting Comprehensive & Adversarial E2E Verification for Variant B ---');
  const session = new BrowserSession();
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    await session.launch();
    console.log('Browser launched successfully.');

    const filePath = path.resolve(__dirname, '../sistemas/emergency-tri-screen-b/index.html');
    const fileUrl = 'file:///' + filePath.replace(/\\/g, '/');
    console.log(`Navigating to: ${fileUrl}`);

    await session.navigate(fileUrl);
    await session.sleep(500);

    // 1. Console Errors & Uncaught Exceptions check
    assert(session.consoleErrors.length === 0, `0 console errors on initial load (found: ${session.consoleErrors.length})`);
    assert(session.uncaughtExceptions.length === 0, `0 uncaught exceptions on initial load (found: ${session.uncaughtExceptions.length})`);

    // 2. Verify window.__EMERGENCY_TRI_B__ interface presence
    const harnessExists = await session.evaluate(`typeof window.__EMERGENCY_TRI_B__ === 'object' && window.__EMERGENCY_TRI_B__ !== null`);
    assert(harnessExists, 'window.__EMERGENCY_TRI_B__ is exposed globally');

    const methodCheck = await session.evaluate(`
      ['getState', 'triggerAlarm', 'resetSimulation', 'injectHazard', 'checkInSafe', 'toggleStairwell', 'setOccupantCount'].every(m => typeof window.__EMERGENCY_TRI_B__[m] === 'function')
    `);
    assert(methodCheck, 'All 7 interface methods exist on window.__EMERGENCY_TRI_B__');

    // 3. Test Initial State
    const initState = await session.evaluate(`window.__EMERGENCY_TRI_B__.getState()`);
    assert(initState.alarmState === 'STANDBY', `Initial alarmState is STANDBY (got: ${initState.alarmState})`);
    assert(initState.occupantsTotal === 48, `Initial occupantsTotal is 48 (got: ${initState.occupantsTotal})`);
    assert(initState.occupantsSafe === 0, `Initial occupantsSafe is 0 (got: ${initState.occupantsSafe})`);
    assert(initState.stairwells.A === 'CLEAR' && initState.stairwells.B === 'CLEAR', 'Initial stairwells A & B are CLEAR');
    assert(Array.isArray(initState.particles) && initState.particles.length === 48, '48 particles properly initialized');

    // 4. Test Trigger Alarm with options (drill, fire, quake)
    await session.evaluate(`window.__EMERGENCY_TRI_B__.triggerAlarm({ severity: 'drill', channel: 'DRILL_CH_1' })`);
    let activeState = await session.evaluate(`window.__EMERGENCY_TRI_B__.getState()`);
    assert(activeState.alarmState === 'ACTIVE' && activeState.severity === 'drill' && activeState.channel === 'DRILL_CH_1', 'Trigger alarm with drill severity & custom channel works');

    await session.evaluate(`window.__EMERGENCY_TRI_B__.triggerAlarm({ severity: 'quake' })`);
    activeState = await session.evaluate(`window.__EMERGENCY_TRI_B__.getState()`);
    assert(activeState.severity === 'quake', 'Trigger alarm dynamically changes to quake severity');

    // 5. Test Dynamic Particle Movement
    await session.sleep(1200);
    const movingState = await session.evaluate(`window.__EMERGENCY_TRI_B__.getState()`);
    const movedParticles = movingState.particles.some(p => p.state === 'evacuating' || p.state === 'safe');
    assert(movedParticles, 'Particles are actively navigating along hallway graph');

    // 6. Test Hazard Injection in multiple zones
    await session.evaluate(`window.__EMERGENCY_TRI_B__.injectHazard('Server Room')`);
    await session.evaluate(`window.__EMERGENCY_TRI_B__.injectHazard('Breakroom')`);
    await session.sleep(200);
    const hazardState = await session.evaluate(`window.__EMERGENCY_TRI_B__.getState()`);
    assert(hazardState.hazards.length === 2, `Both hazards registered (count: ${hazardState.hazards.length})`);

    // 7. Test Stairwell Toggle & Compass Bearing Update
    await session.evaluate(`window.__EMERGENCY_TRI_B__.toggleStairwell('A', 'BLOCKED')`);
    await session.sleep(200);
    let stairState = await session.evaluate(`window.__EMERGENCY_TRI_B__.getState()`);
    assert(stairState.stairwells.A === 'BLOCKED', `Stairwell A is now BLOCKED`);

    const compassBearing = await session.evaluate(`document.getElementById('compassBearingTxt').textContent`);
    assert(compassBearing.includes('180°') || compassBearing.includes('Ruta Alternativa'), `Compass dynamically points to Exit B (got: ${compassBearing})`);

    await session.evaluate(`window.__EMERGENCY_TRI_B__.toggleStairwell('B', 'BLOCKED')`);
    await session.sleep(200);
    stairState = await session.evaluate(`window.__EMERGENCY_TRI_B__.getState()`);
    assert(stairState.stairwells.B === 'BLOCKED', 'Stairwell B is now BLOCKED');

    const compassShelter = await session.evaluate(`document.getElementById('compassTargetExit').textContent`);
    assert(compassShelter.includes('Refugio') || compassShelter.includes('PRECAUCIÓN'), `Compass warns to seek shelter when both exits are blocked (got: ${compassShelter})`);

    // Restore Stairwells
    await session.evaluate(`window.__EMERGENCY_TRI_B__.toggleStairwell('A', 'CLEAR')`);
    await session.evaluate(`window.__EMERGENCY_TRI_B__.toggleStairwell('B', 'CLEAR')`);

    // 8. Test Check-In Safe Action for all phones
    await session.evaluate(`window.__EMERGENCY_TRI_B__.checkInSafe('PHONE_B')`);
    await session.evaluate(`window.__EMERGENCY_TRI_B__.checkInSafe('PHONE_C')`);
    await session.evaluate(`window.__EMERGENCY_TRI_B__.checkInSafe('PHONE_D')`);
    const checkinBtnB = await session.evaluate(`document.getElementById('btnPhoneBCheckinText').textContent`);
    const checkinBtnC = await session.evaluate(`document.getElementById('btnPhoneCCheckinText').textContent`);
    const checkinBtnD = await session.evaluate(`document.getElementById('btnPhoneDCheckinText').textContent`);
    assert(checkinBtnB.includes('A SALVO'), 'Phone B checked in safely');
    assert(checkinBtnC.includes('BRIGADA'), 'Phone C checked in safely');
    assert(checkinBtnD.includes('ZONA REUNIÓN'), 'Phone D verified muster zone safely');

    // 9. Test Set Occupant Count & Boundary Scaling
    await session.evaluate(`window.__EMERGENCY_TRI_B__.setOccupantCount(12)`);
    let countState = await session.evaluate(`window.__EMERGENCY_TRI_B__.getState()`);
    assert(countState.occupantsTotal === 12 && countState.particles.length === 12, 'Occupant count scaled down to 12 correctly');

    await session.evaluate(`window.__EMERGENCY_TRI_B__.setOccupantCount(60)`);
    countState = await session.evaluate(`window.__EMERGENCY_TRI_B__.getState()`);
    assert(countState.occupantsTotal === 60 && countState.particles.length === 60, 'Occupant count scaled up to 60 correctly');

    // 10. Test Rapid Reset & Retrigger Stress Cycle
    for (let cycle = 1; cycle <= 5; cycle++) {
      await session.evaluate(`window.__EMERGENCY_TRI_B__.resetSimulation()`);
      await session.evaluate(`window.__EMERGENCY_TRI_B__.triggerAlarm({ severity: 'fire' })`);
    }
    const cycleState = await session.evaluate(`window.__EMERGENCY_TRI_B__.getState()`);
    assert(cycleState.alarmState === 'ACTIVE', 'Survives 5 rapid reset/retrigger cycles without corruption');

    await session.evaluate(`window.__EMERGENCY_TRI_B__.resetSimulation()`);
    const finalResetState = await session.evaluate(`window.__EMERGENCY_TRI_B__.getState()`);
    assert(finalResetState.alarmState === 'STANDBY', 'Final reset leaves state cleanly in STANDBY');

    // 11. Test Interactive UI clicks directly via DOM
    await session.evaluate(`document.getElementById('btnHapticTrigger').click()`);
    await session.sleep(200);
    const clickAlarmState = await session.evaluate(`window.__EMERGENCY_TRI_B__.getState()`);
    assert(clickAlarmState.alarmState === 'ACTIVE', 'Clicking #btnHapticTrigger initiates emergency alarm');

    // Heatmap Toggle Button Click
    const heatmapInitial = await session.evaluate(`document.getElementById('btnToggleHeatmap').classList.contains('active')`);
    await session.evaluate(`document.getElementById('btnToggleHeatmap').click()`);
    const heatmapToggled = await session.evaluate(`document.getElementById('btnToggleHeatmap').classList.contains('active')`);
    assert(heatmapInitial !== heatmapToggled, 'Clicking #btnToggleHeatmap toggles heatmap state');

    // Vectors Toggle Button Click
    const vectorsInitial = await session.evaluate(`document.getElementById('btnToggleVectors').classList.contains('active')`);
    await session.evaluate(`document.getElementById('btnToggleVectors').click()`);
    const vectorsToggled = await session.evaluate(`document.getElementById('btnToggleVectors').classList.contains('active')`);
    assert(vectorsInitial !== vectorsToggled, 'Clicking #btnToggleVectors toggles vector streams');

    // Audio Mute Toggle Button Click
    await session.evaluate(`document.getElementById('btnAudioToggle').click()`);
    const audioLabel = await session.evaluate(`document.getElementById('audioToggleLabel').textContent`);
    assert(audioLabel === 'Muted', 'Audio toggle mutes audio cleanly');

    // 12. Test Viewport Responsiveness & Zero Horizontal Overflow Matrix
    const viewports = [
      { name: '4K Desktop', width: 3840, height: 2160 },
      { name: 'Ultrawide 1440p', width: 2560, height: 1440 },
      { name: '1080p Desktop', width: 1920, height: 1080 },
      { name: 'Standard Laptop', width: 1366, height: 768 },
      { name: 'Compact Laptop', width: 1280, height: 800 },
      { name: 'iPad Pro Landscape', width: 1024, height: 768 },
      { name: 'Tablet Portrait', width: 768, height: 1024 },
      { name: 'Mobile Large (iPhone 14 Pro Max)', width: 430, height: 932 },
      { name: 'Mobile Standard (iPhone 13)', width: 390, height: 844 },
      { name: 'Mobile Compact', width: 375, height: 667 },
      { name: 'Mobile Narrow (Android)', width: 360, height: 640 },
      { name: 'Mobile Ultra-Narrow', width: 320, height: 568 }
    ];

    for (const vp of viewports) {
      await session.setViewport(vp.width, vp.height);
      await session.sleep(100);
      const overflow = await session.evaluate(`document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1`);
      assert(overflow, `No horizontal overflow at ${vp.name} (${vp.width}x${vp.height})`);
    }

    console.log(`\n================ TEST SUMMARY ================`);
    console.log(`Total Passed: ${passed}`);
    console.log(`Total Failed: ${failed}`);
    console.log(`Console Errors: ${session.consoleErrors.length}`);
    console.log(`Uncaught Exceptions: ${session.uncaughtExceptions.length}`);

    if (failed > 0 || session.consoleErrors.length > 0 || session.uncaughtExceptions.length > 0) {
      throw new Error(`Test suite failed with ${failed} failures and ${session.consoleErrors.length} errors.`);
    }

  } finally {
    session.close();
  }
}

runTests().catch(err => {
  console.error('Fatal error during test run:', err);
  process.exit(1);
});
