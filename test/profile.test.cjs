const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { mkdtempSync, rmSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { join } = require('node:path');
const { execFileSync } = require('node:child_process');
const directory = mkdtempSync(join(tmpdir(), 'card-test-'));
process.env.DATABASE_URL = `file:${join(directory, 'test.db')}`;
const { PrismaClient } = require('@prisma/client');
const { seed } = require('../dist/prisma/seed');
const { createApp } = require('../dist/src/bootstrap');
let app, prisma, base;
const migrate = () => execFileSync(process.execPath, ['node_modules/prisma/build/index.js', 'migrate', 'deploy'], { env: process.env });
const query = async document => {
  const response = await fetch(`${base}/graphql`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ query: document }),
  });
  return { status: response.status, body: await response.json() };
};
before(async () => {
  migrate();
  prisma = new PrismaClient();
  await seed(prisma);
  app = await createApp();
  await app.listen(0, '127.0.0.1');
  base = await app.getUrl();
});
after(async () => {
  if (app) await app.close();
  if (prisma) await prisma.$disconnect();
  rmSync(directory, { recursive: true, force: true });
});
test('fresh database serves the requested nested GraphQL shape', async () => {
  const { status, body } = await query('{ profile { name description links { label url } skills { name } experience { company position startDate endDate achievements } projects { name url } } }');
  assert.equal(status, 200);
  assert.equal(body.errors, undefined);
  assert.equal(body.data.profile.name, 'Abzal Alanov');
  assert.equal(body.data.profile.links.find(link => link.label === 'LinkedIn').url, 'https://www.linkedin.com/in/abzal-alanov-574399334/');
  assert.ok(body.data.profile.skills.some(skill => skill.name === 'TypeScript'));
  assert.ok(body.data.profile.experience.every(job => job.company && job.position && job.achievements.length));
  assert.ok(body.data.profile.projects.every(project => new URL(project.url).protocol === 'https:'));
});
test('aliases and fragments resolve without leaking unrequested fields', async () => {
  const { body } = await query('query { person: profile { ...Identity } } fragment Identity on Profile { name }');
  assert.deepEqual(body, { data: { person: { name: 'Abzal Alanov' } } });
});
test('repeated migration and seed preserve data, stable IDs and unrelated profiles', async () => {
  const snapshot = await query('{ profile { id name skills { name } experience { company achievements } projects { name } } }');
  const counts = async () => Promise.all([prisma.skill.count(), prisma.experience.count(), prisma.achievement.count(), prisma.project.count()]);
  const previousCounts = await counts();
  await prisma.profile.create({ data: { id: 'other', name: 'Other', description: 'Unrelated profile' } });
  migrate();
  await seed(prisma);
  await seed(prisma);
  assert.deepEqual(await counts(), previousCounts);
  assert.deepEqual(await query('{ profile { id name skills { name } experience { company achievements } projects { name } } }'), snapshot);
  assert.ok(await prisma.profile.findUnique({ where: { id: 'other' } }));
});
test('Apollo Sandbox and introspection are available', async () => {
  const response = await fetch(`${base}/graphql`, { headers: { accept: 'text/html' } });
  assert.equal(response.status, 200);
  assert.match(await response.text(), /apollo/i);
  const { body } = await query('{ __schema { queryType { name } mutationType { name } } }');
  assert.equal(body.data.__schema.queryType.name, 'Query');
  assert.equal(body.data.__schema.mutationType, null);
});
test('invalid fields fail validation', async () => {
  const { status, body } = await query('{ profile { nonexistent } }');
  assert.equal(status, 400);
  assert.equal(body.errors[0].extensions.code, 'GRAPHQL_VALIDATION_FAILED');
  assert.equal(body.errors[0].extensions.stacktrace, undefined);
});
test('health endpoint checks seeded profile availability', async () => {
  assert.equal((await fetch(`${base}/health`)).status, 200);
  await prisma.profile.delete({ where: { id: 'abzal-alanov' } });
  try {
    assert.equal((await fetch(`${base}/health`)).status, 503);
    const { body } = await query('{ profile { name } }');
    assert.equal(body.data, null);
    assert.ok(body.errors.length);
  } finally { await seed(prisma); }
});
