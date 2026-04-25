const { createClient } = require('@libsql/client');
require('dotenv').config();

console.log('Script started');

async function run() {
  // Try DATABASE_URL first (the libsql:// one)
  const url = process.env.DATABASE_URL || process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log('Target URL:', url);
  if (!url) {
    console.error('DATABASE_URL is missing!');
    return;
  }

  const client = createClient({ url, authToken });

  try {
    console.log('Adding "avatar" column to "Client" table...');
    await client.execute('ALTER TABLE Client ADD COLUMN avatar TEXT;');
    console.log('Successfully added "avatar" column.');
  } catch (err) {
    if (err.message && err.message.includes('duplicate column name')) {
      console.log('Column "avatar" already exists.');
    } else {
      console.error('Error adding column:', err);
    }
  } finally {
    client.close();
  }
}

run().then(() => console.log('Script finished')).catch(console.error);
