const { createServer } = require('node:http');
const assert = require('node:assert/strict');
const handler = require('../api/index');
const server = createServer(handler);
(async () => {
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  const results = await Promise.all(Array.from({ length: 5 }, async () => {
    const response = await fetch(`${base}/graphql`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ profile { name skills { name } } }' }),
    });
    assert.equal(response.status, 200);
    return response.json();
  }));
  for (const body of results) {
    assert.equal(body.errors, undefined);
    assert.equal(body.data.profile.name, 'Abzal Alanov');
  }
  assert.equal((await fetch(`${base}/health`)).status, 200);
  console.log('Serverless snapshot and concurrent cold-start requests passed');
  server.close(() => process.exit(0));
})().catch(error => { console.error(error); process.exit(1); });
