import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Temple, TempleSubmission, UserProfile, Role, Deity, SolutionTag, NaamaVilakkamEntry } from '../types.js';
import { INITIAL_TEMPLES, INITIAL_SUBMISSIONS, INITIAL_USERS, INITIAL_DEITIES, INITIAL_SOLUTION_TAGS } from './initialData.js';
import {
  isSupabaseConfigured,
  fetchTemplesFromSupabase,
  insertTempleToSupabase,
  updateTempleInSupabase,
  deleteTempleFromSupabase,
  clearAllTemplesFromSupabase,
  fetchUsersFromSupabase,
  insertUserToSupabase,
  updateUserPasswordInSupabase,
  updateUserRoleInSupabase,
  deleteUserFromSupabase,
  fetchDeitiesFromSupabase,
  insertDeityToSupabase,
  updateDeityInSupabase,
  deleteDeityFromSupabase,
  fetchSolutionTagsFromSupabase,
  insertSolutionTagToSupabase,
  updateSolutionTagInSupabase,
  deleteSolutionTagFromSupabase,
  queryTemplesBySolutionTagsFromSupabase,
  fetchSubmissionsFromSupabase,
  insertSubmissionToSupabase,
  updateSubmissionInSupabase,
  fetchFeatureFlagFromSupabase,
  upsertFeatureFlagToSupabase,
  fetchNaamaVilakkamFromSupabase,
  upsertNaamaVilakkamToSupabase,
  deleteNaamaVilakkamFromSupabase,
} from './supabaseClient.js';

interface DatabaseSchema {
  version: string;
  updatedAt: string;
  temples: Temple[];
  submissions: TempleSubmission[];
  users: UserProfile[];
  deities: Deity[];
  solutionTags?: SolutionTag[];
  naamaVilakkam?: NaamaVilakkamEntry[];
  featureFlags?: {
    naamaVilakkamEnabled?: boolean;
  };
}

export class Database {
  private dbPath: string;
  private data: DatabaseSchema;
  private lastSupabaseSync: number = 0;
  private activeSyncPromise: Promise<void> | null = null;
  private pendingSupabaseWrites: Set<Promise<any>> = new Set();

  private trackSupabaseWrite(promise: Promise<any>, label: string): void {
    const tracked = promise
      .catch(e => console.error(`[Supabase] ${label} error:`, e))
      .finally(() => {
        this.pendingSupabaseWrites.delete(tracked);
      });
    this.pendingSupabaseWrites.add(tracked);
  }

  public async flushSupabaseWrites(): Promise<void> {
    if (this.pendingSupabaseWrites.size === 0) return;
    await Promise.allSettled(Array.from(this.pendingSupabaseWrites));
  }

