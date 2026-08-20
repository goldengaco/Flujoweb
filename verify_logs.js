const path = require('path');
const { BrowserSession } = require('./tests/runner');

async function testLogs() {
  const browser = new BrowserSession();
  await browser.launch();

  const dashboards = [
    {
      id: 'gcp-cloudops-cockpit',
      file: 'sistemas/gcp-cloudops-cockpit/index.html',
      searchInput: '#logs-search-input',
      testQuery: 'ERROR',
      getRowCount: async () => {
        return await browser.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('#logs-table-tbody tr'));
          return rows.filter(r => window.getComputedStyle(r).display !== 'none').length;
        });
      }
    },
    {
      id: 'gcp-event-pubsub',
      file: 'sistemas/gcp-event-pubsub/index.html',
      searchInput: '#logSearchInput',
      testQuery: 'WARN',
      getRowCount: async () => {
        return await browser.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('#logStreamBox .log-entry, #logStreamBox .log-row, #logStreamBox div'));
          return rows.filter(r => window.getComputedStyle(r).display !== 'none').length;
        });
      }
    },
    {
      id: 'gcp-serverless-pipeline',
      file: 'sistemas/gcp-serverless-pipeline/index.html',
      searchInput: '#log-search-input',
      testQuery: 'build',
      getRowCount: async () => {
        return await browser.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('#log-terminal-window .log-entry, #log-terminal-window .log-line'));
          return rows.filter(r => window.getComputedStyle(r).display !== 'none').length;
        });
      }
    },
    {
      id: 'gcp-sql-networking',
      file: 'sistemas/gcp-sql-networking/index.html',
      searchInput: '#querySearchInput',
      testQuery: 'SELECT',
      getRowCount: async () => {
        return await browser.evaluate(() => {
          const rows = Array.from(document.querySelectorAll('#terminalLogFeed .log-row, #terminalLogFeed tr, #terminalLogFeed div'));
          return rows.filter(r => window.getComputedStyle(r).display !== 'none').length;
        });
      }
    }
  ];

  for (const d of dashboards) {
    const fullPath = path.resolve(__dirname, d.file);
    await browser.navigate(fullPath);
    await browser.sleep(500);

    const initialCount = await d.getRowCount();
    await browser.type(d.searchInput, d.testQuery);
    await browser.sleep(300);
    const filteredCount = await d.getRowCount();

    await browser.type(d.searchInput, '');
    await browser.sleep(300);
    const resetCount = await d.getRowCount();

    console.log(`[${d.id}] Initial: ${initialCount} -> Filtered ("${d.testQuery}"): ${filteredCount} -> Reset: ${resetCount}`);
  }

  await browser.close();
}

testLogs().catch(console.error);
