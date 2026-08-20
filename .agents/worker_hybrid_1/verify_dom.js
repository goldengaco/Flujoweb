const fs = require('fs');
const path = require('path');

const htmlPath = path.resolve(__dirname, '../../sistemas/apigee-mulesoft-hybrid/index.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const requiredIds = [
  'packetCanvas',
  'btnRunE2E',
  'btnToggleCache',
  'btnInjectSpike',
  'btnExpireToken',
  'btnInjectWAF',
  'btnInjectLag',
  'btnScaleWorkers',
  'btnMuteAudio',
  'corrIdDisplay',
  'e2eLatencyDisplay',
  'cacheStatusBadge',
  'circuitStatusBadge',
  'vcoreGaugeVal',
  'heapGaugeVal',
  'gcPauseGaugeVal',
  'osHitGaugeVal',
  'waterfallBarApigee',
  'waterfallBarMule',
  'waterfallBarAWS',
  'waterfallBarGCP',
  'waterfallBarSAP',
  'logList',
  'dwCode'
];

let missing = [];
requiredIds.forEach(id => {
  const regex = new RegExp(`id=["']${id}["']`);
  if (!regex.test(html)) {
    missing.push(id);
  }
});

if (missing.length === 0) {
  console.log('DOM CONTRACT CHECK PASSED: All 24 required IDs are present in index.html!');
} else {
  console.error('DOM CONTRACT CHECK FAILED! Missing IDs:', missing);
  process.exit(1);
}
