import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewTab } from '../frontend/src/components/ReviewTab';
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
