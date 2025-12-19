const { Pool } = require('pg');

const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@${process.env.POSTGRES_HOST || process.env.PGHOST || 'localhost'}:${process.env.POSTGRES_PORT || process.env.PGPORT || 5432}/${process.env.POSTGRES_DB || 'todos'}`;

const pool = new Pool({ connectionString });

async function initDb() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        completed BOOLEAN NOT NULL DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
      )
    `);
  } finally {
    client.release();
  }
}

async function getClient() {
  return pool.connect();
}

module.exports = { initDb, getClient, pool };
