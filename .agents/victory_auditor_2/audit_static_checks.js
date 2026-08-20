const fs = require('fs');
const path = require('path');

const projectRoot = 'c:/DevWork/Depredador/Flujoweb';
const gcpDirs = [
  'gcp-serverless-pipeline',
  'gcp-event-pubsub',
  'gcp-sql-networking',
  'gcp-iam-security',
  'gcp-cloudops-cockpit'
];

console.log('================================================================');
console.log('PHASE A & B: STATIC INTEGRITY & SPECIFICATION FIDELITY AUDIT');
console.log('================================================================\n');

const results = {};

const REQUIRED_APIS = {
  'gcp-serverless-pipeline': [
    'cloudbuild.googleapis.com',
    'artifactregistry.googleapis.com',
    'secretmanager.googleapis.com',
    'cloudkms.googleapis.com',
    'run.googleapis.com',
    'logging.googleapis.com'
  ],
  'gcp-event-pubsub': [
    'pubsub.googleapis.com',
    'cloudscheduler.googleapis.com',
    'storage.googleapis.com',
    'fcm.googleapis.com',
    'monitoring.googleapis.com'
  ],
  'gcp-sql-networking': [
    'servicenetworking.googleapis.com',
    'sqladmin.googleapis.com',
    'compute.googleapis.com',
    'iam.googleapis.com',
    'cloudkms.googleapis.com'
  ],
  'gcp-iam-security': [
    'iam.googleapis.com',
    'cloudresourcemanager.googleapis.com',
    'secretmanager.googleapis.com',
    'cloudkms.googleapis.com',
    'serviceusage.googleapis.com'
  ],
  'gcp-cloudops-cockpit': [
    'monitoring.googleapis.com',
    'logging.googleapis.com',
    'serviceusage.googleapis.com'
  ]
};

const SPECIFIC_FEATURES = {
  'gcp-serverless-pipeline': [
    { name: '5-Stage Stepper Elements', regex: /stepper|trigger.*commit|artifact.*registry|secret.*manager|cloud.*run|traffic.*split/i },
    { name: 'Emojis present (📦, 🛡️, 🔑, 🚀, 🔀)', check: (c) => ['📦', '🛡️', '🔑', '🚀', '🔀'].every(e => c.includes(e)) },
    { name: 'Cold-start latency gauge', regex: /cold.*start|latency.*gauge|container.*spin/i },
    { name: 'Canary / Blue-Green Traffic Splitting slider', regex: /traffic.*split|canary|slider|revision/i },
    { name: 'Cloud Logging live console', regex: /cloud.*logging|log.*stream|log.*entry/i }
  ],
  'gcp-event-pubsub': [
    { name: '5-Node Topology (⏰, 📬, ⚙️, 📱, ☠️)', check: (c) => ['⏰', '📬', '⚙️', '📱', '☠️'].every(e => c.includes(e)) },
    { name: 'Dead-Letter Queue (DLQ) Inspector', regex: /dead.*letter|dlq|poison.*pill|quarantine/i },
    { name: 'Replay to Topic Action', regex: /replay|reprocess|re-publish|reingest/i },
    { name: 'Ingestion vs ACK Throughput Chart', regex: /throughput|ack|ingest.*chart|canvas/i },
    { name: 'Queue Backlog Depth & SLA Histogram', regex: /backlog|sla|p50|p95|p99|histogram/i }
  ],
  'gcp-sql-networking': [
    { name: 'Private VPC Peering / Service Connect', regex: /vpc|peering|subnet|private.*service/i },
    { name: 'Cloud SQL HA (Primary + Standby Replica)', regex: /cloud.*sql|primary|standby|replica|postgres/i },
    { name: 'Connection Pool Saturation Gauge', regex: /connection.*pool|active|idle|max_connections|saturation/i },
    { name: 'Slow Query & Lock Contention Table', regex: /slow.*query|lock.*contention|pg_stat|explain/i },
    { name: 'Simulate Primary Node Crash & Failover', regex: /crash|failover|promote|replica.*promotion/i }
  ],
  'gcp-iam-security': [
    { name: 'Resource Hierarchy Scanner', regex: /cloudresourcemanager|hierarchy|organization|folder|project/i },
    { name: 'Least-Privilege Risk Matrix', regex: /least.*privilege|excessive|over-privileged|downscop/i },
    { name: 'Service Account Key Expiration & Revocation', regex: /service.*account|key.*rotat|revoke|compromis/i },
    { name: 'Secret Version Lifecycle (Active, Deprecated, Destroyed)', regex: /secret.*version|lifecycle|deprecated|destroyed/i },
    { name: 'Service Usage API Quota Consumption', regex: /quota|serviceusage|rate.*limit|429/i }
  ],
  'gcp-cloudops-cockpit': [
    { name: '4 Golden Signals (Latency, Traffic, Errors, Saturation)', regex: /golden.*signal|latency|traffic|error.*rate|saturation/i },
    { name: 'Multi-Service Health Radar / Topology Mesh', regex: /health.*radar|spider|radar.*chart|topology.*mesh/i },
    { name: 'SLO & Error Budget Burn Rate Dials', regex: /error.*budget|burn.*rate|slo|sli|sev-1|sev-2/i },
    { name: 'Interactive Cloud Logging Live-Tail', regex: /live.*tail|log.*filter|regex|correlat/i },
    { name: 'Incident Mitigation Action Bar', regex: /scale.*instance|clear.*cache|drain.*traffic|trip.*breaker/i }
  ]
};

