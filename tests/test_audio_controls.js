/**
 * Audio Synthesizer & Sound Controls E2E Test Suite
 * Validates sound mute/unmute buttons, state transitions, icon indicators, and oscillator lifecycle across 7 dashboards:
 * 1. emergency-evacuation-v2 (#btn-siren-toggle, #siren-label, TacticalAudioEngine)
 * 2. server-status (#audioToggleBtn, #audioIcon, SoundSynth)
 * 3. apigee-mulesoft-hybrid (#btnMuteAudio, #muteIcon, #muteText, AudioSynthesizer)
 * 4. emergency-evacuation-v1 (#btn-toggle-sound, #audio-status-label)
 * 5. emergency-evacuation-v3 (#btn-audio-toggle)
 * 6. gcp-sql-networking (#btnSoundToggle, #soundIcon, #soundLabel)
 * 7. gcp-iam-security (#audioToggleBtn, #audioIcon)
 */

const path = require('path');
const fs = require('fs');
const { TestContext, Helpers } = require('./fixtures/helpers');

async function runTests(browser) {
  const ctx = new TestContext('Audio Synthesizer & Sound Controls Suite (7 Dashboards)');
  const rootDir = path.resolve(__dirname, '..');

  const audioTargets = [
    {
      id: 'emergency-evacuation-v2',
      name: 'Emergency Evacuation V2 (Mobile Occupant HUD)',
      file: path.join(rootDir, 'sistemas', 'emergency-evacuation-v2', 'index.html'),
      selector: '#btn-siren-toggle',
      getState: async () => {
        return await browser.evaluate(() => {
          const btn = document.querySelector('#btn-siren-toggle');
          const label = document.querySelector('#siren-label');
          const icon = document.querySelector('#siren-icon');
          const isPlaying = typeof audio !== 'undefined' ? audio.isPlayingSiren : false;
          return {
            isActive: btn?.classList.contains('active'),
            label: label?.innerText?.trim(),
            icon: icon?.innerText?.trim(),
            isPlaying
          };
        });
      },
      verifyToggled: (stateBefore, stateAfter) => {
        Helpers.assertTrue(
          stateBefore.isPlaying !== stateAfter.isPlaying || 
          stateBefore.isActive !== stateAfter.isActive || 
          stateBefore.label !== stateAfter.label, 
          `Evac V2 siren state should change on click (before: ${JSON.stringify(stateBefore)}, after: ${JSON.stringify(stateAfter)})`
        );
      }
    },
    {
      id: 'server-status',
      name: 'Server Status (Mission Control NOC)',
      file: path.join(rootDir, 'sistemas', 'server-status', 'index.html'),
      selector: '#audioToggleBtn',
      getState: async () => {
        return await browser.evaluate(() => {
          const btn = document.querySelector('#audioToggleBtn');
          const icon = document.querySelector('#audioIcon');
          return {
            isActive: btn?.classList.contains('active'),
            icon: icon?.innerText?.trim()
          };
        });
      },
      verifyToggled: (stateBefore, stateAfter) => {
        Helpers.assertTrue(stateBefore.icon !== stateAfter.icon, 
          `Server status icon should change on click (before: ${stateBefore.icon}, after: ${stateAfter.icon})`);
      }
    },
    {
      id: 'apigee-mulesoft-hybrid',
      name: 'Apigee + MuleSoft Hybrid Observability Cockpit',
      file: path.join(rootDir, 'sistemas', 'apigee-mulesoft-hybrid', 'index.html'),
      selector: '#btnMuteAudio',
      getState: async () => {
        return await browser.evaluate(() => {
          const btn = document.querySelector('#btnMuteAudio');
          const icon = document.querySelector('#muteIcon');
          const text = document.querySelector('#muteText');
          return {
            icon: icon?.innerText?.trim(),
            text: text?.innerText?.trim(),
            btnText: btn?.innerText?.trim()
          };
        });
      },
      verifyToggled: (stateBefore, stateAfter) => {
        Helpers.assertTrue(stateBefore.icon !== stateAfter.icon || stateBefore.text !== stateAfter.text, 
          `Apigee hybrid audio state should change on click (before: ${stateBefore.text}, after: ${stateAfter.text})`);
      }
    },
    {
      id: 'emergency-evacuation-v1',
      name: 'Emergency Evacuation V1 (Command Center)',
      file: path.join(rootDir, 'sistemas', 'emergency-evacuation-v1', 'index.html'),
      selector: '#btn-toggle-sound',
      getState: async () => {
        return await browser.evaluate(() => {
          const btn = document.querySelector('#btn-toggle-sound');
          const label = document.querySelector('#audio-status-label');
          return {
            isActive: btn?.classList.contains('active'),
            label: label?.innerText?.trim(),
            btnText: btn?.innerText?.trim()
          };
        });
      },
      verifyToggled: (stateBefore, stateAfter) => {
        Helpers.assertTrue(stateBefore.isActive !== stateAfter.isActive || stateBefore.label !== stateAfter.label, 
          `Evac V1 audio state should change on click (before: ${stateBefore.label}, after: ${stateAfter.label})`);
      }
    },
    {
      id: 'emergency-evacuation-v3',
      name: 'Emergency Evacuation V3 (Fan-Out Engine)',
      file: path.join(rootDir, 'sistemas', 'emergency-evacuation-v3', 'index.html'),
      selector: '#btn-audio-toggle',
      getState: async () => {
        return await browser.evaluate(() => {
          const btn = document.querySelector('#btn-audio-toggle');
          return {
            text: btn?.innerText?.trim()
          };
        });
      },
      verifyToggled: (stateBefore, stateAfter) => {
        Helpers.assertTrue(stateBefore.text !== stateAfter.text, 
          `Evac V3 audio button text should change on click (before: ${stateBefore.text}, after: ${stateAfter.text})`);
      }
    },
    {
      id: 'gcp-sql-networking',
      name: 'GCP SQL Networking & HA Peering',
      file: path.join(rootDir, 'sistemas', 'gcp-sql-networking', 'index.html'),
      selector: '#btnSoundToggle',
      getState: async () => {
        return await browser.evaluate(() => {
          const icon = document.querySelector('#soundIcon');
          const label = document.querySelector('#soundLabel');
          return {
            icon: icon?.innerText?.trim(),
            label: label?.innerText?.trim()
          };
        });
      },
      verifyToggled: (stateBefore, stateAfter) => {
        Helpers.assertTrue(stateBefore.icon !== stateAfter.icon || stateBefore.label !== stateAfter.label, 
          `GCP SQL audio should change on click (before: ${stateBefore.label}, after: ${stateAfter.label})`);
      }
    },
    {
      id: 'gcp-iam-security',
      name: 'GCP IAM Security & Secret Vault Auditor',
      file: path.join(rootDir, 'sistemas', 'gcp-iam-security', 'index.html'),
      selector: '#audioToggleBtn',
      getState: async () => {
        return await browser.evaluate(() => {
          const icon = document.querySelector('#audioIcon');
          return {
            icon: icon?.innerText?.trim()
          };
        });
      },
      verifyToggled: (stateBefore, stateAfter) => {
        Helpers.assertTrue(stateBefore.icon !== stateAfter.icon, 
          `GCP IAM audio icon should change on click (before: ${stateBefore.icon}, after: ${stateAfter.icon})`);
      }
    }
  ];

  for (const target of audioTargets) {
    if (!fs.existsSync(target.file)) {
      continue;
    }

    // 1. Initial State & Toggle Cycle
    await ctx.test(`AUDIO-${target.id}: Sound toggle button exists and alternates between active and muted states`, async () => {
      await browser.navigate(target.file);
      await browser.sleep(300);

      // Verify button presence
      await Helpers.assertElementVisible(browser, target.selector, `Audio toggle button ${target.selector} must be visible in ${target.name}`);

      const state0 = await target.getState();

      // Click to toggle
      await browser.click(target.selector);
      await browser.sleep(150);
      const state1 = await target.getState();
      target.verifyToggled(state0, state1);

      // Click to toggle back
      await browser.click(target.selector);
      await browser.sleep(150);
      const state2 = await target.getState();
      target.verifyToggled(state1, state2);

      await Helpers.assertNoConsoleErrors(browser, `${target.id} audio toggle`);
    });

    // 2. Rapid Stress Clicking on Audio Controls (No AudioContext Crashes or Race Conditions)
    await ctx.test(`AUDIO-${target.id}: Rapid toggle stress test (10 clicks) maintains stability without console errors`, async () => {
      await browser.navigate(target.file);
      await browser.sleep(200);

      for (let i = 0; i < 10; i++) {
        await browser.click(target.selector);
        await browser.sleep(30);
      }

      await browser.sleep(200);
      await Helpers.assertNoConsoleErrors(browser, `${target.id} rapid audio stress`);
    });
  }

  return ctx.summary();
}

// Standalone execution
if (require.main === module) {
  const { BrowserSession } = require('./runner');
  (async () => {
    const browser = new BrowserSession();
    try {
      await browser.launch();
      const res = await runTests(browser);
      console.log(`\nAudio Controls Suite Result: ${res.passed}/${res.total} Passed (${res.duration}ms)`);
      process.exit(res.failed === 0 ? 0 : 1);
    } catch (err) {
      console.error(err);
      process.exit(1);
    } finally {
      await browser.close();
    }
  })();
}

module.exports = { runTests };
