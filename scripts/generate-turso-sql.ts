import { execSync } from 'child_process';
import * as dotenv from 'dotenv';
import { writeFileSync } from 'fs';

dotenv.config({ path: '.env.local' });

const token = process.env.TURSO_AUTH_TOKEN || '';
const base = process.env.TURSO_DATABASE_URL || '';
const url = base.replace('https://', 'libsql://') + '?authToken=' + token;

console.log('Generating migration SQL...');
try {
  const sql = execSync(`npx prisma migrate diff --from-url "${url}" --to-schema-datamodel prisma/schema.prisma --script`).toString();
  writeFileSync('prisma/turso-migration.sql', sql);
  console.log('✅ Generated prisma/turso-migration.sql');
} catch (err) {
  console.error('❌ Failed to generate migration SQL:', err);
  process.exit(1);
}
