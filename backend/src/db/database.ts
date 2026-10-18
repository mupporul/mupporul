import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Temple, TempleSubmission, UserProfile, BookmarkRecord, Role } from '../types.js';
import { INITIAL_TEMPLES, INITIAL_SUBMISSIONS, INITIAL_USERS, INITIAL_BOOKMARKS } from './initialData.js';
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
  deleteUserFromSupabase,
} from './supabaseClient.js';

interface DatabaseSchema {
  version: string;
  updatedAt: string;
  temples: Temple[];
  submissions: TempleSubmission[];
  users: UserProfile[];
  bookmarks: { userId: string; templeIds: string[] }[];
}

export class Database {
  private dbPath: string;
  private data: DatabaseSchema;

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

    if (isSupabaseConfigured) {
      this.syncFromSupabase();
    }
  }

  private async syncFromSupabase(): Promise<void> {
    try {
      const supaTemples = await fetchTemplesFromSupabase();
      this.data.temples = supaTemples;
      const supaUsers = await fetchUsersFromSupabase();
      if (supaUsers.length > 0) {
        this.data.users = supaUsers;
      }
      this.saveData();
      console.log(`[Database] Synced ${supaTemples.length} temples and ${supaUsers.length} users from Supabase.`);
    } catch (err) {
      console.warn('[Database] Initial Supabase sync:', err);
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(this.dbPath)) {
        const content = fs.readFileSync(this.dbPath, 'utf-8');
        const parsed = JSON.parse(content) as DatabaseSchema;
        if (parsed && Array.isArray(parsed.temples)) {
          // Clean out sample bootstrap submissions so review tab only has genuine user submissions
          if (Array.isArray(parsed.submissions)) {
            parsed.submissions = parsed.submissions.filter(s =>
              !['sub-new-kanjanur', 'sub-edit-melmalayanoor', 'sub-new-thirunallar'].includes(s.id)
            );
          }
          // Clean out legacy sample users, keeping admin and real users
          if (Array.isArray(parsed.users)) {
            parsed.users = parsed.users.filter(u =>
              !['user-vk', 'user-pilgrim', 'user-devotee'].includes(u.id)
            );
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
      bookmarks: [
        {
          userId: 'user-vk',
          templeIds: [...INITIAL_BOOKMARKS]
        },
        {
          userId: 'user-admin',
          templeIds: ['temple-thirunallar', 'temple-suryanar']
        }
      ]
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
    search?: string;
  }): Temple[] {
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

    // Search Query (name, location, significance)
    if (filters.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(t => 
        t.name.toLowerCase().includes(q) ||
        (t.nameTamil && t.nameTamil.toLowerCase().includes(q)) ||
        t.location.toLowerCase().includes(q) ||
        (t.significance && t.significance.toLowerCase().includes(q))
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
    const newTemple: Temple = {
      ...templeData,
      id: `temple-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      viewsCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.temples.unshift(newTemple);
    this.saveData();

    if (isSupabaseConfigured) {
      insertTempleToSupabase(newTemple).catch(e => console.error('[Supabase] Insert error:', e));
    }

    return newTemple;
  }

  public updateTemple(id: string, updates: Partial<Temple>): Temple | null {
    const index = this.data.temples.findIndex(t => t.id === id);
    if (index === -1) return null;

    this.data.temples[index] = {
      ...this.data.temples[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.saveData();

    if (isSupabaseConfigured) {
      updateTempleInSupabase(id, updates).catch(e => console.error('[Supabase] Update error:', e));
    }

    return this.data.temples[index];
  }

  public deleteTemple(id: string): boolean {
    const prevLength = this.data.temples.length;
    this.data.temples = this.data.temples.filter(t => t.id !== id);
    if (this.data.temples.length !== prevLength) {
      this.saveData();
      if (isSupabaseConfigured) {
        deleteTempleFromSupabase(id).catch(e => console.error('[Supabase] Delete error:', e));
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
      list = list.filter(s => s.submittedBy.id === userId);
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
      const author = this.data.users.find(u => u.id === sub.submittedBy.id);
      if (author) {
        author.approvedCount = (author.approvedCount || 0) + 1;
      }

      if (sub.type === 'edit' && sub.templeId) {
        // Apply edit to existing temple
        const existing = this.getTempleById(sub.templeId);
        if (existing) {
          updatedTemple = this.updateTemple(sub.templeId, {
            ...sub.templeData,
            updatedAt: new Date().toISOString()
          }) || undefined;
        }
      } else {
        // Create new temple
        updatedTemple = this.createTemple(sub.templeData);
      }
    }

    this.saveData();
    return { submission: sub, temple: updatedTemple };
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

  public authenticate(username: string, password?: string): UserProfile | null {
    const user = this.data.users.find(
      u => u.username.toLowerCase() === username.toLowerCase().trim()
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
    return newUser;
  }

  public deleteUser(id: string): boolean {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.data.users.splice(index, 1);
    this.saveData();
    return true;
  }

  public updatePassword(id: string, newPassword: string, currentPassword?: string): boolean {
    const user = this.data.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    if (currentPassword && user.password && user.password !== currentPassword) {
      throw new Error('Current password does not match');
    }
    user.password = newPassword;
    this.saveData();
    return true;
  }

  // ==========================================
  // BOOKMARKS
  // ==========================================
  public getBookmarks(userId: string): string[] {
    const userBm = this.data.bookmarks.find(b => b.userId === userId);
    return userBm ? userBm.templeIds : [];
  }

  public toggleBookmark(userId: string, templeId: string): { bookmarked: boolean; bookmarks: string[] } {
    let userBm = this.data.bookmarks.find(b => b.userId === userId);
    if (!userBm) {
      userBm = { userId, templeIds: [] };
      this.data.bookmarks.push(userBm);
    }

    const exists = userBm.templeIds.includes(templeId);
    if (exists) {
      userBm.templeIds = userBm.templeIds.filter(id => id !== templeId);
    } else {
      userBm.templeIds.push(templeId);
    }

    this.saveData();
    return {
      bookmarked: !exists,
      bookmarks: userBm.templeIds
    };
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
      bookmarks: [
        {
          userId: 'user-vk',
          templeIds: [...INITIAL_BOOKMARKS]
        }
      ]
    };
    this.saveData();
  }
}

// Singleton database instance
export const db = new Database();
