const fs = require('fs');

// 1. Server status chaos modal and workflow card
const srv = fs.readFileSync('sistemas/server-status/index.html', 'utf8');
console.log('--- SERVER STATUS ---');
const srvMatches = srv.match(/openChaosModalBtn[\s\S]{1,400}/);
if (srvMatches) console.log(srvMatches[0].slice(0, 400));
const healCard = srv.match(/healingWorkflowCard[\s\S]{1,300}/);
if (healCard) console.log(healCard[0].slice(0, 300));
const pills = srv.match(/pill-[\s\S]{1,200}/);
if (pills) console.log(pills[0].slice(0, 200));

// 2. Security audit drawer content & FixAll
const sec = fs.readFileSync('sistemas/security-audit/index.html', 'utf8');
console.log('--- SECURITY AUDIT ---');
const fixAllMatch = sec.match(/btnFixAll[\s\S]{1,400}/);
if (fixAllMatch) console.log(fixAllMatch[0].slice(0, 400));
const drawerContent = sec.match(/drawerContent[\s\S]{1,400}/);
if (drawerContent) console.log(drawerContent[0].slice(0, 400));
