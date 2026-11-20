import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReviewTab } from '../frontend/src/components/ReviewTab';
import { BottomNav } from '../frontend/src/components/BottomNav';
import { ProfileTab } from '../frontend/src/components/ProfileTab';
import { AddEditTempleModal } from '../frontend/src/components/AddEditTempleModal';
import { TempleCard } from '../frontend/src/components/TempleCard';
import { Header } from '../frontend/src/components/Header';
import { TemplesList } from '../frontend/src/components/TemplesList';
import { TempleDetailModal } from '../frontend/src/components/TempleDetailModal';
import { SolutionTab } from '../frontend/src/components/SolutionTab';
import { AdminSolutionTagsPanel } from '../frontend/src/components/AdminSolutionTagsPanel';
import * as AppContextModule from '../frontend/src/context/AppContext';
import { TempleSubmission, Temple, SolutionTag } from '../frontend/src/types';

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
    expect(screen.getByRole('button', { name: /Solution/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Quiz/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Profile/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Review/i })).not.toBeInTheDocument();
    expect(screen.queryByTitle('Add Temple')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Analytics/i })).not.toBeInTheDocument();
  });

  it('shows Solution, Review and Add tabs for contributor role, while hiding Analytics', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseNavContext,
      currentUser: { id: 'u-contrib', name: 'Contributor', username: 'contrib', role: 'contributor' },
    } as any);

    render(<BottomNav />);

    expect(screen.getByRole('button', { name: /Solution/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Review/i })).toBeInTheDocument();
    expect(screen.getByTitle('Add Temple')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Analytics/i })).not.toBeInTheDocument();
  });

  it('shows Solution, Review, Add, and Analytics tabs for admin role', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseNavContext,
      currentUser: { id: 'u-admin', name: 'Admin', username: 'admin', role: 'admin' },
    } as any);

    render(<BottomNav />);

    expect(screen.getByRole('button', { name: /Solution/i })).toBeInTheDocument();
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

describe('Phase 2: AddEditTempleModal Edit Persistence & Error Handling', () => {
  const sampleTemple = {
    id: 'temple-edit-1',
    name: 'Karungalakudi Sri Agatheeswarar Temple',
    location: 'Karungalakudi, Madurai',
    state: 'Tamil Nadu',
    planets: ['suri'],
    deity: 'agathiyar',
    significance: 'Ancient hill temple significance',
    remedies: [],
    imageUrl: '',
    videoUrl: '',
    timings: '6:00 AM - 8:00 PM',
    viewsCount: 0,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  };

  const buildModalContext = (overrides: Record<string, any> = {}) => ({
    isAddEditModalOpen: true,
    closeAddEditModal: vi.fn(),
    templeToEdit: sampleTemple,
    submitTemple: vi.fn().mockResolvedValue(true),
    currentUser: { id: 'user-c', name: 'ammurugan', username: 'ammurugan', role: 'contributor' },
    switchRole: vi.fn(),
    setActiveTab: vi.fn(),
    isMobileFrame: false,
    deities: [
      { id: 'agathiyar', nameTamil: 'அகஸ்தியர்', nameEnglish: 'Agathiyar' },
      { id: 'amman', nameTamil: 'அம்மன்', nameEnglish: 'Amman' },
    ],
    createDeity: vi.fn(),
    updateDeity: vi.fn(),
    deleteDeity: vi.fn(),
    ...overrides,
  });

  it('preserves edited Temple Name and Location across async deities updates and submits them', async () => {
    const submitTempleMock = vi.fn().mockResolvedValue(true);
    const useAppSpy = vi.spyOn(AppContextModule, 'useApp');
    const ctx1 = buildModalContext({ submitTemple: submitTempleMock });
    useAppSpy.mockReturnValue(ctx1 as any);

    const { rerender } = render(<AddEditTempleModal />);

    const nameInput = screen.getByDisplayValue('Karungalakudi Sri Agatheeswarar Temple');
    const locationInput = screen.getByDisplayValue('Karungalakudi, Madurai');

    fireEvent.change(nameInput, { target: { value: 'Karuungalakudi Updated Temple' } });
    fireEvent.change(locationInput, { target: { value: 'Melur, Madurai' } });

    // Simulate async refreshFreshData() returning a new deities array reference while modal is open
    const ctx2 = buildModalContext({
      submitTemple: submitTempleMock,
      deities: [
        { id: 'agathiyar', nameTamil: 'அகஸ்தியர்', nameEnglish: 'Agathiyar' },
        { id: 'amman', nameTamil: 'அம்மன்', nameEnglish: 'Amman' },
      ],
    });
    useAppSpy.mockReturnValue(ctx2 as any);
    rerender(<AddEditTempleModal />);

    // User's typed values must remain intact and not reset
    expect(screen.getByDisplayValue('Karuungalakudi Updated Temple')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Melur, Madurai')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Submit Updates for Review/i }));

    await waitFor(() => {
      expect(submitTempleMock).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Karuungalakudi Updated Temple',
          location: 'Melur, Madurai',
        }),
        'temple-edit-1'
      );
    });
  });

  it('displays an error alert and keeps modal open when submitTemple returns false', async () => {
    const submitTempleMock = vi.fn().mockResolvedValue(false);
    const closeMock = vi.fn();
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue(
      buildModalContext({ submitTemple: submitTempleMock, closeAddEditModal: closeMock }) as any
    );

    render(<AddEditTempleModal />);

    fireEvent.click(screen.getByRole('button', { name: /Submit Updates for Review/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to save temple updates/i).length).toBeGreaterThan(0);
    });
    expect(closeMock).not.toHaveBeenCalled();
  });
});

