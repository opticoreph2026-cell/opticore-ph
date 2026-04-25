import { createClient } from '@libsql/client';
import path from 'path';

async function checkDb() {
  const dbPath = 'file:' + path.join(process.cwd(), 'dev.db');
  console.log('Connecting to:', dbPath);
  const client = createClient({ url: dbPath });

  try {
    const rs = await client.execute("SELECT name FROM sqlite_master WHERE type='table';");
    console.log("Tables in root dev.db:", rs.rows.map(r => r[0]));
  } catch (e) {
    console.error(e);
  }
}

checkDb();
