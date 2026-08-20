const fs = require('fs');
const path = require('path');

const systems = [
  'gcp-iam-security',
  'gcp-cloudops-cockpit',
  'mulesoft-observability',
  'apigee-mulesoft-hybrid',
  'emergency-evacuation-v1',
  'emergency-evacuation-v2',
  'emergency-evacuation-v3'
];

systems.forEach(sys => {
  const filePath = path.join(__dirname, '..', '..', 'sistemas', sys, 'index.html');
  const content = fs.readFileSync(filePath, 'utf8');
  console.log(`\n========================================\nSYSTEM: ${sys}\n========================================`);

  // Find all z-index occurrences with line numbers
  const lines = content.split('\n');
  lines.forEach((line, idx) => {
    if (line.includes('z-index')) {
      console.log(`  Line ${idx + 1}: ${line.trim()}`);
    }
  });

  // Find all clamp occurrences with line numbers
  console.log(`  --- Clamp font-size lines ---`);
  lines.forEach((line, idx) => {
    if (line.includes('clamp(')) {
      console.log(`  Line ${idx + 1}: ${line.trim()}`);
    }
  });
});
