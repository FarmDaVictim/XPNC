-- Add Privy support to users table
-- Run in Supabase SQL Editor after 001_initial_schema.sql

-- Link Privy user to Supabase user
ALTER TABLE users ADD COLUMN IF NOT EXISTS privy_did TEXT UNIQUE;

-- Make username nullable for first-time create (we'll set it from email/wallet)
ALTER TABLE users ALTER COLUMN username DROP NOT NULL;

-- Add email for email logins
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT;

-- Updated timestamp for sync
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Index for fast lookup by privy_did
CREATE INDEX IF NOT EXISTS idx_users_privy_did ON users(privy_did);

-- Allow anon to insert/select/update users (for Privy sync without Supabase Auth)
CREATE POLICY "Allow anon insert users" ON users FOR INSERT WITH CHECK (TRUE);
CREATE POLICY "Allow anon select users" ON users FOR SELECT USING (TRUE);
CREATE POLICY "Allow anon update users" ON users FOR UPDATE USING (TRUE);
