-- Quest submission flow — Path 1 (volunteer) and Path 2 (propose location)
-- Run after 002_add_privy_support.sql

-- Submissions: add reflection, score_reasoning, activity_date
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reflection TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS score_reasoning TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS activity_date DATE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS activity_type TEXT;

-- Locations: add status for proposed, website, contact, financial_support_needed
ALTER TABLE locations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS contact TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS financial_support_needed BOOLEAN DEFAULT FALSE;

-- Update status for existing approved locations
UPDATE locations SET status = 'active' WHERE approved = TRUE AND (status IS NULL OR status = '');

-- Allow insert for proposed locations (anon can propose)
DROP POLICY IF EXISTS "Allow anon insert locations" ON locations;
CREATE POLICY "Allow anon insert locations" ON locations FOR INSERT WITH CHECK (TRUE);

-- Allow anon to insert submissions (user submits via app)
DROP POLICY IF EXISTS "Allow anon insert submissions" ON submissions;
CREATE POLICY "Allow anon insert submissions" ON submissions FOR INSERT WITH CHECK (TRUE);

-- Allow anon to update submissions (for AI score update after scoring)
DROP POLICY IF EXISTS "Allow anon update submissions" ON submissions;
CREATE POLICY "Allow anon update submissions" ON submissions FOR UPDATE USING (TRUE);

-- Allow anon to update locations (for admin approve - admin uses anon key for now)
DROP POLICY IF EXISTS "Allow anon update locations" ON locations;
CREATE POLICY "Allow anon update locations" ON locations FOR UPDATE USING (TRUE);

-- Allow anon to delete locations (for admin reject)
DROP POLICY IF EXISTS "Allow anon delete locations" ON locations;
CREATE POLICY "Allow anon delete locations" ON locations FOR DELETE USING (TRUE);
