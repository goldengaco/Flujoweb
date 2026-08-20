/**
 * Master Automated E2E Test Runner
 * Entry point aggregating all enterprise test suites across Tiers 1-4.
 */

const { main } = require('./run_master_suite');

if (require.main === module) {
  main().then(code => process.exit(code)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
