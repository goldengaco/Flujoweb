const fs = require('fs');

console.log('=== DIAGNOSTICS ===');

// 1. Security Audit nodes
const secHtml = fs.readFileSync('sistemas/security-audit/index.html', 'utf8');
const secNodes = secHtml.match(/<div[^>]*class="[^"]*stepper-node[^"]*"[^>]*>/g) || [];
console.log('Security Stepper Nodes (' + secNodes.length + '):');
secNodes.forEach(n => console.log(' ', n));

// 2. Server Status Chaos
const srvHtml = fs.readFileSync('sistemas/server-status/index.html', 'utf8');
const srvChaosBtns = srvHtml.match(/<button[^>]*chaos[^>]*>[\s\S]*?<\/button>/gi) || [];
console.log('Server Status Chaos Buttons:', srvChaosBtns);

// 3. Transaction Flow Scenarios & Execution
const txHtml = fs.readFileSync('sistemas/transaction-flow/index.html', 'utf8');
const txScenarios = txHtml.match(/<button[^>]*scenario-btn[^>]*>[\s\S]*?<\/button>/g) || [];
console.log('Transaction Flow Scenarios:', txScenarios);
const txBifurcations = txHtml.match(/<div[^>]*bifurcation[^>]*>[\s\S]*?<\/div>/g) || [];
console.log('Transaction Bifurcations:', txBifurcations);
