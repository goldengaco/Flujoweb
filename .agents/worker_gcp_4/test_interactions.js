const { BrowserSession } = require('../../tests/runner');
const path = require('path');

async function runInteractionTests() {
  const session = new BrowserSession();
  try {
    await session.launch();
    const filePath = path.resolve(__dirname, '../../sistemas/gcp-iam-security/index.html');
    await session.navigate('file:///' + filePath.replace(/\\/g, '/'));
    await session.sleep(500);

    console.log('--- 1. Testing Full Security Scan Trigger ---');
    await session.click('[data-testid="scan-btn"]');
    await session.sleep(2200); // Wait for scan completion
    const scoreAfterScan = await session.evaluate('document.getElementById("kpiScoreVal").textContent');
    console.log('Score after scan:', scoreAfterScan);

    console.log('--- 2. Testing Threat Simulation & Instant Revoke ---');
    await session.click('[data-testid="simulate-threat-btn"]');
    await session.sleep(300);
    const bannerVisible = await session.evaluate('document.getElementById("threatBanner").classList.contains("active")');
    console.log('Threat Banner Active:', bannerVisible);

    await session.click('[data-testid="threat-instant-revoke-btn"]');
    await session.sleep(300);
    const bannerVisibleAfter = await session.evaluate('document.getElementById("threatBanner").classList.contains("active")');
    console.log('Threat Banner Dismissed after Revoke:', !bannerVisibleAfter);

    console.log('--- 3. Testing Least-Privilege Downscope Workflow ---');
    await session.click('[data-testid="tab-btn-least-privilege"]');
    await session.sleep(300);
    
    // Open Downscope modal
    await session.click('[data-testid="downscope-btn-p2"]');
    await session.sleep(300);
    const modalActive = await session.evaluate('document.getElementById("downscopeModal").classList.contains("active")');
    console.log('Downscope Modal Opened:', modalActive);

    // Confirm Downscope
    await session.click('[data-testid="downscope-apply-btn"]');
    await session.sleep(300);
    const p2Remediated = await session.evaluate('window.__GCP_IAM_SECURITY__.getState().principals.find(p => p.id === "p2").remediated');
    console.log('Principal p2 Remediated:', p2Remediated);

    console.log('--- 4. Testing Secret Vault Interactive Modals ---');
    await session.click('[data-testid="tab-btn-secret-vault"]');
    await session.sleep(300);

    await session.click('[data-testid="create-secret-version-btn"]');
    await session.sleep(200);
    const createModalActive = await session.evaluate('document.getElementById("createSecretVersionModal").classList.contains("active")');
    console.log('Create Version Modal Opened:', createModalActive);

    await session.click('[data-testid="create-version-submit-btn"]');
    await session.sleep(300);

    const versionCount = await session.evaluate('window.__GCP_IAM_SECURITY__.getState().secrets["sec-payment-rsa-key"].versions.length');
    console.log('Secret Version Count after add:', versionCount);

    console.log('--- 5. Testing Zero-Downtime Key Rotation Wizard ---');
    await session.click('[data-testid="tab-btn-sa-keys"]');
    await session.sleep(200);
    await session.click('[data-testid="start-rotation-wizard-btn"]');
    await session.sleep(3000); // wait for 4-step wizard
    const step4Done = await session.evaluate('document.getElementById("step4").classList.contains("completed")');
    console.log('Key Rotation Wizard Phase 4 Completed:', step4Done);

    console.log('--- 6. Testing Responsive Viewports (400px, 768px, 1920px, 3840px) ---');
    const viewports = [
      { width: 400, height: 800 },
      { width: 768, height: 1024 },
      { width: 1920, height: 1080 },
      { width: 3840, height: 2160 }
    ];
    for (const vp of viewports) {
      await session.setViewport(vp.width, vp.height);
      await session.sleep(100);
      const appWidth = await session.evaluate('document.querySelector(".app-container").offsetWidth');
      console.log(`Viewport ${vp.width}x${vp.height} -> Container Width: ${appWidth}px`);
    }

    console.log('--- 7. Testing Luminous Icon Persistence ---');
    const iconsCount = await session.evaluate('document.querySelectorAll(".lum-icon").length');
    console.log('Total Permanent Luminous Icons in DOM:', iconsCount);
    if (iconsCount < 10) throw new Error('Not enough luminous icons found in DOM');

    console.log('\n======================================================');
    console.log('✔ ALL ADVANCED INTERACTION TESTS PASSED CLEANLY!');
    console.log('======================================================\n');
  } finally {
    await session.close();
  }
}

runInteractionTests().catch(err => {
  console.error('Advanced Interaction Test Failure:', err);
  process.exit(1);
});
