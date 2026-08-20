const fs = require('fs');
const path = require('path');

const sistemasDir = path.resolve('c:/DevWork/Depredador/Flujoweb/sistemas');
const dashboards = [
  { id: 'R1', name: 'Serverless Pipeline', file: path.join(sistemasDir, 'gcp-serverless-pipeline', 'index.html'), expectedApis: ['cloudbuild.googleapis.com', 'artifactregistry.googleapis.com', 'secretmanager.googleapis.com', 'cloudkms.googleapis.com', 'run.googleapis.com', 'logging.googleapis.com'] },
  { id: 'R2', name: 'Event Pub/Sub & DLQ', file: path.join(sistemasDir, 'gcp-event-pubsub', 'index.html'), expectedApis: ['pubsub.googleapis.com', 'cloudscheduler.googleapis.com', 'storage.googleapis.com', 'fcm.googleapis.com', 'monitoring.googleapis.com'] },
  { id: 'R3', name: 'Cloud SQL HA & VPC', file: path.join(sistemasDir, 'gcp-sql-networking', 'index.html'), expectedApis: ['servicenetworking.googleapis.com', 'sqladmin.googleapis.com', 'compute.googleapis.com', 'iam.googleapis.com', 'cloudkms.googleapis.com'] },
  { id: 'R4', name: 'IAM Security & Secret Vault', file: path.join(sistemasDir, 'gcp-iam-security', 'index.html'), expectedApis: ['iam.googleapis.com', 'cloudresourcemanager.googleapis.com', 'secretmanager.googleapis.com', 'cloudkms.googleapis.com', 'serviceusage.googleapis.com'] },
  { id: 'R5', name: 'Unified CloudOps SRE Cockpit', file: path.join(sistemasDir, 'gcp-cloudops-cockpit', 'index.html'), expectedApis: ['monitoring.googleapis.com', 'logging.googleapis.com', 'serviceusage.googleapis.com'] },
];

const auditResults = {
  dashboards: {},
  integrityViolations: [],
  adversarialFindings: [],
  summary: { totalPassed: 0, totalWarnings: 0, totalErrors: 0 }
};

dashboards.forEach(d => {
  const content = fs.readFileSync(d.file, 'utf8');
  const dRes = {
    name: d.name,
    file: d.file,
    sizeKb: (fs.statSync(d.file).size / 1024).toFixed(2),
    lines: content.split('\n').length,
    apisFound: [],
    missingApis: [],
    canvasCheck: { present: false, rafLoop: false, dprScaling: false },
    stateMachineCheck: { stateObj: false, transitions: false, errorHandling: false },
    domControls: { buttons: 0, inputs: 0, sliders: 0, modals: 0 },
    cssResponsive: { hasMediaQueries: false, mobile400: false, tablet768: false, uhd4k: false },
    integrityIssues: []
  };

  // API Verification
  d.expectedApis.forEach(api => {
    if (content.toLowerCase().includes(api.toLowerCase())) {
      dRes.apisFound.push(api);
    } else {
      dRes.missingApis.push(api);
    }
  });

  // Canvas & Animation Loop Check
  dRes.canvasCheck.present = content.includes('<canvas');
  dRes.canvasCheck.rafLoop = content.includes('requestAnimationFrame');
  dRes.canvasCheck.dprScaling = content.includes('devicePixelRatio') || content.includes('dpr');

  // State Machine Verification
  dRes.stateMachineCheck.stateObj = /const state\s*=|let state\s*=|var state\s*=|state\s*:\s*\{/i.test(content);
  dRes.stateMachineCheck.transitions = /function\s+transition|setState|setStatus|updateState|dispatch/i.test(content) || /function\s+runStep|runPipeline|triggerChaos|failover/i.test(content);
  dRes.stateMachineCheck.errorHandling = /catch\s*\(|try\s*\{|onError|handleError|recover/i.test(content);

  // DOM Controls
  dRes.domControls.buttons = (content.match(/<button/gi) || []).length;
  dRes.domControls.inputs = (content.match(/<input/gi) || []).length;
  dRes.domControls.sliders = (content.match(/type=["']range["']/gi) || []).length;
  dRes.domControls.modals = (content.match(/modal|drawer|dialog|overlay/gi) || []).length;

  // Responsive CSS
  dRes.cssResponsive.hasMediaQueries = content.includes('@media');
  dRes.cssResponsive.mobile400 = /max-width:\s*(4\d\d|5\d\d|6\d\d)px/i.test(content) || /min-width:\s*(4\d\d|5\d\d)px/i.test(content);
  dRes.cssResponsive.tablet768 = /max-width:\s*(7\d\d|8\d\d|9\d\d|10\d\d)px/i.test(content) || /min-width:\s*(7\d\d|8\d\d)px/i.test(content);
  dRes.cssResponsive.uhd4k = /min-width:\s*(18\d\d|19\d\d|2\d\d\d|3\d\d\d)px/i.test(content) || /2560px|3840px/i.test(content);

  // Check for dummy facade / integrity violations
  if (content.includes('// TODO: implement') || content.includes('// Dummy facade')) {
    dRes.integrityIssues.push('Found TODO / Dummy comments');
    auditResults.integrityViolations.push(`${d.name}: Contains TODO / Dummy facade comment`);
  }

  // Check if emoji status icons are present and permanent
  const emojiCheck = /[\u{1F300}-\u{1FAFF}]/u.test(content);
  dRes.hasLuminousEmojis = emojiCheck;

  auditResults.dashboards[d.id] = dRes;
});

console.log(JSON.stringify(auditResults, null, 2));
