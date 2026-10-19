import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Temple,
  TempleSubmission,
  UserProfile,
  Role,
  FilterState,
  SubmissionStatus,
} from '../types';
import { INITIAL_TEMPLES } from '../data/initialTemples';
import { INITIAL_SUBMISSIONS } from '../data/initialSubmissions';
import { INITIAL_USERS } from '../data/constants';

import { api } from '../services/api';

interface AppContextType {
  temples: Temple[];
  submissions: TempleSubmission[];
  currentUser: UserProfile;
  users: UserProfile[];
  filters: FilterState;
  activeTab: 'temples' | 'review' | 'quiz' | 'profile' | 'analytics';
  selectedTempleForDetail: Temple | null;
  videoModalUrl: { url: string; title: string } | null;
  isFilterOpen: boolean;
  isAddEditModalOpen: boolean;
  templeToEdit: Temple | null;
  bookmarkedIds: string[];
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
  loginWithCredentials: (usernameOrEmail: string, password?: string) => { success: boolean; message: string };
  logout: () => void;
  
  // Password Management
  isChangePasswordModalOpen: boolean;
  openChangePasswordModal: () => void;
  closeChangePasswordModal: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; message: string }>;

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

  // Actions
  setActiveTab: (tab: 'temples' | 'review' | 'quiz' | 'profile' | 'analytics') => void;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  resetFilters: () => void;
  togglePlanetFilter: (planetId: string) => void;
  setPlanetMatchMode: (mode: 'all' | 'exact') => void;
  setSelectedPlanetFilter: (planetId: string | null) => void;
  switchRole: (role: Role) => void;
  setCurrentUserById: (userId: string) => void;
  updateUserRole: (userId: string, newRole: Role) => void;
  openAddModal: () => void;
  openEditModal: (temple: Temple) => void;
  closeAddEditModal: () => void;
  openDetailModal: (temple: Temple) => void;
  closeDetailModal: () => void;
  openVideoModal: (url: string, title: string) => void;
  closeVideoModal: () => void;
  setIsFilterOpen: (isOpen: boolean) => void;
  toggleBookmark: (templeId: string) => void;
  incrementViews: (templeId: string) => void;

  // Review Workflow
  submitTemple: (data: Omit<Temple, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>, existingTempleId?: string) => Promise<boolean>;
  approveSubmission: (submissionId: string, notes?: string) => void;
  rejectSubmission: (submissionId: string, notes: string) => void;
  deleteTemple: (templeId: string) => void;
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
          return parsed.filter(
            (t: Temple) =>
              !['temple-melmalayanoor', 'temple-thirubuvanam', 'temple-thirubavanoor', 'temple-suriyanar', 'temple-thingalur', 'temple-vaitheeswaran', 'temple-thirunageswaram', 'temple-alangudi'].includes(t.id)
          );
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
          return parsed.filter(
            (s: TempleSubmission) =>
              !['sub-new-kanjanur', 'sub-edit-melmalayanoor', 'sub-new-thirunallar'].includes(s.id)
          );
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

  // Bookmarks
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('mupporul_bookmarks_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Auth & UI state
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    try {
      return localStorage.getItem('mupporul_is_logged_in') !== 'false';
    } catch {
      return true;
    }
  });
  const [activeTab, setActiveTab] = useState<'temples' | 'review' | 'quiz' | 'profile' | 'analytics'>('temples');
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [selectedTempleForDetail, setSelectedTempleForDetail] = useState<Temple | null>(null);
  const [videoModalUrl, setVideoModalUrl] = useState<{ url: string; title: string } | null>(null);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [templeToEdit, setTempleToEdit] = useState<Temple | null>(null);
  const [backendStatus, setBackendStatus] = useState<'connected' | 'offline' | 'checking'>('checking');
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [isMobileFrame, setIsMobileFrame] = useState(false);

  // Sync with Backend REST API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchFromBackend = async () => {
      try {
        const health = await api.checkHealth();
        if (health && isMounted) {
          setBackendStatus('connected');
          // Fetch initial fresh data from backend
          const [remoteTemples, remoteSubmissions] = await Promise.allSettled([
            api.getTemples(),
            api.getSubmissions()
          ]);

          if (isMounted) {
            if (remoteTemples.status === 'fulfilled' && Array.isArray(remoteTemples.value)) {
              setTemples(remoteTemples.value);
              try {
                localStorage.setItem('mupporul_temples_v2', JSON.stringify(remoteTemples.value));
              } catch {}
            }
            if (remoteSubmissions.status === 'fulfilled' && Array.isArray(remoteSubmissions.value)) {
              const cleaned = remoteSubmissions.value.filter(
                (s: TempleSubmission) =>
                  !['sub-new-kanjanur', 'sub-edit-melmalayanoor', 'sub-new-thirunallar'].includes(s.id)
              );
              setSubmissions(cleaned);
              try {
                localStorage.setItem('mupporul_submissions_v2', JSON.stringify(cleaned));
              } catch {}
            }
          }
        } else if (isMounted) {
          setBackendStatus('offline');
        }
      } catch {
        if (isMounted) setBackendStatus('offline');
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
        const [remoteTemples, remoteSubmissions] = await Promise.allSettled([
          api.getTemples(),
          api.getSubmissions()
        ]);
        if (remoteTemples.status === 'fulfilled' && Array.isArray(remoteTemples.value)) {
          setTemples(remoteTemples.value);
          try {
            localStorage.setItem('mupporul_temples_v2', JSON.stringify(remoteTemples.value));
          } catch {}
        }
        if (remoteSubmissions.status === 'fulfilled' && Array.isArray(remoteSubmissions.value)) {
          const cleaned = remoteSubmissions.value.filter(
            (s: TempleSubmission) =>
              !['sub-new-kanjanur', 'sub-edit-melmalayanoor', 'sub-new-thirunallar'].includes(s.id)
          );
          setSubmissions(cleaned);
          try {
            localStorage.setItem('mupporul_submissions_v2', JSON.stringify(cleaned));
          } catch {}
        }
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

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);

  // Admin User Management Handlers
  const openAddUserModal = () => {
    setIsAddUserModalOpen(true);
  };

  const closeAddUserModal = () => {
    setIsAddUserModalOpen(false);
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

    setUsers(prev => [...prev, newUser]);

    // Sync to backend API
    api.createUser({
      name: newUser.name,
      username: newUser.username,
      password: newUser.password!,
      email: newUser.email,
      role: newUser.role,
    }).catch(e => console.warn('[AppContext] Background user creation API sync failed (saved locally):', e));

    return {
      success: true,
      message: `User @${newUser.username} created with role ${newUser.role.toUpperCase()}!`,
      user: newUser,
    };
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

    setUsers(prev => prev.filter(u => u.id !== userId));

    // Sync to backend API
    api.deleteUser(userId).catch(e => console.warn('[AppContext] Background user deletion API sync failed:', e));

    return { success: true, message: `User "${targetUser.username || targetUser.name}" deleted successfully.` };
  };

  const openChangePasswordModal = () => setIsChangePasswordModalOpen(true);
  const closeChangePasswordModal = () => setIsChangePasswordModalOpen(false);

  const loginWithCredentials = (usernameOrEmail: string, password?: string) => {
    const cleanId = usernameOrEmail.trim().toLowerCase();
    const cleanPw = (password || '').trim();

    const user = users.find(
      u => u.username?.toLowerCase() === cleanId || u.email?.toLowerCase() === cleanId
    );

    if (!user) {
      return { success: false, message: 'User not found. Check credentials or ask admin to create an account.' };
    }

    if (user.password && cleanPw !== user.password) {
      return { success: false, message: 'Invalid password. Please verify and try again.' };
    }

    setCurrentUserId(user.id);
    setIsLoggedIn(true);
    try {
      localStorage.setItem('mupporul_is_logged_in', 'true');
    } catch {
      // safe fallback
    }
    setIsLoginModalOpen(false);
    return { success: true, message: `Welcome back, ${user.name} (${user.role.toUpperCase()})!` };
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
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'No user is currently active.' };
    }

    const cleanCurrent = (currentPassword || '').trim();
    const cleanNew = (newPassword || '').trim();

    if (currentUser.password && cleanCurrent !== currentUser.password) {
      return { success: false, message: 'Current password does not match. Please verify.' };
    }

    if (cleanNew.length < 4) {
      return { success: false, message: 'New password must be at least 4 characters long.' };
    }

    if (cleanNew === currentUser.password) {
      return { success: false, message: 'New password must be different from current password.' };
    }

    // Update in users state
    setUsers(prev =>
      prev.map(u => (u.id === currentUser.id ? { ...u, password: cleanNew } : u))
    );

    // Sync to backend API
    api.updatePassword(currentUser.id, cleanNew, cleanCurrent).catch(e =>
      console.warn('[AppContext] Background password update API sync failed:', e)
    );

    return {
      success: true,
      message: 'Your password has been changed successfully! Please remember your new password.',
    };
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

  useEffect(() => {
    try {
      localStorage.setItem('mupporul_bookmarks_v2', JSON.stringify(bookmarkedIds));
    } catch (e) {
      console.error(e);
    }
  }, [bookmarkedIds]);

  // Actions
  const resetFilters = () => setFilters(initialFilters);

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
  };

  const setPlanetMatchMode = (mode: 'all' | 'exact') => {
    setFilters(prev => ({
      ...prev,
      planetMatchMode: mode,
    }));
  };

  const setSelectedPlanetFilter = (planetId: string | null) => {
    if (!planetId) {
      setFilters(prev => ({ ...prev, planets: [], planet: null }));
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
  };

  const setCurrentUserById = (userId: string) => {
    const found = users.find(u => u.id === userId);
    if (found) setCurrentUserId(userId);
  };

  const updateUserRole = (userId: string, newRole: Role) => {
    setUsers(prev =>
      prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
    );
  };

  const openAddModal = () => {
    setTempleToEdit(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (temple: Temple) => {
    setTempleToEdit(temple);
    setIsAddEditModalOpen(true);
  };

  const closeAddEditModal = () => {
    setIsAddEditModalOpen(false);
    setTempleToEdit(null);
  };

  const openDetailModal = (temple: Temple) => {
    setSelectedTempleForDetail(temple);
    incrementViews(temple.id);
  };

  const closeDetailModal = () => setSelectedTempleForDetail(null);

  const openVideoModal = (url: string, title: string) => {
    setVideoModalUrl({ url, title });
  };

  const closeVideoModal = () => setVideoModalUrl(null);

  const toggleBookmark = (templeId: string) => {
    setBookmarkedIds(prev =>
      prev.includes(templeId) ? prev.filter(id => id !== templeId) : [...prev, templeId]
    );
    api.toggleBookmark(currentUser.id, templeId).catch(e => console.warn('[AppContext] Bookmark API sync:', e));
  };

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
    const now = new Date().toISOString();
    const isEdit = !!existingTempleId;
    const existingTemple = isEdit ? temples.find(t => t.id === existingTempleId) : undefined;

    // If Admin: Publish directly to live temples directory and database!
    if (currentUser.role === 'admin') {
      if (isEdit && existingTempleId) {
        setTemples(prev =>
          prev.map(t => (t.id === existingTempleId ? { ...t, ...data, updatedAt: now } : t))
        );
        api.updateTemple(existingTempleId, data).catch(e => console.warn('API update failed:', e));
      } else {
        const newTempleId = `temple-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        const newTemple: Temple = {
          ...data,
          id: newTempleId,
          createdAt: now,
          updatedAt: now,
          viewsCount: 0,
          submittedBy: {
            id: currentUser.id,
            name: currentUser.name,
            role: currentUser.role,
          },
        };
        setTemples(prev => [newTemple, ...prev.filter(t => t.name !== data.name)]);
        api.createTemple(data).catch(e => console.warn('API create failed:', e));
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
        templeData: data,
      };
      setSubmissions(prev => [
        approvedSub,
        ...prev.filter(s => s.templeData?.name !== data.name),
      ]);
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
      templeData: data,
      previousData: existingTemple
        ? {
            name: existingTemple.name,
            location: existingTemple.location,
            planets: existingTemple.planets,
            deity: existingTemple.deity,
            timings: existingTemple.timings,
            significance: existingTemple.significance,
          }
        : undefined,
    };

    setSubmissions(prev => [newSubmission, ...prev]);

    // Update contributor count
    setUsers(prev =>
      prev.map(u =>
        u.id === currentUser.id ? { ...u, contributionsCount: u.contributionsCount + 1 } : u
      )
    );

    // Sync with backend API
    api.createSubmission({
      type: newSubmission.type,
      templeId: newSubmission.templeId,
      templeData: newSubmission.templeData,
      previousData: newSubmission.previousData,
      submittedBy: newSubmission.submittedBy,
    }).catch(e => console.warn('[AppContext] Background API submission sync failed (saved locally):', e));

    return true;
  };

  // Approve submission
  const approveSubmission = (submissionId: string, notes?: string) => {
    const submission = submissions.find(s => s.id === submissionId);
    if (!submission) return;

    const now = new Date().toISOString();

    // 1. Update submission status
    setSubmissions(prev =>
      prev.map(s =>
        s.id === submissionId
          ? {
              ...s,
              status: 'approved' as SubmissionStatus,
              reviewedAt: now,
              reviewedBy: {
                id: currentUser.id,
                name: currentUser.name,
                role: currentUser.role,
              },
              reviewNotes: notes || 'Approved by contributor reviewer.',
            }
          : s
      )
    );

    // 2. Apply to temples
    if (submission.type === 'new') {
      const newTemple: Temple = {
        ...submission.templeData,
        id: `temple-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
        viewsCount: 1,
        submittedBy: {
          id: submission.submittedBy.id,
          name: submission.submittedBy.name,
          role: submission.submittedBy.role,
        },
      };
      setTemples(prev => [
        newTemple,
        ...prev.filter(t => t.name.trim().toLowerCase() !== newTemple.name.trim().toLowerCase())
      ]);
    } else if (submission.type === 'edit' && submission.templeId) {
      setTemples(prev =>
        prev.map(t =>
          t.id === submission.templeId
            ? {
                ...t,
                ...submission.templeData,
                updatedAt: now,
              }
            : t
        )
      );
    }

    // Update submitter's approvedCount
    setUsers(prev =>
      prev.map(u =>
        u.id === submission.submittedBy.id
          ? { ...u, approvedCount: (u.approvedCount || 0) + 1 }
          : u
      )
    );

    // Sync review to backend API
    api.reviewSubmission(submissionId, 'approved', {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
    }, notes).catch(e => console.warn('[AppContext] Background API review sync failed:', e));

    // Confetti celebration
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#fbbf24', '#f43f5e', '#10b981', '#3b82f6'],
      });
    } catch {
      // safe fallback
    }
  };

  // Reject submission
  const rejectSubmission = (submissionId: string, notes: string) => {
    const now = new Date().toISOString();
    setSubmissions(prev =>
      prev.map(s =>
        s.id === submissionId
          ? {
              ...s,
              status: 'rejected' as SubmissionStatus,
              reviewedAt: now,
              reviewedBy: {
                id: currentUser.id,
                name: currentUser.name,
                role: currentUser.role,
              },
              reviewNotes: notes || 'Rejected during community review.',
            }
          : s
      )
    );

    // Sync reject to backend API
    api.reviewSubmission(submissionId, 'rejected', {
      id: currentUser.id,
      name: currentUser.name,
      role: currentUser.role,
    }, notes).catch(e => console.warn('[AppContext] Background API rejection sync failed:', e));
  };

  const deleteTemple = (templeId: string) => {
    setTemples(prev => prev.filter(t => t.id !== templeId));
    api.deleteTemple(templeId).catch(e => console.warn('[AppContext] Background API delete failed:', e));
  };

  const clearAllTemples = async (): Promise<boolean> => {
    setTemples([]);
    try {
      localStorage.setItem('mupporul_temples_v2', JSON.stringify([]));
    } catch {}
    const ok = await api.clearAllTemples();
    return ok;
  };

  const resetToDefaultData = () => {
    localStorage.removeItem('mupporul_temples_v2');
    localStorage.removeItem('mupporul_submissions_v2');
    localStorage.removeItem('mupporul_users_v2');
    localStorage.removeItem('mupporul_bookmarks_v2');
    localStorage.removeItem('mupporul_current_user_id');
    setTemples([]);
    setSubmissions([]);
    setUsers(INITIAL_USERS);
    setCurrentUserId('user-admin');
    setBookmarkedIds([]);
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
        templeToEdit,
        bookmarkedIds,
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
        toggleBookmark,
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
