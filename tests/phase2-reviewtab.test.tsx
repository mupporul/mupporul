import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewTab } from '../frontend/src/components/ReviewTab';
import { BottomNav } from '../frontend/src/components/BottomNav';
import { ProfileTab } from '../frontend/src/components/ProfileTab';
import * as AppContextModule from '../frontend/src/context/AppContext';
import { TempleSubmission } from '../frontend/src/types';

describe('Phase 2: ReviewTab Component Boundary & Resilience Tests', () => {
  const mockRefreshFreshData = vi.fn().mockResolvedValue(undefined);
  const mockApproveSubmission = vi.fn().mockResolvedValue(undefined);
  const mockRejectSubmission = vi.fn().mockResolvedValue(undefined);
  const mockSetActiveTab = vi.fn();
  const mockSwitchRole = vi.fn();
  const mockOpenDetailModal = vi.fn();

  const baseUser = {
    id: 'user-admin',
    name: 'Admin Murugan',
    username: 'ammurugan',
    role: 'admin' as const,
    contributionsCount: 10,
    approvedCount: 8,
  };

  const defaultMockContext = {
    submissions: [] as TempleSubmission[],
    approveSubmission: mockApproveSubmission,
    rejectSubmission: mockRejectSubmission,
    currentUser: baseUser,
    switchRole: mockSwitchRole,
    setActiveTab: mockSetActiveTab,
    openDetailModal: mockOpenDetailModal,
    temples: [],
    deities: [],
    refreshFreshData: mockRefreshFreshData,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing when queue is completely empty', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue(defaultMockContext as any);

    render(<ReviewTab />);

    expect(screen.getByText('Community Review Queue')).toBeInTheDocument();
    expect(screen.getByText('No pending submissions at this moment')).toBeInTheDocument();
    expect(screen.getByText(/All pending submissions have been reviewed/)).toBeInTheDocument();
    expect(mockRefreshFreshData).toHaveBeenCalled();
  });

  it('defensively renders boundary submissions with undefined planets and omitted submitter details', () => {
    // Extreme edge-case boundary payload that previously crashed React
    const boundarySubmission: any = {
      id: 'sub-edge-1',
      type: 'new',
      status: 'pending',
      submittedAt: '2026-10-25T10:00:00Z',
      templeData: {
        name: 'Boundary Edge Temple',
        location: 'Coimbatore',
        planets: undefined, // intentionally undefined to test .map guard
        deity: undefined,
        significance: undefined,
        timings: undefined,
      },
      submittedBy: undefined, // intentionally undefined to test .substring guard
    };

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...defaultMockContext,
      submissions: [boundarySubmission],
    } as any);

    // This must not throw an uncaught exception!
    render(<ReviewTab />);

    expect(screen.getByText('Boundary Edge Temple')).toBeInTheDocument();
    expect(screen.getByText('📍 Coimbatore')).toBeInTheDocument();
    // Fallback contributor initials and name should render
    expect(screen.getByText('Contributor')).toBeInTheDocument();
    expect(screen.getByText('CO')).toBeInTheDocument();
    // Approve & Publish button should be present
    expect(screen.getByRole('button', { name: /Approve & Publish/i })).toBeInTheDocument();
  });

  it('filters submissions accurately between Pending, Approved, and Rejected sub-tabs', () => {
    const mixedSubmissions: TempleSubmission[] = [
      {
        id: 'sub-pending-1',
        type: 'new',
        status: 'pending',
        submittedAt: '2026-10-25T10:00:00Z',
        templeData: {
          name: 'Pending Murugan Temple',
          location: 'Palani',
          state: 'Tamil Nadu',
          planets: ['mars'],
          deity: 'murugan',
          significance: 'Spiritual hill',
          remedies: [],
        },
        submittedBy: { id: 'u1', name: 'Devotee A', role: 'contributor' },
      },
      {
        id: 'sub-approved-2',
        type: 'new',
        status: 'approved',
        submittedAt: '2026-10-24T10:00:00Z',
        reviewedAt: '2026-10-25T10:00:00Z',
        reviewedBy: { id: 'admin', name: 'Admin Murugan', role: 'admin' },
        reviewNotes: 'Looks authentic and verified',
        templeData: {
          name: 'Approved Shiva Temple',
          location: 'Thiruvannamalai',
          state: 'Tamil Nadu',
          planets: ['sun'],
          deity: 'shivan',
          significance: 'Agni sthalam',
          remedies: [],
        },
        submittedBy: { id: 'u2', name: 'Devotee B', role: 'contributor' },
      },
      {
        id: 'sub-rejected-3',
        type: 'new',
        status: 'rejected',
        submittedAt: '2026-10-23T10:00:00Z',
        reviewedAt: '2026-10-24T10:00:00Z',
        reviewedBy: { id: 'admin', name: 'Admin Murugan', role: 'admin' },
        reviewNotes: 'Duplicate temple listing',
        templeData: {
          name: 'Duplicate Temple',
          location: 'Chennai',
          state: 'Tamil Nadu',
          planets: [],
          deity: 'vinayagar',
          significance: 'Duplicate',
          remedies: [],
        },
        submittedBy: { id: 'u3', name: 'Devotee C', role: 'user' },
      },
    ];

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...defaultMockContext,
      submissions: mixedSubmissions,
    } as any);

    render(<ReviewTab />);

    // 1. Initial view is Pending Review
    expect(screen.getByText('Pending Murugan Temple')).toBeInTheDocument();
    expect(screen.queryByText('Approved Shiva Temple')).not.toBeInTheDocument();
    expect(screen.queryByText('Duplicate Temple')).not.toBeInTheDocument();

    // 2. Click Approved tab
    const approvedTabBtn = screen.getByRole('button', { name: /Approved \(1\)/i });
    fireEvent.click(approvedTabBtn);

    expect(screen.getByText('Approved Shiva Temple')).toBeInTheDocument();
    expect(screen.getByText(/Looks authentic and verified/)).toBeInTheDocument();
    expect(screen.queryByText('Pending Murugan Temple')).not.toBeInTheDocument();

    // 3. Click Rejected tab
    const rejectedTabBtn = screen.getByRole('button', { name: /Rejected \(1\)/i });
    fireEvent.click(rejectedTabBtn);

    expect(screen.getByText('Duplicate Temple')).toBeInTheDocument();
    expect(screen.getByText(/Duplicate temple listing/)).toBeInTheDocument();
  });

  it('triggers approveSubmission when admin clicks Approve & Publish', async () => {
    const pendingSub: TempleSubmission = {
      id: 'sub-to-approve',
      type: 'new',
      status: 'pending',
      submittedAt: '2026-10-25T11:00:00Z',
      templeData: {
        name: 'Vaitheeswaran Kovil',
        location: 'Mayiladuthurai',
        state: 'Tamil Nadu',
        planets: ['mars'],
        deity: 'shivan',
        significance: 'Chevvai pariharam sthalam',
        timings: '6:00 AM - 1:00 PM',
        remedies: [],
      },
      submittedBy: {
        id: 'user-thangaraj',
        name: 'Thangaraj',
        role: 'contributor',
      },
    };

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...defaultMockContext,
      submissions: [pendingSub],
    } as any);

    render(<ReviewTab />);

    const approveBtn = screen.getByRole('button', { name: /Approve & Publish/i });
    fireEvent.click(approveBtn);

    expect(mockApproveSubmission).toHaveBeenCalledWith(
      'sub-to-approve',
      'Verified and approved for publication.'
    );

    await waitFor(() => {
      expect(screen.getByText(/"Vaitheeswaran Kovil" has been approved/i)).toBeInTheDocument();
    });
  });

  it('triggers manual refresh when the Refresh button is clicked', async () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue(defaultMockContext as any);

    render(<ReviewTab />);

    const refreshBtn = screen.getByRole('button', { name: /Refresh/i });
    fireEvent.click(refreshBtn);

    expect(mockRefreshFreshData).toHaveBeenCalled();
  });
});

