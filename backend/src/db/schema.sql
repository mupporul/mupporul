-- Mupporul backend schema for Supabase.
-- Run in Supabase Dashboard > SQL Editor, or with psql as documented in README.md.
-- Backend access uses SUPABASE_SERVICE_ROLE_KEY; do not add public write policies.

CREATE TABLE IF NOT EXISTS temples (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  name_tamil TEXT,
  location TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Tamil Nadu',
  district TEXT,
  planets JSONB NOT NULL DEFAULT '[]'::jsonb,
  deity TEXT NOT NULL,
  significance TEXT NOT NULL DEFAULT '',
  description_tamil TEXT,
  description_english TEXT,
  pariharam_info TEXT,
  image_url TEXT,
  video_url TEXT,
  timings TEXT,
  history TEXT,
  pooja_details TEXT,
  contact_number TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  submitted_by JSONB,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add fields introduced after the original backend schema.
ALTER TABLE temples ADD COLUMN IF NOT EXISTS name_tamil TEXT;
ALTER TABLE temples ADD COLUMN IF NOT EXISTS district TEXT;
ALTER TABLE temples ADD COLUMN IF NOT EXISTS description_tamil TEXT;
ALTER TABLE temples ADD COLUMN IF NOT EXISTS description_english TEXT;
ALTER TABLE temples ADD COLUMN IF NOT EXISTS pariharam_info TEXT;
ALTER TABLE temples ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7);
ALTER TABLE temples ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
ALTER TABLE temples ADD COLUMN IF NOT EXISTS planets JSONB NOT NULL DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'contributor',
  avatar_text TEXT,
  avatar_color TEXT,
  contributions_count INTEGER NOT NULL DEFAULT 0,
  approved_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Migrate installations made with the original backend schema's password_hash field.
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'users'
      AND column_name = 'password_hash'
  ) THEN
    EXECUTE 'UPDATE public.users SET password = password_hash WHERE password IS NULL';
    EXECUTE 'ALTER TABLE public.users ALTER COLUMN password_hash DROP NOT NULL';
  END IF;
END
$$;
ALTER TABLE users ALTER COLUMN password SET NOT NULL;
ALTER TABLE users ALTER COLUMN email DROP NOT NULL;

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('new', 'edit')),
  temple_id TEXT REFERENCES temples(id) ON DELETE SET NULL,
  temple_data JSONB NOT NULL,
  previous_data JSONB,
  submitted_by JSONB NOT NULL,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by JSONB,
  reviewed_at TIMESTAMPTZ,
  review_notes TEXT
);

CREATE TABLE IF NOT EXISTS deities (
  id TEXT PRIMARY KEY,
  name_tamil TEXT NOT NULL,
  name_english TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_temples_planets ON temples USING GIN (planets);
CREATE INDEX IF NOT EXISTS idx_temples_deity ON temples (deity);
CREATE INDEX IF NOT EXISTS idx_temples_name ON temples (name);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions (status);

-- No anon/authenticated policies are created. The backend service role accesses these tables.
ALTER TABLE temples ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE deities ENABLE ROW LEVEL SECURITY;

-- Remove permissive policies from older setup scripts.
DROP POLICY IF EXISTS "Allow public read on temples" ON temples;
DROP POLICY IF EXISTS "Allow write on temples" ON temples;
DROP POLICY IF EXISTS "Allow public read on users" ON users;
DROP POLICY IF EXISTS "Allow write on users" ON users;
DROP POLICY IF EXISTS "Allow public read on submissions" ON submissions;
DROP POLICY IF EXISTS "Allow write on submissions" ON submissions;
DROP POLICY IF EXISTS "Allow public read on deities" ON deities;
DROP POLICY IF EXISTS "Allow write on deities" ON deities;

-- Public image reads use a public bucket; uploads remain server-side.
INSERT INTO storage.buckets (id, name, public)
VALUES ('temple-images', 'temple-images', TRUE)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

DROP POLICY IF EXISTS "Public Temple Images Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Temple Images Upload" ON storage.objects;

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