describe('Phase 2: TempleCard Admin Delete Menu', () => {
  const sampleTemple = {
    id: 'temple-del-1',
    name: 'Karungalakudi Thiruchunai Sri Agatheeswarar Temple',
    location: 'Karungalakudi, Madurai',
    state: 'Tamil Nadu',
    planets: ['suri'],
    deity: 'agathiyar',
    significance: 'Sacred hill temple',
    remedies: [],
    imageUrl: '',
    videoUrl: '',
    timings: '6 AM - 8 PM',
    viewsCount: 0,
    createdAt: '2026-10-01T00:00:00Z',
    updatedAt: '2026-10-01T00:00:00Z',
  };

  it('shows Delete Temple (Admin) option and triggers deleteTemple after inline confirmation', async () => {
    const deleteTempleMock = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      currentUser: { id: 'user-admin', name: 'ammurugan', username: 'ammurugan', role: 'admin' },
      openEditModal: vi.fn(),
      openDetailModal: vi.fn(),
      openVideoModal: vi.fn(),
      deleteTemple: deleteTempleMock,
      deities: [{ id: 'agathiyar', nameTamil: 'அகஸ்தியர்', nameEnglish: 'Agathiyar' }],
    } as any);

    render(<TempleCard temple={sampleTemple} />);

    fireEvent.click(screen.getByRole('button', { name: /More options/i }));
    const deleteOption = screen.getByRole('button', { name: /Delete Temple \(Admin\)/i });
    expect(deleteOption).toBeInTheDocument();

    fireEvent.click(deleteOption);
    const confirmBtn = screen.getByRole('button', { name: /Confirm Delete/i });
    fireEvent.click(confirmBtn);

    await waitFor(() => {
      expect(deleteTempleMock).toHaveBeenCalledWith('temple-del-1');
    });
  });

  it('hides Delete Temple (Admin) option for non-admin contributor role', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      currentUser: { id: 'user-c', name: 'Contrib', username: 'contrib', role: 'contributor' },
      openEditModal: vi.fn(),
      openDetailModal: vi.fn(),
      openVideoModal: vi.fn(),
      deleteTemple: vi.fn(),
      deities: [],
    } as any);

    render(<TempleCard temple={sampleTemple} />);

    fireEvent.click(screen.getByRole('button', { name: /More options/i }));
    expect(screen.queryByRole('button', { name: /Delete Temple/i })).not.toBeInTheDocument();
  });
});

