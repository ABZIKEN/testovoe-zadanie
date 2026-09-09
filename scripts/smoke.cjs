const assert = require('node:assert/strict');
(async () => {
  const response = await fetch('http://localhost:3000/graphql', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: '{ profile { name skills { name } experience { company position achievements } projects { name url } } }' }),
  });
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.errors, undefined);
  assert.equal(body.data.profile.name, 'Abzal Alanov');
  assert.ok(body.data.profile.skills.length > 0);
  assert.ok(body.data.profile.experience.length > 0);
  assert.ok(body.data.profile.projects.length > 0);
  console.log('Container GraphQL smoke test passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
