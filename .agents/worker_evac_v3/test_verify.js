const http = require('http');
const { spawn } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const port = 9225;

const edge = spawn(edgePath, [
  '--headless',
  '--disable-gpu',
  '--remote-debugging-port=' + port,
  'file:///c:/DevWork/Depredador/Flujoweb/sistemas/emergency-evacuation-v3/index.html'
]);

setTimeout(async () => {
  try {
    const listData = await new Promise((resolve, reject) => {
      http.get('http://localhost:' + port + '/json', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(JSON.parse(data)));
      }).on('error', reject);
    });

    const target = listData.find(t => t.type === 'page');
    if (!target) throw new Error('No page target found');

    const ws = new globalThis.WebSocket(target.webSocketDebuggerUrl);

    let id = 1;
    const callbacks = new Map();
    const errors = [];

    ws.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
        errors.push(msg.params.args);
      }
      if (msg.method === 'Runtime.exceptionThrown') {
        errors.push(msg.params.exceptionDetails);
      }
      if (msg.id && callbacks.has(msg.id)) {
        callbacks.get(msg.id)(msg.result);
        callbacks.delete(msg.id);
      }
    };

    const send = (method, params = {}) => new Promise((resolve) => {
      const msgId = id++;
      callbacks.set(msgId, resolve);
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });

    await new Promise(r => ws.onopen = r);

    await send('Runtime.enable');
    await send('Page.enable');

    console.log('=== CDP TEST: EMERGENCY EVACUATION V3 ===');

    // 1. Check Initial DOM & App State
    const checkDom = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        hasApp: !!window.app,
        hasCanvas: !!document.getElementById('particle-canvas'),
        hasHistCanvas: !!document.getElementById('histogram-canvas'),
        totalPopulation: window.app.engine.totalPopulation,
        nodesCount: window.app.engine.nodes.length,
        cbState: window.app.engine.cbState
      })`,
      returnByValue: true
    });
    console.log('1. Initial DOM State:', JSON.parse(checkDom.result.value));

    // 2. Trigger Mass Broadcast Simulation
    console.log('2. Triggering Mass Fan-Out Broadcast (1.0x Speed)...');
    await send('Runtime.evaluate', {
      expression: `document.getElementById('btn-broadcast-trigger').click()`
    });

    // Wait 2.5s for fan-out processing
    await new Promise(r => setTimeout(r, 2500));

    const checkBroadcast = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        delivered: window.app.engine.totalDelivered,
        inFlight: window.app.engine.totalInFlight,
        failed: window.app.engine.totalFailed,
        deliveredLatenciesCount: window.app.engine.deliveredLatencies.length,
        p99Text: document.getElementById('stat-p99').textContent,
        p50Text: document.getElementById('stat-p50').textContent,
        slaText: document.getElementById('stat-sla-pct').textContent,
        kpiMean: document.getElementById('kpi-mean-latency').textContent
      })`,
      returnByValue: true
    });
    console.log('2. Broadcast Telemetry:', JSON.parse(checkBroadcast.result.value));

    // 3. Reset
    console.log('3. Resetting state for Chaos Test...');
    await send('Runtime.evaluate', {
      expression: `document.getElementById('btn-reset').click()`
    });
    await new Promise(r => setTimeout(r, 300));

    // 4. Inject Chaos: Kill SMS Gateway and Trigger Broadcast
    console.log('4. Ingesting Chaos: Killing SMS Gateway & Setting Speed to Ultra...');
    await send('Runtime.evaluate', {
      expression: `
        document.getElementById('btn-chaos-kill-sms').click();
        document.getElementById('select-speed').value = '10.0';
        document.getElementById('select-speed').dispatchEvent(new Event('change'));
        document.getElementById('btn-broadcast-trigger').click();
      `
    });

    await new Promise(r => setTimeout(r, 2000));

    const checkChaosResult = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        cbState: window.app.engine.cbState,
        cbErrorRate: window.app.engine.cbErrorRate,
        chaosKillSms: window.app.engine.chaosKillSms,
        totalDelivered: window.app.engine.totalDelivered,
        totalRetried: window.app.engine.totalRetried,
        totalFailed: window.app.engine.totalFailed,
        fcmDelivered: window.app.engine.channelStats[0].delivered,
        smsDelivered: window.app.engine.channelStats[1].delivered,
        smsRetried: window.app.engine.channelStats[1].retried
      })`,
      returnByValue: true
    });
    console.log('4. Chaos Failover Broadcast Result:', JSON.parse(checkChaosResult.result.value));

    console.log('5. Total Browser Console Errors:', errors.length);
    if (errors.length > 0) {
      console.error('Console errors logged:', JSON.stringify(errors, null, 2));
    }

    ws.close();
    edge.kill();
    process.exit(errors.length === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test execution failed:', err);
    edge.kill();
    process.exit(1);
  }
}, 1200);
