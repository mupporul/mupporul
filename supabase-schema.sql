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
  jothidar_paarvai BOOLEAN DEFAULT FALSE,
  jothidar_paarvai_notes TEXT DEFAULT '',
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

-- 5. Solution / Problem Tags (தீர்வு குறிச்சொற்கள் - Master Table)
CREATE TABLE IF NOT EXISTS solution_tags (
  id TEXT PRIMARY KEY,
  name_tamil TEXT NOT NULL,
  name_english TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Temple <-> Solution Tags (Parent-Child Many-to-Many Junction Table)
CREATE TABLE IF NOT EXISTS temple_solution_tags (
  temple_id TEXT NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES solution_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (temple_id, tag_id)
);

CREATE INDEX IF NOT EXISTS idx_temple_solution_tags_tag_id
  ON temple_solution_tags(tag_id, temple_id);

CREATE INDEX IF NOT EXISTS idx_temple_solution_tags_temple_id
  ON temple_solution_tags(temple_id);

-- 7. Row Level Security (RLS) & Policies for Web App
ALTER TABLE temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deities ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE temple_solution_tags ENABLE ROW LEVEL SECURITY;

-- Allow Public/Anon or Backend Service read & write access
CREATE POLICY "Allow public read on temples" ON temples FOR SELECT USING (true);
CREATE POLICY "Allow write on temples" ON temples FOR ALL USING (true);

CREATE POLICY "Allow public read on users" ON users FOR SELECT USING (true);
CREATE POLICY "Allow write on users" ON users FOR ALL USING (true);

CREATE POLICY "Allow public read on submissions" ON submissions FOR SELECT USING (true);
CREATE POLICY "Allow write on submissions" ON submissions FOR ALL USING (true);

CREATE POLICY "Allow public read on deities" ON deities FOR SELECT USING (true);
CREATE POLICY "Allow write on deities" ON deities FOR ALL USING (true);

CREATE POLICY "Allow public read on solution_tags" ON solution_tags FOR SELECT USING (true);
CREATE POLICY "Allow write on solution_tags" ON solution_tags FOR ALL USING (true);

CREATE POLICY "Allow public read on temple_solution_tags" ON temple_solution_tags FOR SELECT USING (true);
CREATE POLICY "Allow write on temple_solution_tags" ON temple_solution_tags FOR ALL USING (true);

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

-- Insert Initial Solution / Problem Tags
INSERT INTO solution_tags (id, name_tamil, name_english)
VALUES
  ('veedu-katta-thadai', 'வீடு கட்ட தடை', 'Delay in building house'),
  ('nilam-virka-thadai', 'நிலம் விற்க தடை', 'Delay in selling land')
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

-- ============================================================
-- 7. Standalone நாம விளக்கம் (Naama Vilakkam) & Feature Flags
-- ============================================================
CREATE TABLE IF NOT EXISTS app_feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS naama_vilakkam (
  id TEXT PRIMARY KEY,
  name_tamil TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_by JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS naama_vilakkam_planets (
  naama_id TEXT NOT NULL REFERENCES naama_vilakkam(id) ON DELETE CASCADE,
  planet_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (naama_id, planet_id)
);

CREATE INDEX IF NOT EXISTS idx_naama_vilakkam_planets_planet_id
  ON naama_vilakkam_planets(planet_id, naama_id);

CREATE INDEX IF NOT EXISTS idx_naama_vilakkam_planets_naama_id
  ON naama_vilakkam_planets(naama_id);

ALTER TABLE app_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE naama_vilakkam ENABLE ROW LEVEL SECURITY;
ALTER TABLE naama_vilakkam_planets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read on app_feature_flags" ON app_feature_flags FOR SELECT USING (true);
CREATE POLICY "Allow write on app_feature_flags" ON app_feature_flags FOR ALL USING (true);

CREATE POLICY "Allow public read on naama_vilakkam" ON naama_vilakkam FOR SELECT USING (true);
CREATE POLICY "Allow write on naama_vilakkam" ON naama_vilakkam FOR ALL USING (true);

CREATE POLICY "Allow public read on naama_vilakkam_planets" ON naama_vilakkam_planets FOR SELECT USING (true);
CREATE POLICY "Allow write on naama_vilakkam_planets" ON naama_vilakkam_planets FOR ALL USING (true);

INSERT INTO app_feature_flags (key, enabled)
VALUES ('naama_vilakkam', TRUE)
ON CONFLICT (key) DO NOTHING;
