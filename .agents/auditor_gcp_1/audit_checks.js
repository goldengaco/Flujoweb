const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../..');
const dashboards = [
  { name: 'R1 Serverless Pipeline', path: 'sistemas/gcp-serverless-pipeline/index.html' },
  { name: 'R2 Event PubSub DLQ', path: 'sistemas/gcp-event-pubsub/index.html' },
  { name: 'R3 Cloud SQL Networking', path: 'sistemas/gcp-sql-networking/index.html' },
  { name: 'R4 IAM Security Vault', path: 'sistemas/gcp-iam-security/index.html' },
  { name: 'R5 CloudOps Cockpit', path: 'sistemas/gcp-cloudops-cockpit/index.html' }
];

console.log('=====================================================');
console.log('=== FORENSIC INTEGRITY AUDIT: 5 GCP DASHBOARDS ===');
console.log('=====================================================\n');

// 1. Dependency Analysis
console.log('--- CHECK 1: ZERO EXTERNAL RUNTIME DEPENDENCIES (EXCEPT GOOGLE FONTS) ---');
dashboards.forEach(d => {
  const fullPath = path.join(projectRoot, d.path);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // External scripts
  const scriptSrcs = [...content.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m => m[1]);
  // External stylesheets / links
  const links = [...content.matchAll(/<link[^>]+href=["']([^"']+)["']/gi)].map(m => m[1]);
  // CSS imports
  const imports = [...content.matchAll(/@import\s+[^;]+;/gi)].map(m => m[0]);
  
  console.log(`[${d.name}]`);
  console.log(`  File size: ${content.length} bytes`);
  console.log(`  External <script src>: ${scriptSrcs.length > 0 ? scriptSrcs.join(', ') : 'NONE (PASS)'}`);
  console.log(`  <link> elements: ${links.join(' | ')}`);
  
  // Check if any link is non-google-fonts
  const invalidLinks = links.filter(l => !l.includes('fonts.googleapis.com') && !l.includes('fonts.gstatic.com'));
  if (invalidLinks.length > 0) {
    console.log(`  🔴 VIOLATION: Unauthorized external links: ${invalidLinks.join(', ')}`);
  } else {
    console.log(`  🟢 PASS: All links are Google Fonts`);
  }
  
  if (imports.length > 0) {
    console.log(`  🔴 VIOLATION: CSS @import found: ${imports.join(', ')}`);
  } else {
    console.log(`  🟢 PASS: Zero CSS @imports`);
  }
  console.log('');
});

// 2. Client-side Simulation Logic Analysis
console.log('--- CHECK 2: AUTHENTIC CLIENT-SIDE SIMULATION LOGIC ---');
dashboards.forEach(d => {
  const fullPath = path.join(projectRoot, d.path);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  console.log(`[${d.name}] Analysis:`);
  
  // Check for math/simulation functions
  const mathMatches = {
    'Math.random': (content.match(/Math\.random\(\)/g) || []).length,
    'requestAnimationFrame / setInterval': (content.match(/requestAnimationFrame|setInterval/g) || []).length,
    'Canvas 2D Context': (content.match(/getContext\(['"]2d['"]\)/g) || []).length,
    'Bezier / Spline math': (content.match(/bezier|catmull|spline|quadraticCurveTo|bezierCurveTo/gi) || []).length,
    'Poisson / Normal / Log-Normal / Exponential': (content.match(/poisson|lognormal|gaussian|boxmuller|exponential|log-normal/gi) || []).length,
    'Google SRE / Burn rate': (content.match(/burnRate|burn-rate|errorBudget|burn_rate|SEV-1|SEV-2|slo/gi) || []).length,
    'PostgreSQL lock / pg_stat_activity': (content.match(/ExclusiveLock|AccessShareLock|pg_locks|pg_stat_activity|pg_terminate_backend/gi) || []).length,
    'GCP IAM / Downscoping': (content.match(/downscop|least-privilege|excessPermissions|recommendation|roles\//gi) || []).length,
    'GCP LogEntry / JSON schema': (content.match(/LogEntry|insertId|timestamp|severity|resource\.type|httpRequest/gi) || []).length
  };
  
  for (const [key, count] of Object.entries(mathMatches)) {
    if (count > 0) {
      console.log(`  - ${key}: ${count} occurrences`);
    }
  }
  console.log('');
});

// 3. Facade & Hardcoded Output Detection
console.log('--- CHECK 3: DUMMY FACADE / HARDCODED OUTPUT SEARCH ---');
dashboards.forEach(d => {
  const fullPath = path.join(projectRoot, d.path);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Look for dummy implementations
  const emptyFunctions = content.match(/function\s+\w+\s*\([^)]*\)\s*\{\s*\}/g) || [];
  const constantReturns = content.match(/function\s+\w+\s*\([^)]*\)\s*\{\s*return\s+(true|false|null|undefined|\d+|['"][^'"]*['"]);?\s*\}/g) || [];
  const todoFixme = content.match(/\/\/\s*(TODO|FIXME|XXX|HACK|STUB|MOCK)/gi) || [];
  
  console.log(`[${d.name}]`);
  console.log(`  Empty functions: ${emptyFunctions.length > 0 ? emptyFunctions.join('; ') : '0 (CLEAN)'}`);
  console.log(`  Trivial constant return functions: ${constantReturns.length > 0 ? constantReturns.join('; ') : '0 (CLEAN)'}`);
  console.log(`  TODO/FIXME/STUB comments: ${todoFixme.length > 0 ? todoFixme.join('; ') : '0 (CLEAN)'}`);
  console.log('');
});

// 4. Luminous Icons & Permanent Emoji Verification
console.log('--- CHECK 4: PERMANENT LUMINOUS EMOJI & ICON VISIBILITY ---');
dashboards.forEach(d => {
  const fullPath = path.join(projectRoot, d.path);
  const content = fs.readFileSync(fullPath, 'utf8');
  
  // Find emojis
  const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu;
  const emojis = [...new Set(content.match(emojiRegex) || [])];
  
  // Check if checkmark or generic replacements replace emojis in state changes
  const replacesEmojiWithCheck = content.match(/\.innerHTML\s*=\s*['"][✓✔☑]/g) || [];
  
  console.log(`[${d.name}]`);
  console.log(`  Unique emojis found: ${emojis.length} (${emojis.slice(0, 15).join(' ')}...)`);
  console.log(`  Replaces emoji with plain tickmark: ${replacesEmojiWithCheck.length > 0 ? '🔴 VIOLATION' : '🟢 CLEAN (0 occurrences)'}`);
  console.log('');
});