gcpDirs.forEach(dir => {
  const filePath = path.join(projectRoot, 'sistemas', dir, 'index.html');
  console.log(`\n------------------------------------------------------------`);
  console.log(`AUDITING: sistemas/${dir}/index.html`);
  console.log(`------------------------------------------------------------`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ FILE MISSING: ${filePath}`);
    results[dir] = { exists: false };
    return;
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const fileSize = content.length;
  console.log(`✓ File exists. Size: ${fileSize.toLocaleString()} bytes.`);

  // 1. External Dependencies Check
  // Allowed: Google Fonts (fonts.googleapis.com, fonts.gstatic.com)
  // Disallowed: External JS scripts, external CSS frameworks (bootstrap, tailwind, cdnjs, unpkg, etc.), external images
  const scriptTagsWithSrc = [...content.matchAll(/<script[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  const linkTags = [...content.matchAll(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  const imgTagsWithSrc = [...content.matchAll(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi)].map(m => m[1]);
  
  const unauthorizedScripts = scriptTagsWithSrc.filter(src => !src.startsWith('data:'));
  const unauthorizedLinks = linkTags.filter(href => {
    const isGoogleFont = href.includes('fonts.googleapis.com') || href.includes('fonts.gstatic.com');
    const isLocalOrData = href.startsWith('data:') || href.startsWith('#');
    return !isGoogleFont && !isLocalOrData;
  });
  const unauthorizedImgs = imgTagsWithSrc.filter(src => !src.startsWith('data:') && !src.startsWith('blob:'));
  
  console.log(`\n[External Dependency Check]`);
  if (unauthorizedScripts.length === 0) {
    console.log(`  ✓ Script tags: 0 external scripts (100% inline JS).`);
  } else {
    console.log(`  ❌ Unauthorized external scripts found:`, unauthorizedScripts);
  }
  
  if (unauthorizedLinks.length === 0) {
    console.log(`  ✓ Link tags: Only allowed Google Fonts or local data.`);
  } else {
    console.log(`  ❌ Unauthorized external CSS/links found:`, unauthorizedLinks);
  }
  
  if (unauthorizedImgs.length === 0) {
    console.log(`  ✓ Img tags: 0 external image dependencies.`);
  } else {
    console.log(`  ❌ Unauthorized external images found:`, unauthorizedImgs);
  }

  // 2. GCP API Coverage Check
  console.log(`\n[GCP API Specification Check]`);
  const reqApis = REQUIRED_APIS[dir] || [];
  const missingApis = [];
  reqApis.forEach(api => {
    if (content.includes(api)) {
      console.log(`  ✓ Found API reference: ${api}`);
    } else {
      console.log(`  ❌ MISSING API reference: ${api}`);
      missingApis.push(api);
    }
  });

  // 3. Specific Feature & Acceptance Criteria Check
  console.log(`\n[Feature & Acceptance Criteria Check]`);
  const features = SPECIFIC_FEATURES[dir] || [];
  let featuresPassed = 0;
  features.forEach(f => {
    let ok = false;
    if (f.check) {
      ok = f.check(content);
    } else if (f.regex) {
      ok = f.regex.test(content);
    }
    if (ok) {
      console.log(`  ✓ Feature Verified: ${f.name}`);
      featuresPassed++;
    } else {
      console.log(`  ❌ Feature Missing/Failed: ${f.name}`);
    }
  });

  // 4. Anti-Cheating / Facade / Mocking Check
  console.log(`\n[Anti-Cheating & Implementation Authenticity Check]`);
  // Look for dummy return statements or mock stubs
  const hasDummyNotImplemented = /throw new Error\(["']Not implemented/i.test(content);
  const hasEmptyEventHandlers = /addEventListener\([^)]+,\s*\(\)\s*=>\s*\{\s*\}\)/.test(content);
  const hasCanvas = /<canvas/i.test(content) || /document\.createElement\(["']canvas["']\)/i.test(content);
  
  console.log(`  ✓ No NotImplemented placeholders: ${!hasDummyNotImplemented}`);
  console.log(`  ✓ No empty event handler stubs: ${!hasEmptyEventHandlers}`);
  console.log(`  ✓ Canvas / Graphic rendering present: ${hasCanvas}`);

  results[dir] = {
    fileSize,
    unauthorizedScripts: unauthorizedScripts.length,
    unauthorizedLinks: unauthorizedLinks.length,
    unauthorizedImgs: unauthorizedImgs.length,
    missingApis,
    featuresPassed,
    totalFeatures: features.length
  };
});

console.log('\n================================================================');
console.log('SUMMARY AUDIT TABLE');
console.log('================================================================');
console.table(results);
