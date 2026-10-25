import { Temple, TempleSubmission, UserProfile, Deity } from '../types';

const DEFAULT_REMOTE_RENDER_API = 'https://mupporul-backend.onrender.com/api';

function resolveInitialApiUrl(): string {
  // 1. Check user custom backend in localStorage
  try {
    const saved = localStorage.getItem('mupporul_backend_api_url');
    if (saved && saved.trim()) return saved.trim().replace(/\/$/, '');
  } catch {}

  // 2. Check Vite env var if provided
  if (import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim()) {
    return import.meta.env.VITE_API_URL.trim().replace(/\/$/, '');
  }

  // 3. When hosted on GitHub Pages or external domain, auto-connect to live Render backend
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (
      host.includes('github.io') ||
      (!host.includes('localhost') && !host.includes('run.app') && !host.includes('127.0.0.1'))
    ) {
      return DEFAULT_REMOTE_RENDER_API;
    }
  }

  return '/api';
}

class ApiService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = resolveInitialApiUrl();
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setBaseUrl(newUrl: string): void {
    const clean = newUrl.trim().replace(/\/$/, '');
    this.baseUrl = clean;
    try {
      localStorage.setItem('mupporul_backend_api_url', clean);
    } catch {}
  }

  resetBaseUrl(): void {
    try {
      localStorage.removeItem('mupporul_backend_api_url');
    } catch {}
    this.baseUrl = resolveInitialApiUrl();
  }

  /**
   * Internal anti-cache fetch wrapper:
   * - Appends dynamic timestamp query param `_t` on GET requests so browser & CDN never cache
   * - Sets standard fetch mode `cache: 'no-store'`
   * - Avoids non-simple request headers (Cache-Control / Pragma) that trigger browser CORS preflight blocks
   */
  private async fetchWithAntiCache(inputUrl: string, init?: RequestInit): Promise<Response> {
    const isAbsolute = inputUrl.startsWith('http://') || inputUrl.startsWith('https://');
    const urlObj = isAbsolute
      ? new URL(inputUrl)
      : new URL(inputUrl, window.location.origin);

    const isGet = !init?.method || init.method.toUpperCase() === 'GET';

    // Append unique timestamp query param on GET requests to guarantee fresh data
    if (isGet) {
      urlObj.searchParams.set('_t', Date.now().toString());
    }

    const headers = new Headers(init?.headers || {});

    // For POST/PUT requests with body, ensure Content-Type is set
    if (!isGet && !headers.has('Content-Type') && typeof init?.body === 'string') {
      headers.set('Content-Type', 'application/json');
    }

    return fetch(urlObj.toString(), {
      ...init,
      cache: 'no-store',
      headers,
    });
  }

  // Health check
  async checkHealth(): Promise<{ status: string; service: string; tier: string } | null> {
    try {
      const res = await this.fetchWithAntiCache(`${this.baseUrl}/health`);
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

      const res = await this.fetchWithAntiCache(url.toString());
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('[ApiService] Failed to fetch temples from API:', e);
      throw e;
    }
  }

  async getTempleById(id: string): Promise<Temple | null> {
    try {
      const res = await this.fetchWithAntiCache(`${this.baseUrl}/temples/${id}`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data || null;
    } catch {
      return null;
    }
  }

  async createTemple(templeData: Omit<Temple, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>): Promise<Temple> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/temples`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(templeData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create temple');
    return json.data;
  }

  async updateTemple(id: string, updates: Partial<Temple>): Promise<Temple> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/temples/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update temple');
    return json.data;
  }

  async deleteTemple(id: string): Promise<boolean> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/temples/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete temple');
    return true;
  }

  async clearAllTemples(): Promise<boolean> {
    try {
      const res = await this.fetchWithAntiCache(`${this.baseUrl}/temples`, {
        method: 'DELETE',
      });
      const json = await res.json();
      return !!json.success;
    } catch (e) {
      console.warn('[ApiService] Failed to clear all temples:', e);
      return false;
    }
  }

  // Submissions
  async getSubmissions(status?: 'pending' | 'approved' | 'rejected'): Promise<TempleSubmission[]> {
    try {
      const url = new URL(`${this.baseUrl}/submissions`, window.location.origin);
      if (status) {
        url.searchParams.set('status', status);
      }
      const res = await this.fetchWithAntiCache(url.toString());
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('[ApiService] Failed to fetch submissions:', e);
      throw e;
    }
  }

  async createSubmission(submissionData: {
    templeId?: string;
    type: 'new' | 'edit';
    templeData: Partial<Temple>;
    previousData?: Partial<Temple>;
    submittedBy: { id: string; name: string; email?: string; role: any };
  }): Promise<TempleSubmission> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/submissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(submissionData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create submission');
    return json.data;
  }

  async reviewSubmission(
    id: string,
    action: 'approved' | 'rejected',
    reviewer: { id: string; name: string; role: any },
    reviewNotes?: string
  ): Promise<{ submission: TempleSubmission; temple?: Temple }> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/submissions/${id}/review`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reviewer, reviewNotes }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to review submission');
    return json.data;
  }

  // Users
  async getUsers(): Promise<UserProfile[]> {
    try {
      const res = await this.fetchWithAntiCache(`${this.baseUrl}/users`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('[ApiService] Failed to fetch users:', e);
      throw e;
    }
  }

  async login(usernameOrEmail: string, password?: string): Promise<UserProfile> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/users/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: usernameOrEmail, password }),
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || json.message || 'Invalid username or password');
    }
    const user = json.data || json.user || json;
    if (!user || !user.id) {
      throw new Error('User profile data missing in response');
    }
    return user;
  }

  async createUser(userData: {
    name: string;
    username: string;
    password: string;
    email?: string;
    role: any;
    avatarText?: string;
    avatarColor?: string;
  }): Promise<UserProfile> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create user');
    return json.data;
  }

  async deleteUser(userId: string): Promise<boolean> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/users/${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete user');
    return true;
  }

  async updatePassword(userIdOrIdentifier: string, newPassword: string, currentPassword?: string): Promise<boolean> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/users/${encodeURIComponent(userIdOrIdentifier)}/password`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newPassword, currentPassword }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update password');
    return true;
  }

  async changePasswordByCredentials(identifier: string, currentPassword: string, newPassword: string): Promise<boolean> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/users/change-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, currentPassword, newPassword }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to change password');
    return true;
  }

  // Deities (மூலவர்)
  async getDeities(): Promise<Deity[]> {
    try {
      const res = await this.fetchWithAntiCache(`${this.baseUrl}/deities`);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json = await res.json();
      return json.data || [];
    } catch (e) {
      console.warn('[ApiService] Failed to fetch deities:', e);
      throw e;
    }
  }

  async createDeity(data: { nameTamil: string; nameEnglish?: string; id?: string }): Promise<Deity> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/deities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to create deity');
    return json.data;
  }

  async updateDeity(id: string, updates: { nameTamil?: string; nameEnglish?: string }): Promise<Deity> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/deities/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to update deity');
    return json.data;
  }

  async deleteDeity(id: string): Promise<boolean> {
    const res = await this.fetchWithAntiCache(`${this.baseUrl}/deities/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Failed to delete deity');
    return true;
  }

  // Upload Image to Supabase Storage
  async uploadImage(base64Data: string, fileName: string): Promise<{ url: string; source: string } | null> {
    try {
      const res = await this.fetchWithAntiCache(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: base64Data, fileName }),
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (json.success && json.url) {
        return { url: json.url, source: json.source || 'supabase' };
      }
      return null;
    } catch (e) {
      console.warn('[ApiService] Image upload to backend failed, using fallback:', e);
      return null;
    }
  }

  // Stats
  async getStats() {
    try {
      const res = await this.fetchWithAntiCache(`${this.baseUrl}/stats`);
      if (!res.ok) return null;
      const json = await res.json();
      return json.data;
    } catch {
      return null;
    }
  }
}

export const api = new ApiService();
