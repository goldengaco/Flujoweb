/**
 * Master Enterprise E2E Test Suite Runner
 * Executes all test tiers (Tiers 1-4) and specialized suites across all 14 dashboards and Master Portal:
 * 1. Master Launchpad Portal Suite (sistemas/index.html)
 * 2. Audio Synthesizer & Sound Controls Suite (7 dashboards)
 * 3. Log Panels, Real-Time Filtering & JSON Export Suite (7 dashboards)
 * 4. Layout Anti-Collision & Responsive Viewports Suite (360px–3840px across all systems)
 * 5. GCP Cloud Observability Suite (Tiers 1-4 across 5 GCP dashboards)
 * 6. Core Enterprise Dashboards (Security, Server Status, Transaction Pipeline)
 *
 * Usage:
 *   node tests/run_master_suite.js [--suite=all|portal|audio|logs|layout|gcp|core] [--tier=1|2|3|4|all] [--output=json]
 */

const path = require('path');
const fs = require('fs');
const { BrowserSession } = require('./runner');

// Specialized test modules
const masterPortalSuite = require('./test_master_portal');
const audioControlsSuite = require('./test_audio_controls');
const logPanelsSuite = require('./test_log_panels');
const layoutAntiCollisionSuite = require('./test_layout_anticollision');

// GCP Tier modules
const gcpTier1 = require('./gcp_tier1_features');
const gcpTier2 = require('./gcp_tier2_boundaries');
const gcpTier3 = require('./gcp_tier3_combinations');
const gcpTier4 = require('./gcp_tier4_scenarios');

// Core Tier modules
const tier1Security = require('./tier1_features/test_security_features');
const tier1Server = require('./tier1_features/test_server_features');
const tier1Transaction = require('./tier1_features/test_transaction_features');

const tier2Security = require('./tier2_boundaries/test_security_boundaries');
const tier2Server = require('./tier2_boundaries/test_server_boundaries');
const tier2Transaction = require('./tier2_boundaries/test_transaction_boundaries');

const tier3Security = require('./tier3_combinations/test_security_combinations');
const tier3Server = require('./tier3_combinations/test_server_combinations');
const tier3Transaction = require('./tier3_combinations/test_transaction_combinations');

const tier4Security = require('./tier4_scenarios/test_security_scenarios');
const tier4Server = require('./tier4_scenarios/test_server_scenarios');
const tier4Transaction = require('./tier4_scenarios/test_transaction_scenarios');

