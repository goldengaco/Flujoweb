const { BrowserSession } = require('../runner');

async function test() {
  const b = new BrowserSession();
  await b.launch();
  try {
    await b.navigate('sistemas/security-audit/index.html');
    console.log('Navigated sec!');
    
    // Check initial nodes
    const nodeCount = await b.evaluate(() => document.querySelectorAll('.stepper-node').length);
    console.log('Stepper nodes count:', nodeCount);

    // Click run audit
    await b.click('#btnRunAudit');
    console.log('Clicked btnRunAudit');

    for (let i = 0; i < 10; i++) {
      await b.sleep(1000);
      const res = await b.evaluate(() => {
        const nodes = document.querySelectorAll('.stepper-node');
        const done = document.querySelectorAll('.stepper-node.done-warning, .stepper-node.done-critical, .stepper-node.done-passed, .stepper-node.state-completed');
        const score = document.getElementById('gaugeScoreNumber')?.innerText;
        const badge = document.getElementById('stepperStatusBadge')?.innerText;
        return {
          badge,
          score,
          nodeClasses: Array.from(nodes).map(n => n.className),
          doneCount: done.length
        };
      });
      console.log('Sec Second', i, res);
      if (res.badge && res.badge.includes('COMPLETED')) break;
    }
  } finally {
    await b.close();
  }
}
test();
