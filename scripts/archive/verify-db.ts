/**
 * verify-db.ts — checks record counts for all critical tables.
 * Run: npx tsx scripts/verify-db.ts
 */
import { createClient } from '@libsql/client';
import { join } from 'path';

const db = createClient({ url: `file:${join(process.cwd(), 'dev.db')}` });

async function count(table: string) {
  const { rows } = await db.execute(`SELECT COUNT(*) as c FROM "${table}"`);
  return Number(rows[0].c);
}

async function main() {
  const tables = ['Client', 'UtilityProvider', 'ApplianceCatalog', 'UtilityReading', 'AIReport', 'Alert', 'Appliance'];
  console.log('\n📊 OptiCore DB Record Counts\n' + '─'.repeat(35));
  for (const t of tables) {
    try {
      const n = await count(t);
      const status = (t === 'UtilityProvider' && n === 0) ? ' ⚠️  NEEDS SEEDING' : (t === 'ApplianceCatalog' && n === 0) ? ' ⚠️  NEEDS SEEDING' : '';
      console.log(`  ${t.padEnd(22)} ${String(n).padStart(4)} records${status}`);
    } catch (e: any) {
      console.log(`  ${t.padEnd(22)} ERROR: ${e.message}`);
    }
  }
  console.log('─'.repeat(35) + '\n');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
