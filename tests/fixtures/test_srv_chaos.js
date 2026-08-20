const { BrowserSession } = require('../runner');

async function test() {
  const b = new BrowserSession();
  await b.launch();
  try {
    await b.navigate('sistemas/server-status/index.html');
    console.log('Navigated srv!');

    // Check chaos modal
    await b.click('#openChaosModalBtn');
    await b.sleep(200);
    const cards = await b.evaluate(() => document.querySelectorAll('.chaos-scenario-card').length);
    console.log('Chaos scenario cards in modal:', cards);

    // Click first scenario card
    await b.click('.chaos-scenario-card');
    await b.sleep(500);

    const s = await b.evaluate(() => {
      const card = document.getElementById('healingWorkflowCard');
      return {
        cardDisplay: card ? card.style.display : null,
        cardClass: card ? card.className : null,
        scenarioName: document.getElementById('healingWorkflowScenarioName')?.innerText
      };
    });
    console.log('After modal scenario click:', s);

    // Test quick chaos button
    await b.click('#svc-db .btn-card-chaos, .btn-card-chaos');
    await b.sleep(500);
    const s2 = await b.evaluate(() => {
      const card = document.getElementById('healingWorkflowCard');
      return {
        cardDisplay: card ? card.style.display : null,
        cardClass: card ? card.className : null,
        scenarioName: document.getElementById('healingWorkflowScenarioName')?.innerText
      };
    });
    console.log('After card chaos click:', s2);

  } finally {
    await b.close();
  }
}
test();
