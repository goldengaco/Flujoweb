const fs = require('fs');

console.log('================ AUDIT OF AUDIT_NODES_DATA ================');
const sec = fs.readFileSync('sistemas/security-audit/index.html', 'utf8');
const secMatch = sec.match(/const\s+AUDIT_NODES_DATA\s*=\s*(\[[\s\S]*?\]);\s*(?:\n|\r|\/\/|\/\*|class|function|let|const)/);
if (secMatch) {
  try {
    const nodes = eval(secMatch[1]);
    console.log(`Security nodes count: ${nodes.length}`);
    nodes.forEach((n, idx) => {
      console.log(`  [Node ${idx+1}] ID: ${n.id} | Title: ${n.title} | Icon: ${n.icon} | Category: ${n.category}`);
      if (n.vulnerabilities) {
        console.log(`    Vulns: ${n.vulnerabilities.length}`);
      }
    });
  } catch (e) {
    console.log('Error parsing AUDIT_NODES_DATA:', e.message);
  }
}

console.log('\n================ AUDIT OF SERVICES_DATA ================');
const srv = fs.readFileSync('sistemas/server-status/index.html', 'utf8');
const srvMatch = srv.match(/const\s+SERVICES_DATA\s*=\s*(\[[\s\S]*?\]);\s*(?:\n|\r|\/\/|\/\*|class|function|let|const)/);
if (srvMatch) {
  try {
    const services = eval(srvMatch[1]);
    console.log(`Server services count: ${services.length}`);
    services.forEach((s, idx) => {
      console.log(`  [Service ${idx+1}] ID: ${s.id} | Name: ${s.name} | Icon: ${s.icon} | Tier: ${s.tier} | Base Latency: ${s.baseLatency}ms`);
    });
  } catch (e) {
    console.log('Error parsing SERVICES_DATA:', e.message);
  }
}

console.log('\n================ AUDIT OF CHAOS_SCENARIOS ================');
const chaosMatch = srv.match(/const\s+CHAOS_SCENARIOS\s*=\s*(\[[\s\S]*?\]);\s*(?:\n|\r|\/\/|\/\*|class|function|let|const)/);
if (chaosMatch) {
  try {
    const chaos = eval(chaosMatch[1]);
    console.log(`Chaos scenarios count: ${chaos.length}`);
    chaos.forEach((c, idx) => {
      console.log(`  [Chaos ${idx+1}] ID: ${c.id} | Name: ${c.name} | Target: ${c.targetService}`);
    });
  } catch (e) {
    console.log('Error parsing CHAOS_SCENARIOS:', e.message);
  }
}

console.log('\n================ AUDIT OF SCENARIOS & TRANSACTION PIPELINE ================');
const tx = fs.readFileSync('sistemas/transaction-flow/index.html', 'utf8');
const scnMatch = tx.match(/const\s+SCENARIOS\s*=\s*(\{[\s\S]*?\n\s*\});\s*(?:\n|\r|\/\/|\/\*|class|function|let|const)/);
if (scnMatch) {
  try {
    const scenarios = eval('(' + scnMatch[1] + ')');
    console.log(`Transaction scenarios:`, Object.keys(scenarios));
    for (const [k, v] of Object.entries(scenarios)) {
      console.log(`  Scenario [${k}]: Name: ${v.name}, Card: ${v.card}, Amount: ${v.amount}, Expected: ${v.expectedResult}`);
    }
  } catch (e) {
    console.log('Error parsing SCENARIOS:', e.message);
  }
}

// Find transaction nodes in HTML or JS
const txNodesInHtml = [...tx.matchAll(/class="[^"]*pipeline-node[^"]*"[^>]*data-node="([^"]+)"/g)];
console.log(`Transaction HTML pipeline nodes (${txNodesInHtml.length}):`, txNodesInHtml.map(m => m[1]));
