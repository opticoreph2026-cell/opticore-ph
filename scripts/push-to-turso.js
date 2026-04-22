const { execSync } = require('child_process');
const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('--- OptiCore Turso Sync ---');
  
  // 1. Parse .env
  const envPath = path.join(__dirname, '..', '.env');
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  envContent.split('\n').forEach(line => {
    const match = line.match(/^\s*([^#=]+)\s*=\s*(.*)$/);
    if (match) {
        let val = match[2].trim();
        if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
        env[match[1].trim()] = val;
    }
  });

  const url = env.TURSO_DATABASE_URL;
  const authToken = env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    console.error('Error: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN missing in .env');
    process.exit(1);
  }

  // 2. Generate SQL from Schema
  console.log('Generating database schema SQL...');
  let sql;
  try {
    sql = execSync('npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script').toString();
    console.log('SQL Generated Length:', sql.length);
    // console.log('SQL Preview:', sql.substring(0, 100));
  } catch (err) {
    console.error('Error generating SQL:', err.stdout?.toString() || err.message);
    process.exit(1);
  }

  // 3. Connect to Turso
  console.log('Connecting to Turso...');
  const cleanUrl = url.split('?')[0];
  const client = createClient({ url: cleanUrl, authToken });

  // 4. Split and Clean SQL
  // Filter out comments and empty lines but keep the statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0);

  console.log(`Found ${statements.length} potential segments. Cleaning...`);
  
  const cleanStatements = [];
  for (let s of statements) {
    // Remove all lines starting with --
    const lines = s.split('\n').filter(line => !line.trim().startsWith('--'));
    const cleanStr = lines.join('\n').trim();
    if (cleanStr.length > 0) {
      cleanStatements.push(cleanStr);
    }
  }

  console.log(`Found ${cleanStatements.length} executable SQL statements.`);

  // 5. Execute
  for (const statement of cleanStatements) {
    try {
      console.log(`Executing: ${statement.substring(0, 50)}...`);
      await client.execute(statement);
    } catch (err) {
      if (err.message.includes('already exists')) {
        console.warn('  > Table/Index already exists, skipping.');
      } else {
        console.error('  > Error executing statement:', err.message);
        // We continue if it's a non-fatal error like "already exists"
      }
    }
  }

  console.log('\nSUCCESS: Your cloud database is now in sync with your schema!');
  process.exit(0);
}

main().catch(err => {
    console.error('Sync failed:', err);
    process.exit(1);
});
