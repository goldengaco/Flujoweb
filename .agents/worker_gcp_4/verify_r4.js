const { BrowserSession } = require('../../tests/runner');
const path = require('path');

async function test() {
  const session = new BrowserSession();
  try {
    await session.launch();
    const filePath = path.resolve(__dirname, '../../sistemas/gcp-iam-security/index.html');
    await session.navigate('file:///' + filePath.replace(/\\/g, '/'));
    await session.sleep(600);

    const title = await session.evaluate('document.title');
    console.log('Page Title:', title);

    // Run built-in self-tests
    const testResults = await session.evaluate('window.__GCP_IAM_SECURITY__.runTests()');
    console.log('Automated Test Results:', JSON.stringify(testResults, null, 2));

    // Test API Downscoping
    await session.evaluate('window.__GCP_IAM_SECURITY__.applyDownscope("p1")');
    const p1State = await session.evaluate('window.__GCP_IAM_SECURITY__.getState().principals[0].remediated');
    console.log('P1 Remediated:', p1State);

    // Test Key Revocation
    await session.evaluate('window.__GCP_IAM_SECURITY__.revokeKey("key-9941-deploy-sec8")');
    const keyStatus = await session.evaluate('window.__GCP_IAM_SECURITY__.getState().saKeys.find(k => k.id === "key-9941-deploy-sec8").status');
    console.log('Key Status:', keyStatus);

    // Test Secret Version Creation
    await session.evaluate('window.__GCP_IAM_SECURITY__.createSecretVersion("TEST_NEW_KEY_PAYLOAD_123")');
    const newVersion = await session.evaluate('window.__GCP_IAM_SECURITY__.getState().secrets["sec-payment-rsa-key"].versions.slice(-1)[0]');
    console.log('New Secret Version:', newVersion);

    // Test KMS Force Rotation
    await session.evaluate('window.__GCP_IAM_SECURITY__.forceKmsRotation()');
    const kmsCountdown = await session.evaluate('document.getElementById("kmsDaysCount").textContent');
    console.log('KMS Days Count:', kmsCountdown);

    // Test Quota Spike Simulation
    await session.evaluate('window.__GCP_IAM_SECURITY__.simulateQuotaSpike()');
    await session.sleep(1000);
    const quotaVal = await session.evaluate('window.__GCP_IAM_SECURITY__.getState().quotas.secretmanager.rps');
    console.log('Quota Spike RPS:', quotaVal);

    // Test Report Export
    const report = await session.evaluate('window.__GCP_IAM_SECURITY__.exportReport()');
    console.log('Report Type:', report.reportType, 'Score:', report.securityScore);

    // Check errors
    console.log('Console Errors:', session.consoleErrors);
    console.log('Uncaught Exceptions:', session.uncaughtExceptions);

    if (session.consoleErrors.length === 0 && session.uncaughtExceptions.length === 0 && testResults.failed === 0) {
      console.log('\n==========================================');
      console.log('✔ ALL VERIFICATIONS PASSED WITH 0 ERRORS!');
      console.log('==========================================\n');
    } else {
      console.error('\n✖ VERIFICATION FAILED!');
      process.exit(1);
    }
  } finally {
    await session.close();
  }
}

test().catch(err => {
  console.error('Fatal Test Execution Error:', err);
  process.exit(1);
});
