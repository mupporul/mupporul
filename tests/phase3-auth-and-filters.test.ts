import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createBackendApp } from '../backend/src/app.js';
import { db } from '../backend/src/db/database.js';
import { Temple } from '../backend/src/types.js';

describe('Phase 3: Auth & User Security Integration Tests', () => {
  const app = createBackendApp();

  it('authenticates admin user with valid credentials', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        identifier: 'admin',
        password: 'admin123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.username).toBe('admin');
    expect(res.body.data.role).toBe('admin');
    // Ensure password is never exposed in login response
    expect(res.body.data.password).toBeUndefined();
  });

  it('rejects login with wrong password', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        identifier: 'admin',
        password: 'wrong-password-123',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid username/email or password');
  });

  it('rejects login with non-existent username', async () => {
    const res = await request(app)
      .post('/api/users/login')
      .send({
        identifier: 'non_existent_user_99999',
        password: 'anyPassword',
      });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('Invalid username/email or password');
  });

  it('creates a new user and allows immediate login', async () => {
    const timestamp = Date.now();
    const newUserPayload = {
      name: `Test Devotee ${timestamp}`,
      username: `devotee_${timestamp}`,
      password: 'DevoteePassword@123',
      role: 'contributor',
      email: `devotee_${timestamp}@mupporul.com`,
    };

    // 1. Create user
    const createRes = await request(app)
      .post('/api/users')
      .send(newUserPayload);

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.username).toBe(newUserPayload.username);
    expect(createRes.body.data.role).toBe('contributor');

    // 2. Login with new credentials
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({
        identifier: newUserPayload.username,
        password: newUserPayload.password,
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    expect(loginRes.body.data.username).toBe(newUserPayload.username);
  });

  it('changes password successfully and validates old vs new password', async () => {
    const testUsername = `user_pw_${Date.now()}`;
    const initialPassword = 'InitialSecretPassword1';
    const newPassword = 'UpdatedSecretPassword2';

    // 1. Create user
    await request(app)
      .post('/api/users')
      .send({
        name: 'Password Test User',
        username: testUsername,
        password: initialPassword,
        role: 'user',
      });

    // 2. Change password
    const changeRes = await request(app)
      .post('/api/users/change-password')
      .send({
        identifier: testUsername,
        currentPassword: initialPassword,
        newPassword: newPassword,
      });

    expect(changeRes.status).toBe(200);
    expect(changeRes.body.success).toBe(true);

    // 3. Old password should now fail
    const oldLoginRes = await request(app)
      .post('/api/users/login')
      .send({
        identifier: testUsername,
        password: initialPassword,
      });
    expect(oldLoginRes.status).toBe(401);

    // 4. New password should succeed
    const newLoginRes = await request(app)
      .post('/api/users/login')
      .send({
        identifier: testUsername,
        password: newPassword,
      });
    expect(newLoginRes.status).toBe(200);
    expect(newLoginRes.body.success).toBe(true);
  });
});

