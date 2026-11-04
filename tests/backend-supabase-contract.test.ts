import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  resolveSupabaseCredentials,
  toSupabaseTempleRow,
  toSupabaseUserRow,
} from '../backend/src/db/supabaseClient.js';
import { Temple, UserProfile } from '../backend/src/types.js';

describe('Supabase backend contract', () => {
  it('prefers the server-side service role key over public anon keys', () => {
    expect(resolveSupabaseCredentials({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_KEY: 'legacy-key',
      SUPABASE_ANON_KEY: 'public-key',
      SUPABASE_SERVICE_ROLE_KEY: 'server-key',
    })).toEqual({
      url: 'https://project.supabase.co',
      key: 'server-key',
    });
  });

  it('requires both URL and key before enabling Supabase', () => {
    expect(resolveSupabaseCredentials({ SUPABASE_URL: 'https://project.supabase.co' })).toBeNull();
    expect(resolveSupabaseCredentials({ SUPABASE_SERVICE_ROLE_KEY: 'server-key' })).toBeNull();
    expect(resolveSupabaseCredentials({
      SUPABASE_URL: 'https://project.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: ' ',
      SUPABASE_ANON_KEY: 'public-key',
    })?.key).toBe('public-key');
  });

  it('only writes temple columns present in the supported Supabase schema', () => {
    const temple: Temple = {
      id: 'temple-test',
      name: 'Test Temple',
      nameTamil: 'சோதனை கோவில்',
      location: 'Thanjavur',
      state: 'Tamil Nadu',
      district: 'Thanjavur',
      planets: ['sani'],
      deity: 'shivan',
      significance: 'Test significance',
      coordinates: { lat: 10.787, lng: 79.137 },
      remedies: ['legacy-field'],
      imageUrl: '',
      videoUrl: '',
      timings: '',
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
      viewsCount: 0,
    };

    expect(toSupabaseTempleRow(temple)).toMatchObject({
      id: 'temple-test',
      planets: ['sani'],
      name_tamil: 'சோதனை கோவில்',
      district: 'Thanjavur',
      latitude: 10.787,
      longitude: 79.137,
      image_url: '',
    });
    expect(toSupabaseTempleRow(temple)).not.toHaveProperty('remedies');
  });

  it('maps user credentials to the schema column used by the backend API', () => {
    const user: UserProfile = {
      id: 'user-test',
      name: 'Test User',
      username: 'test-user',
      password: 'test-password',
      email: '',
      role: 'user',
      avatarText: 'TU',
      avatarColor: '#123456',
      contributionsCount: 0,
      approvedCount: 0,
    };

    expect(toSupabaseUserRow(user)).toMatchObject({
      id: 'user-test',
      username: 'test-user',
      password: 'test-password',
      email: null,
    });
    expect(toSupabaseUserRow(user)).not.toHaveProperty('password_hash');
  });

  it('secures the SQL schema for backend-only access and matches adapter columns', () => {
    const schema = readFileSync('backend/src/db/schema.sql', 'utf8');

    expect(schema).toContain('password TEXT NOT NULL');
    expect(schema).toContain('description_tamil TEXT');
    expect(schema).toContain('ALTER TABLE users ALTER COLUMN email DROP NOT NULL');
    expect(schema).toContain('ALTER TABLE temples ENABLE ROW LEVEL SECURITY');
    expect(schema).not.toMatch(/CREATE POLICY[\s\S]+?TO (?:anon|authenticated)/i);
  });
});
