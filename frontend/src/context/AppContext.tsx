import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Temple,
  TempleSubmission,
  UserProfile,
  Role,
  FilterState,
  SubmissionStatus,
  Deity,
  SolutionTag,
  NaamaVilakkamEntry,
} from '../types';
import { INITIAL_TEMPLES } from '../data/initialTemples';
import { INITIAL_SUBMISSIONS } from '../data/initialSubmissions';
import { INITIAL_USERS, DEITIES } from '../data/constants';

import { api } from '../services/api';

export type AppTab = 'temples' | 'solution' | 'review' | 'quiz' | 'naama_vilakkam' | 'profile' | 'analytics';

interface AppContextType {
  temples: Temple[];
  submissions: TempleSubmission[];
  currentUser: UserProfile;
  users: UserProfile[];
  filters: FilterState;
  activeTab: AppTab;
  selectedTempleForDetail: Temple | null;
  videoModalUrl: { url: string; title: string } | null;
  isFilterOpen: boolean;
  isAddEditModalOpen: boolean;
  templeToEdit: Temple | null;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  backendStatus: 'connected' | 'offline' | 'checking';
  reconnectBackend: (customUrl?: string) => Promise<boolean>;
  isArchitectureModalOpen: boolean;
  setIsArchitectureModalOpen: (open: boolean) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (isOpen: boolean) => void;
  openLoginModal: () => void;
  closeLoginModal: () => void;
  loginWithCredentials: (usernameOrEmail: string, password?: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  
  // Password Management
  isChangePasswordModalOpen: boolean;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
  changePassword: (currentPassword: string, newPassword: string, usernameOrEmail?: string) => Promise<{ success: boolean; message: string }>;

  // Admin User Management
  isAddUserModalOpen: boolean;
  openAddUserModal: () => void;
  closeAddUserModal: () => void;
  addUser: (userData: {
    name: string;
    username: string;
    password: string;
    email?: string;
    role: Role;
  }) => Promise<{ success: boolean; message: string; user?: UserProfile }>;
  deleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;

  // Deities (மூலவர்) State & Admin Actions
  deities: Deity[];
  createDeity: (data: { nameTamil: string; nameEnglish?: string; id?: string }) => Promise<{ success: boolean; deity?: Deity; message?: string }>;
  updateDeity: (id: string, updates: { nameTamil?: string; nameEnglish?: string }) => Promise<{ success: boolean; deity?: Deity; message?: string }>;
  deleteDeity: (id: string) => Promise<{ success: boolean; message?: string }>;

  // Solution / Problem Tags (தீர்வு குறிச்சொற்கள்) State & Admin Actions
  solutionTags: SolutionTag[];
  createSolutionTag: (data: { nameTamil: string; nameEnglish?: string; id?: string }) => Promise<{ success: boolean; tag?: SolutionTag; message?: string }>;
  updateSolutionTag: (id: string, updates: { nameTamil?: string; nameEnglish?: string }) => Promise<{ success: boolean; tag?: SolutionTag; message?: string }>;
  deleteSolutionTag: (id: string) => Promise<{ success: boolean; message?: string }>;

  // Standalone நாம விளக்கம் (Naama Vilakkam) State & Feature Toggle
  naamaVilakkamEnabled: boolean;
  toggleNaamaVilakkamFeature: (enabled: boolean) => Promise<{ success: boolean; enabled: boolean; message?: string }>;
  naamaVilakkamList: NaamaVilakkamEntry[];
  isNaamaModalOpen: boolean;
  naamaToEdit: NaamaVilakkamEntry | null;
  openAddNaamaModal: () => void;
  openEditNaamaModal: (entry: NaamaVilakkamEntry) => void;
  closeNaamaModal: () => void;
  createNaamaVilakkam: (data: { nameTamil: string; planets: string[]; notes?: string }) => Promise<{ success: boolean; entry?: NaamaVilakkamEntry; message?: string }>;
  updateNaamaVilakkam: (id: string, updates: { nameTamil: string; planets: string[]; notes?: string }) => Promise<{ success: boolean; entry?: NaamaVilakkamEntry; message?: string }>;
  deleteNaamaVilakkam: (id: string) => Promise<{ success: boolean; message?: string }>;

  // Actions
  setActiveTab: (tab: AppTab) => void;
  switchTab: (tab: AppTab) => Promise<void>;
  refreshFreshData: () => Promise<void>;
  isTabLoading: boolean;
  actionLoadingText: string | null;
  setActionLoadingText: (val: string | null) => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  togglePlanetFilter: (planetId: string) => void;
  setPlanetMatchMode: (mode: 'all' | 'exact') => void;
  setSelectedPlanetFilter: (planetId: string | null) => void;
  switchRole: (role: Role) => void;
  setCurrentUserById: (userId: string) => void;
  updateUserRole: (userId: string, newRole: Role) => Promise<{ success: boolean; message: string }>;
  openAddModal: () => void;
  openEditModal: (temple: Temple) => void;
  closeAddEditModal: () => void;
  openDetailModal: (temple: Temple) => void;
  closeDetailModal: () => void;
  openVideoModal: (url: string, title: string) => void;
  closeVideoModal: () => void;
  setIsFilterOpen: (isOpen: boolean) => void;
  incrementViews: (templeId: string) => void;

  // Review Workflow
  submitTemple: (data: Omit<Temple, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>, existingTempleId?: string) => Promise<boolean>;
  approveSubmission: (submissionId: string, notes?: string) => Promise<void>;
  rejectSubmission: (submissionId: string, notes: string) => Promise<void>;
  deleteTemple: (templeId: string) => Promise<void>;
  clearAllTemples: () => Promise<boolean>;
  resetToDefaultData: () => void;
}

const initialFilters: FilterState = {
  planets: [],
  planetMatchMode: 'exact',
  planet: null,
  deity: null,
  state: null,
  significance: null,
  searchQuery: '',
  jothidarPaarvaiOnly: false,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Temples state with localStorage persistence
  const [temples, setTemples] = useState<Temple[]>(() => {
    try {
      const saved = localStorage.getItem('mupporul_temples_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter(
              (t: Temple) =>
                !['temple-melmalayanoor', 'temple-thirubuvanam', 'temple-thirubavanoor', 'temple-suriyanar', 'temple-thingalur', 'temple-vaitheeswaran', 'temple-thirunageswaram', 'temple-alangudi'].includes(t.id)
            )
            .map((t: Temple) => ({ ...t, remedies: [] }));
        }
      }
    } catch (e) {
      console.error('Failed to load temples from localStorage', e);
    }
    return [];
  });

  // Submissions state (Real submissions only; sample initial submissions purged)
  const [submissions, setSubmissions] = useState<TempleSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('mupporul_submissions_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed
            .filter(
              (s: TempleSubmission) =>
                !['sub-new-kanjanur', 'sub-edit-melmalayanoor', 'sub-new-thirunallar'].includes(s.id)
            )
            .map((s: TempleSubmission) => {
              if (s.templeData) s.templeData.remedies = [];
              if (s.previousData) s.previousData.remedies = [];
              return s;
            });
        }
      }
    } catch (e) {
      console.error('Failed to load submissions from localStorage', e);
    }
    return [];
  });

  // Users state (Only admin by default; additional users created by Admin)
  const [users, setUsers] = useState<UserProfile[]>(() => {
    try {
      const saved = localStorage.getItem('mupporul_users_v2');
      if (saved) {
        const parsed: UserProfile[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out legacy sample users
          const filtered = parsed.filter(
            u => !['user-vk', 'user-devotee', 'user-pilgrim'].includes(u.id)
          );
          if (filtered.length > 0) {
            return filtered;
          }
        }
      }
    } catch (e) {
      console.error('Failed to load users from localStorage', e);
    }
    return INITIAL_USERS;
  });

  // Deities (மூலவர்) state with fallback to standard DEITIES
  const [deities, setDeities] = useState<Deity[]>(() => {
    try {
      const saved = localStorage.getItem('mupporul_deities_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load deities from localStorage', e);
    }
    return DEITIES;
  });

  // Solution Tags (தீர்வு குறிச்சொற்கள்) - strictly sourced from Database only
  const [solutionTags, setSolutionTags] = useState<SolutionTag[]>([]);

  // Standalone நாம விளக்கம் (Naama Vilakkam) - isolated state & Admin feature toggle
  const [naamaVilakkamEnabled, setNaamaVilakkamEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mupporul_feature_naama_vilakkam');
      if (saved === 'false') return false;
      if (saved === 'true') return true;
    } catch {}
    return true;
  });
  const [naamaVilakkamList, setNaamaVilakkamList] = useState<NaamaVilakkamEntry[]>([]);
  const [isNaamaModalOpen, setIsNaamaModalOpen] = useState<boolean>(false);
  const [naamaToEdit, setNaamaToEdit] = useState<NaamaVilakkamEntry | null>(null);

  // Active Current User (Default: Admin Murugan)
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('mupporul_current_user_id');
      if (saved && !['user-vk', 'user-devotee', 'user-pilgrim'].includes(saved)) {
        return saved;
      }
      return 'user-admin';
    } catch {
      return 'user-admin';
    }
  });

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

  // Auth & UI state - require active login on both desktop and mobile
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mupporul_is_logged_in') === 'true';
    } catch {
      return false;
    }
  });
  const [activeTab, setActiveTabState] = useState<AppTab>('temples');
  const [isTabLoading, setIsTabLoading] = useState<boolean>(false);
  const [actionLoadingText, setActionLoadingText] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedTempleForDetail, setSelectedTempleForDetail] = useState<Temple | null>(null);
  const [videoModalUrl, setVideoModalUrl] = useState<{ url: string; title: string } | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [templeToEdit, setTempleToEdit] = useState<Temple | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Always fetch fresh data directly from Backend / Supabase API
  const refreshFreshData = async () => {
    try {
      const [remoteTemples, remoteSubmissions, remoteUsers, remoteDeities, remoteSolutionTags, remoteNaama] = await Promise.allSettled([
        api.getTemples(),
        api.getSubmissions(),
        api.getUsers(),
        api.getDeities(),
        api.getSolutionTags(),
        api.getNaamaVilakkam(),
      ]);

      let cleanedTemples: Temple[] = [];
      if (remoteTemples.status === 'fulfilled' && Array.isArray(remoteTemples.value)) {
        cleanedTemples = remoteTemples.value.map((t: Temple) => ({ ...t, remedies: [] }));
      }

      let cleanedSubmissions: TempleSubmission[] = [];
      if (remoteSubmissions.status === 'fulfilled' && Array.isArray(remoteSubmissions.value)) {
        cleanedSubmissions = remoteSubmissions.value
          .filter(
            (s: TempleSubmission) =>
              !['sub-new-kanjanur', 'sub-edit-melmalayanoor', 'sub-new-thirunallar'].includes(s.id)
          )
          .map((s: TempleSubmission) => {
            if (s.templeData) s.templeData.remedies = [];
            if (s.previousData) s.previousData.remedies = [];
            return s;
          });
        setSubmissions(cleanedSubmissions);
        try {
          localStorage.setItem('mupporul_submissions_v2', JSON.stringify(cleanedSubmissions));
        } catch {}
      }

      // Self-healing guard: Reconcile missing 'new' approved submissions without creating duplicates from edits or deleted temples
      const approvedSubs = (cleanedSubmissions.length > 0 ? cleanedSubmissions : submissions).filter(
        (s: TempleSubmission) => s.status === 'approved'
      );
      const supersededNames = new Set<string>();
      for (const s of approvedSubs) {
        if (s.type === 'edit' && s.previousData?.name) {
          supersededNames.add(s.previousData.name.trim().toLowerCase());
        }
      }

      for (const sub of approvedSubs) {
        if (!sub.templeData?.name) continue;
        if (sub.type === 'edit') continue;
        if (sub.templeId && sub.templeId.startsWith('deleted:')) continue;

        const nameClean = sub.templeData.name.trim().toLowerCase();
        if (!sub.templeId && supersededNames.has(nameClean)) continue;

        const exists = cleanedTemples.some(
          t => (sub.templeId && t.id === sub.templeId) || t.name.trim().toLowerCase() === nameClean
        );
        if (!exists) {
          cleanedTemples.unshift({
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
            jothidarPaarvai: Boolean(sub.templeData.jothidarPaarvai || sub.templeData.jothidarPaarvaiNotes?.trim()),
            jothidarPaarvaiNotes: sub.templeData.jothidarPaarvaiNotes || '',
            submittedBy: sub.submittedBy || { id: 'contributor', name: 'Contributor', role: 'contributor' },
            viewsCount: 0,
            createdAt: sub.reviewedAt || sub.submittedAt || new Date().toISOString(),
            updatedAt: sub.reviewedAt || new Date().toISOString(),
          });
        }
      }

      if (cleanedTemples.length > 0 || remoteTemples.status === 'fulfilled') {
        setTemples(cleanedTemples);
        try {
          localStorage.setItem('mupporul_temples_v2', JSON.stringify(cleanedTemples));
        } catch {}
      }

      if (remoteUsers.status === 'fulfilled' && Array.isArray(remoteUsers.value) && remoteUsers.value.length > 0) {
        setUsers(remoteUsers.value);
        try {
          localStorage.setItem('mupporul_users_v2', JSON.stringify(remoteUsers.value));
        } catch {}
      }

      if (remoteDeities.status === 'fulfilled' && Array.isArray(remoteDeities.value) && remoteDeities.value.length > 0) {
        setDeities(remoteDeities.value);
        try {
          localStorage.setItem('mupporul_deities_v2', JSON.stringify(remoteDeities.value));
        } catch {}
      }

      if (remoteSolutionTags.status === 'fulfilled' && Array.isArray(remoteSolutionTags.value)) {
        setSolutionTags(remoteSolutionTags.value);
      }
      if (remoteNaama.status === 'fulfilled' && remoteNaama.value) {
        setNaamaVilakkamList(Array.isArray(remoteNaama.value.data) ? remoteNaama.value.data : []);
        if (typeof remoteNaama.value.enabled === 'boolean') {
          setNaamaVilakkamEnabled(remoteNaama.value.enabled);
          try {
            localStorage.setItem('mupporul_feature_naama_vilakkam', String(remoteNaama.value.enabled));
          } catch {}
        }
      }
      try {
        localStorage.removeItem('mupporul_solution_tags_v1');
      } catch {}
    } catch (e) {
      console.warn('[AppContext] Failed to refresh fresh data:', e);
    }
  };

  // Switch tabs with Tamil Nadu Temple Tower loading spinner & fresh API data
  const switchTab = async (newTab: AppTab) => {
    setIsTabLoading(true);
    setActiveTabState(newTab);
    try {
      await Promise.all([
        refreshFreshData(),
        new Promise(resolve => setTimeout(resolve, 400)),
      ]);
    } finally {
      setIsTabLoading(false);
    }
  };

  const setActiveTab = (tab: AppTab) => {
    switchTab(tab);
  };

  // Sync with Backend REST API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchFromBackend = async () => {
      try {
        setBackendStatus('checking');
        const health = await api.checkHealth();
        if (health && isMounted) {
          setBackendStatus('connected');
          await refreshFreshData();
        } else if (isMounted) {
          setBackendStatus('offline');
        }
      } catch {
        if (isMounted) setBackendStatus('offline');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchFromBackend();
    return () => { isMounted = false; };
  }, []);

  const reconnectBackend = async (customUrl?: string): Promise<boolean> => {
    setBackendStatus('checking');
    if (customUrl) {
      api.setBaseUrl(customUrl);
    }
    try {
      const health = await api.checkHealth();
      if (health) {
        setBackendStatus('connected');
        const [remoteTemples, remoteSubmissions, remoteUsers, remoteDeities, remoteSolutionTags, remoteNaama] = await Promise.allSettled([
          api.getTemples(),
          api.getSubmissions(),
          api.getUsers(),
          api.getDeities(),
          api.getSolutionTags(),
          api.getNaamaVilakkam(),
        ]);
        if (remoteTemples.status === 'fulfilled' && Array.isArray(remoteTemples.value)) {
          const cleanedTemples = remoteTemples.value.map((t: Temple) => {
            if (t.remedies && t.remedies.length > 0) {
              api.updateTemple(t.id, { remedies: [] }).catch(() => {});
            }
            return { ...t, remedies: [] };
          });
          setTemples(cleanedTemples);
          try {
            localStorage.setItem('mupporul_temples_v2', JSON.stringify(cleanedTemples));
          } catch {}
        }
        if (remoteSubmissions.status === 'fulfilled' && Array.isArray(remoteSubmissions.value)) {
          const cleaned = remoteSubmissions.value
            .filter(
              (s: TempleSubmission) =>
                !['sub-new-kanjanur', 'sub-edit-melmalayanoor', 'sub-new-thirunallar'].includes(s.id)
            )
            .map((s: TempleSubmission) => {
              if (s.templeData) s.templeData.remedies = [];
              if (s.previousData) s.previousData.remedies = [];
              return s;
            });
          setSubmissions(cleaned);
          try {
            localStorage.setItem('mupporul_submissions_v2', JSON.stringify(cleaned));
          } catch {}
        }
        if (remoteUsers.status === 'fulfilled' && Array.isArray(remoteUsers.value) && remoteUsers.value.length > 0) {
          setUsers(remoteUsers.value);
          try {
            localStorage.setItem('mupporul_users_v2', JSON.stringify(remoteUsers.value));
          } catch {}
        }
        if (remoteDeities.status === 'fulfilled' && Array.isArray(remoteDeities.value) && remoteDeities.value.length > 0) {
          setDeities(remoteDeities.value);
          try {
            localStorage.setItem('mupporul_deities_v2', JSON.stringify(remoteDeities.value));
          } catch {}
        }
        if (remoteSolutionTags.status === 'fulfilled' && Array.isArray(remoteSolutionTags.value)) {
          setSolutionTags(remoteSolutionTags.value);
        }
        if (remoteNaama.status === 'fulfilled' && remoteNaama.value) {
          setNaamaVilakkamList(Array.isArray(remoteNaama.value.data) ? remoteNaama.value.data : []);
          if (typeof remoteNaama.value.enabled === 'boolean') {
            setNaamaVilakkamEnabled(remoteNaama.value.enabled);
            try {
              localStorage.setItem('mupporul_feature_naama_vilakkam', String(remoteNaama.value.enabled));
            } catch {}
          }
        }
        try {
          localStorage.removeItem('mupporul_solution_tags_v1');
        } catch {}
        return true;
      } else {
        setBackendStatus('offline');
        return false;
      }
    } catch {
      setBackendStatus('offline');
      return false;
    }
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    refreshFreshData();
  };
  const closeLoginModal = () => {
    setIsLoginModalOpen(false);
    refreshFreshData();
  };

  // Admin User Management Handlers
  const openAddUserModal = () => {
    setIsAddUserModalOpen(true);
    refreshFreshData();
  };

  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false);
    refreshFreshData();
  };

  const addUser = async (userData: {
    name: string;
    username: string;
    password: string;
    email?: string;
    role: Role;
  }): Promise<{ success: boolean; message: string; user?: UserProfile }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrators can create new users.' };
    }

    const cleanUsername = userData.username.trim().toLowerCase();
    if (!cleanUsername) {
      return { success: false, message: 'Username is required.' };
    }
    if (!userData.password || userData.password.trim().length < 4) {
      return { success: false, message: 'Password must be at least 4 characters long.' };
    }
    if (!userData.name.trim()) {
      return { success: false, message: 'Full name is required.' };
    }

    const exists = users.some(u => u.username?.toLowerCase() === cleanUsername);
    if (exists) {
      return { success: false, message: `Username "${cleanUsername}" is already taken. Please choose another.` };
    }

    const nameParts = userData.name.trim().split(/\s+/);
    const avatarText = nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
      : userData.name.slice(0, 2).toUpperCase() || 'U';

    const gradients = [
      'from-amber-500 to-amber-700',
      'from-purple-600 to-indigo-800',
      'from-emerald-500 to-teal-700',
      'from-rose-500 to-pink-700',
      'from-blue-600 to-cyan-700',
      'from-violet-600 to-purple-800',
      'from-fuchsia-600 to-rose-700',
    ];
    const avatarColor = gradients[Math.floor(Math.random() * gradients.length)];

    const newUser: UserProfile = {
      id: `user-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: userData.name.trim(),
      username: cleanUsername,
      password: userData.password.trim(),
      email: userData.email?.trim() || `${cleanUsername}@mupporul.app`,
      role: userData.role,
      avatarText,
      avatarColor,
      contributionsCount: 0,
      approvedCount: 0,
    };

    setActionLoadingText('Creating User Account...');
    try {
      setUsers(prev => [...prev, newUser]);

      // Sync to backend API
      await api.createUser({
        name: newUser.name,
        username: newUser.username,
        password: newUser.password!,
        email: newUser.email,
        role: newUser.role,
      });

      await refreshFreshData();

      return {
        success: true,
        message: `User @${newUser.username} created with role ${newUser.role.toUpperCase()}!`,
        user: newUser,
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to create user on backend.' };
    } finally {
      setActionLoadingText(null);
    }
  };

  const deleteUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrators can delete users.' };
    }

    if (userId === currentUser.id) {
      return { success: false, message: 'Cannot delete your own active administrator account.' };
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'User not found.' };
    }

    setActionLoadingText('Deleting User...');
    try {
      setUsers(prev => prev.filter(u => u.id !== userId));

      // Sync to backend API
      await api.deleteUser(userId);
      await refreshFreshData();

      return { success: true, message: `User "${targetUser.username || targetUser.name}" deleted successfully.` };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to delete user on backend.' };
    } finally {
      setActionLoadingText(null);
    }
  };

  // Deity (மூலவர்) Admin Handlers - Restricted strictly to Admin role
  const createDeity = async (data: {
    nameTamil: string;
    nameEnglish?: string;
    id?: string;
  }): Promise<{ success: boolean; deity?: Deity; message?: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrators can add deities.' };
    }

    const nameTamil = data.nameTamil?.trim();
    if (!nameTamil) {
      return { success: false, message: 'மூலவர் தமிழ் பெயர் அவசியம் (Deity Tamil name is required).' };
    }

    // Check duplicate
    const exists = deities.some(
      d => d.nameTamil.toLowerCase() === nameTamil.toLowerCase() ||
           (data.nameEnglish && d.nameEnglish?.toLowerCase() === data.nameEnglish.trim().toLowerCase())
    );
    if (exists) {
      return { success: false, message: `மூலவர் "${nameTamil}" ஏற்கனவே பட்டியலில் உள்ளது (Deity already exists).` };
    }

    const id = data.id?.trim() ||
      (data.nameEnglish ? data.nameEnglish.trim().toLowerCase().replace(/[^a-z0-9]/g, '-') : `deity-${Date.now()}`);

    const newDeity: Deity = {
      id,
      nameTamil,
      nameEnglish: data.nameEnglish?.trim() || nameTamil,
    };

    setActionLoadingText('மூலவர் சேர்க்கப்படுகிறது (Saving Deity)...');
    try {
      setDeities(prev => [...prev, newDeity]);
      try {
        localStorage.setItem('mupporul_deities_v2', JSON.stringify([...deities, newDeity]));
      } catch {}

      const created = await api.createDeity(newDeity);
      await refreshFreshData();
      return {
        success: true,
        deity: created || newDeity,
        message: `மூலவர் "${nameTamil}" வெற்றிகரமாக சேர்க்கப்பட்டது!`,
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to create deity on backend.' };
    } finally {
      setActionLoadingText(null);
    }
  };

  const updateDeity = async (
    id: string,
    updates: { nameTamil?: string; nameEnglish?: string }
  ): Promise<{ success: boolean; deity?: Deity; message?: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrators can edit deities.' };
    }

    const existing = deities.find(d => d.id === id);
    if (!existing) {
      return { success: false, message: 'மூலவர் கிடைக்கவில்லை (Deity not found).' };
    }

    setActionLoadingText('மூலவர் புதுப்பிக்கப்படுகிறது (Updating Deity)...');
    try {
      const updatedDeity: Deity = {
        ...existing,
        nameTamil: updates.nameTamil?.trim() || existing.nameTamil,
        nameEnglish: updates.nameEnglish?.trim() !== undefined ? updates.nameEnglish.trim() : existing.nameEnglish,
      };

      setDeities(prev => prev.map(d => (d.id === id ? updatedDeity : d)));
      try {
        const next = deities.map(d => (d.id === id ? updatedDeity : d));
        localStorage.setItem('mupporul_deities_v2', JSON.stringify(next));
      } catch {}

      const res = await api.updateDeity(id, updates);
      await refreshFreshData();
      return {
        success: true,
        deity: res || updatedDeity,
        message: `மூலவர் "${updatedDeity.nameTamil}" புதுப்பிக்கப்பட்டது!`,
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to update deity on backend.' };
    } finally {
      setActionLoadingText(null);
    }
  };

  const deleteDeity = async (id: string): Promise<{ success: boolean; message?: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrators can delete deities.' };
    }

    const target = deities.find(d => d.id === id);
    if (!target) {
      return { success: false, message: 'மூலவர் கிடைக்கவில்லை (Deity not found).' };
    }

    setActionLoadingText('மூலவர் நீக்கப்படுகிறது (Deleting Deity)...');
    try {
      setDeities(prev => prev.filter(d => d.id !== id));
      try {
        localStorage.setItem('mupporul_deities_v2', JSON.stringify(deities.filter(d => d.id !== id)));
      } catch {}

      await api.deleteDeity(id);
      await refreshFreshData();
      return {
        success: true,
        message: `மூலவர் "${target.nameTamil}" நீக்கப்பட்டது.`,
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to delete deity on backend.' };
    } finally {
      setActionLoadingText(null);
    }
  };

  // Solution / Problem Tag Admin Handlers - Restricted strictly to Admin role
  const createSolutionTag = async (data: {
    nameTamil: string;
    nameEnglish?: string;
    id?: string;
  }): Promise<{ success: boolean; tag?: SolutionTag; message?: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrators can configure problem tags.' };
    }

    const nameTamil = data.nameTamil?.trim();
    if (!nameTamil) {
      return { success: false, message: 'குறிச்சொல் (தமிழ்) அவசியம் (Problem tag in Tamil is required).' };
    }

    const exists = solutionTags.some(
      t => t.nameTamil.trim().toLowerCase() === nameTamil.toLowerCase()
    );
    if (exists) {
      return { success: false, message: `"${nameTamil}" ஏற்கனவே பட்டியலில் உள்ளது (Tag already exists).` };
    }

    const slug =
      data.id?.trim() ||
      (data.nameEnglish?.trim()
        ? data.nameEnglish.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : '') ||
      `tag-${Date.now()}`;

    const newTag: SolutionTag = {
      id: slug,
      nameTamil,
      nameEnglish: data.nameEnglish?.trim() || '',
    };

    setActionLoadingText('குறிச்சொல் சேமிக்கப்படுகிறது...');
    try {
      const created = await api.createSolutionTag(newTag);
      await refreshFreshData();
      return {
        success: true,
        tag: created || newTag,
        message: `"${nameTamil}" சேர்க்கப்பட்டது!`,
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to create tag on database.' };
    } finally {
      setActionLoadingText(null);
    }
  };

  const updateSolutionTag = async (
    id: string,
    updates: { nameTamil?: string; nameEnglish?: string }
  ): Promise<{ success: boolean; tag?: SolutionTag; message?: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrators can edit problem tags.' };
    }

    const existing = solutionTags.find(t => t.id === id);
    if (!existing) {
      return { success: false, message: 'Tag not found.' };
    }

    const nextTamil = updates.nameTamil?.trim();
    if (nextTamil && solutionTags.some(t => t.id !== id && t.nameTamil.trim().toLowerCase() === nextTamil.toLowerCase())) {
      return { success: false, message: `"${nextTamil}" ஏற்கனவே பட்டியலில் உள்ளது (Tag already exists).` };
    }

    setActionLoadingText('குறிச்சொல் புதுப்பிக்கப்படுகிறது...');
    try {
      const updatedTag: SolutionTag = {
        ...existing,
        nameTamil: nextTamil || existing.nameTamil,
        nameEnglish: updates.nameEnglish !== undefined ? updates.nameEnglish.trim() : existing.nameEnglish,
      };

      const res = await api.updateSolutionTag(id, {
        nameTamil: updatedTag.nameTamil,
        nameEnglish: updatedTag.nameEnglish,
      });
      await refreshFreshData();
      return {
        success: true,
        tag: res || updatedTag,
        message: `"${updatedTag.nameTamil}" புதுப்பிக்கப்பட்டது!`,
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to update tag on database.' };
    } finally {
      setActionLoadingText(null);
    }
  };

  const deleteSolutionTag = async (id: string): Promise<{ success: boolean; message?: string }> => {
    if (currentUser.role !== 'admin') {
      return { success: false, message: 'Unauthorized: Only administrators can delete problem tags.' };
    }

    const target = solutionTags.find(t => t.id === id);
    if (!target) {
      return { success: false, message: 'Tag not found.' };
    }

    setActionLoadingText('குறிச்சொல் நீக்கப்படுகிறது...');
    try {
      await api.deleteSolutionTag(id);
      await refreshFreshData();
      return {
        success: true,
        message: `"${target.nameTamil}" நீக்கப்பட்டது.`,
      };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to delete tag on database.' };
    } finally {
      setActionLoadingText(null);
    }
  };

  // Standalone நாம விளக்கம் (Naama Vilakkam) & Admin Feature Toggle Handlers
  const toggleNaamaVilakkamFeature = async (
    enabled: boolean
  ): Promise<{ success: boolean; enabled: boolean; message?: string }> => {
    if (currentUser.role !== 'admin') {
      return {
        success: false,
        enabled: naamaVilakkamEnabled,
        message: 'Unauthorized: Only administrators can toggle modules.',
      };
    }

    const previous = naamaVilakkamEnabled;
    setNaamaVilakkamEnabled(enabled);
    try {
      localStorage.setItem('mupporul_feature_naama_vilakkam', String(enabled));
    } catch {}

    setActionLoadingText(enabled ? 'Enabling நாம விளக்கம்...' : 'Turning off நாம விளக்கம்...');
    try {
      const confirmed = await api.setNaamaVilakkamEnabled(enabled, currentUser.role);
      setNaamaVilakkamEnabled(confirmed);
      try {
        localStorage.setItem('mupporul_feature_naama_vilakkam', String(confirmed));
      } catch {}
      return {
        success: true,
        enabled: confirmed,
        message: confirmed
          ? 'நாம விளக்கம் tab is now ENABLED for all roles.'
          : 'நாம விளக்கம் tab is now TURNED OFF cleanly without affecting live Temples, Quiz, or Roles.',
      };
    } catch (e: any) {
      // Revert if backend explicitly rejects
      setNaamaVilakkamEnabled(previous);
      try {
        localStorage.setItem('mupporul_feature_naama_vilakkam', String(previous));
      } catch {}
      return {
        success: false,
        enabled: previous,
        message: e?.message || 'Failed to update Naama Vilakkam toggle.',
      };
    } finally {
      setActionLoadingText(null);
    }
  };

  const openAddNaamaModal = () => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'contributor' && currentUser.role !== 'user') return;
    setNaamaToEdit(null);
    setIsNaamaModalOpen(true);
  };

  const openEditNaamaModal = (entry: NaamaVilakkamEntry) => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'contributor' && currentUser.role !== 'user') return;
    setNaamaToEdit(entry);
    setIsNaamaModalOpen(true);
  };

  const closeNaamaModal = () => {
    setIsNaamaModalOpen(false);
    setNaamaToEdit(null);
  };

  const createNaamaVilakkam = async (data: {
    nameTamil: string;
    planets: string[];
    notes?: string;
  }): Promise<{ success: boolean; entry?: NaamaVilakkamEntry; message?: string }> => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'contributor' && currentUser.role !== 'user') {
      return { success: false, message: 'Unauthorized.' };
    }
    const cleanName = data.nameTamil?.trim();
    if (!cleanName) {
      return { success: false, message: 'நாமம் (தமிழ்) அவசியம்.' };
    }
    if (!Array.isArray(data.planets) || data.planets.length === 0) {
      return { success: false, message: 'குறைந்தது ஒரு கிரகத்தைத் தேர்ந்தெடுக்கவும்.' };
    }

    setActionLoadingText('நாம விளக்கம் சேமிக்கப்படுகிறது...');
    try {
      const created = await api.createNaamaVilakkam({
        nameTamil: cleanName,
        planets: data.planets,
        notes: data.notes?.trim() || '',
        createdBy: {
          id: currentUser.id,
          name: currentUser.name,
          role: currentUser.role,
        },
        actorRole: currentUser.role,
      });
      await refreshFreshData();
      return { success: true, entry: created, message: `"${cleanName}" சேர்க்கப்பட்டது!` };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Failed to save Naama Vilakkam entry.' };
    } finally {
      setActionLoadingText(null);
    }
  };

  const updateNaamaVilakkam = async (
    id: string,
    updates: { nameTamil: string; planets: string[]; notes?: string }
  ): Promise<{ success: boolean; entry?: NaamaVilakkamEntry; message?: string }> => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'contributor' && currentUser.role !== 'user') {
      return { success: false, message: 'Unauthorized.' };
    }
    const cleanName = updates.nameTamil?.trim();
    if (!cleanName) {
      return { success: false, message: 'நாமம் (தமிழ்) காலியாக இருக்கக் கூடாது.' };
    }
    if (!Array.isArray(updates.planets) || updates.planets.length === 0) {
      return { success: false, message: 'குறைந்தது ஒரு கிரகத்தைத் தேர்ந்தெடுக்கவும்.' };
    }

    setActionLoadingText('நாம விளக்கம் புதுப்பிக்கப்படுகிறது...');
    try {
      const updated = await api.updateNaamaVilakkam(id, {
        nameTamil: cleanName,
        planets: updates.planets,
        notes: updates.notes?.trim() || '',
        actorRole: currentUser.role,
      });
      await refreshFreshData();
      return { success: true, entry: updated, message: `"${cleanName}" புதுப்பிக்கப்பட்டது!` };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Failed to update Naama Vilakkam entry.' };
    } finally {
      setActionLoadingText(null);
    }
  };

  const deleteNaamaVilakkam = async (
    id: string
  ): Promise<{ success: boolean; message?: string }> => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'contributor') {
      return { success: false, message: 'Unauthorized: Contributors and Admins only.' };
    }

    setActionLoadingText('நாம விளக்கம் நீக்கப்படுகிறது...');
    try {
      await api.deleteNaamaVilakkam(id, currentUser.role);
      await refreshFreshData();
      return { success: true, message: 'நாம விளக்கம் நீக்கப்பட்டது.' };
    } catch (e: any) {
      return { success: false, message: e?.message || 'Failed to delete Naama Vilakkam entry.' };
    } finally {
      setActionLoadingText(null);
    }
  };

  const openChangePasswordModal = () => {
    setIsChangePasswordModalOpen(true);
    refreshFreshData();
  };
  const closeChangePasswordModal = () => {
    setIsChangePasswordModalOpen(false);
    refreshFreshData();
  };

  const loginWithCredentials = async (
    usernameOrEmail: string,
    password?: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanId = usernameOrEmail.trim();
    const cleanPw = (password || '').trim();

    // 1. Attempt REAL network call to backend API first
    try {
      const remoteUser = await api.login(cleanId, cleanPw);
      if (remoteUser && remoteUser.id) {
        // Sync local users state
        setUsers(prev => {
          const idx = prev.findIndex(u => u.id === remoteUser.id);
          if (idx >= 0) {
            const updated = [...prev];
            updated[idx] = { ...updated[idx], ...remoteUser };
            return updated;
          }
          return [...prev, remoteUser];
        });

        setCurrentUserId(remoteUser.id);
        setIsLoggedIn(true);
        try {
          localStorage.setItem('mupporul_is_logged_in', 'true');
          localStorage.setItem('mupporul_current_user_id', remoteUser.id);
        } catch {}
        setIsLoginModalOpen(false);
        // Immediately fetch fresh submissions, temples, deities, and users for the authenticated user
        await refreshFreshData();
        return { success: true, message: `Welcome back, ${remoteUser.name} (${remoteUser.role.toUpperCase()})!` };
      }
    } catch (apiErr: any) {
      console.warn('[AppContext] API Login call returned error:', apiErr.message);

      // If backend explicitly rejected the login credentials (e.g. invalid username or password), return that error
      if (apiErr.message && !apiErr.message.toLowerCase().includes('failed to fetch')) {
        return {
          success: false,
          message: apiErr.message,
        };
      }

      // 2. Check local fallback users ONLY if network was completely unreachable
      const localUser = users.find(
        u =>
          u.username?.toLowerCase() === cleanId.toLowerCase() ||
          u.email?.toLowerCase() === cleanId.toLowerCase()
      );

      if (localUser) {
        if (localUser.password && cleanPw !== localUser.password) {
          return { success: false, message: 'Invalid password. Please verify and try again.' };
        }
        setCurrentUserId(localUser.id);
        setIsLoggedIn(true);
        try {
          localStorage.setItem('mupporul_is_logged_in', 'true');
          localStorage.setItem('mupporul_current_user_id', localUser.id);
        } catch {}
        setIsLoginModalOpen(false);
        await refreshFreshData();
        return { success: true, message: `Welcome back, ${localUser.name} (${localUser.role.toUpperCase()})!` };
      }

      return {
        success: false,
        message: apiErr.message || 'User not found. Check credentials or ask admin to create an account.',
      };
    }

    return { success: false, message: 'Login failed. Please verify credentials.' };
  };

  const logout = () => {
    setIsLoggedIn(false);
    try {
      localStorage.setItem('mupporul_is_logged_in', 'false');
    } catch {
      // safe fallback
    }
  };

  const changePassword = async (
    currentPassword: string,
    newPassword: string,
    usernameOrEmail?: string
  ): Promise<{ success: boolean; message: string }> => {
    const cleanCurrent = (currentPassword || '').trim();
    const cleanNew = (newPassword || '').trim();
    const cleanIdentifier = (usernameOrEmail || '').trim();

    if (cleanNew.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    if (cleanCurrent && cleanCurrent === cleanNew) {
      return { success: false, message: 'New password must be different from current password.' };
    }

    // Determine target user identifier
    const targetIdentifier = cleanIdentifier || currentUser?.username || currentUser?.id;
    if (!targetIdentifier) {
      return { success: false, message: 'Please specify your username or email.' };
    }

    // Call real backend API
    setActionLoadingText('Updating Password...');
    try {
      await api.changePasswordByCredentials(targetIdentifier, cleanCurrent, cleanNew);
      await refreshFreshData();

      // Sync local React state
      setUsers(prev =>
        prev.map(u => {
          if (
            u.id === targetIdentifier ||
            u.username.toLowerCase() === targetIdentifier.toLowerCase() ||
            (u.email && u.email.toLowerCase() === targetIdentifier.toLowerCase())
          ) {
            return { ...u, password: cleanNew };
          }
          return u;
        })
      );

      // Also update remembered password in localStorage if user checked Remember Me
      try {
        if (localStorage.getItem('mupporul_remember_me') === 'true') {
          const savedId = localStorage.getItem('mupporul_saved_identifier') || '';
          if (
            !savedId ||
            savedId.toLowerCase() === targetIdentifier.toLowerCase() ||
            (currentUser && savedId.toLowerCase() === currentUser.username.toLowerCase())
          ) {
            localStorage.setItem('mupporul_saved_password', cleanNew);
          }
        }
      } catch {}

      return {
        success: true,
        message: 'Your password has been changed successfully! You can now sign in with your new password.',
      };
    } catch (apiErr: any) {
      console.warn('[AppContext] changePassword API call returned error:', apiErr.message);
      return {
        success: false,
        message: apiErr.message || 'Failed to update password. Please verify your current password.',
      };
    } finally {
      setActionLoadingText(null);
    }
  };

  // Sync with LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('mupporul_temples_v2', JSON.stringify(temples));
    } catch (e) {
      console.error(e);
    }
  }, [temples]);

  useEffect(() => {
    try {
      localStorage.setItem('mupporul_submissions_v2', JSON.stringify(submissions));
    } catch (e) {
      console.error(e);
    }
  }, [submissions]);

  useEffect(() => {
    try {
      localStorage.setItem('mupporul_users_v2', JSON.stringify(users));
    } catch (e) {
      console.error(e);
    }
  }, [users]);

  useEffect(() => {
    try {
      localStorage.setItem('mupporul_current_user_id', currentUserId);
    } catch (e) {
      console.error(e);
    }
  }, [currentUserId]);

  // Actions - Always interact with fresh table data without cache
  const resetFilters = () => {
    setFilters(initialFilters);
    refreshFreshData();
  };

  const togglePlanetFilter = (planetId: string) => {
    setFilters(prev => {
      const current = prev.planets || [];
      const exists = current.includes(planetId);
      const nextPlanets = exists
        ? current.filter(id => id !== planetId)
        : [...current, planetId];
      return {
        ...prev,
        planets: nextPlanets,
        planet: nextPlanets[0] || null,
      };
    });
    refreshFreshData();
  };

  const setPlanetMatchMode = (mode: 'all' | 'exact') => {
    setFilters(prev => ({
      ...prev,
      planetMatchMode: mode,
    }));
    refreshFreshData();
  };

  const setSelectedPlanetFilter = (planetId: string | null) => {
    if (!planetId) {
      setFilters(prev => ({ ...prev, planets: [], planet: null }));
      refreshFreshData();
      return;
    }
    togglePlanetFilter(planetId);
  };

  const switchRole = (newRole: Role) => {
    // Check if an existing profile has this role, or update current user
    const existing = users.find(u => u.role === newRole);
    if (existing) {
      setCurrentUserId(existing.id);
    } else {
      setUsers(prev =>
        prev.map(u => (u.id === currentUser.id ? { ...u, role: newRole } : u))
      );
    }
    refreshFreshData();
  };

  const setCurrentUserById = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) setCurrentUserId(userId);
    refreshFreshData();
  };

  const updateUserRole = async (
    userId: string,
    newRole: Role
  ): Promise<{ success: boolean; message: string }> => {
    if (currentUser.role !== 'admin') {
      return {
        success: false,
        message: 'Unauthorized: Only administrators can update user roles.',
      };
    }

    const targetUser = users.find(u => u.id === userId);
    if (!targetUser) {
      return { success: false, message: 'User not found.' };
    }

    const previousRole = targetUser.role;
    if (previousRole === newRole) {
      return {
        success: true,
        message: `${targetUser.name} is already assigned the ${newRole.toUpperCase()} role.`,
      };
    }

    setActionLoadingText('Updating User Role...');
    try {
      // Optimistically update local state so dropdown reflects immediately
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
      );

      // Persist to backend API & Supabase DB
      await api.updateUserRole(userId, newRole);
      await refreshFreshData();

      return {
        success: true,
        message: `Updated ${targetUser.name} role to ${newRole.toUpperCase()} successfully.`,
      };
    } catch (e: any) {
      // Rollback optimistic update if backend/DB persistence failed
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: previousRole } : u))
      );
      return {
        success: false,
        message: e.message || 'Failed to update user role on backend.',
      };
    } finally {
      setActionLoadingText(null);
    }
  };

  const openAddModal = () => {
    setTempleToEdit(null);
    setIsAddEditModalOpen(true);
    refreshFreshData();
  };

  const openEditModal = (temple: Temple) => {
    setTempleToEdit(temple);
    setIsAddEditModalOpen(true);
    refreshFreshData();
  };

  const closeAddEditModal = () => {
    setIsAddEditModalOpen(false);
    setTempleToEdit(null);
    refreshFreshData();
  };

  const openDetailModal = (temple: Temple) => {
    setSelectedTempleForDetail(temple);
    incrementViews(temple.id);
    refreshFreshData();
  };

  const closeDetailModal = () => {
    setSelectedTempleForDetail(null);
    refreshFreshData();
  };

  const openVideoModal = (url: string, title: string) => {
    setVideoModalUrl({ url, title });
  };

  const closeVideoModal = () => setVideoModalUrl(null);

  const incrementViews = (templeId: string) => {
    setTemples(prev =>
      prev.map(t => (t.id === templeId ? { ...t, viewsCount: (t.viewsCount || 0) + 1 } : t))
    );
  };

  // Submit Temple for review
  const submitTemple = async (
    data: Omit<Temple, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>,
    existingTempleId?: string
  ): Promise<boolean> => {
    const isEdit = !!existingTempleId;
    setActionLoadingText(isEdit ? 'Updating Temple...' : 'Submitting Temple...');
    try {
      const now = new Date().toISOString();
      const cleanData = {
        ...data,
        remedies: [],
      };
      const existingTemple = isEdit ? temples.find(t => t.id === existingTempleId) : undefined;

      // If Admin: Publish directly to live temples directory and database!
      if (currentUser.role === 'admin') {
        if (isEdit && existingTempleId) {
          setTemples(prev =>
            prev.map(t => (t.id === existingTempleId ? { ...t, ...cleanData, updatedAt: now } : t))
          );
          setSelectedTempleForDetail(prev =>
            prev && prev.id === existingTempleId ? { ...prev, ...cleanData, updatedAt: now } : prev
          );
          await api.updateTemple(existingTempleId, cleanData);
        } else {
          await api.createTemple(cleanData);
        }

        // Also create an auto-approved audit entry so it shows in Approved history
        const approvedSub: TempleSubmission = {
          id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          templeId: existingTempleId,
          type: isEdit ? 'edit' : 'new',
          status: 'approved',
          submittedAt: now,
          reviewedAt: now,
          reviewedBy: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
          },
          reviewNotes: 'Directly published by Administrator.',
          submittedBy: {
            id: currentUser.id,
            name: currentUser.name,
            email: currentUser.email,
            role: currentUser.role,
          },
          templeData: cleanData,
        };
        setSubmissions(prev => [
          approvedSub,
          ...prev.filter(s => s.templeData?.name !== data.name),
        ]);
        await refreshFreshData();
        return true;
      }

      // For Contributors: Submit to review queue
      const newSubmission: TempleSubmission = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        templeId: existingTempleId,
        type: isEdit ? 'edit' : 'new',
        status: 'pending',
        submittedAt: now,
        submittedBy: {
          id: currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
        },
        templeData: cleanData,
        previousData: existingTemple
          ? {
              name: existingTemple.name,
              location: existingTemple.location,
              planets: existingTemple.planets,
              deity: existingTemple.deity,
              timings: existingTemple.timings,
              significance: existingTemple.significance,
              solutionTags: existingTemple.solutionTags || [],
              jothidarPaarvai: existingTemple.jothidarPaarvai,
              jothidarPaarvaiNotes: existingTemple.jothidarPaarvaiNotes,
            }
          : undefined,
      };

      setSubmissions(prev => [newSubmission, ...prev]);

      // Sync with backend API
      await api.createSubmission({
        type: newSubmission.type,
        templeId: newSubmission.templeId,
        templeData: newSubmission.templeData,
        previousData: newSubmission.previousData,
        submittedBy: newSubmission.submittedBy,
      });

      await refreshFreshData();
      return true;
    } catch (e) {
      console.error('[AppContext] submitTemple failed:', e);
      return false;
    } finally {
      setActionLoadingText(null);
    }
  };

  // Approve submission
  const approveSubmission = async (submissionId: string, notes?: string): Promise<void> => {
    setActionLoadingText('Approving Submission...');
    try {
      const targetSub = submissions.find(s => s.id === submissionId);
      if (targetSub?.templeData?.name) {
        const approvedTemple: Temple = {
          id: targetSub.templeId || `temple-approved-${targetSub.id}`,
          name: targetSub.templeData.name,
          location: targetSub.templeData.location || '',
          state: targetSub.templeData.state || 'Tamil Nadu',
          planets: Array.isArray(targetSub.templeData.planets) ? targetSub.templeData.planets : [],
          deity: targetSub.templeData.deity || 'shivan',
          significance: targetSub.templeData.significance || (targetSub.templeData as any).descriptionTamil || '',
          remedies: [],
          solutionTags: Array.isArray(targetSub.templeData.solutionTags) ? targetSub.templeData.solutionTags : [],
          imageUrl: targetSub.templeData.imageUrl || '',
          videoUrl: targetSub.templeData.videoUrl || '',
          timings: targetSub.templeData.timings || '',
          history: targetSub.templeData.history || '',
          poojaDetails: targetSub.templeData.poojaDetails || '',
          contactNumber: targetSub.templeData.contactNumber || '',
          jothidarPaarvai: Boolean(targetSub.templeData.jothidarPaarvai || targetSub.templeData.jothidarPaarvaiNotes?.trim()),
          jothidarPaarvaiNotes: targetSub.templeData.jothidarPaarvaiNotes || '',
          submittedBy: targetSub.submittedBy || {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
          },
          viewsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        setTemples(prev => {
          if (targetSub.type === 'edit') {
            const prevNameClean = (targetSub.previousData?.name || '').trim().toLowerCase();
            const isMatch = (t: Temple) =>
              (targetSub.templeId && t.id === targetSub.templeId) ||
              (prevNameClean && t.name.trim().toLowerCase() === prevNameClean);
            if (prev.some(isMatch)) {
              return prev.map(t =>
                isMatch(t)
                  ? {
                      ...t,
                      ...approvedTemple,
                      id: t.id,
                      viewsCount: t.viewsCount,
                      createdAt: t.createdAt,
                      updatedAt: new Date().toISOString(),
                    }
                  : t
              );
            }
          }
          const cleanName = approvedTemple.name.trim().toLowerCase();
          const exists = prev.some(
            t => (targetSub.templeId && t.id === targetSub.templeId) || t.name.trim().toLowerCase() === cleanName
          );
          return exists ? prev : [approvedTemple, ...prev];
        });
      }

      await api.reviewSubmission(submissionId, 'approved', {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
      }, notes);

      await refreshFreshData();

      // Confetti celebration
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#10b981', '#3b82f6'],
        });
      } catch {}
    } catch (e) {
      console.error('[AppContext] approveSubmission failed:', e);
    } finally {
      setActionLoadingText(null);
    }
  };

  // Reject submission
  const rejectSubmission = async (submissionId: string, notes: string): Promise<void> => {
    setActionLoadingText('Rejecting Submission...');
    try {
      await api.reviewSubmission(submissionId, 'rejected', {
        id: currentUser.id,
        name: currentUser.name,
        role: currentUser.role,
      }, notes);

      await refreshFreshData();
    } catch (e) {
      console.error('[AppContext] rejectSubmission failed:', e);
    } finally {
      setActionLoadingText(null);
    }
  };

  const deleteTemple = async (templeId: string): Promise<void> => {
    setActionLoadingText('Deleting Temple...');
    try {
      setTemples(prev => prev.filter(t => t.id !== templeId));
      await api.deleteTemple(templeId);
      await refreshFreshData();
    } catch (e) {
      console.error('[AppContext] deleteTemple failed:', e);
    } finally {
      setActionLoadingText(null);
    }
  };

  const clearAllTemples = async (): Promise<boolean> => {
    setActionLoadingText('Wiping Temples Catalog...');
    try {
      setTemples([]);
      try {
        localStorage.setItem('mupporul_temples_v2', JSON.stringify([]));
      } catch {}
      const ok = await api.clearAllTemples();
      await refreshFreshData();
      return ok;
    } catch (e) {
      console.error('[AppContext] clearAllTemples failed:', e);
      return false;
    } finally {
      setActionLoadingText(null);
    }
  };

  const resetToDefaultData = () => {
    localStorage.removeItem('mupporul_temples_v2');
    localStorage.removeItem('mupporul_submissions_v2');
    localStorage.removeItem('mupporul_users_v2');
    localStorage.removeItem('mupporul_current_user_id');
    localStorage.removeItem('mupporul_solution_tags_v1');
    setTemples([]);
    setSubmissions([]);
    setSolutionTags([]);
    setUsers(INITIAL_USERS);
    setCurrentUserId('user-admin');
    setFilters(initialFilters);
  };

  return (
    <AppContext.Provider
      value={{
        temples,
        submissions,
        currentUser,
        users,
        filters,
        activeTab,
        selectedTempleForDetail,
        videoModalUrl,
        isFilterOpen,
        isAddEditModalOpen,
        isLoggedIn,
        setIsLoggedIn,
        isLoginModalOpen,
        setIsLoginModalOpen,
        openLoginModal,
        closeLoginModal,
        loginWithCredentials,
        logout,
        isChangePasswordModalOpen,
        openChangePasswordModal,
        closeChangePasswordModal,
        changePassword,
        isAddUserModalOpen,
        openAddUserModal,
        closeAddUserModal,
        addUser,
        deleteUser,
        deities,
        createDeity,
        updateDeity,
        deleteDeity,
        solutionTags,
        createSolutionTag,
        updateSolutionTag,
        deleteSolutionTag,
        naamaVilakkamEnabled,
        toggleNaamaVilakkamFeature,
        naamaVilakkamList,
        isNaamaModalOpen,
        naamaToEdit,
        openAddNaamaModal,
        openEditNaamaModal,
        closeNaamaModal,
        createNaamaVilakkam,
        updateNaamaVilakkam,
        deleteNaamaVilakkam,
        templeToEdit,
        isLoading,
        setIsLoading,
        isTabLoading,
        actionLoadingText,
        setActionLoadingText,
        switchTab,
        refreshFreshData,
        setActiveTab,
        setFilters,
        resetFilters,
        togglePlanetFilter,
        setPlanetMatchMode,
        setSelectedPlanetFilter,
        switchRole,
        setCurrentUserById,
        updateUserRole,
        openAddModal,
        openEditModal,
        closeAddEditModal,
        openDetailModal,
        closeDetailModal,
        openVideoModal,
        closeVideoModal,
        setIsFilterOpen,
        incrementViews,
        submitTemple,
        approveSubmission,
        rejectSubmission,
        deleteTemple,
        clearAllTemples,
        resetToDefaultData,
        backendStatus,
        reconnectBackend,
        isArchitectureModalOpen,
        setIsArchitectureModalOpen,
        isMobileFrame,
        setIsMobileFrame,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