describe('Phase 3: Filter & Search Calculation Tests', () => {
  const sampleTemples: Temple[] = [
    {
      id: 't-1',
      name: 'Suryanar Kovil',
      nameTamil: 'சூரியனார் கோவில்',
      location: 'Kumbakonam, Thanjavur',
      state: 'Tamil Nadu',
      planets: ['sun'],
      deity: 'suryan',
      significance: 'Sun deity pariharam sthalam',
      remedies: [],
      createdAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 't-2',
      name: 'Thingaloor Kailasanathar',
      nameTamil: 'திங்களூர் கைலாசநாதர்',
      location: 'Thingaloor, Thanjavur',
      state: 'Tamil Nadu',
      planets: ['moon'],
      deity: 'shivan',
      significance: 'Moon Chandra pariharam sthalam',
      remedies: [],
      createdAt: '2026-01-02T00:00:00Z',
    },
    {
      id: 't-3',
      name: 'Vaitheeswaran Kovil',
      nameTamil: 'வைத்தீஸ்வரன் கோவில்',
      location: 'Mayiladuthurai',
      state: 'Tamil Nadu',
      planets: ['mars'],
      deity: 'shivan',
      significance: 'Chevvai / Mars pariharam',
      remedies: [],
      createdAt: '2026-01-03T00:00:00Z',
    },
    {
      id: 't-4',
      name: 'Srikalahasti Temple',
      nameTamil: 'ஸ்ரீகாளஹஸ்தி',
      location: 'Tirupati',
      state: 'Andhra Pradesh',
      planets: ['rahu', 'ketu'],
      deity: 'shivan',
      significance: 'Rahu and Ketu sarpa dosha pariharam',
      remedies: [],
      createdAt: '2026-01-04T00:00:00Z',
    },
  ];

  function applyClientFilter(
    temples: Temple[],
    filters: {
      planets?: string[];
      planetMatchMode?: 'exact' | 'all';
      deity?: string | null;
      state?: string | null;
      searchQuery?: string;
    }
  ) {
    const selectedPlanets = filters.planets || [];
    const matchMode = filters.planetMatchMode || 'exact';

    return temples.filter(temple => {
      // 1. Planet filtering
      if (selectedPlanets.length > 0) {
        if (matchMode === 'exact') {
          const hasSameLength = temple.planets.length === selectedPlanets.length;
          const allPresent = selectedPlanets.every(p => temple.planets.includes(p));
          if (!hasSameLength || !allPresent) return false;
        } else {
          const allPresent = selectedPlanets.every(p => temple.planets.includes(p));
          if (!allPresent) return false;
        }
      }

      // 2. Deity filter
      if (filters.deity && temple.deity.toLowerCase() !== filters.deity.toLowerCase()) {
        return false;
      }

      // 3. State filter
      if (filters.state && temple.state.toLowerCase() !== filters.state.toLowerCase()) {
        return false;
      }

      // 4. Search query
      if (filters.searchQuery && filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        const matchName = temple.name.toLowerCase().includes(q);
        const matchTamil = temple.nameTamil?.toLowerCase().includes(q);
        const matchLocation = temple.location.toLowerCase().includes(q);
        const matchSig = temple.significance?.toLowerCase().includes(q);
        if (!matchName && !matchTamil && !matchLocation && !matchSig) {
          return false;
        }
      }

      return true;
    });
  }

  it('filters by exact planet match correctly', () => {
    // Only temples with strictly ['rahu'] should match; t-4 has ['rahu', 'ketu'] so should not match in exact mode
    const exactRahu = applyClientFilter(sampleTemples, {
      planets: ['rahu'],
      planetMatchMode: 'exact',
    });
    expect(exactRahu.length).toBe(0);

    // Exact match for both rahu and ketu
    const exactRahuKetu = applyClientFilter(sampleTemples, {
      planets: ['rahu', 'ketu'],
      planetMatchMode: 'exact',
    });
    expect(exactRahuKetu.length).toBe(1);
    expect(exactRahuKetu[0].name).toBe('Srikalahasti Temple');
  });

  it('filters by all (contains) planet match correctly', () => {
    // In 'all' mode, t-4 contains 'rahu', so it matches!
    const allRahu = applyClientFilter(sampleTemples, {
      planets: ['rahu'],
      planetMatchMode: 'all',
    });
    expect(allRahu.length).toBe(1);
    expect(allRahu[0].name).toBe('Srikalahasti Temple');
  });

  it('filters by deity and state simultaneously', () => {
    const shivaTN = applyClientFilter(sampleTemples, {
      deity: 'shivan',
      state: 'Tamil Nadu',
    });
    // Should return t-2 and t-3
    expect(shivaTN.map(t => t.id)).toEqual(['t-2', 't-3']);

    const shivaAP = applyClientFilter(sampleTemples, {
      deity: 'shivan',
      state: 'Andhra Pradesh',
    });
    expect(shivaAP.map(t => t.id)).toEqual(['t-4']);
  });

  it('searches by Tamil and English text query', () => {
    const tamilSearch = applyClientFilter(sampleTemples, {
      searchQuery: 'கைலாசநாதர்',
    });
    expect(tamilSearch.length).toBe(1);
    expect(tamilSearch[0].id).toBe('t-2');

    const englishLocationSearch = applyClientFilter(sampleTemples, {
      searchQuery: 'Mayiladuthurai',
    });
    expect(englishLocationSearch.length).toBe(1);
    expect(englishLocationSearch[0].id).toBe('t-3');
  });
});
