import { execSync } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const token = process.env.TURSO_AUTH_TOKEN || '';
const base = process.env.TURSO_DATABASE_URL || '';
const url = base.replace('https://', 'libsql://') + '?authToken=' + token;

console.log('Pushing to Turso database...');
process.env.DATABASE_URL = url;

try {
  execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
  console.log('✅ Turso DB Push Complete');
} catch (err) {
  console.error('❌ Failed to push to Turso:', err);
  process.exit(1);
}