describe('Phase 2: BottomNav Role-Based Tab Visibility Guard', () => {
  const baseNavContext = {
    activeTab: 'temples' as const,
    setActiveTab: vi.fn(),
    submissions: [],
    openAddModal: vi.fn(),
  };

  it('hides Review, Add, and Analytics tabs for user (Viewer) role', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseNavContext,
      currentUser: { id: 'u-user', name: 'Thangaraj', username: 'thangaraj', role: 'user' },
    } as any);

    render(<BottomNav />);

    expect(screen.getByRole('button', { name: /Temples/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Quiz/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Profile/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Review/i })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Add Temple')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Analytics/i })).not.toBeInTheDocument();
  });

  it('shows Review and Add tabs for contributor role, while hiding Analytics', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseNavContext,
      currentUser: { id: 'u-contrib', name: 'Contributor', username: 'contrib', role: 'contributor' },
    } as any);

    render(<BottomNav />);

    expect(screen.getByRole('button', { name: /Review/i })).toBeInTheDocument();
    expect(screen.getByTitle('Add Temple')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Analytics/i })).not.toBeInTheDocument();
  });

  it('shows Review, Add, and Analytics tabs for admin role', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseNavContext,
      currentUser: { id: 'u-admin', name: 'Admin', username: 'admin', role: 'admin' },
    } as any);

    render(<BottomNav />);

    expect(screen.getByRole('button', { name: /Review/i })).toBeInTheDocument();
    expect(screen.getByTitle('Add Temple')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Analytics/i })).toBeInTheDocument();
  });
});