describe('Phase 2: Jothidar Paarvai Feature Tests', () => {
  it('shows textarea only when Jothidar Paarvai checkbox is checked and validates/saves notes in AddEditTempleModal', async () => {
    const submitTempleMock = vi.fn().mockResolvedValue(true);
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      isAddEditModalOpen: true,
      closeAddEditModal: vi.fn(),
      templeToEdit: {
        id: 'temple-vayalur',
        name: 'Vayalur Murugan Temple',
        location: 'Vayalur, Tiruchirappalli',
        state: 'Tamil Nadu',
        planets: ['sani', 'sev'],
        deity: 'murugan',
        significance: 'Existing significance text',
        remedies: [],
        imageUrl: '',
        videoUrl: '',
        timings: '6 am - 8 pm',
        viewsCount: 0,
        createdAt: '2026-10-01T00:00:00Z',
        updatedAt: '2026-10-01T00:00:00Z',
      },
      submitTemple: submitTempleMock,
      currentUser: { id: 'user-admin', name: 'Admin Murugan', username: 'admin', role: 'admin' },
      switchRole: vi.fn(),
      setActiveTab: vi.fn(),
      isMobileFrame: false,
      deities: [{ id: 'murugan', nameTamil: 'முருகன்', nameEnglish: 'Murugan' }],
      createDeity: vi.fn(),
      updateDeity: vi.fn(),
      deleteDeity: vi.fn(),
    } as any);

    render(<AddEditTempleModal />);

    const checkbox = screen.getByRole('checkbox', { name: /பாவ\/ராசி தொடர்பு/i });
    expect(checkbox).not.toBeChecked();
    expect(screen.queryByPlaceholderText(/பாவ\/ராசி தொடர்பு குறிப்புகளை/i)).not.toBeInTheDocument();

    fireEvent.click(checkbox);
    const notesBox = screen.getByPlaceholderText(/பாவ\/ராசி தொடர்பு குறிப்புகளை/i);
    expect(notesBox).toBeInTheDocument();

    fireEvent.change(notesBox, {
      target: { value: 'செவ்வாய் நீசம் பெற்று கடகத்தில் இருந்தாலும் வழிபடலாம்' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Update & Publish \(Admin\)/i }));

    await waitFor(() => {
      expect(submitTempleMock).toHaveBeenCalledWith(
        expect.objectContaining({
          jothidarPaarvai: true,
          jothidarPaarvaiNotes: 'செவ்வாய் நீசம் பெற்று கடகத்தில் இருந்தாலும் வழிபடலாம்',
        }),
        'temple-vayalur'
      );
    });
  });

  it('filters temple list when Jothidar Paarvai search checkbox is toggled in Header and TemplesList', () => {
    const templesData: Temple[] = [
      {
        id: 't-with-jp',
        name: 'Vayalur Murugan Temple',
        location: 'Vayalur, Tiruchirappalli',
        state: 'Tamil Nadu',
        planets: ['sani', 'sev'],
        deity: 'murugan',
        significance: 'Vayalur significance',
        remedies: [],
        imageUrl: '',
        videoUrl: '',
        jothidarPaarvai: true,
        jothidarPaarvaiNotes: 'Special Jothidar astrologer observation',
        timings: '6 am - 8 pm',
        viewsCount: 0,
        createdAt: '2026-11-18T00:00:00Z',
        updatedAt: '2026-11-18T00:00:00Z',
      },
      {
        id: 't-without-jp',
        name: 'Pampuranathar Temple',
        location: 'Thirupampuram, Thiruvarur',
        state: 'Tamil Nadu',
        planets: ['rahu', 'sani'],
        deity: 'shivan',
        significance: 'Pampuranathar significance',
        remedies: [],
        imageUrl: '',
        videoUrl: '',
        jothidarPaarvai: false,
        jothidarPaarvaiNotes: '',
        timings: '6 am - 8 pm',
        viewsCount: 0,
        createdAt: '2026-11-17T00:00:00Z',
        updatedAt: '2026-11-17T00:00:00Z',
      },
    ];

    let currentFilters = {
      planets: [] as string[],
      planetMatchMode: 'exact' as const,
      planet: null,
      deity: null,
      state: null,
      significance: null,
      searchQuery: '',
      jothidarPaarvaiOnly: false,
    };

    const useAppSpy = vi.spyOn(AppContextModule, 'useApp');
    const buildCtx = () =>
      ({
        temples: templesData,
        filters: currentFilters,
        setFilters: (updater: any) => {
          currentFilters = typeof updater === 'function' ? updater(currentFilters) : updater;
        },
        resetFilters: vi.fn(),
        openAddModal: vi.fn(),
        openEditModal: vi.fn(),
        openDetailModal: vi.fn(),
        openVideoModal: vi.fn(),
        deleteTemple: vi.fn(),
        setIsFilterOpen: vi.fn(),
        activeTab: 'temples',
        setActiveTab: vi.fn(),
        currentUser: { id: 'user-admin', name: 'Admin', username: 'admin', role: 'admin', avatarText: 'AM', avatarColor: 'from-purple-500 to-purple-700' },
        isLoggedIn: true,
        openLoginModal: vi.fn(),
        setPlanetMatchMode: vi.fn(),
        togglePlanetFilter: vi.fn(),
        refreshFreshData: vi.fn(),
        isMobileFrame: false,
        deities: [],
      } as any);

    useAppSpy.mockImplementation(buildCtx);

    const { rerender } = render(
      <>
        <Header />
        <TemplesList />
      </>
    );

    expect(screen.getByText('Vayalur Murugan Temple')).toBeInTheDocument();
    expect(screen.getByText('Pampuranathar Temple')).toBeInTheDocument();

    const searchCheckboxes = screen.getAllByRole('checkbox', { name: /பாவ\/ராசி தொடர்பு/i });
    fireEvent.click(searchCheckboxes[0]);

    useAppSpy.mockImplementation(buildCtx);
    rerender(
      <>
        <Header />
        <TemplesList />
      </>
    );

    expect(screen.getByText('Vayalur Murugan Temple')).toBeInTheDocument();
    expect(screen.queryByText('Pampuranathar Temple')).not.toBeInTheDocument();
  });

  it('displays yellow star button on TempleCard & TempleDetailModal and shows saved text when tapped', () => {
    const jpTemple: Temple = {
      id: 'temple-jp-star',
      name: 'Vayalur Murugan Temple',
      location: 'Vayalur, Tiruchirappalli',
      state: 'Tamil Nadu',
      planets: ['sani', 'sev'],
      deity: 'murugan',
      significance: 'Test significance',
      remedies: [],
      imageUrl: '',
      videoUrl: '',
      timings: '6 am - 8 pm',
      viewsCount: 0,
      createdAt: '2026-11-18T00:00:00Z',
      updatedAt: '2026-11-18T00:00:00Z',
      jothidarPaarvai: true,
      jothidarPaarvaiNotes: 'வயலூர் - கடக ராசி குறிக்கும் ஜோதிடர் குறிப்பு',
    };

    const regularTemple: Temple = {
      ...jpTemple,
      id: 'temple-no-star',
      name: 'Regular Temple',
      jothidarPaarvai: false,
      jothidarPaarvaiNotes: '',
    };

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      currentUser: { id: 'user-admin', name: 'Admin', username: 'admin', role: 'admin' },
      openEditModal: vi.fn(),
      openDetailModal: vi.fn(),
      openVideoModal: vi.fn(),
      closeDetailModal: vi.fn(),
      deleteTemple: vi.fn(),
      deities: [],
      temples: [jpTemple, regularTemple],
      selectedTempleForDetail: jpTemple,
      isMobileFrame: false,
    } as any);

    const { unmount } = render(<TempleCard temple={regularTemple} />);
    expect(screen.queryByRole('button', { name: /பாவ\/ராசி தொடர்பு/i })).not.toBeInTheDocument();
    unmount();

    render(<TempleCard temple={jpTemple} />);
    const cardStarBtn = screen.getByRole('button', { name: /பாவ\/ராசி தொடர்பு/i });
    expect(cardStarBtn).toBeInTheDocument();
    expect(screen.queryByText('வயலூர் - கடக ராசி குறிக்கும் ஜோதிடர் குறிப்பு')).not.toBeInTheDocument();

    fireEvent.click(cardStarBtn);
    expect(screen.getByText('வயலூர் - கடக ராசி குறிக்கும் ஜோதிடர் குறிப்பு')).toBeInTheDocument();

    // Detail Modal also renders cyan star button & reveals notes on tap
    render(<TempleDetailModal />);
    const starBtns = screen.getAllByRole('button', { name: /பாவ\/ராசி தொடர்பு/i });
    expect(starBtns.length).toBeGreaterThanOrEqual(2);
    fireEvent.click(starBtns[starBtns.length - 1]);
    expect(screen.getAllByText('வயலூர் - கடக ராசி குறிக்கும் ஜோதிடர் குறிப்பு').length).toBe(2);
  });
});

