import { Temple, TempleSubmission, UserProfile } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_BASE_URL.replace(/\/$/, '');
  }

  // Health check
  async checkHealth(): Promise<{ status: string; service: string; tier: string } | null> {
    try {
      const res = await fetch(`${this.baseUrl}/health`);
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  }

  // Temples
  async getTemples(params?: {
    planets?: string[];
    planetMatchMode?: 'all' | 'exact';
    deity?: string;
    state?: string;
    search?: string;
  }): Promise<Temple[]> {
    try {
      const url = new URL(`${this.baseUrl}/temples`, window.location.origin);
      if (params?.planets && params.planets.length > 0) {
        url.searchParams.set('planets', params.planets.join(','));
      }
      if (params?.planetMatchMode) {
        url.searchParams.set('planetMatchMode', params.planetMatchMode);
      }
      if (params?.deity) {
        url.searchParams.set('deity', params.deity);
      }
      if (params?.state) {
        url.searchParams.set('state', params.state);
      }
      if (params?.search) {
        url.searchParams.set('search', params.search);
      }

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('[ApiService] Failed to fetch temples from API, using fallback:', e);
      throw e;
    }
  }

  async getTempleById(id: string): Promise<Temple | null> {
    try {
      const res = await fetch(`${this.baseUrl}/temples/${id}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async createTemple(templeData: Omit<Temple, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>): Promise<Temple> {
    const res = await fetch(`${this.baseUrl}/temples`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templeData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create temple');
    return json.data;
  }

  async updateTemple(id: string, updates: Partial<Temple>): Promise<Temple> {
    const res = await fetch(`${this.baseUrl}/temples/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update temple');
    return json.data;
  }

  async deleteTemple(id: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/temples/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  }

  async clearAllTemples(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/temples`, {
        method: 'DELETE',
      });
      return res.ok;
    } catch {
      return false;
    }
  }

  // Submissions
  async getSubmissions(status?: string, userId?: string): Promise<TempleSubmission[]> {
    try {
      const url = new URL(`${this.baseUrl}/submissions`, window.location.origin);
      if (status) url.searchParams.set('status', status);
      if (userId) url.searchParams.set('userId', userId);

      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('[ApiService] Failed to fetch submissions from API:', e);
      throw e;
    }
  }

  async createSubmission(data: {
    type: 'new' | 'edit';
    templeId?: string;
    templeData: any;
    previousData?: any;
    submittedBy: any;
  }): Promise<TempleSubmission> {
    const res = await fetch(`${this.baseUrl}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to submit temple');
    return json.data;
  }

  async reviewSubmission(
    id: string,
    action: 'approved' | 'rejected',
    reviewer: any,
    reviewNotes?: string
  ): Promise<{ submission: TempleSubmission; temple?: Temple }> {
    const res = await fetch(`${this.baseUrl}/submissions/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reviewer, reviewNotes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to review submission');
    return json;
  }

  // Users & Auth
  async getUsers(): Promise<UserProfile[]> {
    try {
      const res = await fetch(`${this.baseUrl}/users`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('[ApiService] Failed to fetch users:', e);
      throw e;
    }
  }

  async login(username: string, password?: string): Promise<UserProfile> {
    const res = await fetch(`${this.baseUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Login failed');
    return json.data;
  }

  async createUser(userData: {
    name: string;
    username: string;
    password: string;
    email?: string;
    role: 'user' | 'contributor' | 'admin';
  }): Promise<UserProfile> {
    const res = await fetch(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create user');
    return json.data;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete user');
    return true;
  }

  async updatePassword(userId: string, newPassword: string, currentPassword?: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/users/${encodeURIComponent(userId)}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword, currentPassword }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update password');
    return true;
  }

  // Bookmarks
  async getBookmarks(userId: string): Promise<string[]> {
    try {
      const res = await fetch(`${this.baseUrl}/bookmarks?userId=${encodeURIComponent(userId)}`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('[ApiService] Failed to fetch bookmarks:', e);
      throw e;
    }
  }

  async toggleBookmark(userId: string, templeId: string): Promise<{ bookmarked: boolean; bookmarks: string[] }> {
    const res = await fetch(`${this.baseUrl}/bookmarks/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, templeId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to toggle bookmark');
    return { bookmarked: json.bookmarked, bookmarks: json.data };
  }

  // Stats
  async getStats() {
    try {
      const res = await fetch(`${this.baseUrl}/stats`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  }
}

export const api = new ApiService();
