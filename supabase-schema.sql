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

-- 4. Deities (மூலவர்) Table
CREATE TABLE IF NOT EXISTS deities (
  id TEXT PRIMARY KEY,
  name_tamil TEXT NOT NULL,
  name_english TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row Level Security (RLS) & Policies for Web App
ALTER TABLE temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deities ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon or Backend Service read & write access
CREATE POLICY "Allow public read on temples" ON temples FOR SELECT USING (true);
CREATE POLICY "Allow write on temples" ON temples FOR ALL USING (true);

CREATE POLICY "Allow public read on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow write on users" ON users FOR ALL USING (true);

CREATE POLICY "Allow public read on submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Allow write on submissions" ON submissions FOR ALL USING (true);

CREATE POLICY "Allow public read on deities" ON deities FOR SELECT USING (true);
CREATE POLICY "Allow write on deities" ON deities FOR ALL USING (true);

-- Insert Initial Essential Admin User
INSERT INTO users (id, name, username, password, email, role, avatar_text, avatar_color, contributions_count, approved_count)
VALUES ('user-admin', 'Admin Murugan', 'admin', 'admin123', 'admin@mupporul.app', 'admin', 'AM', '#e53e3e', 0, 0)
ON CONFLICT (username) DO NOTHING;

-- Insert Initial Deities
INSERT INTO deities (id, name_tamil, name_english)
VALUES
  ('amman', 'அம்மன்', 'Amman / Devi'),
  ('shivan', 'சிவன்', 'Shiva'),
  ('vishnu', 'விஷ்ணு', 'Vishnu / Perumal'),
  ('murugan', 'முருகன்', 'Murugan / Karthikeya'),
  ('ayyappan', 'ஐயப்பன்', 'Ayyappan'),
  ('pillaiyar', 'பிள்ளையார்', 'Pillaiyar / Ganesha'),
  ('bhairavar', 'பைரவர்', 'Bhairavar'),
  ('anjaneyar', 'ஆஞ்சநேயர்', 'Anjaneyar / Hanuman')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 6. Storage Bucket for Temple Photos ('temple-images')
-- ============================================================
-- Create public storage bucket if not already created:
INSERT INTO storage.buckets (id, name, public)
VALUES ('temple-images', 'temple-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Allow public read access to all temple photos in the bucket:
CREATE POLICY "Public Temple Images Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'temple-images');

-- Allow uploading photos into 'temple-images':
CREATE POLICY "Public Temple Images Upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'temple-images');

