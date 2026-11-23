-- ============================================================
-- Standalone Migration: நாம விளக்கம் (Naama Vilakkam)
-- Completely isolated from temples, quiz, solution_tags, and users.
-- Run this in Supabase: Project Dashboard > SQL Editor > Run
-- ============================================================

-- 1. Standalone Feature Flags Table (Toggle modules from Admin screen)
CREATE TABLE IF NOT EXISTS app_feature_flags (
  key TEXT PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Standalone Master Table: நாம விளக்கம் (Tamil-only entries)
CREATE TABLE IF NOT EXISTS naama_vilakkam (
  id TEXT PRIMARY KEY,
  name_tamil TEXT NOT NULL,
  notes TEXT DEFAULT '',
  created_by JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Parent-Child Planet Junction Table (Fast indexed single & combo planet queries)
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

-- 4. Row Level Security (RLS) & Policies
ALTER TABLE app_feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE naama_vilakkam ENABLE ROW LEVEL SECURITY;
ALTER TABLE naama_vilakkam_planets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on app_feature_flags" ON app_feature_flags;
CREATE POLICY "Allow public read on app_feature_flags" ON app_feature_flags FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write on app_feature_flags" ON app_feature_flags;
CREATE POLICY "Allow write on app_feature_flags" ON app_feature_flags FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on naama_vilakkam" ON naama_vilakkam;
CREATE POLICY "Allow public read on naama_vilakkam" ON naama_vilakkam FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write on naama_vilakkam" ON naama_vilakkam;
CREATE POLICY "Allow write on naama_vilakkam" ON naama_vilakkam FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on naama_vilakkam_planets" ON naama_vilakkam_planets;
CREATE POLICY "Allow public read on naama_vilakkam_planets" ON naama_vilakkam_planets FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow write on naama_vilakkam_planets" ON naama_vilakkam_planets;
CREATE POLICY "Allow write on naama_vilakkam_planets" ON naama_vilakkam_planets FOR ALL USING (true);

-- 5. Default Feature Flag Row (Controlled via Admin Dashboard Toggle)
INSERT INTO app_feature_flags (key, enabled)
VALUES ('naama_vilakkam', TRUE)
ON CONFLICT (key) DO NOTHING;
