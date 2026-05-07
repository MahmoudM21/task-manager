const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.connect((err, client, release) => {
  if (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[TaskFlow] Failed to connect to PostgreSQL:', err.message);
    }
  } else {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[TaskFlow] Connected to PostgreSQL database');
    }
    release();
  }
});

const query = (text, params) => pool.query(text, params);

module.exports = { pool, query };
