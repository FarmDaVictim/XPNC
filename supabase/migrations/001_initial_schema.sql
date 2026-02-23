-- XPNC Supabase Schema
-- Run this in Supabase SQL Editor or via Supabase CLI

-- Enable UUID extension (usually enabled by default)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT,
  username TEXT NOT NULL,
  avatar_url TEXT,
  impact_points INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Locations table (volunteer opportunities)
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  nonprofit_name TEXT NOT NULL,
  description TEXT DEFAULT '',
  continent TEXT NOT NULL,
  country TEXT DEFAULT '',
  city TEXT DEFAULT '',
  lat DOUBLE PRECISION NOT NULL,
  lng DOUBLE PRECISION NOT NULL,
  category TEXT DEFAULT 'general',
  impact INTEGER DEFAULT 0,
  approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Submissions table (volunteer hour logs)
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  location_id UUID REFERENCES locations(id) ON DELETE CASCADE,
  hours_logged INTEGER NOT NULL,
  volunteer_type TEXT DEFAULT '',
  photo_url TEXT,
  notes TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  impact_points_awarded INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Badges table
CREATE TABLE badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  badge_name TEXT NOT NULL,
  badge_description TEXT DEFAULT '',
  earned_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX idx_locations_continent ON locations(continent);
CREATE INDEX idx_locations_approved ON locations(approved);
CREATE INDEX idx_submissions_user_id ON submissions(user_id);
CREATE INDEX idx_submissions_location_id ON submissions(location_id);
CREATE INDEX idx_badges_user_id ON badges(user_id);

-- Enable Row Level Security (RLS) - policies to be added with auth
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE badges ENABLE ROW LEVEL SECURITY;

-- For now: allow public read on locations - no auth yet (restrict to approved later)
CREATE POLICY "Allow public read on locations"
  ON locations FOR SELECT
  USING (TRUE);
