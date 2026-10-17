-- ============================================================
-- Mupporul Hindu & Navagraha Temples - Supabase SQL Setup
-- Run this in Supabase: Project Dashboard > SQL Editor > Run
-- ============================================================

-- 1. Temples Table
CREATE TABLE IF NOT EXISTS temples (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  state TEXT DEFAULT 'Tamil Nadu',
  planets JSONB DEFAULT '[]'::jsonb,
  deity TEXT NOT NULL,
  significance TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  timings TEXT,
  history TEXT,
  pooja_details TEXT,
  contact_number TEXT,
  submitted_by JSONB,
  views_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT,
  role TEXT NOT NULL DEFAULT 'contributor',
  avatar_text TEXT,
  avatar_color TEXT,
  contributions_count INT DEFAULT 0,
  approved_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  temple_id TEXT,
  temple_data JSONB NOT NULL,
  previous_data JSONB,
  submitted_by JSONB NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by JSONB,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT
);

-- 4. Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
  user_id TEXT PRIMARY KEY,
  temple_ids JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS) & Policies for Web App
ALTER TABLE temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon or Backend Service read & write access
CREATE POLICY "Allow public read on temples" ON temples FOR SELECT USING (true);
CREATE POLICY "Allow write on temples" ON temples FOR ALL USING (true);

CREATE POLICY "Allow public read on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow write on users" ON users FOR ALL USING (true);

CREATE POLICY "Allow public read on submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Allow write on submissions" ON submissions FOR ALL USING (true);

CREATE POLICY "Allow public read on bookmarks" ON bookmarks FOR SELECT USING (true);
CREATE POLICY "Allow write on bookmarks" ON bookmarks FOR ALL USING (true);

-- Insert Initial Essential Admin User
INSERT INTO users (id, name, username, password, email, role, avatar_text, avatar_color, contributions_count, approved_count)
VALUES ('user-admin', 'Admin Murugan', 'admin', 'admin123', 'admin@mupporul.app', 'admin', 'AM', '#e53e3e', 0, 0)
ON CONFLICT (username) DO NOTHING;
