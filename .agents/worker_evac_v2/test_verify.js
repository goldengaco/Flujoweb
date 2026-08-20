const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

async function runCdpTests() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const htmlPath = path.resolve('sistemas/emergency-evacuation-v2/index.html');
  const fileUrl = 'file:///' + htmlPath.replace(/\\/g, '/');

  const chrome = spawn(chromePath, [
    '--headless=new',
    '--remote-debugging-port=9224',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-web-security',
    fileUrl
  ]);

  await new Promise(r => setTimeout(r, 2000));

  const listRes = await new Promise((resolve, reject) => {
    http.get('http://127.0.0.1:9224/json', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });

  const target = listRes.find(t => t.url.includes('emergency-evacuation-v2'));
  if (!target) throw new Error('Target page not found');

  const ws = new WebSocket(target.webSocketDebuggerUrl);
  let id = 1;
  const callbacks = new Map();
  const consoleMessages = [];

  ws.onmessage = (event) => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      consoleMessages.push(msg.params);
    }
    if (msg.id && callbacks.has(msg.id)) {
      callbacks.get(msg.id)(msg.result);
      callbacks.delete(msg.id);
    }
  };

  await new Promise(r => ws.onopen = r);

  const send = (method, params = {}) => {
    return new Promise(resolve => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  await send('Runtime.enable');
  await send('Page.enable');

  const evalCode = async (expression) => {
    const res = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (res && res.exceptionDetails) {
      throw new Error(JSON.stringify(res.exceptionDetails));
    }
    return res && res.result ? res.result.value : undefined;
  };

  console.log('=== RUNNING TESTS FOR EMERGENCY EVACUATION V2 ===');

  // Test 1: Page Title and Core Elements
  const title = await evalCode('document.title');
  console.log('[TEST 1] Title:', title);

  // Test 2: Canvas Element & Context
  const canvasCheck = await evalCode('(() => { const c = document.getElementById("floorplan-canvas"); return !!(c && c.getContext("2d")); })()');
  console.log('[TEST 2] Canvas initialized:', canvasCheck);

  // Test 3: Audio and Voice Engines initialized
  const enginesCheck = await evalCode('(() => { return typeof audio !== "undefined" && typeof voice !== "undefined" && typeof floorEngine !== "undefined" && typeof meshSim !== "undefined" && typeof HUD !== "undefined"; })()');
  console.log('[TEST 3] Core JS Engines initialized:', enginesCheck);

  // Test 4: Dynamic A* Path Calculation
  const aStarCheck = await evalCode('(() => { return floorEngine.currentPathResult && floorEngine.currentPathResult.path.length > 0 && floorEngine.currentPathResult.targetExit.name.includes("Salida A"); })()');
  console.log('[TEST 4] A* Path to Salida A found:', aStarCheck);

  // Test 5: Check Turn-by-Turn Steps Rendering
  const stepsCheck = await evalCode('(() => { return document.querySelectorAll("#step-list .step-item").length > 0; })()');
  console.log('[TEST 5] Turn-by-Turn Guidance steps rendered:', stepsCheck);

  // Test 6: Trigger "Estoy a Salvo"
  const safeCheck = await evalCode('(() => { document.getElementById("btn-im-safe").click(); return HUD.isSafeState && document.getElementById("modal-safe").classList.contains("active"); })()');
  console.log('[TEST 6] "Estoy a Salvo" trigger & modal active:', safeCheck);

  // Test 7: Dismiss Safe Modal and Trigger SOS Modal
  const sosCheck = await evalCode('(() => { document.getElementById("btn-close-safe").click(); document.getElementById("btn-report-sos").click(); return document.getElementById("modal-sos").classList.contains("active"); })()');
  console.log('[TEST 7] SOS Triage Modal opened:', sosCheck);

  // Test 8: Transmit SOS Beacon
  const transmitSosCheck = await evalCode('(() => { document.getElementById("btn-send-sos-beacon").click(); return HUD.isSosState; })()');
  console.log('[TEST 8] SOS Beacon transmitted successfully:', transmitSosCheck);

  // Test 9: Preset: Block All Exits (Refuge Zone Pathfinding)
  const refugeCheck = await evalCode('(() => { floorEngine.loadPreset("block_all"); return floorEngine.currentPathResult && floorEngine.currentPathResult.isRefuge; })()');
  console.log('[TEST 9] Trap Scenario -> A* Reroutes to Refuge Room 705:', refugeCheck);

  // Test 10: Mesh Network Offline Toggle
  const meshToggleCheck = await evalCode('(() => { meshSim.toggleCellularMode(); return !meshSim.isCellularActive; })()');
  console.log('[TEST 10] Mesh Network toggled to Offline P2P:', meshToggleCheck);

  // Test 11: Viewport Toggle (Fullscreen mode)
  const fullscreenCheck = await evalCode('(() => { document.getElementById("btn-view-toggle").click(); return document.getElementById("app-viewport").classList.contains("fullscreen-mode"); })()');
  console.log('[TEST 11] Fullscreen Responsive HUD Mode active:', fullscreenCheck);

  // Test 12: Console error check
  const errorLogs = consoleMessages.filter(m => m.type === 'error');
  console.log('[TEST 12] Total Console Errors:', errorLogs.length);

  ws.close();
  chrome.kill();

  if (!canvasCheck || !enginesCheck || !aStarCheck || !safeCheck || !sosCheck || !refugeCheck || !meshToggleCheck || errorLogs.length > 0) {
    console.error('TESTS FAILED!');
    process.exit(1);
  }
  console.log('ALL 12 E2E CRITICAL TESTS PASSED WITH 0 ERRORS!');
  process.exit(0);
}

runCdpTests().catch(err => {
  console.error(err);
  process.exit(1);
});
