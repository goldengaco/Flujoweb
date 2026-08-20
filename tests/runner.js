/**
 * CDP Headless Browser Test Runner Engine
 * Zero external dependencies — uses Node 24 native WebSocket and fetch to drive Chrome/Edge via DevTools Protocol.
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const url = require('url');

class BrowserSession {
  constructor(options = {}) {
    this.port = options.port || (9222 + Math.floor(Math.random() * 500));
    this.browserProcess = null;
    this.ws = null;
    this.msgId = 1;
    this.pendingCallbacks = new Map();
    this.consoleLogs = [];
    this.consoleErrors = [];
    this.uncaughtExceptions = [];
    this.pageTargetId = null;
    this.browserType = options.browser || 'auto';
  }

  findBrowserPath() {
    const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    if (this.browserType === 'chrome' && fs.existsSync(chromePath)) return chromePath;
    if (this.browserType === 'edge' && fs.existsSync(edgePath)) return edgePath;
    if (fs.existsSync(chromePath)) return chromePath;
    if (fs.existsSync(edgePath)) return edgePath;
    throw new Error('Neither Google Chrome nor Microsoft Edge was found on this system.');
  }

  async launch() {
    const browserExe = this.findBrowserPath();
    const args = [
      '--headless=new',
      `--remote-debugging-port=${this.port}`,
      '--disable-gpu',
      '--no-sandbox',
      '--disable-extensions',
      '--disable-default-apps',
      '--disable-background-networking',
      '--disable-sync',
      '--disable-translate',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
      '--safebrowsing-disable-auto-update',
      '--allow-file-access-from-files',
      'about:blank'
    ];

    this.browserProcess = spawn(browserExe, args, { stdio: 'ignore' });

    // Wait for CDP port to be active
    let connected = false;
    for (let i = 0; i < 40; i++) {
      try {
        const res = await fetch(`http://127.0.0.1:${this.port}/json/version`);
        if (res.ok) {
          connected = true;
          break;
        }
      } catch (e) {
        await new Promise(r => setTimeout(r, 100));
      }
    }

    if (!connected) {
      this.close();
      throw new Error(`Failed to connect to browser CDP port ${this.port} after launch`);
    }

    // Get list of targets and pick page target
    const listRes = await fetch(`http://127.0.0.1:${this.port}/json/list`);
    const targets = await listRes.json();
    const pageTarget = targets.find(t => t.type === 'page') || targets[0];
    if (!pageTarget || !pageTarget.webSocketDebuggerUrl) {
      throw new Error('No page WebSocket target found');
    }

    this.pageTargetId = pageTarget.id;
    this.ws = new WebSocket(pageTarget.webSocketDebuggerUrl);

    await new Promise((resolve, reject) => {
      this.ws.onopen = () => resolve();
      this.ws.onerror = (err) => reject(err);
    });

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.id && this.pendingCallbacks.has(msg.id)) {
          const { resolve, reject } = this.pendingCallbacks.get(msg.id);
          this.pendingCallbacks.delete(msg.id);
          if (msg.error) {
            reject(new Error(msg.error.message || JSON.stringify(msg.error)));
          } else {
            resolve(msg.result);
          }
        } else if (msg.method) {
          this.handleEvent(msg.method, msg.params);
        }
      } catch (err) {
        console.error('Error parsing CDP message:', err);
      }
    };

    // Enable domains
    await this.send('Page.enable');
    await this.send('Runtime.enable');
    await this.send('DOM.enable');
    await this.send('CSS.enable');

    // Default desktop viewport
    await this.setViewport(1440, 900);
  }

  handleEvent(method, params) {
    if (method === 'Runtime.consoleAPICalled') {
      const type = params.type;
      const text = params.args.map(a => a.value !== undefined ? String(a.value) : (a.description || '')).join(' ');
      this.consoleLogs.push({ type, text, timestamp: Date.now() });
      if (type === 'error') {
        this.consoleErrors.push({ text, timestamp: Date.now() });
      }
    } else if (method === 'Runtime.exceptionThrown') {
      const details = params.exceptionDetails;
      const text = details.text + (details.exception ? ' ' + (details.exception.description || details.exception.value) : '');
      this.uncaughtExceptions.push({ text, url: details.url, line: details.lineNumber, col: details.columnNumber });
      this.consoleErrors.push({ text, timestamp: Date.now() });
    }
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = this.msgId++;
      this.pendingCallbacks.set(id, { resolve, reject });
      const payload = JSON.stringify({ id, method, params });
      this.ws.send(payload);
    });
  }

  async navigate(filePathOrUrl) {
    this.clearLogs();
    let targetUrl = filePathOrUrl;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://') && !targetUrl.startsWith('file://')) {
      targetUrl = url.pathToFileURL(path.resolve(filePathOrUrl)).href;
    }

    await this.send('Page.navigate', { url: targetUrl });
    await this.waitForLoad();
    
    // Inject mock clipboard to prevent headless focus permission exceptions
    await this.evaluate(() => {
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        navigator.clipboard = {
          writeText: async () => true,
          readText: async () => ''
        };
      } else {
        const origWrite = navigator.clipboard.writeText.bind(navigator.clipboard);
        navigator.clipboard.writeText = async (text) => {
          try {
            return await origWrite(text);
          } catch (e) {
            return true;
          }
        };
      }
    });

    await this.sleep(300);
  }

  async waitForLoad(timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const readyState = await this.evaluate(() => document.readyState);
      if (readyState === 'complete' || readyState === 'interactive') {
        return;
      }
      await this.sleep(100);
    }
  }

  async setViewport(width, height, deviceScaleFactor = 1, isMobile = false) {
    await this.send('Emulation.setDeviceMetricsOverride', {
      width,
      height,
      deviceScaleFactor,
      mobile: isMobile
    });
  }

  async evaluate(fnOrString, ...args) {
    let expression;
    if (typeof fnOrString === 'function') {
      const serializedArgs = JSON.stringify(args);
      expression = `(${fnOrString.toString()})(...${serializedArgs})`;
    } else {
      expression = fnOrString;
    }

    const res = await this.send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true
    });

    if (res.exceptionDetails) {
      throw new Error(res.exceptionDetails.exception?.description || res.exceptionDetails.text);
    }

    return res.result?.value;
  }

  async click(selector) {
    const exists = await this.evaluate((sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      el.click();
      return true;
    }, selector);

    if (!exists) {
      throw new Error(`Element not found for click: ${selector}`);
    }
    await this.sleep(100);
  }

  async type(selector, text) {
    const success = await this.evaluate((sel, val) => {
      const el = document.querySelector(sel);
      if (!el) return false;
      el.value = val;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      return true;
    }, selector, text);

    if (!success) {
      throw new Error(`Element not found for typing: ${selector}`);
    }
  }

  async waitForSelector(selector, timeoutMs = 5000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const found = await this.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el !== null && el.offsetParent !== null;
      }, selector);
      if (found) return true;
      await this.sleep(100);
    }
    throw new Error(`Timeout waiting for selector: ${selector} (${timeoutMs}ms)`);
  }

  async waitForFunction(predicateFn, timeoutMs = 10000, ...args) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const res = await this.evaluate(predicateFn, ...args);
        if (res) return res;
      } catch (e) {
        // ignore intermediate errors
      }
      await this.sleep(100);
    }
    throw new Error(`Timeout waiting for predicate function (${timeoutMs}ms)`);
  }

  async getText(selector) {
    return await this.evaluate((sel) => {
      const el = document.querySelector(sel);
      return el ? (el.innerText || el.textContent || '').trim() : null;
    }, selector);
  }

  async getAttribute(selector, attr) {
    return await this.evaluate((sel, a) => {
      const el = document.querySelector(sel);
      return el ? el.getAttribute(a) : null;
    }, selector, attr);
  }

  async getComputedStyle(selector, prop) {
    return await this.evaluate((sel, p) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const s = window.getComputedStyle(el);
      return s ? s.getPropertyValue(p) : null;
    }, selector, prop);
  }

  getConsoleErrors() {
    return [...this.consoleErrors, ...this.uncaughtExceptions.map(e => ({ text: e.text }))];
  }

  getConsoleLogs() {
    return [...this.consoleLogs];
  }

  clearLogs() {
    this.consoleLogs = [];
    this.consoleErrors = [];
    this.uncaughtExceptions = [];
  }

  sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  async close() {
    if (this.ws) {
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
    if (this.browserProcess) {
      try {
        this.browserProcess.kill();
      } catch (e) {}
      this.browserProcess = null;
    }
    await this.sleep(100);
  }
}

module.exports = {
  BrowserSession
};
