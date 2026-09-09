const { copyFileSync, mkdtempSync } = require('node:fs');
const { join } = require('node:path');
const { tmpdir } = require('node:os');

let ready;
async function initialize() {
  // Each serverless process gets an isolated copy of the migrated, seeded snapshot.
  const directory = mkdtempSync(join(tmpdir(), 'business-card-'));
  const database = join(directory, 'card.db');
  copyFileSync(join(__dirname, '../dist/assets/card.db'), database);
  process.env.DATABASE_URL = `file:${database}`;
  const { createApp } = require('../dist/src/bootstrap');
  const app = await createApp();
  return app.getHttpAdapter().getInstance();
}

module.exports = async (req, res) => {
  try {
    ready ??= initialize().catch(error => { ready = undefined; throw error; });
    const handler = await ready;
    handler(req, res);
  } catch (error) {
    console.error('Startup failed', error);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Service temporarily unavailable' }));
  }
};
