const path = require('path');
const { BrowserSession } = require('./tests/runner');

async function testAudio() {
  const browser = new BrowserSession();
  await browser.launch();
  
  const dashboards = [
    {
      id: 'emergency-evacuation-v2',
      file: 'sistemas/emergency-evacuation-v2/index.html',
      selector: '#btn-siren-toggle',
      check: async () => {
        const icon = await browser.getText('#siren-icon');
        return icon;
      }
    },
    {
      id: 'server-status',
      file: 'sistemas/server-status/index.html',
      selector: '#audioToggleBtn',
      check: async () => {
        const icon = await browser.getText('#audioIcon');
        return icon;
      }
    },
    {
      id: 'apigee-mulesoft-hybrid',
      file: 'sistemas/apigee-mulesoft-hybrid/index.html',
      selector: '#btnMuteAudio',
      check: async () => {
        const icon = await browser.getText('#muteIcon');
        const text = await browser.getText('#muteText');
        return `${icon} ${text}`;
      }
    },
    {
      id: 'emergency-evacuation-v1',
      file: 'sistemas/emergency-evacuation-v1/index.html',
      selector: '#btn-toggle-sound',
      check: async () => {
        const text = await browser.getText('#btn-toggle-sound');
        return text;
      }
    },
    {
      id: 'emergency-evacuation-v3',
      file: 'sistemas/emergency-evacuation-v3/index.html',
      selector: '#btn-audio-toggle',
      check: async () => {
        const text = await browser.getText('#btn-audio-toggle');
        return text;
      }
    },
    {
      id: 'gcp-sql-networking',
      file: 'sistemas/gcp-sql-networking/index.html',
      selector: '#btnSoundToggle',
      check: async () => {
        const icon = await browser.getText('#soundIcon');
        const label = await browser.getText('#soundLabel');
        return `${icon} ${label}`;
      }
    },
    {
      id: 'gcp-iam-security',
      file: 'sistemas/gcp-iam-security/index.html',
      selector: '#audioToggleBtn',
      check: async () => {
        const icon = await browser.getText('#audioIcon');
        return icon;
      }
    }
  ];

  for (const d of dashboards) {
    const fullPath = path.resolve(__dirname, d.file);
    await browser.navigate(fullPath);
    await browser.sleep(300);
    
    const before = await d.check();
    await browser.click(d.selector);
    await browser.sleep(200);
    const after = await d.check();
    await browser.click(d.selector);
    await browser.sleep(200);
    const afterSecond = await d.check();
    
    console.log(`[${d.id}] Initial: "${before}" -> Click 1: "${after}" -> Click 2: "${afterSecond}"`);
  }

  await browser.close();
}

testAudio().catch(console.error);
