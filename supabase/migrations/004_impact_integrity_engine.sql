-- Impact Integrity Engine — full scoring schema
-- Run after 003_quest_submission_flow.sql

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
