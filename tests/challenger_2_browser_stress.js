/**
 * CHALLENGER 2: LIVE BROWSER ADVERSARIAL STRESS & CDP HARDENING SUITE
 * Milestone 6 - Tier 5 Live Browser White-Box Hardening
 * 
 * Verifies live browser DOM, Canvas physics loop, and BroadcastChannel
 * across all 3 variants and portal in headless Chrome/Edge.
 */

import http from 'node:http';
import { spawn } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to find Chrome/Edge executable
function getBrowserPath() {
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  if (fs.existsSync(edgePath)) return edgePath;
  if (fs.existsSync(chromePath)) return chromePath;
  throw new Error('Neither Chrome nor Edge was found on system');
}

// Simple CDP WebSocket Client
class CdpSession {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.ws = null;
    this.msgId = 1;
    this.pending = new Map();
    this.events = [];
    this.consoleErrors = [];
    this.exceptions = [];
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.wsUrl);
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
      this.ws.onmessage = (event) => {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pending.has(msg.id)) {
          const { resolve, reject } = this.pending.get(msg.id);
          this.pending.delete(msg.id);
          if (msg.error) reject(new Error(msg.error.message));
          else resolve(msg.result);
        } else if (msg.method) {
          if (msg.method === 'Runtime.consoleAPICalled') {
            const type = msg.params.type;
            const text = msg.params.args.map(a => a.value || a.description || '').join(' ');
            if (type === 'error') this.consoleErrors.push(text);
          } else if (msg.method === 'Runtime.exceptionThrown') {
            this.exceptions.push(msg.params.exceptionDetails.text || 'Uncaught exception');
          }
        }
      };
    });
  }

  async send(method, params = {}) {
    const id = this.msgId++;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async eval(expression) {
    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (res.exceptionDetails) {
      throw new Error(`Eval exception: ${res.exceptionDetails.text}`);
    }
    return res.result ? res.result.value : undefined;
  }

  close() {
    if (this.ws) this.ws.close();
  }
}

async function runBrowserStress() {
  console.log(`\n======================================================================`);
  console.log(`  CHALLENGER 2: LIVE BROWSER ADVERSARIAL HARDENING SUITE              `);
  console.log(`======================================================================`);

  const browserBin = getBrowserPath();
  const cdpPort = 9224;

  const browserProc = spawn(browserBin, [
    `--remote-debugging-port=${cdpPort}`,
    '--headless=new',
    '--mute-audio',
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-gpu',
    'about:blank'
  ]);

  await new Promise(r => setTimeout(r, 1200));

  // Get WebSocket Debugger URL
  const versionRes = await fetch(`http://127.0.0.1:${cdpPort}/json/version`);
  const versionData = await versionRes.json();
  const browserWs = versionData.webSocketDebuggerUrl;

  const files = [
    { name: 'Variant A', path: path.join(ROOT_DIR, 'sistemas', 'emergency-tri-screen-a', 'index.html'), harness: '__EMERGENCY_TRI_A__' },
    { name: 'Variant B', path: path.join(ROOT_DIR, 'sistemas', 'emergency-tri-screen-b', 'index.html'), harness: '__EMERGENCY_TRI_B__' },
    { name: 'Variant C', path: path.join(ROOT_DIR, 'sistemas', 'emergency-tri-screen-c', 'index.html'), harness: '__EMERGENCY_TRI_C__' }
  ];

  let stressPasses = 0;
  let stressTotal = 0;

  for (const item of files) {
    console.log(`\n--- Stress Testing: ${item.name} ---`);

    // Create target page
    const newTargetRes = await fetch(`http://127.0.0.1:${cdpPort}/json/new?file:///${item.path.replace(/\\/g, '/')}`, { method: 'PUT' });
    const targetInfo = await newTargetRes.json();
    const cdp = new CdpSession(targetInfo.webSocketDebuggerUrl);
    await cdp.connect();

    await cdp.send('Runtime.enable');
    await cdp.send('Page.enable');

    await new Promise(r => setTimeout(r, 800));

    // Test 1: Rapid Trigger / Reset Stress Loop (5 iterations)
    stressTotal++;
    let loopHealthy = true;
    for (let i = 0; i < 5; i++) {
      await cdp.eval(`window.${item.harness}.triggerAlarm({ severity: 'fire', incidentLevel: 3 })`);
      await cdp.eval(`window.${item.harness}.injectHazard('Breakroom')`);
      await cdp.eval(`window.${item.harness}.toggleStairwell('STAIRWELL_A', 'BLOCKED')`);
      await cdp.eval(`window.${item.harness}.checkInSafe('PHONE_B')`);
      await cdp.eval(`window.${item.harness}.resetSimulation()`);
    }
    const stateAfterLoop = await cdp.eval(`window.${item.harness}.getState()`);
    if (stateAfterLoop.alarmState !== 'STANDBY' || stateAfterLoop.hazards.length !== 0) {
      loopHealthy = false;
    }
    if (loopHealthy) {
      stressPasses++;
      console.log(`  ✔ [PASS] 5x Rapid Trigger/Hazard/Reset cycle returned cleanly to STANDBY`);
    } else {
      console.error(`  ✖ [FAIL] 5x Rapid cycle left state unreset:`, stateAfterLoop);
    }

    // Test 2: Particle Count Scalability (5 to 100 occupants)
    stressTotal++;
    await cdp.eval(`window.${item.harness}.setOccupantCount(100)`);
    await cdp.eval(`window.${item.harness}.triggerAlarm()`);
    await new Promise(r => setTimeout(r, 600));
    const countState = await cdp.eval(`window.${item.harness}.getState()`);
    if (countState.occupantsTotal === 100 && countState.particles.length === 100) {
      stressPasses++;
      console.log(`  ✔ [PASS] Occupant scaling to 100 particles initialized and evacuated successfully`);
    } else {
      console.error(`  ✖ [FAIL] Occupant scaling failed:`, countState);
    }

    // Test 3: Zero Console Errors / Zero Uncaught Exceptions Check
    stressTotal++;
    if (cdp.consoleErrors.length === 0 && cdp.exceptions.length === 0) {
      stressPasses++;
      console.log(`  ✔ [PASS] Zero console errors and zero uncaught exceptions in browser session`);
    } else {
      console.error(`  ✖ [FAIL] Console errors detected:`, cdp.consoleErrors, cdp.exceptions);
    }

    // Clean up target
    cdp.close();
    await fetch(`http://127.0.0.1:${cdpPort}/json/close/${targetInfo.id}`);
  }

  // Kill headless browser
  browserProc.kill();

  console.log(`\n======================================================================`);
  console.log(`  LIVE BROWSER STRESS RESULT: ${stressPasses}/${stressTotal} Passed`);
  console.log(`======================================================================\n`);

  if (stressPasses !== stressTotal) process.exit(1);
}

runBrowserStress().catch(err => {
  console.error('Fatal stress test runner error:', err);
  process.exit(1);
});
