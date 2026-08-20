const fs = require('fs');
const path = require('path');

const files = [
  'sistemas/gcp-serverless-pipeline/index.html',
  'sistemas/gcp-event-pubsub/index.html',
  'sistemas/gcp-sql-networking/index.html',
  'sistemas/gcp-iam-security/index.html',
  'sistemas/gcp-cloudops-cockpit/index.html'
];

console.log('=== 1. Checking External Script Dependencies ===');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const scripts = content.match(/<script[^>]*src=[^>]*>/gi) || [];
  const stylesheets = (content.match(/<link[^>]*rel=["']stylesheet["'][^>]*>/gi) || [])
    .filter(link => !link.includes('fonts.googleapis.com') && !link.includes('fonts.gstatic.com'));
  console.log(`[${f}] External JS scripts: ${scripts.length}, Non-GoogleFont CSS links: ${stylesheets.length}`);
  if (scripts.length > 0) console.log('  Scripts:', scripts);
  if (stylesheets.length > 0) console.log('  CSS:', stylesheets);
});

console.log('\n=== 2. Checking Emoji & Icon Persistence ===');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  // Check if badges or node icons get replaced with tick marks
  const tickReplacements = content.match(/\.innerHTML\s*=\s*['"][^'"]*[✓✔☑][^'"]*['"]|\.textContent\s*=\s*['"][^'"]*[✓✔☑][^'"]*['"]/g) || [];
  console.log(`[${f}] Plain tick replacements: ${tickReplacements.length}`);
  if (tickReplacements.length > 0) {
    console.log('  Matches:', tickReplacements);
  }
});

console.log('\n=== 3. Checking Responsive CSS & Breakpoints ===');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  const mediaQueries = content.match(/@media[^{]+{/gi) || [];
  console.log(`[${f}] @media queries count: ${mediaQueries.length}`);
  mediaQueries.slice(0, 5).forEach(mq => console.log('  ', mq.trim()));
});

console.log('\n=== 4. Checking Functional Modules & Core APIs ===');
const apiRequirements = {
  'sistemas/gcp-serverless-pipeline/index.html': ['cloudbuild', 'artifactregistry', 'secretmanager', 'cloudkms', 'run', 'logging'],
  'sistemas/gcp-event-pubsub/index.html': ['pubsub', 'cloudscheduler', 'storage', 'fcm', 'monitoring'],
  'sistemas/gcp-sql-networking/index.html': ['servicenetworking', 'sqladmin', 'compute', 'iam', 'cloudkms'],
  'sistemas/gcp-iam-security/index.html': ['iam', 'cloudresourcemanager', 'secretmanager', 'cloudkms', 'serviceusage'],
  'sistemas/gcp-cloudops-cockpit/index.html': ['monitoring', 'logging', 'serviceusage']
};

for (const [file, apis] of Object.entries(apiRequirements)) {
  const content = fs.readFileSync(file, 'utf8').toLowerCase();
  const found = apis.filter(api => content.includes(api.toLowerCase()));
  const missing = apis.filter(api => !content.includes(api.toLowerCase()));
  console.log(`[${file}] APIs represented: ${found.join(', ')} (Missing: ${missing.length ? missing.join(', ') : 'None'})`);
}
