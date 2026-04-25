const { createClient } = require('@libsql/client');
require('dotenv').config();

async function run() {
  const url = process.env.DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  const client = createClient({ url, authToken });

  try {
    const res = await client.execute('PRAGMA table_info(Client);');
    console.log('Columns in Client table:');
    res.rows.forEach(row => {
      console.log(`- ${row.name} (${row.type})`);
    });
  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.close();
  }
}

run();