describe('Phase 2: Astrologer Solution Finder & Problem Tags Suite', () => {
  const starterTags: SolutionTag[] = [
    { id: 'veedu-katta-thadai', nameTamil: 'வீடு கட்ட தடை', nameEnglish: 'Delay in building house' },
    { id: 'nilam-virka-thadai', nameTamil: 'நிலம் விற்க தடை', nameEnglish: 'Delay in selling land' },
  ];

  const sampleTemples: Temple[] = [
    {
      id: 't-parthasarathy',
      name: 'Parthasarathy Temple',
      location: 'Triplicane, Chennai',
      state: 'Tamil Nadu',
      planets: ['sani'],
      deity: 'vishnu',
      significance: '4,2 bhava remedy for house and land',
      remedies: [],
      solutionTags: ['veedu-katta-thadai', 'nilam-virka-thadai'],
      imageUrl: '',
      videoUrl: '',
      timings: '6 am - 9 pm',
      viewsCount: 10,
      createdAt: '2026-11-18T00:00:00Z',
      updatedAt: '2026-11-18T00:00:00Z',
    },
    {
      id: 't-vayalur',
      name: 'Vayalur Murugan Temple',
      location: 'Vayalur, Tiruchirappalli',
      state: 'Tamil Nadu',
      planets: ['sani', 'sev'],
      deity: 'murugan',
      significance: 'House construction remedy',
      remedies: [],
      solutionTags: ['veedu-katta-thadai'],
      imageUrl: '',
      videoUrl: '',
      timings: '6 am - 8 pm',
      viewsCount: 5,
      createdAt: '2026-11-19T00:00:00Z',
      updatedAt: '2026-11-19T00:00:00Z',
    },
  ];

  it('supports dynamic 1-by-1 problem dropdowns and BOTH Best Match (Any) & Match All (Exact) modes in SolutionTab', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      temples: sampleTemples,
      solutionTags: starterTags,
      currentUser: { id: 'u-user', name: 'Astrologer User', username: 'astro', role: 'user' },
      isMobileFrame: false,
      openAddModal: vi.fn(),
      openEditModal: vi.fn(),
      openDetailModal: vi.fn(),
      openVideoModal: vi.fn(),
      deleteTemple: vi.fn(),
      deities: [],
    } as any);

    render(<SolutionTab />);

    // Non-admin does not see Configure Solution Tags (Admin)
    expect(screen.queryByRole('button', { name: /Configure Solution Tags/i })).not.toBeInTheDocument();

    // Starts with Problem 1 dropdown
    const problem1Select = screen.getByLabelText('Problem 1') as HTMLSelectElement;
    expect(problem1Select).toBeInTheDocument();
    fireEvent.change(problem1Select, { target: { value: 'veedu-katta-thadai' } });

    expect(screen.getByText('Parthasarathy Temple')).toBeInTheDocument();
    expect(screen.getByText('Vayalur Murugan Temple')).toBeInTheDocument();

    // Add Problem 2 dynamically
    fireEvent.click(screen.getByRole('button', { name: /\+ Add Problem/i }));
    const problem2Select = screen.getByLabelText('Problem 2') as HTMLSelectElement;
    expect(problem2Select).toBeInTheDocument();

    // Already selected Problem 1 is excluded from Problem 2 dropdown options
    expect(Array.from(problem2Select.options).some(o => o.value === 'veedu-katta-thadai')).toBe(false);

    fireEvent.change(problem2Select, { target: { value: 'nilam-virka-thadai' } });

    // Best Match (Any) keeps both temples, ranking 2/2 match (Parthasarathy) first
    const headingsAny = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent);
    const parthaIdx = headingsAny.findIndex(t => t?.includes('Parthasarathy Temple'));
    const vayalurIdx = headingsAny.findIndex(t => t?.includes('Vayalur Murugan Temple'));
    expect(parthaIdx).toBeGreaterThanOrEqual(0);
    expect(vayalurIdx).toBeGreaterThan(parthaIdx);
    expect(screen.getByText(/2\/2 தீர்வு/i)).toBeInTheDocument();
    expect(screen.getByText(/1\/2 தீர்வு/i)).toBeInTheDocument();

    // Switch to Match All (Exact)
    fireEvent.click(screen.getByRole('button', { name: /Match All \(Exact\)/i }));
    expect(screen.getByText('Parthasarathy Temple')).toBeInTheDocument();
    expect(screen.queryByText('Vayalur Murugan Temple')).not.toBeInTheDocument();
  });

  it('opens Configure Solution Tags modal for Admin inside SolutionTab and supports CRUD in AdminSolutionTagsPanel', async () => {
    const createSolutionTag = vi.fn().mockResolvedValue({ success: true, message: 'Tag added.' });
    const updateSolutionTag = vi.fn().mockResolvedValue({ success: true, message: 'Tag updated.' });
    const deleteSolutionTag = vi.fn().mockResolvedValue({ success: true, message: 'Tag removed.' });

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      temples: sampleTemples,
      solutionTags: starterTags,
      currentUser: { id: 'u-admin', name: 'Admin Murugan', username: 'admin', role: 'admin' },
      isMobileFrame: false,
      openAddModal: vi.fn(),
      openEditModal: vi.fn(),
      openDetailModal: vi.fn(),
      openVideoModal: vi.fn(),
      deleteTemple: vi.fn(),
      deities: [],
      createSolutionTag,
      updateSolutionTag,
      deleteSolutionTag,
    } as any);

    render(<SolutionTab />);

    const manageBtn = screen.getByRole('button', { name: /Configure Solution Tags \(Admin\)/i });
    fireEvent.click(manageBtn);

    expect(screen.getByRole('dialog', { name: /Configure Solution Tags/i })).toBeInTheDocument();
    expect(screen.getByText('2 temples')).toBeInTheDocument();

    // Add a new tag
    const tamilInput = screen.getByPlaceholderText(/திருமண தடை/i);
    fireEvent.change(tamilInput, { target: { value: 'கடன் பிரச்சனை தீர' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Tag/i }));

    await waitFor(() => {
      expect(createSolutionTag).toHaveBeenCalledWith({
        nameTamil: 'கடன் பிரச்சனை தீர',
        nameEnglish: '',
      });
    });

    // Delete first tag after inline confirm
    fireEvent.click(screen.getByRole('button', { name: 'Delete வீடு கட்ட தடை' }));
    fireEvent.click(screen.getByRole('button', { name: /Confirm Delete/i }));

    await waitFor(() => {
      expect(deleteSolutionTag).toHaveBeenCalledWith('veedu-katta-thadai');
    });
  });

  it('allows selecting multiple solution tags in AddEditTempleModal and restricts inline add to admin', async () => {
    const submitTempleMock = vi.fn().mockResolvedValue(true);
    const useAppSpy = vi.spyOn(AppContextModule, 'useApp');

    useAppSpy.mockReturnValue({
      isAddEditModalOpen: true,
      closeAddEditModal: vi.fn(),
      templeToEdit: sampleTemples[1], // has ['veedu-katta-thadai']
      submitTemple: submitTempleMock,
      currentUser: { id: 'u-contrib', name: 'Contrib', username: 'contrib', role: 'contributor' },
      switchRole: vi.fn(),
      setActiveTab: vi.fn(),
      isMobileFrame: false,
      deities: [{ id: 'murugan', nameTamil: 'முருகன்', nameEnglish: 'Murugan' }],
      createDeity: vi.fn(),
      updateDeity: vi.fn(),
      deleteDeity: vi.fn(),
      solutionTags: starterTags,
      createSolutionTag: vi.fn(),
    } as any);

    const { rerender } = render(<AddEditTempleModal />);

    // Non-admin does not see inline add button, sees admin note
    expect(screen.queryByRole('button', { name: /குறிச்சொல் சேர்/i })).not.toBeInTheDocument();
    expect(screen.getByText(/Only an Admin account can configure new problem tags/i)).toBeInTheDocument();

    const landCheckbox = screen.getByRole('checkbox', { name: /நிலம் விற்க தடை/i });
    expect(landCheckbox).not.toBeChecked();
    fireEvent.click(landCheckbox);
    expect(landCheckbox).toBeChecked();

    fireEvent.click(screen.getByRole('button', { name: /Submit Updates for Review/i }));
    await waitFor(() => {
      expect(submitTempleMock).toHaveBeenCalledWith(
        expect.objectContaining({
          solutionTags: ['veedu-katta-thadai', 'nilam-virka-thadai'],
        }),
        't-vayalur'
      );
    });

    // Admin sees inline + குறிச்சொல் சேர் quick-add button
    useAppSpy.mockReturnValue({
      isAddEditModalOpen: true,
      closeAddEditModal: vi.fn(),
      templeToEdit: sampleTemples[1],
      submitTemple: submitTempleMock,
      currentUser: { id: 'u-admin', name: 'Admin', username: 'admin', role: 'admin' },
      switchRole: vi.fn(),
      setActiveTab: vi.fn(),
      isMobileFrame: false,
      deities: [{ id: 'murugan', nameTamil: 'முருகன்', nameEnglish: 'Murugan' }],
      createDeity: vi.fn(),
      updateDeity: vi.fn(),
      deleteDeity: vi.fn(),
      solutionTags: starterTags,
      createSolutionTag: vi.fn().mockResolvedValue({ success: true }),
    } as any);

    rerender(<AddEditTempleModal />);
    expect(screen.getByRole('button', { name: /குறிச்சொல் சேர்/i })).toBeInTheDocument();
  });
});

