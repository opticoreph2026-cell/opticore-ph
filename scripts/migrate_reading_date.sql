-- Turso/LibSQL migration for readingDate
-- Step 1: Add new column
ALTER TABLE UtilityReading ADD COLUMN readingDate_new DATETIME;

-- Step 2: Backfill — parse existing ISO strings
UPDATE UtilityReading 
SET readingDate_new = datetime(readingDate)
WHERE readingDate IS NOT NULL;

-- Step 3: Verify zero nulls before proceeding (Run manually or check output)
-- SELECT COUNT(*) FROM UtilityReading WHERE readingDate_new IS NULL;

-- Step 4: Drop old, rename new
ALTER TABLE UtilityReading DROP COLUMN readingDate;
ALTER TABLE UtilityReading RENAME COLUMN readingDate_new TO readingDate;
