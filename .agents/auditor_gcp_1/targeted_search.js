const fs = require('fs');
const path = require('path');
const projectRoot = path.resolve(__dirname, '../..');

function searchInFile(relPath, query, contextLines = 20) {
  const content = fs.readFileSync(path.join(projectRoot, relPath), 'utf8');
  const lines = content.split('\n');
  console.log(`\n======================================================`);
  console.log(`SEARCH IN ${relPath} FOR "${query}"`);
  console.log(`======================================================`);
  
  let matchCount = 0;
  lines.forEach((line, idx) => {
    if (line.toLowerCase().includes(query.toLowerCase())) {
      matchCount++;
      console.log(`--- Match #${matchCount} at Line ${idx+1}: ---`);
      const start = Math.max(0, idx - 2);
      const end = Math.min(lines.length, idx + contextLines);
      for (let i = start; i < end; i++) {
        console.log(`${i+1}: ${lines[i]}`);
      }
    }
  });
  if (matchCount === 0) {
    console.log('No matches found.');
  }
}

// Check R1: Particle & Canvas & Stepper
searchInFile('sistemas/gcp-serverless-pipeline/index.html', 'class Particle', 30);
searchInFile('sistemas/gcp-serverless-pipeline/index.html', 'trafficSplit', 20);

// Check R2: Poisson & Log-normal & Catmull-Rom & DLQ
searchInFile('sistemas/gcp-event-pubsub/index.html', 'drawCatmullRom', 30);
searchInFile('sistemas/gcp-event-pubsub/index.html', 'crc32', 25);
searchInFile('sistemas/gcp-event-pubsub/index.html', 'histogram', 25);
searchInFile('sistemas/gcp-event-pubsub/index.html', 'replayToTopic', 25);

// Check R3: Topology & Failover & Lock Table
searchInFile('sistemas/gcp-sql-networking/index.html', 'TopologyEngine', 35);
searchInFile('sistemas/gcp-sql-networking/index.html', 'simulateCrash', 35);
searchInFile('sistemas/gcp-sql-networking/index.html', 'renderLocks', 30);

// Check R4: Least-Privilege & SA Keys & Secrets
searchInFile('sistemas/gcp-iam-security/index.html', 'downscope', 30);
searchInFile('sistemas/gcp-iam-security/index.html', 'recalculateScore', 30);

// Check R5: Golden Signals & Burn Rate & Radar
searchInFile('sistemas/gcp-cloudops-cockpit/index.html', 'updateTelemetryStep', 40);
searchInFile('sistemas/gcp-cloudops-cockpit/index.html', 'drawRadar', 30);
searchInFile('sistemas/gcp-cloudops-cockpit/index.html', 'drawMesh', 30);
