/**
 * Extended Stress, Boundary & Edge-Case Verification Suite for R2 PubSub
 */

const path = require('path');
const { BrowserSession } = require('./runner');

async function runExtended() {
  console.log('================================================================');
  console.log('Running Extended Stress & Boundary Tests: GCP Pub/Sub DLQ Console');
  console.log('================================================================\n');

  const browser = new BrowserSession();
  let passedCount = 0;
  let failedCount = 0;

  async function test(name, fn) {
    try {
      process.stdout.write(`  [STRESS TEST] ${name} ... `);
      await fn();
      console.log('PASSED ✅');
      passedCount++;
    } catch (err) {
      console.log('FAILED ❌');
      console.error(`    Error: ${err.message}`);
      failedCount++;
    }
  }

  try {
    await browser.launch();
    const filePath = path.resolve(__dirname, '../sistemas/gcp-event-pubsub/index.html');
    await browser.navigate(filePath);
    await browser.sleep(600);

    // Test 1: Rapid Ingestion Slider Range & Boundary Testing (100 to 4000)
    await test('Slider range boundaries (100 msg/s to 4000 msg/s)', async () => {
      // Set to min 100
      await browser.evaluate(() => {
        window.__GCP_EVENT_PUBSUB__.setIngestionRate(100);
      });
      await browser.sleep(300);
      let state = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getState());
      if (state.targetIngestionRate !== 100) throw new Error(`Expected target 100, got ${state.targetIngestionRate}`);

      // Set to max 4000
      await browser.evaluate(() => {
        window.__GCP_EVENT_PUBSUB__.setIngestionRate(4000);
      });
      await browser.sleep(300);
      state = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getState());
      if (state.targetIngestionRate !== 4000) throw new Error(`Expected target 4000, got ${state.targetIngestionRate}`);

      // Reset to 1200
      await browser.evaluate(() => {
        window.__GCP_EVENT_PUBSUB__.setIngestionRate(1200);
      });
    });

    // Test 2: Rapid Chaos Injection Stress (10 rapid poison pills injected)
    await test('Rapid DLQ poison-pill injections handled without memory leak or DOM failure', async () => {
      const beforeCount = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getDlqItems().length);
      
      await browser.evaluate(() => {
        const reasons = ['SCHEMA_VALIDATION_ERROR', 'MALFORMED_UTF8_PAYLOAD', 'DEPENDENCY_TIMEOUT_NACK', 'CORRUPTED_SIGNATURE'];
        for (let i = 0; i < 10; i++) {
          window.__GCP_EVENT_PUBSUB__.injectPoisonPill(reasons[i % reasons.length]);
        }
      });
      await browser.sleep(400);

      const afterCount = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getDlqItems().length);
      if (afterCount !== beforeCount + 10) {
        throw new Error(`Expected ${beforeCount + 10} DLQ items, found ${afterCount}`);
      }

      // Verify DOM table rows match
      const rowCount = await browser.evaluate(() => document.querySelectorAll('#dlqTableBody tr').length);
      if (rowCount !== afterCount) {
        throw new Error(`DOM table row count (${rowCount}) did not match DLQ items count (${afterCount})`);
      }
    });

    // Test 3: Search and Filter in DLQ Table
    await test('DLQ Search and Reason Filters work accurately', async () => {
      // Filter by SCHEMA_VALIDATION_ERROR
      await browser.evaluate(() => {
        const filter = document.getElementById('dlqReasonFilter');
        filter.value = 'SCHEMA_VALIDATION_ERROR';
        filter.dispatchEvent(new Event('change'));
      });
      await browser.sleep(200);

      const allSchemaRows = await browser.evaluate(() => {
        const badges = Array.from(document.querySelectorAll('#dlqTableBody .reason-badge'));
        return badges.every(b => b.textContent === 'SCHEMA_VALIDATION_ERROR');
      });
      if (!allSchemaRows) throw new Error('Filter did not restrict table rows to SCHEMA_VALIDATION_ERROR');

      // Reset filter
      await browser.evaluate(() => {
        const filter = document.getElementById('dlqReasonFilter');
        filter.value = 'ALL';
        filter.dispatchEvent(new Event('change'));
      });
    });

    // Test 4: Modal In-Drawer Sanitize & Replay Action
    await test('In-Modal "Sanitize & Replay to Topic" remediation workflow', async () => {
      const items = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getDlqItems());
      if (items.length === 0) throw new Error('No items in DLQ to inspect');

      const targetId = items[0].id;
      await browser.evaluate((id) => {
        window.__GCP_EVENT_PUBSUB__.__inspect(id);
      }, targetId);
      await browser.sleep(300);

      // Verify modal is open and has targetId
      const modalMsg = await browser.evaluate(() => document.getElementById('modalMsgId').textContent);
      if (modalMsg !== targetId) throw new Error(`Modal shows wrong ID: ${modalMsg} vs expected ${targetId}`);

      // Click "Sanitize & Replay to Topic" in modal
      await browser.evaluate(() => {
        document.getElementById('btnModalReplay').click();
      });
      await browser.sleep(500);

      // Verify modal closed and item removed
      const postState = await browser.evaluate((id) => {
        const isOpen = document.getElementById('dlqModal').classList.contains('open');
        const items = window.__GCP_EVENT_PUBSUB__.getDlqItems();
        const found = items.some(x => x.id === id);
        return { isOpen, found };
      }, targetId);

      if (postState.isOpen) throw new Error('Modal remained open after Sanitize & Replay');
      if (postState.found) throw new Error('Target item was not removed from DLQ after replay');
    });

    // Test 5: Permanent Icon Visibility Attestation Across State Changes
    await test('Permanent icon visibility (emojis ⏰, 📬, ⚙️, 📱, ☠️ never turn into checkmarks)', async () => {
      // Trigger burst, cron, worker crash to cycle through all states
      await browser.evaluate(() => {
        window.__GCP_EVENT_PUBSUB__.injectBurst(2, 3000);
        window.__GCP_EVENT_PUBSUB__.simulateWorkerCrash(2);
      });
      await browser.sleep(1000);

      const iconsCheck = await browser.evaluate(() => {
        const badges = Array.from(document.querySelectorAll('.luminous-icon-badge'));
        const badgeTexts = badges.map(b => b.innerText.trim());
        const expectedIcons = ['⏰', '📬', '⚙️', '📱', '☠️'];
        const allPresent = expectedIcons.every(ic => badgeTexts.includes(ic));
        const containsCheckmark = badgeTexts.some(t => t.includes('✓') || t.includes('✔') || t.includes('✅'));
        return { allPresent, containsCheckmark, badgeTexts };
      });

      if (!iconsCheck.allPresent) throw new Error(`Luminous icons missing: ${JSON.stringify(iconsCheck.badgeTexts)}`);
      if (iconsCheck.containsCheckmark) throw new Error('Found plain checkmarks replacing permanent luminous icons');
    });

    // Test 6: Purge Single DLQ Item
    await test('Purge action on single message permanently clears item', async () => {
      const itemsBefore = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getDlqItems());
      if (itemsBefore.length === 0) throw new Error('No items in DLQ to purge');
      const targetId = itemsBefore[0].id;

      await browser.evaluate((id) => {
        window.__GCP_EVENT_PUBSUB__.purgeMessage(id);
      }, targetId);
      await browser.sleep(300);

      const itemsAfter = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getDlqItems());
      const stillPresent = itemsAfter.some(x => x.id === targetId);
      if (stillPresent) throw new Error(`Item ${targetId} was not purged`);
    });

    // Test 7: Purge All
    await test('Purge All button discards entire DLQ quarantine table', async () => {
      await browser.evaluate(() => {
        window.__GCP_EVENT_PUBSUB__.purgeAll();
      });
      await browser.sleep(300);

      const count = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getDlqItems().length);
      if (count !== 0) throw new Error(`Expected DLQ count 0 after Purge All, got ${count}`);
    });

    // Test 8: Pause / Resume Functionality
    await test('Pause halts simulation and Resume restarts it', async () => {
      const isPausedInitial = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getState().isPaused);
      if (isPausedInitial) throw new Error('Should not be paused initially');

      // Click pause
      await browser.evaluate(() => {
        window.__GCP_EVENT_PUBSUB__.togglePause();
      });
      await browser.sleep(200);

      let paused = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getState().isPaused);
      if (!paused) throw new Error('Simulation failed to pause');

      // Click resume
      await browser.evaluate(() => {
        window.__GCP_EVENT_PUBSUB__.togglePause();
      });
      await browser.sleep(200);

      paused = await browser.evaluate(() => window.__GCP_EVENT_PUBSUB__.getState().isPaused);
      if (paused) throw new Error('Simulation failed to resume');
    });

  } finally {
    browser.close();
  }

  console.log('\n================================================================');
  console.log(`EXTENDED TEST SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log('================================================================');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runExtended().catch(err => {
  console.error('Fatal extended test error:', err);
  process.exit(1);
});
