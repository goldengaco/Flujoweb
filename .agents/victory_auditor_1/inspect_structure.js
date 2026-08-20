const fs = require('fs');

const srv = fs.readFileSync('sistemas/server-status/index.html', 'utf8');
const tx = fs.readFileSync('sistemas/transaction-flow/index.html', 'utf8');
const sec = fs.readFileSync('sistemas/security-audit/index.html', 'utf8');

console.log('=== SERVER STATUS SERVICES IN CODE ===');
// Search for services array or objects
const srvServiceMatches = srv.match(/const\s+SERVICES\s*=\s*(\[[\s\S]*?\]);/);
if (srvServiceMatches) {
  console.log('Found SERVICES array:');
  try {
    // eval or parse
    const services = eval(srvServiceMatches[1]);
    console.log(services.map(s => `${s.id}: ${s.name} (${s.icon || ''})`));
  } catch (e) {
    console.log('Raw snippet:', srvServiceMatches[1].slice(0, 500));
  }
} else {
  console.log('SERVICES array not matched with regex, searching for service cards or objects...');
  const cardMatches = [...srv.matchAll(/class="[^"]*service-card[^"]*"[^>]*data-service-id="([^"]+)"/g)];
  console.log('Card data-service-ids:', cardMatches.map(m => m[1]));
}

console.log('\n=== TRANSACTION FLOW NODES IN CODE ===');
const txNodesMatches = tx.match(/const\s+PIPELINE_NODES\s*=\s*(\[[\s\S]*?\]);/) || tx.match(/const\s+NODES\s*=\s*(\[[\s\S]*?\]);/);
if (txNodesMatches) {
  try {
    const nodes = eval(txNodesMatches[1]);
    console.log(nodes.map(n => `${n.id}: ${n.name || n.title} (${n.icon || ''})`));
  } catch (e) {
    console.log('Raw snippet:', txNodesMatches[1].slice(0, 500));
  }
} else {
  const nodeMatches = [...tx.matchAll(/data-node-id="([^"]+)"/g)];
  console.log('Node IDs:', nodeMatches.map(m => m[1]));
}

console.log('\n=== SECURITY AUDIT NODES IN CODE ===');
const secNodesMatches = sec.match(/const\s+AUDIT_NODES\s*=\s*(\[[\s\S]*?\]);/) || sec.match(/const\s+NODES\s*=\s*(\[[\s\S]*?\]);/);
if (secNodesMatches) {
  try {
    const nodes = eval(secNodesMatches[1]);
    console.log(nodes.map(n => `${n.id}: ${n.name || n.title} (${n.icon || ''})`));
  } catch (e) {
    console.log('Raw snippet:', secNodesMatches[1].slice(0, 500));
  }
}
