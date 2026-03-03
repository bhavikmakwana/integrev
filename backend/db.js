const fs = require('fs');
const { Client } = require('pg');
const path = require('path');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('Please set DATABASE_URL in environment');
  process.exit(1);
}

const client = new Client({ connectionString });

async function init() {
  await client.connect();
  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql')).toString();
  await client.query(sql);
}

module.exports = {
  client,
  init
};