  constructor() {
    // Determine path to database storage file
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const dataDir = path.resolve(__dirname, '../../data');

    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Fallback to /tmp if read-only filesystem
      }
    }

    this.dbPath = process.env.DB_FILE_PATH || path.join(dataDir, 'mupporul_db.json');
    this.data = this.loadData();
    this.reconcileApprovedSubmissions();

    if (isSupabaseConfigured) {
      this.syncFromSupabase(true);
    }
  }

  public async syncFromSupabase(force = false): Promise<void> {
    if (!isSupabaseConfigured) return;
    await this.flushSupabaseWrites();
    const now = Date.now();
    if (!force && now - this.lastSupabaseSync < 400) {
      return;
    }
    if (this.activeSyncPromise) {
      return this.activeSyncPromise;
    }

    this.activeSyncPromise = (async () => {
      try {
        const [supaTemples, supaUsers, supaDeities, supaSubmissions, supaSolutionTags, supaNaama, supaNaamaFlag] = await Promise.allSettled([
          fetchTemplesFromSupabase(),
          fetchUsersFromSupabase(),
          fetchDeitiesFromSupabase(),
          fetchSubmissionsFromSupabase(),
          fetchSolutionTagsFromSupabase(),
          fetchNaamaVilakkamFromSupabase(),
          fetchFeatureFlagFromSupabase('naama_vilakkam'),
        ]);

        if (supaTemples.status === 'fulfilled' && Array.isArray(supaTemples.value)) {
          this.data.temples = supaTemples.value.map(t => ({ ...t, remedies: [] }));
          for (const t of supaTemples.value) {
            if (t.remedies && t.remedies.length > 0) {
              updateTempleInSupabase(t.id, { remedies: [] }).catch(() => {});
            }
          }
        }
        if (supaUsers.status === 'fulfilled' && Array.isArray(supaUsers.value) && supaUsers.value.length > 0) {
          this.data.users = supaUsers.value;
        }
        if (supaDeities.status === 'fulfilled' && Array.isArray(supaDeities.value) && supaDeities.value.length > 0) {
          this.data.deities = supaDeities.value;
        }
        if (supaSolutionTags.status === 'fulfilled' && Array.isArray(supaSolutionTags.value)) {
          this.data.solutionTags = supaSolutionTags.value;
        }
        if (supaNaama.status === 'fulfilled' && supaNaama.value?.available) {
          this.data.naamaVilakkam = supaNaama.value.entries;
        }
        if (supaNaamaFlag.status === 'fulfilled' && supaNaamaFlag.value?.available && typeof supaNaamaFlag.value.enabled === 'boolean') {
          this.data.featureFlags = {
            ...(this.data.featureFlags || {}),
            naamaVilakkamEnabled: supaNaamaFlag.value.enabled,
          };
        }
        if (supaSubmissions.status === 'fulfilled' && Array.isArray(supaSubmissions.value)) {
          this.data.submissions = supaSubmissions.value.map(s => {
            if (s.templeData) s.templeData.remedies = [];
            if (s.previousData) s.previousData.remedies = [];
            return s;
          });
        }

        this.reconcileApprovedSubmissions();
        this.lastSupabaseSync = Date.now();
        this.saveData();
      } catch (err) {
        console.warn('[Database] Supabase sync error:', err);
      } finally {
        this.activeSyncPromise = null;
      }
    })();

    return this.activeSyncPromise;
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const content = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(content) as DatabaseSchema;
        if (parsed && Array.isArray(parsed.temples)) {
          // Clean out legacy sample mock temples and ensure no remedy tags
          parsed.temples = parsed.temples
            .filter(t =>
              !['temple-melmalayanoor', 'temple-thirubuvanam', 'temple-thirubavanoor', 'temple-suriyanar', 'temple-thingalur', 'temple-vaitheeswaran', 'temple-thirunageswaram', 'temple-alangudi'].includes(t.id)
            )
            .map(t => ({
              ...t,
              remedies: [],
            }));
          // Clean out sample bootstrap submissions so review tab only has genuine user submissions
          if (Array.isArray(parsed.submissions)) {
            parsed.submissions = parsed.submissions
              .filter(s =>
                !['sub-new-kanjanur', 'sub-edit-melmalayanoor', 'sub-new-thirunallar'].includes(s.id)
              )
              .map(s => {
                if (s.templeData) s.templeData.remedies = [];
                if (s.previousData) s.previousData.remedies = [];
                return s;
              });
          }
          // Clean out legacy sample users, keeping admin and real users
          if (Array.isArray(parsed.users)) {
            parsed.users = parsed.users.filter(u =>
              !['user-vk', 'user-pilgrim', 'user-devotee'].includes(u.id)
            );
          }
          // Ensure deities array is present and populated
          if (!Array.isArray(parsed.deities) || parsed.deities.length === 0) {
            parsed.deities = [...INITIAL_DEITIES];
          }
          // Ensure solutionTags array is present (sourced strictly from DB, never hardcoded)
          if (!Array.isArray(parsed.solutionTags)) {
            parsed.solutionTags = [];
          }
          if (!Array.isArray(parsed.naamaVilakkam)) {
            parsed.naamaVilakkam = [];
          }
          if (!parsed.featureFlags || typeof parsed.featureFlags !== 'object') {
            parsed.featureFlags = { naamaVilakkamEnabled: true };
          } else if (typeof parsed.featureFlags.naamaVilakkamEnabled !== 'boolean') {
            parsed.featureFlags.naamaVilakkamEnabled = true;
          }
          return parsed;
        }
      }
    } catch (err) {
      console.warn('[Database] Could not read existing DB file, initializing fresh:', err);
    }

    // Default seed
    const defaultData: DatabaseSchema = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      temples: [...INITIAL_TEMPLES],
      submissions: [...INITIAL_SUBMISSIONS],
      users: [...INITIAL_USERS],
      deities: [...INITIAL_DEITIES],
      solutionTags: [],
      naamaVilakkam: [],
      featureFlags: { naamaVilakkamEnabled: true },
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(newData?: DatabaseSchema): void {
    if (newData) {
      this.data = newData;
    }
    this.data.updatedAt = new Date().toISOString();
    try {
      const dir = path.dirname(this.dbPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[Database] Failed to save DB to disk:', err);
    }
  }

  // ==========================================
  // TEMPLES CRUD
  // ==========================================
  public getTemples(filters?: {
    planets?: string[];
    planetMatchMode?: 'all' | 'exact';
    deity?: string;
    state?: string;
    jothidarPaarvai?: boolean;
    search?: string;
  }): Temple[] {
    this.reconcileApprovedSubmissions();
    let list = [...this.data.temples];

    if (!filters) return list;

    // Filter by Planets (exact or all)
    if (filters.planets && filters.planets.length > 0) {
      if (filters.planetMatchMode === 'exact') {
        const sortedSelected = [...filters.planets].sort().join(',');
        list = list.filter(t => {
          const sortedTemple = [...t.planets].sort().join(',');
          return sortedTemple === sortedSelected;
        });
      } else {
        list = list.filter(t => filters.planets!.every(p => t.planets.includes(p)));
      }
    }

    // Filter by Deity
    if (filters.deity) {
      list = list.filter(t => t.deity.toLowerCase() === filters.deity!.toLowerCase());
    }

    // Filter by State
    if (filters.state) {
      list = list.filter(t => t.state.toLowerCase() === filters.state!.toLowerCase());
    }

    // Filter by Jothidar Paarvai
    if (filters.jothidarPaarvai) {
      list = list.filter(t => Boolean(t.jothidarPaarvai || (t.jothidarPaarvaiNotes && t.jothidarPaarvaiNotes.trim())));
    }

    // Search Query (name, location, significance, jothidarPaarvaiNotes)
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) ||
        (t.nameTamil && t.nameTamil.toLowerCase().includes(q)) ||
        t.location.toLowerCase().includes(q) ||
        (t.significance && t.significance.toLowerCase().includes(q)) ||
        (t.jothidarPaarvaiNotes && t.jothidarPaarvaiNotes.toLowerCase().includes(q))
      );
    }

    // Always sort by created date (newest created first), NOT modified/updated date
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return list;
  }

  public getTempleById(id: string): Temple | undefined {
    return this.data.temples.find(t => t.id === id);
  }

  public incrementTempleViews(id: string): Temple | undefined {
    const temple = this.data.temples.find(t => t.id === id);
    if (temple) {
      temple.viewsCount = (temple.viewsCount || 0) + 1;
      this.saveData();
      return temple;
    }
    return undefined;
  }

  public createTemple(templeData: Omit<Temple, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>): Temple {
    // Prevent duplicate temple insertion if temple with same name already exists
    const existing = this.data.temples.find(
      t => t.name.trim().toLowerCase() === templeData.name.trim().toLowerCase()
    );
    if (existing) {
      const merged = this.updateTemple(existing.id, templeData);
      return merged || existing;
    }

    const hasJp = Boolean(templeData.jothidarPaarvai || (templeData.jothidarPaarvaiNotes && templeData.jothidarPaarvaiNotes.trim()));
    const cleanSolutionTags = Array.isArray(templeData.solutionTags)
      ? Array.from(new Set(templeData.solutionTags.filter(id => typeof id === 'string' && id.trim())))
      : [];
    const newTemple: Temple = {
      ...templeData,
      remedies: [],
      solutionTags: cleanSolutionTags,
      jothidarPaarvai: hasJp,
      jothidarPaarvaiNotes: hasJp ? (templeData.jothidarPaarvaiNotes || '').trim() : '',
      id: `temple-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.temples.unshift(newTemple);
    this.saveData();

    if (isSupabaseConfigured) {
      this.trackSupabaseWrite(insertTempleToSupabase(newTemple), 'Insert temple');
    }

    return newTemple;
  }

  public updateTemple(id: string, updates: Partial<Temple>): Temple | null {
    const index = this.data.temples.findIndex(t => t.id === id);
    if (index === -1) return null;

    const previousTemple = this.data.temples[index];
    const prevNameClean = (previousTemple.name || '').trim().toLowerCase();

    const sanitizedUpdates: Partial<Temple> = {
      ...updates,
      remedies: [],
    };
    if (updates.solutionTags !== undefined) {
      sanitizedUpdates.solutionTags = Array.isArray(updates.solutionTags)
        ? Array.from(new Set(updates.solutionTags.filter(tagId => typeof tagId === 'string' && tagId.trim())))
        : [];
    }
    if (sanitizedUpdates.jothidarPaarvai !== undefined) {
      sanitizedUpdates.jothidarPaarvai = Boolean(sanitizedUpdates.jothidarPaarvai);
      if (!sanitizedUpdates.jothidarPaarvai) {
        sanitizedUpdates.jothidarPaarvaiNotes = '';
      }
    }
    if (typeof sanitizedUpdates.jothidarPaarvaiNotes === 'string') {
      sanitizedUpdates.jothidarPaarvaiNotes = sanitizedUpdates.jothidarPaarvaiNotes.trim();
    }

    this.data.temples[index] = {
      ...previousTemple,
      ...sanitizedUpdates,
      updatedAt: new Date().toISOString()
    };

    // Keep any historical submissions linked to this temple ID so renaming a temple
    // never causes reconcileApprovedSubmissions() to resurrect the old name as a duplicate.
    for (const sub of this.data.submissions) {
      const subNameClean = (sub.templeData?.name || '').trim().toLowerCase();
      if (!sub.templeId && prevNameClean && subNameClean === prevNameClean) {
        sub.templeId = id;
        if (isSupabaseConfigured) {
          this.trackSupabaseWrite(
            updateSubmissionInSupabase(sub.id, { templeId: id }),
            'Link submission templeId'
          );
        }
      }
    }

    this.saveData();

    if (isSupabaseConfigured) {
      this.trackSupabaseWrite(
        updateTempleInSupabase(id, sanitizedUpdates, this.data.temples[index]),
        'Update temple'
      );
    }

    return this.data.temples[index];
  }

  public deleteTemple(id: string): boolean {
    const targetTemple = this.data.temples.find(t => t.id === id);
    const prevLength = this.data.temples.length;
    this.data.temples = this.data.temples.filter(t => t.id !== id);
    if (this.data.temples.length !== prevLength) {
      // Mark matching approved submissions as deleted so reconciliation doesn't resurrect the deleted temple
      const targetNameClean = (targetTemple?.name || '').trim().toLowerCase();
      for (const sub of this.data.submissions) {
        const subNameClean = (sub.templeData?.name || '').trim().toLowerCase();
        const matchesId = sub.templeId === id;
        const matchesOrphanName = !sub.templeId && targetNameClean && subNameClean === targetNameClean;
        if (matchesId || matchesOrphanName) {
          sub.templeId = `deleted:${id}`;
          if (isSupabaseConfigured) {
            this.trackSupabaseWrite(
              updateSubmissionInSupabase(sub.id, { templeId: sub.templeId }),
              'Mark deleted temple submission'
            );
          }
        }
      }

      this.saveData();
      if (isSupabaseConfigured) {
        this.trackSupabaseWrite(deleteTempleFromSupabase(id), 'Delete temple');
      }
      return true;
    }
    return false;
  }

  public async clearAllTemples(): Promise<boolean> {
    this.data.temples = [];
    this.saveData();
    if (isSupabaseConfigured) {
      try {
        await clearAllTemplesFromSupabase();
      } catch (e) {
        console.error('[Supabase] Clear all error:', e);
      }
    }
    return true;
  }

  // ==========================================
  // SUBMISSIONS (CONTRIBUTOR / REVIEW WORKFLOW)
  // ==========================================
  public getSubmissions(status?: string, userId?: string): TempleSubmission[] {
    let list = [...this.data.submissions];
    if (status) {
      list = list.filter(s => s.status === status);
    }
    if (userId) {
      list = list.filter(s => s.submittedBy?.id === userId);
    }
    return list;
  }

  public createSubmission(submissionData: Omit<TempleSubmission, 'id' | 'submittedAt' | 'status'>): TempleSubmission {
    const newSubmission: TempleSubmission = {
      ...submissionData,
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    this.data.submissions.unshift(newSubmission);

    // Update contributor count
    const user = this.data.users.find(u => u.id === submissionData.submittedBy.id);
    if (user) {
      user.contributionsCount = (user.contributionsCount || 0) + 1;
    }

    this.saveData();
    if (isSupabaseConfigured) {
      this.trackSupabaseWrite(insertSubmissionToSupabase(newSubmission), 'Insert submission');
    }
    return newSubmission;
  }

  public reviewSubmission(
    submissionId: string,
    action: 'approved' | 'rejected',
    reviewer: { id: string; name: string; role: any },
    reviewNotes?: string
  ): { submission: TempleSubmission; temple?: Temple } | null {
    const sub = this.data.submissions.find(s => s.id === submissionId);
    if (!sub) return null;

    sub.status = action;
    sub.reviewedBy = reviewer;
    sub.reviewedAt = new Date().toISOString();
    sub.reviewNotes = reviewNotes || '';

    let updatedTemple: Temple | undefined;

    if (action === 'approved') {
      // If contributor, increment approved count
      const author = sub.submittedBy?.id ? this.data.users.find(u => u.id === sub.submittedBy.id) : undefined;
      if (author) {
        author.approvedCount = (author.approvedCount || 0) + 1;
      }

      if (sub.type === 'edit') {
        const existingById = sub.templeId ? this.getTempleById(sub.templeId) : undefined;
        const prevNameClean = (sub.previousData?.name || '').trim().toLowerCase();
        const existingByPrevName = !existingById && prevNameClean
          ? this.data.temples.find(t => t.name.trim().toLowerCase() === prevNameClean)
          : undefined;
        const targetExisting = existingById || existingByPrevName;

        if (targetExisting) {
          sub.templeId = targetExisting.id;
          updatedTemple = this.updateTemple(targetExisting.id, {
            ...sub.templeData,
            updatedAt: new Date().toISOString()
          }) || undefined;
        } else {
          updatedTemple = this.createTemple({
            ...sub.templeData,
            submittedBy: sub.submittedBy || {
              id: reviewer.id,
              name: reviewer.name,
              role: reviewer.role,
            },
          });
          sub.templeId = updatedTemple.id;
        }
      } else {
        // Create new temple or update existing if temple with same name exists
        const templeNameClean = (sub.templeData?.name || '').trim().toLowerCase();
        const existingByName = this.data.temples.find(
          t => t.name.trim().toLowerCase() === templeNameClean
        );
        if (existingByName) {
          updatedTemple = this.updateTemple(existingByName.id, {
            ...sub.templeData,
            updatedAt: new Date().toISOString()
          }) || existingByName;
        } else {
          updatedTemple = this.createTemple({
            ...sub.templeData,
            submittedBy: sub.submittedBy || {
              id: reviewer.id,
              name: reviewer.name,
              role: reviewer.role,
            },
          });
        }
        sub.templeId = updatedTemple.id;
      }
      this.reconcileApprovedSubmissions();
    }

    this.saveData();

    if (isSupabaseConfigured) {
      this.trackSupabaseWrite(
        updateSubmissionInSupabase(sub.id, {
          status: sub.status,
          templeId: sub.templeId,
          reviewedBy: sub.reviewedBy,
          reviewedAt: sub.reviewedAt,
          reviewNotes: sub.reviewNotes,
        }),
        'Update submission'
      );
    }

    return { submission: sub, temple: updatedTemple };
  }

  /**
   * Reconciles any approved submissions:
   * If a submission has status 'approved', guarantees that its corresponding temple exists
   * in the active temples directory. If missing (e.g. from prior approval or interrupted sync),
   * synthesizes and registers the temple automatically and persists to Supabase/JSON.
   */
  public reconcileApprovedSubmissions(): void {
    if (!this.data || !Array.isArray(this.data.submissions) || !Array.isArray(this.data.temples)) return;

    const approvedSubs = this.data.submissions.filter(s => s.status === 'approved');
    const supersededNames = new Set<string>();
    for (const s of approvedSubs) {
      if (s.type === 'edit' && s.previousData?.name) {
        supersededNames.add(s.previousData.name.trim().toLowerCase());
      }
    }

    let hasChanges = false;

    for (const sub of approvedSubs) {
      if (!sub.templeData || !sub.templeData.name) continue;
      if (sub.templeId && sub.templeId.startsWith('deleted:')) continue;

      const cleanName = sub.templeData.name.trim().toLowerCase();

      // Never re-synthesize a duplicate from a submission whose temple name was already renamed by an edit,
      // or from historical 'edit' submissions (which mutate an existing temple rather than adding a second one).
      if (sub.type === 'edit') continue;
      if (!sub.templeId && supersededNames.has(cleanName)) continue;

      const existing = this.data.temples.find(
        t => (sub.templeId && t.id === sub.templeId) || t.name.trim().toLowerCase() === cleanName
      );

      if (!existing) {
        console.log(`[Database] Auto-reconciling approved submission into temples directory: "${sub.templeData.name}"`);
        const synthesizedTemple: Temple = {
          id: sub.templeId || `temple-approved-${sub.id}`,
          name: sub.templeData.name,
          location: sub.templeData.location || '',
          state: sub.templeData.state || 'Tamil Nadu',
          planets: Array.isArray(sub.templeData.planets) ? sub.templeData.planets : [],
          deity: sub.templeData.deity || 'shivan',
          significance: sub.templeData.significance || (sub.templeData as any).descriptionTamil || '',
          remedies: [],
          solutionTags: Array.isArray(sub.templeData.solutionTags) ? sub.templeData.solutionTags : [],
          imageUrl: sub.templeData.imageUrl || '',
          videoUrl: sub.templeData.videoUrl || '',
          timings: sub.templeData.timings || '',
          history: sub.templeData.history || '',
          poojaDetails: sub.templeData.poojaDetails || '',
          contactNumber: sub.templeData.contactNumber || '',
          jothidarPaarvai: Boolean(sub.templeData.jothidarPaarvai || (sub.templeData.jothidarPaarvaiNotes && sub.templeData.jothidarPaarvaiNotes.trim())),
          jothidarPaarvaiNotes: sub.templeData.jothidarPaarvaiNotes || '',
          submittedBy: sub.submittedBy || {
            id: 'contributor',
            name: 'Contributor',
            role: 'contributor',
          },
          viewsCount: 0,
          createdAt: sub.reviewedAt || sub.submittedAt || new Date().toISOString(),
          updatedAt: sub.reviewedAt || new Date().toISOString(),
        };

        sub.templeId = synthesizedTemple.id;
        this.data.temples.unshift(synthesizedTemple);
        hasChanges = true;

        if (isSupabaseConfigured) {
          this.trackSupabaseWrite(insertTempleToSupabase(synthesizedTemple), 'Auto-sync approved temple');
          this.trackSupabaseWrite(
            updateSubmissionInSupabase(sub.id, { templeId: synthesizedTemple.id }),
            'Link auto-synced submission templeId'
          );
        }
      } else if (!sub.templeId) {
        sub.templeId = existing.id;
        hasChanges = true;
        if (isSupabaseConfigured) {
          this.trackSupabaseWrite(
            updateSubmissionInSupabase(sub.id, { templeId: existing.id }),
            'Link existing temple to submission'
          );
        }
      }
    }

    if (hasChanges) {
      this.saveData();
    }
  }

  public deleteSubmission(id: string): boolean {
    const prevLen = this.data.submissions.length;
    this.data.submissions = this.data.submissions.filter(s => s.id !== id);
    if (this.data.submissions.length !== prevLen) {
      this.saveData();
      return true;
    }
    return false;
  }


  // ==========================================
  // USERS & AUTH
  // ==========================================
  public getUsers(): UserProfile[] {
    return this.data.users.map(({ password, ...u }) => u as UserProfile);
  }

  public getUserById(id: string): UserProfile | undefined {
    return this.data.users.find(u => u.id === id);
  }

  public authenticate(identifier: string, password?: string): UserProfile | null {
    const clean = identifier.toLowerCase().trim();
    const user = this.data.users.find(
      u => u.username.toLowerCase() === clean || (u.email && u.email.toLowerCase() === clean)
    );
    if (!user) return null;

    // Check password if provided, or allow test pass
    if (password && user.password && user.password !== password) {
      return null;
    }
    return user;
  }

  public createUser(userData: {
    name: string;
    username: string;
    password: string;
    email?: string;
    role?: Role;
  }): UserProfile {
    const username = userData.username.trim().toLowerCase();
    const existing = this.data.users.find(u => u.username.toLowerCase() === username);
    if (existing) {
      throw new Error(`Username "${username}" is already taken.`);
    }

    const name = userData.name.trim();
    const nameParts = name.split(/\s+/);
    const avatarText = nameParts.length >= 2 
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : name.slice(0, 2).toUpperCase() || 'U';

    const colors = [
      'from-amber-500 to-amber-700',
      'from-purple-500 to-purple-700',
      'from-emerald-500 to-emerald-700',
      'from-blue-500 to-blue-700',
      'from-rose-500 to-rose-700',
      'from-cyan-500 to-cyan-700',
    ];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const newUser: UserProfile = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      username,
      password: userData.password,
      email: userData.email?.trim() || `${username}@mupporul.app`,
      role: userData.role || 'user',
      avatarText,
      avatarColor,
      contributionsCount: 0,
      approvedCount: 0,
    };

    this.data.users.push(newUser);
    this.saveData();

    if (isSupabaseConfigured) {
      insertUserToSupabase(newUser).catch(e => console.error('[Supabase] Insert user error:', e));
    }

    return newUser;
  }

  public deleteUser(id: string): boolean {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.data.users.splice(index, 1);
    this.saveData();

    if (isSupabaseConfigured) {
      deleteUserFromSupabase(id).catch(e => console.error('[Supabase] Delete user error:', e));
    }

    return true;
  }

  public updatePassword(identifierOrId: string, newPassword: string, currentPassword?: string): boolean {
    const clean = identifierOrId.toLowerCase().trim();
    const user = this.data.users.find(
      u => u.id === identifierOrId ||
           u.username.toLowerCase() === clean ||
           (u.email && u.email.toLowerCase() === clean)
    );
    if (!user) throw new Error('User not found. Please verify your username or email.');
    if (currentPassword && user.password && user.password !== currentPassword.trim()) {
      throw new Error('Current password does not match. Please verify and try again.');
    }
    user.password = newPassword.trim();
    this.saveData();

    if (isSupabaseConfigured) {
      updateUserPasswordInSupabase(user.id, user.password).catch(e => console.error('[Supabase] Update password error:', e));
    }

    return true;
  }

  public async updateUserRole(id: string, role: Role): Promise<UserProfile | null> {
    if (!['user', 'contributor', 'admin'].includes(role)) {
      throw new Error(`Invalid role "${role}". Must be user, contributor, or admin.`);
    }

    const user = this.data.users.find(u => u.id === id);
    if (!user) return null;

    const previousRole = user.role;
    user.role = role;

    if (isSupabaseConfigured) {
      try {
        await updateUserRoleInSupabase(user.id, role);
      } catch (e) {
        user.role = previousRole;
        throw e;
      }
    }

    this.saveData();
    return user;
  }

  // ==========================================
  // DEITIES
  // ==========================================
  public getDeities(): Deity[] {
    if (!this.data.deities || this.data.deities.length === 0) {
      this.data.deities = [...INITIAL_DEITIES];
      this.saveData();
    }
    return this.data.deities;
  }

  public getDeityById(id: string): Deity | undefined {
    return this.getDeities().find(d => d.id === id);
  }

  public createDeity(deityData: { nameTamil: string; nameEnglish?: string; id?: string }): Deity {
    const existing = this.getDeities();
    // Generate slug from id, english name, or timestamp
    const baseSlug = deityData.id?.trim() || deityData.nameEnglish?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || `deity-${Date.now()}`;
    const id = baseSlug.replace(/^-+|-+$/g, '') || `deity-${Date.now()}`;
    
    const newDeity: Deity = {
      id,
      nameTamil: deityData.nameTamil.trim(),
      nameEnglish: deityData.nameEnglish?.trim() || deityData.nameTamil.trim(),
    };

    const idx = existing.findIndex(d => d.id === id || d.nameTamil.trim() === newDeity.nameTamil);
    if (idx >= 0) {
      existing[idx] = newDeity;
    } else {
      existing.push(newDeity);
    }
    this.data.deities = existing;
    this.saveData();

    if (isSupabaseConfigured) {
      insertDeityToSupabase(newDeity).catch(e => console.error('[Supabase] Insert deity error:', e));
    }
    return newDeity;
  }

  public updateDeity(id: string, updates: Partial<Deity>): Deity | null {
    const existing = this.getDeities();
    const deity = existing.find(d => d.id === id);
    if (!deity) return null;

    if (updates.nameTamil) deity.nameTamil = updates.nameTamil.trim();
    if (updates.nameEnglish) deity.nameEnglish = updates.nameEnglish.trim();

    this.saveData();

    if (isSupabaseConfigured) {
      updateDeityInSupabase(id, updates).catch(e => console.error('[Supabase] Update deity error:', e));
    }
    return deity;
  }

  public deleteDeity(id: string): boolean {
    const initialLen = this.getDeities().length;
    this.data.deities = this.data.deities.filter(d => d.id !== id);
    const deleted = this.data.deities.length < initialLen;
    if (deleted) {
      this.saveData();
      if (isSupabaseConfigured) {
        deleteDeityFromSupabase(id).catch(e => console.error('[Supabase] Delete deity error:', e));
      }
    }
    return deleted;
  }

  // ==========================================
  // SOLUTION / PROBLEM TAGS (தீர்வு குறிச்சொற்கள்)
  // ==========================================
  public getSolutionTags(): SolutionTag[] {
    if (!Array.isArray(this.data.solutionTags)) {
      this.data.solutionTags = [];
    }
    return this.data.solutionTags;
  }

  public createSolutionTag(tagData: { nameTamil: string; nameEnglish?: string; id?: string }): SolutionTag {
    const existing = this.getSolutionTags();
    const baseSlug =
      tagData.id?.trim() ||
      tagData.nameEnglish?.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') ||
      `tag-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const id = baseSlug || `tag-${Date.now()}`;

    const newTag: SolutionTag = {
      id,
      nameTamil: tagData.nameTamil.trim(),
      nameEnglish: tagData.nameEnglish?.trim() || '',
    };

    const idx = existing.findIndex(t => t.id === id || t.nameTamil.trim() === newTag.nameTamil);
    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...newTag, id: existing[idx].id };
      this.data.solutionTags = existing;
      this.saveData();
      if (isSupabaseConfigured) {
        this.trackSupabaseWrite(insertSolutionTagToSupabase(existing[idx]), 'Upsert solution tag');
      }
      return existing[idx];
    }

    existing.push(newTag);
    this.data.solutionTags = existing;
    this.saveData();

    if (isSupabaseConfigured) {
      this.trackSupabaseWrite(insertSolutionTagToSupabase(newTag), 'Insert solution tag');
    }
    return newTag;
  }

  public updateSolutionTag(id: string, updates: Partial<SolutionTag>): SolutionTag | null {
    const existing = this.getSolutionTags();
    const tag = existing.find(t => t.id === id);
    if (!tag) return null;

    if (updates.nameTamil !== undefined && updates.nameTamil.trim()) {
      tag.nameTamil = updates.nameTamil.trim();
    }
    if (updates.nameEnglish !== undefined) {
      tag.nameEnglish = updates.nameEnglish.trim();
    }

    this.saveData();

    if (isSupabaseConfigured) {
      this.trackSupabaseWrite(updateSolutionTagInSupabase(id, updates), 'Update solution tag');
    }
    return tag;
  }

  public deleteSolutionTag(id: string): boolean {
    const current = this.getSolutionTags();
    const next = current.filter(t => t.id !== id);
    if (next.length < current.length) {
      this.data.solutionTags = next;

      // Mirror ON DELETE CASCADE: remove deleted tag ID from assigned temples cleanly
      for (const temple of this.data.temples) {
        if (Array.isArray(temple.solutionTags) && temple.solutionTags.includes(id)) {
          temple.solutionTags = temple.solutionTags.filter(tagId => tagId !== id);
        }
      }

      this.saveData();
      if (isSupabaseConfigured) {
        this.trackSupabaseWrite(deleteSolutionTagFromSupabase(id), 'Delete solution tag');
      }
      return true;
    }
    return false;
  }

  public async searchTemplesBySolutionTags(
    tagIds: string[],
    mode: 'any' | 'all' = 'any'
  ): Promise<{ temple: Temple; matchedTagIds: string[]; matchCount: number }[]> {
    const cleanTagIds = Array.from(new Set((tagIds || []).filter(id => typeof id === 'string' && id.trim())));
    if (cleanTagIds.length === 0) return [];

    this.reconcileApprovedSubmissions();

    // Use indexed Supabase junction table query when available
    if (isSupabaseConfigured) {
      const remote = await queryTemplesBySolutionTagsFromSupabase(cleanTagIds, mode);
      if (remote.available && remote.matches.length > 0) {
        const templeMap = new Map(this.data.temples.map(t => [t.id, t]));
        const resolved = remote.matches
          .map(m => {
            const temple = templeMap.get(m.templeId);
            if (!temple) return null;
            return {
              temple,
              matchedTagIds: m.matchedTagIds,
              matchCount: m.matchedTagIds.length,
            };
          })
          .filter((item): item is { temple: Temple; matchedTagIds: string[]; matchCount: number } => Boolean(item));

        if (resolved.length > 0) {
          return resolved;
        }
      }
    }

    // Fast indexed lookup in memory
    const results = this.data.temples
      .map(temple => {
        const assigned = Array.isArray(temple.solutionTags) ? temple.solutionTags : [];
        const matchedTagIds = cleanTagIds.filter(id => assigned.includes(id));
        return {
          temple,
          matchedTagIds,
          matchCount: matchedTagIds.length,
        };
      })
      .filter(item =>
        mode === 'all'
          ? item.matchCount === cleanTagIds.length
          : item.matchCount > 0
      )
      .sort((a, b) => {
        if (b.matchCount !== a.matchCount) {
          return b.matchCount - a.matchCount;
        }
        return (
          new Date(b.temple.createdAt || 0).getTime() -
          new Date(a.temple.createdAt || 0).getTime()
        );
      });

    return results;
  }

  // ==========================================
  // STANDALONE நாம விளக்கம் (NAAMA VILAKKAM) & FEATURE FLAGS
  // ==========================================
  public getNaamaVilakkamEnabled(): boolean {
    if (!this.data.featureFlags || typeof this.data.featureFlags.naamaVilakkamEnabled !== 'boolean') {
      return true;
    }
    return this.data.featureFlags.naamaVilakkamEnabled;
  }

  public setNaamaVilakkamEnabled(enabled: boolean): boolean {
    const cleanEnabled = Boolean(enabled);
    this.data.featureFlags = {
      ...(this.data.featureFlags || {}),
      naamaVilakkamEnabled: cleanEnabled,
    };
    this.saveData();
    if (isSupabaseConfigured) {
      this.trackSupabaseWrite(
        upsertFeatureFlagToSupabase('naama_vilakkam', cleanEnabled),
        'Upsert naama_vilakkam feature flag'
      );
    }
    return cleanEnabled;
  }

  public getNaamaVilakkamList(): NaamaVilakkamEntry[] {
    if (!Array.isArray(this.data.naamaVilakkam)) {
      this.data.naamaVilakkam = [];
    }
    return [...this.data.naamaVilakkam].sort(
      (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
    );
  }

  public createNaamaVilakkam(input: {
    nameTamil: string;
    planets: string[];
    notes?: string;
    createdBy?: { id: string; name: string; role: Role };
  }): NaamaVilakkamEntry {
    if (!Array.isArray(this.data.naamaVilakkam)) {
      this.data.naamaVilakkam = [];
    }
    const cleanPlanets = Array.from(
      new Set((input.planets || []).filter(p => typeof p === 'string' && p.trim()))
    );
    const now = new Date().toISOString();
    const entry: NaamaVilakkamEntry = {
      id: `naama-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      nameTamil: input.nameTamil.trim(),
      planets: cleanPlanets,
      notes: (input.notes || '').trim(),
      createdBy: input.createdBy,
      createdAt: now,
      updatedAt: now,
    };

    this.data.naamaVilakkam.unshift(entry);
    this.saveData();

    if (isSupabaseConfigured) {
      this.trackSupabaseWrite(upsertNaamaVilakkamToSupabase(entry), 'Insert naama_vilakkam');
    }
    return entry;
  }

  public updateNaamaVilakkam(
    id: string,
    updates: { nameTamil?: string; planets?: string[]; notes?: string }
  ): NaamaVilakkamEntry | null {
    if (!Array.isArray(this.data.naamaVilakkam)) {
      this.data.naamaVilakkam = [];
    }
    const index = this.data.naamaVilakkam.findIndex(item => item.id === id);
    if (index === -1) return null;

    const current = this.data.naamaVilakkam[index];
    const cleanPlanets =
      updates.planets !== undefined
        ? Array.from(new Set(updates.planets.filter(p => typeof p === 'string' && p.trim())))
        : current.planets;

    const updated: NaamaVilakkamEntry = {
      ...current,
      nameTamil:
        updates.nameTamil !== undefined && updates.nameTamil.trim()
          ? updates.nameTamil.trim()
          : current.nameTamil,
      planets: cleanPlanets,
      notes: updates.notes !== undefined ? updates.notes.trim() : current.notes,
      updatedAt: new Date().toISOString(),
    };

    this.data.naamaVilakkam[index] = updated;
    this.saveData();

    if (isSupabaseConfigured) {
      this.trackSupabaseWrite(upsertNaamaVilakkamToSupabase(updated), 'Update naama_vilakkam');
    }
    return updated;
  }

  public deleteNaamaVilakkam(id: string): boolean {
    if (!Array.isArray(this.data.naamaVilakkam)) {
      this.data.naamaVilakkam = [];
    }
    const prevLen = this.data.naamaVilakkam.length;
    this.data.naamaVilakkam = this.data.naamaVilakkam.filter(item => item.id !== id);
    if (this.data.naamaVilakkam.length < prevLen) {
      this.saveData();
      if (isSupabaseConfigured) {
        this.trackSupabaseWrite(deleteNaamaVilakkamFromSupabase(id), 'Delete naama_vilakkam');
      }
      return true;
    }
    return false;
  }

  // ==========================================
  // ANALYTICS & STATS
  // ==========================================
  public getStats() {
    const totalTemples = this.data.temples.length;
    const pendingSubmissions = this.data.submissions.filter(s => s.status === 'pending').length;
    const approvedSubmissions = this.data.submissions.filter(s => s.status === 'approved').length;
    const totalContributors = this.data.users.filter(u => u.role === 'contributor' || u.role === 'admin').length;

    // Count temples per planet
    const planetCounts: Record<string, number> = {};
    for (const t of this.data.temples) {
      for (const p of t.planets) {
        planetCounts[p] = (planetCounts[p] || 0) + 1;
      }
    }

    return {
      totalTemples,
      pendingSubmissions,
      approvedSubmissions,
      totalContributors,
      databaseType: isSupabaseConfigured ? 'Supabase Cloud PostgreSQL' : 'Persistent File DB (100% Free Tier)',
      isSupabase: isSupabaseConfigured
    };
  }

  // Reset to seed data
  public resetToDefaults(): void {
    this.data = {
      version: '1.0.0',
      updatedAt: new Date().toISOString(),
      temples: [...INITIAL_TEMPLES],
      submissions: [...INITIAL_SUBMISSIONS],
      users: [...INITIAL_USERS],
      deities: [...INITIAL_DEITIES],
      solutionTags: [],
      naamaVilakkam: this.data.naamaVilakkam || [],
      featureFlags: this.data.featureFlags || { naamaVilakkamEnabled: true },
    };
    this.saveData();
  }
}

// Singleton database instance
export const db = new Database();
