-- ============================================================
-- Mupporul: Safe Production Migration for Problem / Solution Tags
-- Master Table (solution_tags) + Parent-Child Junction Table (temple_solution_tags)
-- Additive & idempotent: does NOT alter or delete existing temples/users/deities.
-- ============================================================

-- 1. Master Table: solution_tags
CREATE TABLE IF NOT EXISTS solution_tags (
  id TEXT PRIMARY KEY,
  name_tamil TEXT NOT NULL,
  name_english TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Parent-Child Junction Table: temple_solution_tags (temples <-> solution_tags)
CREATE TABLE IF NOT EXISTS temple_solution_tags (
  temple_id TEXT NOT NULL REFERENCES temples(id) ON DELETE CASCADE,
  tag_id TEXT NOT NULL REFERENCES solution_tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (temple_id, tag_id)
);

-- Fast indexed lookups by problem tag -> temples, and by temple -> problem tags
CREATE INDEX IF NOT EXISTS idx_temple_solution_tags_tag_id
  ON temple_solution_tags(tag_id, temple_id);

CREATE INDEX IF NOT EXISTS idx_temple_solution_tags_temple_id
  ON temple_solution_tags(temple_id);

-- 3. Row Level Security & Access Policies (safe re-run with DROP POLICY IF EXISTS)
ALTER TABLE solution_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE temple_solution_tags ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read on solution_tags" ON solution_tags;
CREATE POLICY "Allow public read on solution_tags" ON solution_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write on solution_tags" ON solution_tags;
CREATE POLICY "Allow write on solution_tags" ON solution_tags FOR ALL USING (true);

DROP POLICY IF EXISTS "Allow public read on temple_solution_tags" ON temple_solution_tags;
CREATE POLICY "Allow public read on temple_solution_tags" ON temple_solution_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow write on temple_solution_tags" ON temple_solution_tags;
CREATE POLICY "Allow write on temple_solution_tags" ON temple_solution_tags FOR ALL USING (true);

-- 4. Seed Starter Solution Tags (Admin can add/edit/delete more from UI)
INSERT INTO solution_tags (id, name_tamil, name_english)
VALUES
  ('veedu-katta-thadai', 'வீடு கட்ட தடை', 'Delay in building house'),
  ('nilam-virka-thadai', 'நிலம் விற்க தடை', 'Delay in selling land')
ON CONFLICT (id) DO NOTHING;

-- 5. Safe Backfill: Copy any existing solutionTags from temples.submitted_by JSONB into temple_solution_tags
INSERT INTO temple_solution_tags (temple_id, tag_id)
SELECT t.id, elem.value
FROM temples t
CROSS JOIN LATERAL jsonb_array_elements_text(
  CASE
    WHEN jsonb_typeof(t.submitted_by->'solutionTags') = 'array'
      THEN t.submitted_by->'solutionTags'
    ELSE '[]'::jsonb
  END
) AS elem(value)
JOIN solution_tags st ON st.id = elem.value
ON CONFLICT (temple_id, tag_id) DO NOTHING;
