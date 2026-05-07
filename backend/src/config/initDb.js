require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const fs = require('fs');
const path = require('path');
const { pool } = require('./db');

// updated_at triggers are installed — UPDATE queries auto-set the timestamp
async function initDb() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    process.stdout.write('[TaskFlow] Initializing database...\n');
    await pool.query(schema);
    process.stdout.write('[TaskFlow] Database initialized successfully!\n');
    process.exit(0);
  } catch (err) {
    process.stderr.write(`[TaskFlow] Failed to initialize database: ${err.message}\n`);
    process.exit(1);
  }
}

initDb();