async function main() {
  const args = process.argv.slice(2);
  const suiteArg = (args.find(a => a.startsWith('--suite=')) || '--suite=all').split('=')[1].toLowerCase();
  const tierArg = (args.find(a => a.startsWith('--tier=')) || '--tier=all').split('=')[1].toLowerCase();
  const isJsonOutput = args.includes('--output=json');

  const rootDir = path.resolve(__dirname, '..');
  const startTime = Date.now();

  console.log('\n\x1b[1m\x1b[36m========================================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m        FLUJOWEB ENTERPRISE ECOSYSTEM — UNIFIED E2E TEST RUNNER (TIERS 1-4)             \x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================================\x1b[0m\n');
  console.log(`Config: Suite = \x1b[33m${suiteArg}\x1b[0m | Tier = \x1b[33m${tierArg}\x1b[0m\n`);

  const browser = new BrowserSession();
  let totalPassed = 0;
  let totalFailed = 0;
  const suiteResults = [];

  try {
    await browser.launch();
    console.log('Headless browser session established successfully.\n');

    // 1. Audio Controls Suite
    if (suiteArg === 'all' || suiteArg === 'audio') {
      console.log('\n\x1b[1m\x1b[35m>>> RUNNING SUITE: Audio Synthesizer & Sound Controls (7 Dashboards)\x1b[0m');
      const res = await audioControlsSuite.runTests(browser);
      suiteResults.push(res);
      totalPassed += res.passed;
      totalFailed += res.failed;
    }

    // 2. Log Panels & JSON Export Suite
    if (suiteArg === 'all' || suiteArg === 'logs') {
      console.log('\n\x1b[1m\x1b[35m>>> RUNNING SUITE: Log Panels, Real-Time Search & JSON Export (7 Dashboards)\x1b[0m');
      const res = await logPanelsSuite.runTests(browser);
      suiteResults.push(res);
      totalPassed += res.passed;
      totalFailed += res.failed;
    }

    // 3. Master Portal Suite
    if (suiteArg === 'all' || suiteArg === 'portal') {
      const portalPath = path.join(rootDir, 'sistemas', 'index.html');
      console.log('\n\x1b[1m\x1b[35m>>> RUNNING SUITE: Master Launchpad Portal (sistemas/index.html)\x1b[0m');
      const res = await masterPortalSuite.runTests(browser, portalPath);
      suiteResults.push(res);
      totalPassed += res.passed;
      totalFailed += res.failed;
    }

    // 4. Layout Anti-Collision & Viewports Suite
    if (suiteArg === 'all' || suiteArg === 'layout') {
      console.log('\n\x1b[1m\x1b[35m>>> RUNNING SUITE: Layout Anti-Collision & Responsive Viewports (360px-3840px)\x1b[0m');
      const res = await layoutAntiCollisionSuite.runTests(browser);
      suiteResults.push(res);
      totalPassed += res.passed;
      totalFailed += res.failed;
    }

    // 5. Core Dashboards (Security, Server Status, Transaction Flow)
    if (suiteArg === 'all' || suiteArg === 'core') {
      const coreDashboards = [
        {
          key: 'security',
          name: 'CyberSec Sentinel Security Scanner',
          path: path.join(rootDir, 'sistemas', 'security-audit', 'index.html'),
          tier1: tier1Security,
          tier2: tier2Security,
          tier3: tier3Security,
          tier4: tier4Security
        },
        {
          key: 'server',
          name: 'Mission Control NOC & Server Status',
          path: path.join(rootDir, 'sistemas', 'server-status', 'index.html'),
          tier1: tier1Server,
          tier2: tier2Server,
          tier3: tier3Server,
          tier4: tier4Server
        },
        {
          key: 'transaction',
          name: 'High-Frequency Transaction Pipeline',
          path: path.join(rootDir, 'sistemas', 'transaction-flow', 'index.html'),
          tier1: tier1Transaction,
          tier2: tier2Transaction,
          tier3: tier3Transaction,
          tier4: tier4Transaction
        }
      ];

      for (const db of coreDashboards) {
        if (!fs.existsSync(db.path)) continue;
        console.log(`\n\x1b[1m\x1b[35m>>> RUNNING CORE SUITES FOR: ${db.name}\x1b[0m`);

        if (tierArg === 'all' || tierArg === '1') {
          const res = await db.tier1.runTests(browser, db.path);
          suiteResults.push(res);
          totalPassed += res.passed;
          totalFailed += res.failed;
        }
        if (tierArg === 'all' || tierArg === '2') {
          const res = await db.tier2.runTests(browser, db.path);
          suiteResults.push(res);
          totalPassed += res.passed;
          totalFailed += res.failed;
        }
        if (tierArg === 'all' || tierArg === '3') {
          const res = await db.tier3.runTests(browser, db.path);
          suiteResults.push(res);
          totalPassed += res.passed;
          totalFailed += res.failed;
        }
        if (tierArg === 'all' || tierArg === '4') {
          const res = await db.tier4.runTests(browser, db.path);
          suiteResults.push(res);
          totalPassed += res.passed;
          totalFailed += res.failed;
        }
      }
    }

    // 6. GCP Observability Dashboards (5 systems)
    if (suiteArg === 'all' || suiteArg === 'gcp') {
      const gcpDashboards = [
        { key: 'pipeline', name: 'GCP Serverless Pipeline', path: path.join(rootDir, 'sistemas', 'gcp-serverless-pipeline', 'index.html') },
        { key: 'pubsub', name: 'GCP Pub/Sub & DLQ', path: path.join(rootDir, 'sistemas', 'gcp-event-pubsub', 'index.html') },
        { key: 'sql', name: 'GCP Cloud SQL HA Peering', path: path.join(rootDir, 'sistemas', 'gcp-sql-networking', 'index.html') },
        { key: 'iam', name: 'GCP IAM Security Auditor', path: path.join(rootDir, 'sistemas', 'gcp-iam-security', 'index.html') },
        { key: 'cockpit', name: 'GCP CloudOps Cockpit', path: path.join(rootDir, 'sistemas', 'gcp-cloudops-cockpit', 'index.html') }
      ];

      for (const db of gcpDashboards) {
        if (!fs.existsSync(db.path)) continue;
        console.log(`\n\x1b[1m\x1b[35m>>> RUNNING GCP SUITES FOR: ${db.name}\x1b[0m`);

        if (tierArg === 'all' || tierArg === '1') {
          const res = await gcpTier1.runTests(browser, db.path, db.key);
          suiteResults.push(res);
          totalPassed += res.passed;
          totalFailed += res.failed;
        }
        if (tierArg === 'all' || tierArg === '2') {
          const res = await gcpTier2.runTests(browser, db.path, db.key);
          suiteResults.push(res);
          totalPassed += res.passed;
          totalFailed += res.failed;
        }
        if (tierArg === 'all' || tierArg === '3') {
          const res = await gcpTier3.runTests(browser, db.path, db.key);
          suiteResults.push(res);
          totalPassed += res.passed;
          totalFailed += res.failed;
        }
        if (tierArg === 'all' || tierArg === '4') {
          const res = await gcpTier4.runTests(browser, db.path, db.key);
          suiteResults.push(res);
          totalPassed += res.passed;
          totalFailed += res.failed;
        }
      }
    }

  } catch (err) {
    console.error(`\x1b[31mFatal Master Runner Error: ${err.message}\x1b[0m`);
    if (err.stack) console.error(err.stack);
    totalFailed++;
  } finally {
    await browser.close();
  }

  const grandTotal = totalPassed + totalFailed;
  const totalDuration = Date.now() - startTime;

  console.log('\n\x1b[1m\x1b[36m========================================================================================\x1b[0m');
  console.log('\x1b[1m\x1b[36m                         MASTER TEST EXECUTION SUMMARY                                  \x1b[0m');
  console.log('\x1b[1m\x1b[36m========================================================================================\x1b[0m\n');

  suiteResults.forEach(s => {
    if (s.status === 'SKIPPED_NOT_FOUND') {
      console.log(`  \x1b[33m⚠\x1b[0m ${s.name}: \x1b[33mSKIPPED (File not yet generated)\x1b[0m`);
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

  console.log('\n----------------------------------------------------------------------------------------');
  console.log(`Total Tests: \x1b[1m${grandTotal}\x1b[0m | Passed: \x1b[32m${totalPassed}\x1b[0m | Failed: \x1b[31m${totalFailed}\x1b[0m | Time: \x1b[90m${(totalDuration / 1000).toFixed(2)}s\x1b[0m`);
  console.log('----------------------------------------------------------------------------------------\n');

  // Save report artifact
  const report = {
    timestamp: new Date().toISOString(),
    totalExecuted: grandTotal,
    totalPassed,
    totalFailed,
    durationMs: totalDuration,
    suites: suiteResults
  };
  fs.writeFileSync(path.join(__dirname, 'test_results.json'), JSON.stringify(report, null, 2), 'utf-8');

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
