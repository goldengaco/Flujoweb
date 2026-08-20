/**
 * Master E2E Automated Test Suite Runner — GCP Cloud Observability Dashboards
 * Executes Tiers 1-4 across all 5 enterprise GCP dashboards.
 *
 * Usage:
 *   node tests/gcp_e2e_suite.js [--tier=1|2|3|4|all] [--target=pipeline|pubsub|sql|iam|cockpit|all] [--output=json]
 */

const path = require('path');
const fs = require('fs');
const { BrowserSession } = require('./runner');

// Test Tier Modules
const tier1Features = require('./gcp_tier1_features');
const tier2Boundaries = require('./gcp_tier2_boundaries');
const tier3Combinations = require('./gcp_tier3_combinations');
const tier4Scenarios = require('./gcp_tier4_scenarios');

async function main() {
  const args = process.argv.slice(2);
  const tierArg = (args.find(a => a.startsWith('--tier=')) || '--tier=all').split('=')[1];
  const targetArg = (args.find(a => a.startsWith('--target=')) || '--target=all').split('=')[1];
  const isJsonOutput = args.includes('--output=json');

  const rootDir = path.resolve(__dirname, '..');
  const dashboards = {
    pipeline: {
      key: 'pipeline',
      name: 'R1: Serverless Microservice Pipeline & Zero-Downtime Deployer',
      path: path.join(rootDir, 'sistemas', 'gcp-serverless-pipeline', 'index.html')
    },
    pubsub: {
      key: 'pubsub',
      name: 'R2: Event-Driven Pub/Sub Ingestion & DLQ Console',
      path: path.join(rootDir, 'sistemas', 'gcp-event-pubsub', 'index.html')
    },
    sql: {
      key: 'sql',
      name: 'R3: Private VPC Peering & Cloud SQL High-Availability Hub',
      path: path.join(rootDir, 'sistemas', 'gcp-sql-networking', 'index.html')
    },
    iam: {
      key: 'iam',
      name: 'R4: Identity & Access Governance (IAM) & Secret Vault Auditor',
      path: path.join(rootDir, 'sistemas', 'gcp-iam-security', 'index.html')
    },
    cockpit: {
      key: 'cockpit',
      name: 'R5: Unified CloudOps SRE Command Cockpit',
      path: path.join(rootDir, 'sistemas', 'gcp-cloudops-cockpit', 'index.html')
    }
  };

  console.log('\n\x1b[1m\x1b[36m======================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m   GCP CLOUD OBSERVABILITY SUITE — COMPREHENSIVE E2E TEST RUNNER     \x1b[0m');
  console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m\n');
  console.log(`Config: Tier = \x1b[33m${tierArg}\x1b[0m | Target = \x1b[33m${targetArg}\x1b[0m`);

  const browser = new BrowserSession();
  let totalPassed = 0;
  let totalFailed = 0;
  const suiteResults = [];
  const startTime = Date.now();

  try {
    await browser.launch();
    console.log('Headless browser session established successfully.\n');

    const targetsToRun = targetArg === 'all'
      ? Object.keys(dashboards)
      : [targetArg].filter(k => dashboards[k]);

    if (targetsToRun.length === 0) {
      throw new Error(`Invalid target specified: "${targetArg}". Options: pipeline, pubsub, sql, iam, cockpit, all`);
    }

    for (const key of targetsToRun) {
      const db = dashboards[key];
      console.log(`\n\x1b[1m\x1b[35m>>> RUNNING SUITES FOR: ${db.name}\x1b[0m`);
      console.log(`    Path: ${db.path}`);

      if (!fs.existsSync(db.path)) {
        console.warn(`    \x1b[31m✖ File not found at ${db.path}.\x1b[0m\n`);
        suiteResults.push({
          name: db.name,
          status: 'SKIPPED_NOT_FOUND',
          path: db.path,
          total: 0,
          passed: 0,
          failed: 1,
          failures: [{ description: 'File existence check', error: `File not found at ${db.path}` }]
        });
        totalFailed++;
        continue;
      }

      // Tier 1: Features
      if (tierArg === 'all' || tierArg === '1') {
        console.log(`\n  \x1b[1m[TIER 1: FEATURE COVERAGE]\x1b[0m`);
        const res = await tier1Features.runTests(browser, db.path, db.key);
        suiteResults.push(res);
        totalPassed += res.passed;
        totalFailed += res.failed;
      }

      // Tier 2: Boundaries & Corners
      if (tierArg === 'all' || tierArg === '2') {
        console.log(`\n  \x1b[1m[TIER 2: BOUNDARIES & CORNER CASES]\x1b[0m`);
        const res = await tier2Boundaries.runTests(browser, db.path, db.key);
        suiteResults.push(res);
        totalPassed += res.passed;
        totalFailed += res.failed;
      }

      // Tier 3: Combinations
      if (tierArg === 'all' || tierArg === '3') {
        console.log(`\n  \x1b[1m[TIER 3: CROSS-FEATURE COMBINATIONS]\x1b[0m`);
        const res = await tier3Combinations.runTests(browser, db.path, db.key);
        suiteResults.push(res);
        totalPassed += res.passed;
        totalFailed += res.failed;
      }

      // Tier 4: Real-World Scenarios
      if (tierArg === 'all' || tierArg === '4') {
        console.log(`\n  \x1b[1m[TIER 4: REAL-WORLD SRE SCENARIOS]\x1b[0m`);
        const res = await tier4Scenarios.runTests(browser, db.path, db.key);
        suiteResults.push(res);
        totalPassed += res.passed;
        totalFailed += res.failed;
      }
    }

  } catch (err) {
    console.error(`\x1b[31mFatal E2E Runner Error: ${err.message}\x1b[0m`);
    if (err.stack) console.error(err.stack);
    totalFailed++;
  } finally {
    await browser.close();
  }

  const grandTotal = totalPassed + totalFailed;
  const totalDuration = Date.now() - startTime;

  console.log('\n\x1b[1m\x1b[36m======================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m                   GCP E2E TEST EXECUTION SUMMARY                     \x1b[0m');
  console.log('\x1b[1m\x1b[36m======================================================================\x1b[0m\n');

  suiteResults.forEach(s => {
    if (s.status === 'SKIPPED_NOT_FOUND') {
      console.log(`  \x1b[31m✖\x1b[0m ${s.name}: \x1b[31mFILE NOT FOUND\x1b[0m`);
    } else {
      const color = s.failed === 0 ? '\x1b[32m' : '\x1b[31m';
      console.log(`  ${color}●\x1b[0m ${s.name}: ${s.passed}/${s.total} Passed \x1b[90m(${s.duration}ms)\x1b[0m`);
      if (s.failed > 0) {
        s.failures.forEach(f => {
          console.log(`    \x1b[31m- ${f.description}: ${f.error}\x1b[0m`);
        });
      }
    }
  });

  console.log('\n----------------------------------------------------------------------');
  console.log(`Total Tests Executed: \x1b[1m${grandTotal}\x1b[0m | Passed: \x1b[32m${totalPassed}\x1b[0m | Failed: \x1b[31m${totalFailed}\x1b[0m | Time: \x1b[90m${totalDuration}ms\x1b[0m`);
  console.log('----------------------------------------------------------------------\n');

  // Save report artifact to tests/gcp_test_results.json
  const report = {
    timestamp: new Date().toISOString(),
    totalExecuted: grandTotal,
    totalPassed,
    totalFailed,
    durationMs: totalDuration,
    suites: suiteResults
  };
  fs.writeFileSync(path.join(__dirname, 'gcp_test_results.json'), JSON.stringify(report, null, 2), 'utf-8');

  if (isJsonOutput) {
    console.log(JSON.stringify(report));
  }

  return totalFailed === 0 ? 0 : 1;
}

if (require.main === module) {
  main().then(code => process.exit(code)).catch(err => {
    console.error(err);
    process.exit(1);
  });
}

module.exports = { main };
