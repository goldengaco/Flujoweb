/**
 * Independent Forensic Integrity & Anti-Cheating Analyzer
 * Victory Auditor Execution
 */

const fs = require('fs');
const path = require('path');

const files = {
  security: path.resolve(__dirname, '../../sistemas/security-audit/index.html'),
  server: path.resolve(__dirname, '../../sistemas/server-status/index.html'),
  transaction: path.resolve(__dirname, '../../sistemas/transaction-flow/index.html')
};

const report = {
  timestamp: new Date().toISOString(),
  filesChecked: {},
  integrityViolations: [],
  featureVerifications: {}
};

console.log('=== RUNNING INDEPENDENT FORENSIC INTEGRITY AUDIT ===\n');

for (const [key, filePath] of Object.entries(files)) {
  console.log(`[FILE] Inspecting ${key}: ${filePath}`);
  if (!fs.existsSync(filePath)) {
    report.integrityViolations.push(`File missing: ${filePath}`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  const fileSize = Buffer.byteLength(content, 'utf8');
  const lineCount = content.split('\n').length;

  console.log(`  Size: ${fileSize} bytes, Lines: ${lineCount}`);

  // 1. External scripts/CDNs
  const externalScripts = (content.match(/<script\s+[^>]*src=["'](?!(?:data:))[^"']+["']/gi) || []);
  console.log(`  External <script src>: ${externalScripts.length}`);
  if (externalScripts.length > 0) {
    report.integrityViolations.push(`[${key}] External scripts detected: ${externalScripts.join(', ')}`);
  }

  // 2. Network bypasses / Remote APIs
  const remoteFetch = (content.match(/fetch\s*\(\s*['"`]http/gi) || []);
  const remoteXHR = (content.match(/xhr\.open\s*\(\s*['"`][A-Z]+['"`]\s*,\s*['"`]http/gi) || []);
  const remoteWS = (content.match(/new\s+WebSocket\s*\(\s*['"`]wss?:/gi) || []);
  
  if (remoteFetch.length > 0 || remoteXHR.length > 0 || remoteWS.length > 0) {
    report.integrityViolations.push(`[${key}] Remote network dependencies detected`);
  }

  // 3. Test detection bypasses
  const testBypasses = (content.match(/window\.__TEST__|navigator\.webdriver|process\.env\.NODE_ENV === ['"]test['"]/gi) || []);
  if (testBypasses.length > 0) {
    report.integrityViolations.push(`[${key}] Test bypass flags detected: ${testBypasses.join(', ')}`);
  }

  // 4. Facade / Dummy returns
  const dummyFuncs = (content.match(/function\s+\w+\s*\([^)]*\)\s*\{\s*return\s+(?:true|false|0|null|undefined|""|\[\]|\{\})\s*;\s*\}/g) || []);
  console.log(`  Dummy/facade functions: ${dummyFuncs.length}`);
  if (dummyFuncs.length > 0) {
    console.log('    Dummy functions found:', dummyFuncs);
  }

  report.filesChecked[key] = {
    path: filePath,
    size: fileSize,
    lines: lineCount,
    externalScripts: externalScripts.length,
    dummyFunctions: dummyFuncs.length
  };
}

console.log('\n=== CHECKING DETAILED DOMAIN LOGIC & ALGORITHMS ===');

// Check Security Audit Requirements
const secContent = fs.readFileSync(files.security, 'utf8');
const secChecks = {
  has7Nodes: [
    'SSL / TLS 1.3',
    'HTTP Security Headers',
    'CORS & Origin Security',
    'SQL Injection',
    'Cross-Site Scripting',
    'Session & JWT Integrity',
    'RBAC & Endpoint Access'
  ].every(n => secContent.includes(n) || secContent.toLowerCase().includes(n.toLowerCase())),
  hasCircularSvgGauge: secContent.includes('<svg') && (secContent.includes('stroke-dashoffset') || secContent.includes('strokeDashoffset')),
  hasDrawerController: secContent.includes('drawer') || secContent.includes('Drawer'),
  hasVulnerabilityTable: secContent.includes('<table') || secContent.includes('vuln-table') || secContent.includes('vuln-row') || secContent.includes('vulnerability'),
  hasSeverityFilters: ['critical', 'high', 'medium', 'low', 'passed'].filter(s => secContent.toLowerCase().includes(s)).length >= 4,
  hasPatchSimulate: secContent.includes('Fix') || secContent.includes('patch') || secContent.includes('Patch') || secContent.includes('Simulate'),
  hasReportExport: secContent.includes('Export') || secContent.includes('export') || secContent.includes('JSON') || secContent.includes('download')
};
console.log('Security Audit Checklist:', secChecks);
report.featureVerifications.security = secChecks;

// Check Server Status Requirements
const srvContent = fs.readFileSync(files.server, 'utf8');
const srvChecks = {
  has9Services: [
    'API Gateway',
    'Core Web Engine',
    'Primary Database',
    'Auth',
    'Payment Service',
    'Global CDN',
    'Transactional Mailer',
    'Object Storage',
    'Redis Cluster'
  ].every(s => srvContent.includes(s) || srvContent.toLowerCase().includes(s.toLowerCase())),
  hasSparklines: srvContent.includes('<canvas') || srvContent.includes('sparkline') || srvContent.includes('Sparkline'),
  has90DaySlaBar: srvContent.includes('90') && (srvContent.includes('sla') || srvContent.includes('uptime') || srvContent.includes('matrix')),
  hasCpuMemErrTelemetry: ['cpu', 'memory', 'error'].every(m => srvContent.toLowerCase().includes(m)),
  hasChaosInjection: srvContent.includes('chaos') || srvContent.includes('Chaos') || srvContent.includes('Outage') || srvContent.includes('exhaustion'),
  hasAutoHealing: srvContent.includes('heal') || srvContent.includes('Heal') || srvContent.includes('recover') || srvContent.includes('reroute') || srvContent.includes('failover'),
  hasTerminalConsole: srvContent.includes('terminal') || srvContent.includes('Terminal') || srvContent.includes('console') || srvContent.includes('log')
};
console.log('Server Status Checklist:', srvChecks);
report.featureVerifications.server = srvChecks;

// Check Transaction Flow Requirements
const txContent = fs.readFileSync(files.transaction, 'utf8');
const txChecks = {
  has6Nodes: [
    'Order Capture',
    'Tokenization',
    'Fraud ML',
    '3D-Secure',
    'Clearing Network',
    'Settlement'
  ].every(n => txContent.includes(n) || txContent.toLowerCase().includes(n.toLowerCase())),
  hasFraudBifurcation: (txContent.includes('85') || txContent.includes('fraud') || txContent.includes('Fraud')) && txContent.includes('bifurcat'),
  hasDeclineBifurcation: txContent.includes('decline') || txContent.includes('Decline') || txContent.includes('funds') || txContent.includes('Funds') || txContent.includes('51'),
  hasScenarioSelector: ['Success', 'Fraud', 'Funds', 'Timeout'].filter(s => txContent.toLowerCase().includes(s.toLowerCase())).length >= 3,
  has30sTtlTimer: txContent.includes('30') && (txContent.includes('ttl') || txContent.includes('TTL') || txContent.includes('countdown') || txContent.includes('Timer')),
  hasReversalFlow: txContent.includes('Revers') || txContent.includes('revers') || txContent.includes('rollback') || txContent.includes('Rollback'),
  hasPayloadInspector: txContent.includes('8583') || txContent.includes('ISO') || txContent.includes('payload') || txContent.includes('Payload') || txContent.includes('json')
};
console.log('Transaction Flow Checklist:', txChecks);
report.featureVerifications.transaction = txChecks;

// Check Icon Persistence (Emojis & icons remaining visible across all states)
const iconChecks = {
  secHasIconsInNodes: /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(secContent),
  srvHasIconsInNodes: /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(srvContent),
  txHasIconsInNodes: /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(txContent)
};
console.log('Icon Presence Check:', iconChecks);

fs.writeFileSync(path.resolve(__dirname, 'forensic_report.json'), JSON.stringify(report, null, 2));
console.log('\nForensic Check Complete. Violations:', report.integrityViolations.length);
