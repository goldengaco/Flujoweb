const { BrowserSession } = require('../runner');

async function test() {
  const b = new BrowserSession();
  await b.launch();
  try {
    await b.navigate('sistemas/transaction-flow/index.html');
    console.log('Navigated!');

    // Reset
    await b.click('#btnReset');
    await b.sleep(200);

    // Click fraud
    await b.click('.scenario-btn[data-scenario="fraud"]');
    await b.sleep(200);

    // Click process
    await b.click('#btnProcess');

    // Wait
    for (let i = 0; i < 6; i++) {
      await b.sleep(1000);
      const res = await b.evaluate(() => {
        const bFraud = document.getElementById('bifurcation-fraud');
        const badge = document.getElementById('engineStateBadge')?.innerText;
        const classes = bFraud ? bFraud.className : null;
        return { badge, classes };
      });
      console.log('Fraud second', i, res);
    }
  } finally {
    await b.close();
  }
}
test();
