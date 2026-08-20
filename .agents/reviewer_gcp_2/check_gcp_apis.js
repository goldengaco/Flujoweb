const fs = require('fs');
const path = require('path');

const sistemasDir = path.resolve('c:/DevWork/Depredador/Flujoweb/sistemas');
const files = {
  'R1: Serverless Pipeline': path.join(sistemasDir, 'gcp-serverless-pipeline', 'index.html'),
  'R2: Event Pub/Sub & DLQ': path.join(sistemasDir, 'gcp-event-pubsub', 'index.html'),
  'R3: Cloud SQL HA & VPC': path.join(sistemasDir, 'gcp-sql-networking', 'index.html'),
  'R4: IAM Security & Vault': path.join(sistemasDir, 'gcp-iam-security', 'index.html'),
  'R5: CloudOps SRE Cockpit': path.join(sistemasDir, 'gcp-cloudops-cockpit', 'index.html'),
};

const apis18 = [
  'cloudbuild.googleapis.com',
  'artifactregistry.googleapis.com',
  'secretmanager.googleapis.com',
  'cloudkms.googleapis.com',
  'run.googleapis.com',
  'logging.googleapis.com',
  'pubsub.googleapis.com',
  'cloudscheduler.googleapis.com',
  'storage.googleapis.com',
  'fcm.googleapis.com',
  'monitoring.googleapis.com',
  'servicenetworking.googleapis.com',
  'sqladmin.googleapis.com',
  'compute.googleapis.com',
  'iam.googleapis.com',
  'cloudresourcemanager.googleapis.com',
  'serviceusage.googleapis.com',
  'cloudaudit.googleapis.com'
];

console.log('=== 18 GCP API CROSS-REFERENCE COVERAGE MATRIX ===\n');

const coverageMatrix = {};
apis18.forEach(api => {
  coverageMatrix[api] = [];
});

Object.entries(files).forEach(([name, filePath]) => {
  const content = fs.readFileSync(filePath, 'utf8');
  apis18.forEach(api => {
    if (content.toLowerCase().includes(api.toLowerCase())) {
      coverageMatrix[api].push(name.split(':')[0]);
    }
  });
});

console.log('| # | GCP API Endpoint | Covered In Dashboards | Status |');
console.log('|---|------------------|-----------------------|:------:|');
let coveredCount = 0;
apis18.forEach((api, i) => {
  const coveredIn = coverageMatrix[api];
  const isCovered = coveredIn.length > 0;
  if (isCovered) coveredCount++;
  console.log(`| ${i + 1} | \`${api}\` | ${coveredIn.length ? coveredIn.join(', ') : '**NONE**'} | ${isCovered ? '✅ COVERED' : '❌ MISSING'} |`);
});

console.log(`\nTotal 18 GCP APIs Covered: ${coveredCount} / ${apis18.length} (${((coveredCount/apis18.length)*100).toFixed(1)}%)`);
