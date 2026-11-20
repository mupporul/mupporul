import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createBackendApp } from '../backend/src/app.js';
import {
  normalizeSupabaseSubmission,
  safeParseJson,
  buildSupabaseTempleRow,
  buildSupabaseTempleUpdateRow,
} from '../backend/src/db/supabaseClient.js';
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

  it('omits non-existent remedies column from Supabase temples insert and update payloads', () => {
    const insertRow = buildSupabaseTempleRow({
      id: 'temple-schema-guard',
      name: 'Parikkal Narasimmar Temple',
      location: 'Viluppuram, Tamil Nadu',
      state: 'Tamil Nadu',
      planets: ['suriyan'],
      deity: 'narasimmar',
      significance: 'Pariharam temple',
      remedies: ['legacy-tag'],
      imageUrl: '',
      videoUrl: '',
      timings: '6 AM - 8 PM',
      viewsCount: 0,
      createdAt: '2026-11-17T00:00:00Z',
      updatedAt: '2026-11-17T00:00:00Z',
    });

    expect('remedies' in insertRow).toBe(false);
    expect(insertRow.name).toBe('Parikkal Narasimmar Temple');

    const updateRow = buildSupabaseTempleUpdateRow({
      name: 'Parikkal Narasimmar Temple',
      remedies: [],
    });

    expect('remedies' in updateRow).toBe(false);
    expect(updateRow.name).toBe('Parikkal Narasimmar Temple');
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

  it('self-heals and auto-reconciles approved submissions into temples directory when temples list is queried', async () => {
    // Simulate an approved submission that was reviewed by a contributor/admin
    const templeName = 'Self-Healing Test Temple ' + Date.now();
    const approvedSub = db.createSubmission({
      type: 'new',
      templeData: {
        name: templeName,
        location: 'PoovarasanKuppam, Viluppuram',
        state: 'Tamil Nadu',
        planets: ['suri', 'sani', 'sev', 'suk'],
        deity: 'narasimmar',
        significance: 'Spiritual pariharam temple',
        remedies: [],
      },
      submittedBy: {
        id: 'user-thangaraj',
        name: 'Thangaraj',
        role: 'contributor',
      },
    });

    // Mark as approved
    db.reviewSubmission(approvedSub.id, 'approved', {
      id: 'user-murugan',
      name: 'ammurugan',
      role: 'contributor',
    }, 'Verified and approved for publication.');

    // Query temples directly via GET /api/temples
    const res = await request(app).get('/api/temples');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const found = res.body.data.find((t: any) => t.name === templeName);
    expect(found).toBeDefined();
    expect(found.deity).toBe('narasimmar');
    expect(found.location).toBe('PoovarasanKuppam, Viluppuram');
    expect(found.planets).toEqual(['suri', 'sani', 'sev', 'suk']);
  });

  it('updates temple name and location via PUT /api/temples/:id without creating duplicates', async () => {
    const initialName = 'Original Edit Temple ' + Date.now();
    const renamedName = 'Renamed Edit Temple ' + Date.now();

    const sub = db.createSubmission({
      type: 'new',
      templeData: {
        name: initialName,
        location: 'Old Location, Madurai',
        state: 'Tamil Nadu',
        planets: ['suriyan'],
        deity: 'agathiyar',
        significance: 'Initial significance details',
        remedies: [],
        imageUrl: '',
        videoUrl: '',
        timings: '',
      },
      submittedBy: { id: 'user-admin', name: 'Admin Murugan', email: 'admin@mupporul.app', role: 'admin' },
    });

    const approvedRes = db.reviewSubmission(sub.id, 'approved', {
      id: 'user-admin',
      name: 'Admin Murugan',
      role: 'admin',
    });
    const templeId = approvedRes!.temple!.id;

    // Simulate legacy unlinked submission (temple_id null) before rename
    sub.templeId = undefined;

    const updateRes = await request(app)
      .put(`/api/temples/${templeId}`)
      .send({
        name: renamedName,
        location: 'New Updated Location, Madurai',
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.name).toBe(renamedName);
    expect(updateRes.body.data.location).toBe('New Updated Location, Madurai');

    const listRes = await request(app).get('/api/temples');
    expect(listRes.status).toBe(200);
    const matchingNew = listRes.body.data.filter((t: any) => t.name === renamedName);
    const matchingOld = listRes.body.data.filter((t: any) => t.name === initialName);
    expect(matchingNew).toHaveLength(1);
    expect(matchingOld).toHaveLength(0);
    expect(matchingNew[0].location).toBe('New Updated Location, Madurai');
  });

  it('approves a contributor edit submission renaming a temple without creating a duplicate card', async () => {
    const originalName = 'Contributor Pre-Edit Temple ' + Date.now();
    const editedName = 'Contributor Post-Edit Temple ' + Date.now();

    const created = db.createTemple({
      name: originalName,
      location: 'Karungalakudi, Madurai',
      state: 'Tamil Nadu',
      planets: ['suri'],
      deity: 'agathiyar',
      significance: 'Original significance',
      remedies: [],
      imageUrl: '',
      videoUrl: '',
      timings: '',
      submittedBy: { id: 'user-contrib', name: 'ammurugan', role: 'contributor' },
    });

    const editSubRes = await request(app)
      .post('/api/submissions')
      .send({
        type: 'edit',
        templeId: created.id,
        templeData: {
          name: editedName,
          location: 'Melur, Madurai',
          state: 'Tamil Nadu',
          planets: ['suri'],
          deity: 'amman',
          significance: 'Updated significance',
          remedies: [],
        },
        previousData: {
          name: originalName,
          location: 'Karungalakudi, Madurai',
          planets: ['suri'],
          deity: 'agathiyar',
          significance: 'Original significance',
        },
        submittedBy: { id: 'user-contrib', name: 'ammurugan', role: 'contributor' },
      });

    expect(editSubRes.status).toBe(201);

    const approveRes = await request(app)
      .put(`/api/submissions/${editSubRes.body.data.id}/review`)
      .send({
        action: 'approved',
        reviewer: { id: 'user-admin', name: 'Admin Murugan', role: 'admin' },
      });

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.temple.id).toBe(created.id);
    expect(approveRes.body.temple.name).toBe(editedName);

    const templesRes = await request(app).get('/api/temples');
    expect(templesRes.body.data.filter((t: any) => t.name === editedName)).toHaveLength(1);
    expect(templesRes.body.data.filter((t: any) => t.name === originalName)).toHaveLength(0);

    // Deleting the temple should not cause reconcileApprovedSubmissions to resurrect it
    const delRes = await request(app).delete(`/api/temples/${created.id}`);
    expect(delRes.status).toBe(200);

    const afterDeleteRes = await request(app).get('/api/temples');
    expect(afterDeleteRes.body.data.find((t: any) => t.id === created.id)).toBeUndefined();
    expect(afterDeleteRes.body.data.find((t: any) => t.name === editedName)).toBeUndefined();
  });

  it('persists jothidarPaarvai & jothidarPaarvaiNotes inside submitted_by JSONB without un-migrated columns and filters GET /api/temples?jothidarPaarvai=true', async () => {
    const noteText = 'வயலூர் - கடக ராசி + செவ்வாய் & சனி சிறப்பு பார்வை';
    const insertRow = buildSupabaseTempleRow({
      id: 'temple-jp-schema-1',
      name: 'Vayalur Jothidar Test Temple',
      location: 'Vayalur, Tiruchirappalli',
      state: 'Tamil Nadu',
      planets: ['sani', 'sev'],
      deity: 'murugan',
      significance: 'Test significance',
      remedies: [],
      imageUrl: '',
      videoUrl: '',
      timings: '6 AM - 8 PM',
      jothidarPaarvai: true,
      jothidarPaarvaiNotes: noteText,
      submittedBy: { id: 'user-admin', name: 'Admin Murugan', role: 'admin' },
      viewsCount: 0,
      createdAt: '2026-11-19T00:00:00Z',
      updatedAt: '2026-11-19T00:00:00Z',
    });

    expect('jothidar_paarvai' in insertRow).toBe(false);
    expect('jothidar_paarvai_notes' in insertRow).toBe(false);
    expect(insertRow.submitted_by.jothidarPaarvai).toBe(true);
    expect(insertRow.submitted_by.jothidarPaarvaiNotes).toBe(noteText);

    const updateRow = buildSupabaseTempleUpdateRow(
      { jothidarPaarvai: true, jothidarPaarvaiNotes: 'Updated astrologer insight' },
      {
        id: 'temple-jp-schema-1',
        name: 'Vayalur Jothidar Test Temple',
        location: 'Vayalur, Tiruchirappalli',
        state: 'Tamil Nadu',
        planets: ['sani'],
        deity: 'murugan',
        significance: 'Test significance',
        remedies: [],
        imageUrl: '',
        videoUrl: '',
        timings: '6 AM - 8 PM',
        submittedBy: { id: 'user-admin', name: 'Admin Murugan', role: 'admin' },
        viewsCount: 0,
        createdAt: '2026-11-19T00:00:00Z',
        updatedAt: '2026-11-19T00:00:00Z',
      }
    );
    expect('jothidar_paarvai' in updateRow).toBe(false);
    expect('jothidar_paarvai_notes' in updateRow).toBe(false);
    expect(updateRow.submitted_by.jothidarPaarvai).toBe(true);
    expect(updateRow.submitted_by.jothidarPaarvaiNotes).toBe('Updated astrologer insight');

    // API integration: create one temple WITH Jothidar Paarvai and one WITHOUT
    const withNotesName = 'Jothidar Enabled Temple ' + Date.now();
    const withoutNotesName = 'Regular Temple ' + Date.now();

    const withRes = await request(app)
      .post('/api/temples')
      .send({
        name: withNotesName,
        location: 'Tiruchirappalli',
        state: 'Tamil Nadu',
        planets: ['sani'],
        deity: 'murugan',
        significance: 'With Jothidar notes',
        jothidarPaarvai: true,
        jothidarPaarvaiNotes: noteText,
      });
    expect(withRes.status).toBe(201);
    expect(withRes.body.data.jothidarPaarvai).toBe(true);
    expect(withRes.body.data.jothidarPaarvaiNotes).toBe(noteText);

    const withoutRes = await request(app)
      .post('/api/temples')
      .send({
        name: withoutNotesName,
        location: 'Madurai',
        state: 'Tamil Nadu',
        planets: ['suri'],
        deity: 'shivan',
        significance: 'Without Jothidar notes',
        jothidarPaarvai: false,
      });
    expect(withoutRes.status).toBe(201);
    expect(withoutRes.body.data.jothidarPaarvai).toBe(false);

    const filteredRes = await request(app).get('/api/temples?jothidarPaarvai=true');
    expect(filteredRes.status).toBe(200);
    expect(filteredRes.body.data.some((t: any) => t.name === withNotesName)).toBe(true);
    expect(filteredRes.body.data.some((t: any) => t.name === withoutNotesName)).toBe(false);
  });

  it('reads solution tags strictly from DB (no hardcoded seeds) and supports POST/PUT/DELETE CRUD', async () => {
    const getRes = await request(app).get('/api/solution-tags');
    expect(getRes.status).toBe(200);
    expect(getRes.body.success).toBe(true);
    expect(Array.isArray(getRes.body.data)).toBe(true);

    // Create a problem tag
    const createRes = await request(app)
      .post('/api/solution-tags')
      .send({
        nameTamil: 'திருமண தடை ' + Date.now(),
        nameEnglish: 'Marriage Delay',
      });
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    const createdId = createRes.body.data.id;
    expect(createdId).toBeTruthy();

    // Update the tag
    const updateRes = await request(app)
      .put(`/api/solution-tags/${createdId}`)
      .send({
        nameTamil: 'திருமண தடை நீங்க',
        nameEnglish: 'Marriage Delay Remedy',
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.nameTamil).toBe('திருமண தடை நீங்க');

    // Delete the test tag cleanly
    const delRes = await request(app).delete(`/api/solution-tags/${createdId}`);
    expect(delRes.status).toBe(200);

    const afterRes = await request(app).get('/api/solution-tags');
    expect(afterRes.body.data.some((t: any) => t.id === createdId)).toBe(false);
  });

  it('keeps temples.submitted_by JSONB clean (stores links in temple_solution_tags) and handles POST /api/temples', async () => {
    const insertRow = buildSupabaseTempleRow({
      id: 'temple-sol-schema-1',
      name: 'Parthasarathy Solution Test Temple',
      location: 'Triplicane, Chennai',
      state: 'Tamil Nadu',
      planets: ['sani'],
      deity: 'vishnu',
      significance: '4,2 bhava remedy',
      remedies: [],
      solutionTags: ['veedu-katta-thadai', 'nilam-virka-thadai'],
      imageUrl: '',
      videoUrl: '',
      timings: '6 AM - 9 PM',
      jothidarPaarvai: true,
      jothidarPaarvaiNotes: '4,2 பாவ அதிகார பிரச்னை தீர',
      submittedBy: { id: 'user-admin', name: 'Admin Murugan', role: 'admin' },
      viewsCount: 0,
      createdAt: '2026-11-20T00:00:00Z',
      updatedAt: '2026-11-20T00:00:00Z',
    });

    expect('solution_tags' in insertRow).toBe(false);
    expect('solutionTags' in insertRow.submitted_by).toBe(false);
    expect(insertRow.submitted_by.jothidarPaarvai).toBe(true);

    const updateRow = buildSupabaseTempleUpdateRow(
      { solutionTags: ['veedu-katta-thadai'] },
      {
        id: 'temple-sol-schema-1',
        name: 'Parthasarathy Solution Test Temple',
        location: 'Triplicane, Chennai',
        state: 'Tamil Nadu',
        planets: ['sani'],
        deity: 'vishnu',
        significance: '4,2 bhava remedy',
        remedies: [],
        imageUrl: '',
        videoUrl: '',
        timings: '6 AM - 9 PM',
        jothidarPaarvai: true,
        jothidarPaarvaiNotes: '4,2 பாவ அதிகார பிரச்னை தீர',
        submittedBy: { id: 'user-admin', name: 'Admin Murugan', role: 'admin' },
        viewsCount: 0,
        createdAt: '2026-11-20T00:00:00Z',
        updatedAt: '2026-11-20T00:00:00Z',
      }
    );
    expect('solution_tags' in updateRow).toBe(false);
    expect('submitted_by' in updateRow).toBe(false);

    const postRes = await request(app)
      .post('/api/temples')
      .send({
        name: 'Solution Tagged Temple ' + Date.now(),
        location: 'Triplicane, Chennai',
        state: 'Tamil Nadu',
        planets: ['sani'],
        deity: 'vishnu',
        significance: 'Property & housing remedies',
        solutionTags: ['veedu-katta-thadai', 'nilam-virka-thadai'],
      });
    expect(postRes.status).toBe(201);
    expect(postRes.body.data.solutionTags).toEqual(['veedu-katta-thadai', 'nilam-virka-thadai']);
    await request(app).delete(`/api/temples/${postRes.body.data.id}`);
  });

  it('supports GET /api/solution-tags/search in any/all modes and cascades deleted tag removal across temples', async () => {
    const tagARes = await request(app)
      .post('/api/solution-tags')
      .send({ nameTamil: 'சோதனை குறிச்சொல் A ' + Date.now(), nameEnglish: 'Test Tag A' });
    const tagBRes = await request(app)
      .post('/api/solution-tags')
      .send({ nameTamil: 'சோதனை குறிச்சொல் B ' + Date.now(), nameEnglish: 'Test Tag B' });

    const tagA = tagARes.body.data.id;
    const tagB = tagBRes.body.data.id;

    const templeBothRes = await request(app)
      .post('/api/temples')
      .send({
        name: 'Junction Both Temple ' + Date.now(),
        location: 'Chennai',
        state: 'Tamil Nadu',
        planets: ['sani'],
        deity: 'vishnu',
        significance: 'Matches both tags',
        solutionTags: [tagA, tagB],
      });
    const templeSingleRes = await request(app)
      .post('/api/temples')
      .send({
        name: 'Junction Single Temple ' + Date.now(),
        location: 'Madurai',
        state: 'Tamil Nadu',
        planets: ['suri'],
        deity: 'shivan',
        significance: 'Matches single tag',
        solutionTags: [tagA],
      });

    const bothId = templeBothRes.body.data.id;
    const singleId = templeSingleRes.body.data.id;

    // Best Match (any): 2/2 match ranks ahead of 1/2 match
    const anyRes = await request(app).get(`/api/solution-tags/search?tagIds=${tagA},${tagB}&mode=any`);
    expect(anyRes.status).toBe(200);
    expect(anyRes.body.data).toHaveLength(2);
    expect(anyRes.body.data[0].temple.id).toBe(bothId);
    expect(anyRes.body.data[0].matchCount).toBe(2);
    expect(anyRes.body.data[1].temple.id).toBe(singleId);
    expect(anyRes.body.data[1].matchCount).toBe(1);

    // Match All (all): only temple solving both tags returned
    const allRes = await request(app).get(`/api/solution-tags/search?tagIds=${tagA},${tagB}&mode=all`);
    expect(allRes.status).toBe(200);
    expect(allRes.body.data).toHaveLength(1);
    expect(allRes.body.data[0].temple.id).toBe(bothId);

    // Delete tagB -> cascades removal from templeBoth
    const delTagRes = await request(app).delete(`/api/solution-tags/${tagB}`);
    expect(delTagRes.status).toBe(200);

    const updatedBoth = db.getTempleById(bothId);
    expect(updatedBoth?.solutionTags).toEqual([tagA]);

    // Cleanup test tagA and test temples
    await request(app).delete(`/api/solution-tags/${tagA}`);
    await request(app).delete(`/api/temples/${bothId}`);
    await request(app).delete(`/api/temples/${singleId}`);
  });
});

