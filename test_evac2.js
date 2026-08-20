const path = require('path');
const { BrowserSession } = require('./tests/runner');

async function testEvac2() {
  const browser = new BrowserSession();
  await browser.launch();
  const filePath = path.resolve(__dirname, 'sistemas/emergency-evacuation-v2/index.html');
  await browser.navigate(filePath);
  await browser.sleep(300);

  const res1 = await browser.evaluate(() => {
    return {
      isPlaying: typeof audio !== 'undefined' ? audio.isPlayingSiren : 'undefined',
      label: document.querySelector('#siren-label')?.innerText,
      active: document.querySelector('#btn-siren-toggle')?.classList.contains('active')
    };
  });
  console.log('Init:', res1);

  await browser.click('#btn-siren-toggle');
  await browser.sleep(150);

  const res2 = await browser.evaluate(() => {
    return {
      isPlaying: typeof audio !== 'undefined' ? audio.isPlayingSiren : 'undefined',
      label: document.querySelector('#siren-label')?.innerText,
      active: document.querySelector('#btn-siren-toggle')?.classList.contains('active')
    };
  });
  console.log('Click 1:', res2);

  await browser.click('#btn-siren-toggle');
  await browser.sleep(150);

  const res3 = await browser.evaluate(() => {
    return {
      isPlaying: typeof audio !== 'undefined' ? audio.isPlayingSiren : 'undefined',
      label: document.querySelector('#siren-label')?.innerText,
      active: document.querySelector('#btn-siren-toggle')?.classList.contains('active')
    };
  });
  console.log('Click 2:', res3);

  await browser.close();
}

testEvac2().catch(console.error);
