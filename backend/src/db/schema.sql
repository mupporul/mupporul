-- ====================================================================
-- MUPPORUL SACRED TEMPLES & NAVAGRAHA PARIHARAM
-- Free-Tier Database Schema for Supabase (PostgreSQL) / Neon / Render Postgres
-- Run this directly in the Supabase SQL Editor: https://app.supabase.com
-- ====================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(64) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'contributor', 'admin')),
    avatar_text VARCHAR(16) DEFAULT 'OM',
    avatar_color VARCHAR(32) DEFAULT '#f5a623',
    contributions_count INT DEFAULT 0,
    approved_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEMPLES TABLE
CREATE TABLE IF NOT EXISTS temples (
    id VARCHAR(128) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    name_tamil VARCHAR(255),
    location VARCHAR(255) NOT NULL,
    state VARCHAR(128) DEFAULT 'Tamil Nadu',
    district VARCHAR(128),
    planets TEXT[] NOT NULL DEFAULT '{}', -- Array of planet IDs e.g. ARRAY['sani', 'suri']
    deity VARCHAR(128) NOT NULL,
    significance TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    timings VARCHAR(255) DEFAULT '6:00 AM - 12:30 PM, 4:00 PM - 8:30 PM',
    history TEXT,
    pooja_details TEXT,
    contact_number VARCHAR(128),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    views_count INT DEFAULT 0,
    submitted_by JSONB, -- { id, name, role }
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for searching and filtering
CREATE INDEX IF NOT EXISTS idx_temples_planets ON temples USING GIN(planets);
CREATE INDEX IF NOT EXISTS idx_temples_deity ON temples(deity);
CREATE INDEX IF NOT EXISTS idx_temples_name ON temples(name);

-- 4. SUBMISSIONS TABLE (Contributor & Review Workflow)
CREATE TABLE IF NOT EXISTS submissions (
    id VARCHAR(128) PRIMARY KEY,
    temple_id VARCHAR(128) REFERENCES temples(id) ON DELETE SET NULL,
    type VARCHAR(32) NOT NULL CHECK (type IN ('new', 'edit')),
    temple_data JSONB NOT NULL,
    previous_data JSONB,
    submitted_by JSONB NOT NULL, -- { id, name, email, role }
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(32) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    reviewed_by JSONB, -- { id, name, role }
    reviewed_at TIMESTAMPTZ,
    review_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- ====================================================================
-- SEED INITIAL USERS
-- ====================================================================
INSERT INTO users (id, name, email, username, password_hash, role, avatar_text, avatar_color, contributions_count, approved_count)
VALUES 
  ('user-vk', 'V. K. Ramanathan', 'vk.ramanathan@mupporul.org', 'vkraman', 'vk123', 'contributor', 'VK', '#f5a623', 8, 7),
  ('user-admin', 'Super Admin - Arumugam', 'admin@mupporul.org', 'admin', 'admin123', 'admin', 'SA', '#e53e3e', 24, 24),
  ('user-seeker', 'Bhakthan / Pilgrim User', 'bhakthan@mupporul.org', 'bhakthan', 'user123', 'user', 'BP', '#38bdf8', 0, 0)
ON CONFLICT (id) DO NOTHING;

-- Verification query
SELECT 'Database schema successfully initialized!' as status;
