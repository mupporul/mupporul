import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createBackendApp } from '../backend/src/app.js';
import { normalizeSupabaseSubmission, safeParseJson } from '../backend/src/db/supabaseClient.js';
import { db } from '../backend/src/db/database.js';

describe('Phase 1: Supabase Mapper & Schema Normalization', () => {
  it('safely parses JSON strings and object values', () => {
    expect(safeParseJson('{"name": "Thirunallar"}')).toEqual({ name: 'Thirunallar' });
    expect(safeParseJson({ name: 'Thirunallar' })).toEqual({ name: 'Thirunallar' });
    expect(safeParseJson(null)).toEqual({});
    expect(safeParseJson(undefined)).toEqual({});
    expect(safeParseJson('invalid-json')).toBe('invalid-json');
  });

  it('normalizes submission when planets is undefined or null', () => {
    const rawRow = {
      id: 'sub-raw-1',
      type: 'new',
      temple_data: {
        name: 'Lakshmi Narasimmar Temple',
        location: 'Tamil Nadu',
        // planets is intentionally omitted
      },
      submitted_by: {
        id: 'user-thangaraj',
        name: 'Thangaraj',
      },
      status: 'pending',
    };

    const normalized = normalizeSupabaseSubmission(rawRow);
    expect(normalized.id).toBe('sub-raw-1');
    expect(normalized.templeData.name).toBe('Lakshmi Narasimmar Temple');
    expect(Array.isArray(normalized.templeData.planets)).toBe(true);
    expect(normalized.templeData.planets).toEqual([]);
    expect(normalized.submittedBy.name).toBe('Thangaraj');
    expect(normalized.status).toBe('pending');
  });

  it('normalizes submission when temple_data and submitted_by are stringified JSON', () => {
    const rawRow = {
      id: 'sub-str-2',
      type: 'new',
      temple_data: JSON.stringify({
        name: 'Suryanar Kovil',
        location: 'Kumbakonam',
        planets: ['sun'],
        deity: 'suryan',
      }),
      submitted_by: JSON.stringify({
        id: 'user-contributor',
        name: 'VK Contributor',
        role: 'contributor',
      }),
      status: 'PENDING',
    };

    const normalized = normalizeSupabaseSubmission(rawRow);
    expect(normalized.templeData.name).toBe('Suryanar Kovil');
    expect(normalized.templeData.planets).toEqual(['sun']);
    expect(normalized.submittedBy.name).toBe('VK Contributor');
    expect(normalized.submittedBy.role).toBe('contributor');
    expect(normalized.status).toBe('pending');
  });

  it('provides safe fallback defaults for completely empty row', () => {
    const emptyRow = { id: 'sub-empty-3' };
    const normalized = normalizeSupabaseSubmission(emptyRow);
    expect(normalized.templeData.name).toBe('Sacred Temple');
    expect(normalized.templeData.planets).toEqual([]);
    expect(normalized.submittedBy.name).toBe('Contributor');
    expect(normalized.submittedBy.role).toBe('contributor');
    expect(normalized.status).toBe('pending');
  });
});

describe('Phase 1: Submission Review Route & Workflow Guard', () => {
  const app = createBackendApp();

  it('creates a new submission via POST /api/submissions', async () => {
    const payload = {
      type: 'new',
      templeData: {
        name: 'Automated Test Temple ' + Date.now(),
        location: 'Thanjavur, Tamil Nadu',
        planets: ['jupiter'],
        deity: 'shivan',
        significance: 'Spiritual significance for test guard',
      },
      submittedBy: {
        id: 'user-test-contributor',
        name: 'Test Contributor',
        role: 'contributor',
      },
    };

    const res = await request(app)
      .post('/api/submissions')
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toMatch(/^sub-/);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.data.templeData.name).toBe(payload.templeData.name);
  });

  it('approves a pending submission, updating status and adding temple to directory', async () => {
    // 1. Create a submission
    const sub = db.createSubmission({
      type: 'new',
      templeData: {
        name: 'Approval Flow Temple ' + Date.now(),
        location: 'Madurai, Tamil Nadu',
        state: 'Tamil Nadu',
        planets: ['saturn'],
        deity: 'shivan',
        significance: 'Special test temple for approval flow guard',
        remedies: [],
      },
      submittedBy: {
        id: 'user-contributor-test',
        name: 'Thangaraj',
        role: 'contributor',
      },
    });

    // 2. Call review API to approve
    const reviewRes = await request(app)
      .put(`/api/submissions/${sub.id}/review`)
      .send({
        action: 'approved',
        reviewer: { id: 'user-admin', name: 'Admin Murugan', role: 'admin' },
        reviewNotes: 'Verified and approved by admin',
      });

    expect(reviewRes.status).toBe(200);
    expect(reviewRes.body.success).toBe(true);
    expect(reviewRes.body.data.status).toBe('approved');
    expect(reviewRes.body.data.reviewedBy.name).toBe('Admin Murugan');

    // 3. Verify temple exists in the live temples list
    const temples = db.getTemples();
    const liveTemple = temples.find(t => t.name === sub.templeData.name);
    expect(liveTemple).toBeDefined();
    expect(liveTemple?.planets).toContain('saturn');
  });

  it('rejects a submission and preserves rejection notes', async () => {
    const sub = db.createSubmission({
      type: 'new',
      templeData: {
        name: 'Rejected Temple ' + Date.now(),
        location: 'Coimbatore, Tamil Nadu',
        state: 'Tamil Nadu',
        planets: ['rahu'],
        deity: 'amman',
        remedies: [],
      },
      submittedBy: {
        id: 'user-test',
        name: 'User',
        role: 'user',
      },
    });

    const res = await request(app)
      .put(`/api/submissions/${sub.id}/review`)
      .send({
        action: 'rejected',
        reviewer: { id: 'user-admin', name: 'Admin Murugan', role: 'admin' },
        reviewNotes: 'Missing primary deity details and authentic pariharam information.',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('rejected');
    expect(res.body.data.reviewNotes).toContain('Missing primary deity details');
  });
});