describe('Phase 2: ProfileTab Role-Based Visibility Guard', () => {
  const baseProfileContext = {
    switchRole: vi.fn(),
    temples: [],
    submissions: [
      {
        id: 'sub-old-1',
        type: 'new',
        status: 'approved',
        submittedAt: '2026-10-26T00:00:00Z',
        templeData: {
          name: 'Lakshmi Narasimmar Temple',
          location: 'Poovarasankuppam',
          state: 'Tamil Nadu',
          planets: ['sun'],
          deity: 'narasimmar',
          significance: 'Pariharam temple',
          imageUrl: '',
          videoUrl: '',
          timings: '',
          remedies: [],
        },
        submittedBy: {
          id: 'user-thangaraj',
          name: 'Thangaraj',
          email: 'thangaraj@mupporul.app',
          role: 'contributor',
        },
      },
    ],
    openDetailModal: vi.fn(),
    openAddModal: vi.fn(),
    openAddUserModal: vi.fn(),
    openChangePasswordModal: vi.fn(),
    logout: vi.fn(),
    setActiveTab: vi.fn(),
    resetToDefaultData: vi.fn(),
    openLoginModal: vi.fn(),
    setIsArchitectureModalOpen: vi.fn(),
  };

  it('hides Switch User, My Submissions, and RBAC Matrix when demoted to user (Viewer) role', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseProfileContext,
      currentUser: {
        id: 'user-thangaraj',
        name: 'Thangaraj',
        username: 'thangaraj',
        email: 'thangaraj@mupporul.app',
        role: 'user',
        avatarText: 'TH',
        avatarColor: 'from-cyan-500 to-cyan-700',
        contributionsCount: 0,
        approvedCount: 0,
      },
    } as any);

    render(<ProfileTab />);

    expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Switch User/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/My Submissions/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/RBAC Matrix/i)).not.toBeInTheDocument();
    expect(screen.queryByText('Lakshmi Narasimmar Temple')).not.toBeInTheDocument();
  });

  it('hides Switch User while keeping My Submissions and RBAC Matrix for contributor role', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseProfileContext,
      currentUser: {
        id: 'user-thangaraj',
        name: 'Thangaraj',
        username: 'thangaraj',
        email: 'thangaraj@mupporul.app',
        role: 'contributor',
        avatarText: 'TH',
        avatarColor: 'from-cyan-500 to-cyan-700',
        contributionsCount: 1,
        approvedCount: 1,
      },
    } as any);

    render(<ProfileTab />);

    expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Switch User/i })).not.toBeInTheDocument();
    expect(screen.getByText(/My Submissions \(1\)/i)).toBeInTheDocument();
    expect(screen.getByText(/RBAC Matrix/i)).toBeInTheDocument();
    expect(screen.getByText('Lakshmi Narasimmar Temple')).toBeInTheDocument();
  });

  it('shows Switch User, My Submissions, and RBAC Matrix for admin role', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseProfileContext,
      currentUser: {
        id: 'user-admin',
        name: 'Admin Murugan',
        username: 'ammurugan',
        email: 'admin@mupporul.app',
        role: 'admin',
        avatarText: 'AM',
        avatarColor: 'from-purple-500 to-purple-700',
        contributionsCount: 5,
        approvedCount: 5,
      },
    } as any);

    render(<ProfileTab />);

    expect(screen.getByRole('button', { name: /Log Out/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Switch User/i })).toBeInTheDocument();
    expect(screen.getByText(/My Submissions/i)).toBeInTheDocument();
    expect(screen.getByText(/RBAC Matrix/i)).toBeInTheDocument();
  });
});
