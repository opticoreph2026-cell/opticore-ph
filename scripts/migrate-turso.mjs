import { createClient } from '@libsql/client';

const url = "libsql://opticoreph-opticoreph.aws-ap-northeast-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzUyMzcwNjAsImlkIjoiMDE5ZDU0NWYtOWUwMS03YTdkLWE5MjEtNjdjMjgxYWQ0MjU2IiwicmlkIjoiNmYzN2E2MDYtZmNlNC00YjA1LTg1MWMtYTA5YzEzNDYzYmNhIn0.htRY_IcO4fgocPuPgVjUaCaKfzezRWW63ndLoOQbD5ysiiJYdrWotkRPOTqu-AORfXTQW590djXHVyZpbSVSDg";

const client = createClient({ url, authToken });

async function migrate() {
  const statements = [
    "ALTER TABLE Client ADD COLUMN phone TEXT;",
    "ALTER TABLE Client ADD COLUMN city TEXT;",
    "ALTER TABLE Client ADD COLUMN barangay TEXT;",
    "ALTER TABLE Client ADD COLUMN province TEXT;",
    "ALTER TABLE Client ADD COLUMN region TEXT;",
    "ALTER TABLE Client ADD COLUMN incomeClass TEXT;",
    "ALTER TABLE Client ADD COLUMN preferredLanguage TEXT NOT NULL DEFAULT 'taglish';",
    "ALTER TABLE Client ADD COLUMN suspended BOOLEAN NOT NULL DEFAULT 0;"
  ];

  for (const stmt of statements) {
    try {
      console.log(`Executing: ${stmt}`);
      await client.execute(stmt);
      console.log('Success');
    } catch (err) {
      if (err.message.includes('duplicate column name')) {
        console.log('Column already exists, skipping...');
      } else {
        console.error('Error:', err.message);
      }
    }
  }

  // Check columns again
  const res = await client.execute("PRAGMA table_info(Client);");
  console.log("\nClient columns:", res.rows.map(r => r.name));
}

migrate();
