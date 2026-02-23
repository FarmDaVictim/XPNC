-- Admin support: tokens_earned, flagged, rejection_reason
-- Run after SUPABASE_ONE_TIME_SETUP.sql

ALTER TABLE users ADD COLUMN IF NOT EXISTS tokens_earned INTEGER DEFAULT 0;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT FALSE;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
