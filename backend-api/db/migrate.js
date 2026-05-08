'use strict';

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { query, end } = require('../src/db');

async function migrate() {
  const migrationsDir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    console.log(`Running migration: ${file}`);
    await query(sql);
    console.log(`  ✓ ${file}`);
  }

  await end();
  console.log('Migrations complete.');
}

migrate().catch((err) => {
  console.error('Migration failed:', err.message);
  process.exit(1);
});
