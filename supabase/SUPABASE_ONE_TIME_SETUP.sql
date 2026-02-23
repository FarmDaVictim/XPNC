-- =============================================================================
-- XPNC SUPABASE: ONE-TIME FULL SETUP
-- =============================================================================
-- Run this ONCE in Supabase Dashboard → SQL Editor.
-- Fixes: RLS "violates row-level security", missing columns, invalid uuid errors.
-- Safe to run multiple times (uses IF NOT EXISTS / DROP IF EXISTS).
--
-- After this: Run seed.sql to load locations.
-- =============================================================================

-- 1. LOCATIONS: add columns
ALTER TABLE locations ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE locations ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS contact TEXT;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS financial_support_needed BOOLEAN DEFAULT FALSE;
UPDATE locations SET status = 'active' WHERE approved = TRUE AND (status IS NULL OR status = '');

-- 2. SUBMISSIONS: add columns
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

-- 3. USERS: add columns (Privy)
ALTER TABLE users ADD COLUMN IF NOT EXISTS privy_did TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_privy_did ON users(privy_did) WHERE privy_did IS NOT NULL;
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;

-- 4. RLS POLICIES — fix "violates row-level security"
-- Submissions (must allow anon INSERT + UPDATE for volunteer flow)
DROP POLICY IF EXISTS "Allow anon insert submissions" ON submissions;
CREATE POLICY "Allow anon insert submissions" ON submissions FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Allow anon update submissions" ON submissions;
CREATE POLICY "Allow anon update submissions" ON submissions FOR UPDATE USING (TRUE);
DROP POLICY IF EXISTS "Allow anon select submissions" ON submissions;
CREATE POLICY "Allow anon select submissions" ON submissions FOR SELECT USING (TRUE);

-- Users (Privy sync)
DROP POLICY IF EXISTS "Allow anon insert users" ON users;
CREATE POLICY "Allow anon insert users" ON users FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Allow anon select users" ON users;
CREATE POLICY "Allow anon select users" ON users FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Allow anon update users" ON users;
CREATE POLICY "Allow anon update users" ON users FOR UPDATE USING (TRUE);

-- Locations (read + propose + admin)
DROP POLICY IF EXISTS "Allow public read on locations" ON locations;
CREATE POLICY "Allow public read on locations" ON locations FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Allow anon insert locations" ON locations;
CREATE POLICY "Allow anon insert locations" ON locations FOR INSERT WITH CHECK (TRUE);
DROP POLICY IF EXISTS "Allow anon update locations" ON locations;
CREATE POLICY "Allow anon update locations" ON locations FOR UPDATE USING (TRUE);
DROP POLICY IF EXISTS "Allow anon delete locations" ON locations;
CREATE POLICY "Allow anon delete locations" ON locations FOR DELETE USING (TRUE);

-- Badges (read + insert for awarding)
DROP POLICY IF EXISTS "Allow anon select badges" ON badges;
CREATE POLICY "Allow anon select badges" ON badges FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Allow anon insert badges" ON badges;
CREATE POLICY "Allow anon insert badges" ON badges FOR INSERT WITH CHECK (TRUE);

-- Admin support
ALTER TABLE users ADD COLUMN IF NOT EXISTS tokens_earned INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS admin_recommendation TEXT;
