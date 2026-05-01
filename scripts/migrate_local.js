const { createClient } = require('@libsql/client');

async function main() {
  const client = createClient({ url: 'file:./dev.db' });
  
  try {
    console.log("Adding readingDate_new column...");
    await client.execute('ALTER TABLE UtilityReading ADD COLUMN readingDate_new DATETIME;');
    
    console.log("Backfilling data...");
    await client.execute('UPDATE UtilityReading SET readingDate_new = datetime(readingDate) WHERE readingDate IS NOT NULL;');
    
    const result = await client.execute('SELECT COUNT(*) as count FROM UtilityReading WHERE readingDate_new IS NULL AND readingDate IS NOT NULL;');
    console.log(`Nulls after conversion: ${result.rows[0].count}`);
    
    console.log("Dropping old column...");
    await client.execute('ALTER TABLE UtilityReading DROP COLUMN readingDate;');
    
    console.log("Renaming new column...");
    await client.execute('ALTER TABLE UtilityReading RENAME COLUMN readingDate_new TO readingDate;');
    
    console.log("Migration successful!");
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    client.close();
  }
}

main();
