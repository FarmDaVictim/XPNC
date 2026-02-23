-- XPNC Schema Repair — run this in Supabase SQL Editor
-- Fixes: "activity_date column not found", "invalid uuid: 3", and related schema errors
-- Safe to run multiple times (uses IF NOT EXISTS)

-- Locations: add status (required for getLocationsByContinent query; without it, app falls back to mock data with integer IDs → UUID error)
ALTER TABLE locations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
UPDATE locations SET status = 'active' WHERE approved = TRUE AND (status IS NULL OR status = '');

-- Submissions: add all columns needed for volunteer flow + AI scoring
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reflection TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS score_reasoning TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS activity_date DATE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS activity_type TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS authenticity_score INTEGER;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS depth_score INTEGER;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS learning_score INTEGER;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS effort_score INTEGER;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS bonuses_applied JSONB;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS final_score INTEGER;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS authenticity_verdict TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS reasoning TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS standout_detail TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS red_flags JSONB;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS token_airdrop_amount INTEGER;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS public_summary TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS total_bonuses_percent INTEGER;

-- Submissions RLS: allow anon to insert and update (required for submission flow)
DROP POLICY IF EXISTS "Allow anon insert submissions" ON submissions;
CREATE POLICY "Allow anon insert submissions" ON submissions FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Allow anon update submissions" ON submissions;
CREATE POLICY "Allow anon update submissions" ON submissions FOR UPDATE USING (TRUE);

-- After running this, run seed.sql to populate locations (otherwise map will be empty)
