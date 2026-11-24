import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import request from 'supertest';
import { createBackendApp } from '../backend/src/app.js';
import { BottomNav } from '../frontend/src/components/BottomNav';
import { Header } from '../frontend/src/components/Header';
import { NaamaVilakkamTab } from '../frontend/src/components/NaamaVilakkamTab';
import { AddEditNaamaModal } from '../frontend/src/components/AddEditNaamaModal';
import { QuizTab } from '../frontend/src/components/QuizTab';
import * as AppContextModule from '../frontend/src/context/AppContext';
import { NaamaVilakkamEntry } from '../frontend/src/types';

describe('Phase 4 Backend API: Standalone நாம விளக்கம் & Feature Toggle', () => {
  const app = createBackendApp();

  it('supports Admin feature toggle ON/OFF and blocks non-admin toggle updates', async () => {
    const initial = await request(app).get('/api/naama-vilakkam/feature-toggle');
    expect(initial.status).toBe(200);
    const originalState = Boolean(initial.body.enabled);

    const forbidden = await request(app)
      .put('/api/naama-vilakkam/feature-toggle')
      .send({ enabled: !originalState, actorRole: 'contributor' });
    expect(forbidden.status).toBe(403);

    const toggledOff = await request(app)
      .put('/api/naama-vilakkam/feature-toggle')
      .send({ enabled: false, actorRole: 'admin' });
    expect(toggledOff.status).toBe(200);
    expect(toggledOff.body.enabled).toBe(false);

    // Restore original toggle state cleanly
    const restored = await request(app)
      .put('/api/naama-vilakkam/feature-toggle')
      .send({ enabled: originalState, actorRole: 'admin' });
    expect(restored.status).toBe(200);
    expect(restored.body.enabled).toBe(originalState);
  });

  it('supports Naama Vilakkam add/edit for user/contributor/admin and restricts delete to contributor/admin', async () => {
    // Reject unrecognized role creation
    const unknownDenied = await request(app)
      .post('/api/naama-vilakkam')
      .send({
        nameTamil: 'பார்த்தசாரதி',
        planets: ['suri', 'sev'],
        actorRole: 'guest',
      });
    expect(unknownDenied.status).toBe(403);

    // Reject missing Tamil name or missing planets
    const invalidRes = await request(app)
      .post('/api/naama-vilakkam')
      .send({
        nameTamil: '   ',
        planets: ['sani'],
        actorRole: 'user',
      });
    expect(invalidRes.status).toBe(400);

    // Allow user role to create combo-planet entry
    const createdByUser = await request(app)
      .post('/api/naama-vilakkam')
      .send({
        nameTamil: 'பார்த்தசாரதி',
        planets: ['suri', 'sev'],
        notes: '4,2 பாவ தொடர்புக்கு உரிய நாமம்',
        actorRole: 'user',
      });
    expect(createdByUser.status).toBe(201);
    expect(createdByUser.body.success).toBe(true);
    expect(createdByUser.body.data.nameTamil).toBe('பார்த்தசாரதி');
    expect(createdByUser.body.data.planets).toEqual(['suri', 'sev']);
    const id = createdByUser.body.data.id;

    // Allow user role to edit entry
    const updatedByUser = await request(app)
      .put(`/api/naama-vilakkam/${encodeURIComponent(id)}`)
      .send({
        nameTamil: 'ஸ்ரீ பார்த்தசாரதி',
        planets: ['suri', 'sev', 'guru'],
        notes: 'திருவல்லிக்கேணி தல நாம விளக்கம்',
        actorRole: 'user',
      });
    expect(updatedByUser.status).toBe(200);
    expect(updatedByUser.body.data.planets).toEqual(['suri', 'sev', 'guru']);

    // Verify listed in GET
    const listed = await request(app).get('/api/naama-vilakkam');
    expect(listed.status).toBe(200);
    expect(listed.body.data.some((x: any) => x.id === id)).toBe(true);

    // Block delete by user role
    const deleteUserDenied = await request(app)
      .delete(`/api/naama-vilakkam/${encodeURIComponent(id)}?actorRole=user`);
    expect(deleteUserDenied.status).toBe(403);

    // Clean up as contributor
    const deleted = await request(app)
      .delete(`/api/naama-vilakkam/${encodeURIComponent(id)}?actorRole=contributor`);
    expect(deleted.status).toBe(200);
  });
});

describe('Phase 4 UI: நாம விளக்கம் Tab, Role Permissions & 2-Way 9-Planet Search', () => {
  const sampleEntries: NaamaVilakkamEntry[] = [
    {
      id: 'naama-1',
      nameTamil: 'பார்த்தசாரதி',
      planets: ['suri', 'sev'],
      notes: 'நான்காம் மற்றும் இரண்டாம் பாவ தொடர்பு',
      createdAt: '2026-11-23T10:00:00Z',
      updatedAt: '2026-11-23T10:00:00Z',
    },
    {
      id: 'naama-2',
      nameTamil: 'சனீஸ்வரன்',
      planets: ['sani'],
      notes: '',
      createdAt: '2026-11-22T10:00:00Z',
      updatedAt: '2026-11-22T10:00:00Z',
    },
    {
      id: 'naama-3',
      nameTamil: 'செவ்வாய் வேலன்',
      planets: ['sev'],
      notes: 'செவ்வாய் தோஷ பரிகார நாமம்',
      createdAt: '2026-11-21T10:00:00Z',
      updatedAt: '2026-11-21T10:00:00Z',
    },
  ];

  const baseMockContext = {
    activeTab: 'naama_vilakkam',
    setActiveTab: vi.fn(),
    submissions: [],
    openAddModal: vi.fn(),
    naamaVilakkamEnabled: true,
    naamaVilakkamList: sampleEntries,
    isMobileFrame: false,
    openAddNaamaModal: vi.fn(),
    openEditNaamaModal: vi.fn(),
    deleteNaamaVilakkam: vi.fn().mockResolvedValue({ success: true }),
    createNaamaVilakkam: vi.fn().mockResolvedValue({ success: true }),
    updateNaamaVilakkam: vi.fn().mockResolvedValue({ success: true }),
    closeNaamaModal: vi.fn(),
    isNaamaModalOpen: false,
    naamaToEdit: null,
    currentUser: {
      id: 'user-1',
      name: 'Devotee',
      username: 'devotee',
      email: 'devotee@mupporul.app',
      role: 'user' as const,
      avatarText: 'DE',
      avatarColor: 'from-emerald-500 to-teal-700',
      contributionsCount: 0,
      approvedCount: 0,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('hides Search temples and Filter bar in Header when activeTab is naama_vilakkam', () => {
    const headerContext = {
      ...baseMockContext,
      filters: { searchQuery: '', planet: null, planets: [], deity: null, state: null, jothidarPaarvaiOnly: false },
      setFilters: vi.fn(),
      setIsFilterOpen: vi.fn(),
      isLoggedIn: true,
      openLoginModal: vi.fn(),
    };

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...headerContext,
      activeTab: 'temples',
    } as any);
    const { rerender } = render(<Header />);
    expect(screen.getByPlaceholderText('Search temples...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Filter/i })).toBeInTheDocument();

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...headerContext,
      activeTab: 'naama_vilakkam',
    } as any);
    rerender(<Header />);
    expect(screen.queryByPlaceholderText('Search temples...')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Filter/i })).not.toBeInTheDocument();
  });

  it('places நாம விளக்கம் right after Quiz in BottomNav when enabled and hides it completely when turned OFF', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseMockContext,
      naamaVilakkamEnabled: true,
    } as any);

    const { rerender } = render(<BottomNav />);
    const buttons = screen.getAllByRole('button');
    const labels = buttons.map(b => b.textContent?.trim() || '');
    const quizIdx = labels.findIndex(t => t.includes('Quiz'));
    const naamaIdx = labels.findIndex(t => t.includes('நாம விளக்கம்'));
    expect(quizIdx).toBeGreaterThanOrEqual(0);
    expect(naamaIdx).toBe(quizIdx + 1);

    // Feature toggled OFF -> disappears cleanly while Temples & Quiz remain
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseMockContext,
      naamaVilakkamEnabled: false,
    } as any);
    rerender(<BottomNav />);
    expect(screen.queryByText('நாம விளக்கம்')).not.toBeInTheDocument();
    expect(screen.getByText('Temples')).toBeInTheDocument();
    expect(screen.getByText('Quiz')).toBeInTheDocument();
  });

  it('grants add/edit without delete for user role and full add/edit/delete for contributor and admin', () => {
    // 1. User role -> Add & Edit visible, Delete strictly hidden
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseMockContext,
      currentUser: { ...baseMockContext.currentUser, role: 'user' },
    } as any);
    const { unmount } = render(<NaamaVilakkamTab />);
    expect(screen.getByRole('button', { name: /நாமம் சேர்/i })).toBeInTheDocument();
    const userMenuButtons = screen.getAllByLabelText('Entry options');
    expect(userMenuButtons.length).toBe(3);
    fireEvent.click(userMenuButtons[0]);
    expect(screen.getByText('திருத்து (Edit)')).toBeInTheDocument();
    expect(screen.queryByText('நீக்கு (Delete)')).not.toBeInTheDocument();
    unmount();

    // 2. Contributor role -> Add, Edit, AND Delete visible
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseMockContext,
      currentUser: { ...baseMockContext.currentUser, role: 'contributor' },
    } as any);
    render(<NaamaVilakkamTab />);
    expect(screen.getByRole('button', { name: /நாமம் சேர்/i })).toBeInTheDocument();
    const contribMenuButtons = screen.getAllByLabelText('Entry options');
    fireEvent.click(contribMenuButtons[0]);
    expect(screen.getByText('திருத்து (Edit)')).toBeInTheDocument();
    expect(screen.getByText('நீக்கு (Delete)')).toBeInTheDocument();
  });

  it('supports 2-way Name search -> Planet Combination output and defaults to Contains Any vs Exact Combo', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseMockContext,
      currentUser: { ...baseMockContext.currentUser, role: 'admin' },
    } as any);

    const { container } = render(<NaamaVilakkamTab />);

    // Type a Tamil name -> displays planet combination output strip
    const searchInput = screen.getByLabelText('நாமத்தைத் தட்டச்சு செய்க');
    fireEvent.change(searchInput, { target: { value: 'பார்த்தசாரதி' } });
    expect(screen.getByText('கிரகச் சேர்க்கை முடிவு')).toBeInTheDocument();
    expect(screen.getAllByText('பார்த்தசாரதி').length).toBeGreaterThanOrEqual(2);

    // Clear search and test 9-planet Contains Any (default) vs Exact Combo
    fireEvent.change(searchInput, { target: { value: '' } });

    const desktopRail = container.querySelector('aside');
    expect(desktopRail).toBeTruthy();
    const suriFilterBtn = within(desktopRail!).getByRole('button', { name: /சூரி/i });
    const sevFilterBtn = within(desktopRail!).getByRole('button', { name: /செவ்/i });
    fireEvent.click(suriFilterBtn);
    fireEvent.click(sevFilterBtn);

    // Default Contains Any matches both பார்த்தசாரதி (suri+sev) and செவ்வாய் வேலன் (sev), excludes சனீஸ்வரன் (sani)
    expect(screen.getByText('பார்த்தசாரதி')).toBeInTheDocument();
    expect(screen.getByText('செவ்வாய் வேலன்')).toBeInTheDocument();
    expect(screen.queryByText('சனீஸ்வரன்')).not.toBeInTheDocument();

    // Switch to Exact Combo -> strictly பார்த்தசாரதி (suri+sev) only
    const exactBtn = within(desktopRail!).getByRole('button', { name: 'Exact Combo' });
    fireEvent.click(exactBtn);
    expect(screen.getByText('பார்த்தசாரதி')).toBeInTheDocument();
    expect(screen.queryByText('செவ்வாய் வேலன்')).not.toBeInTheDocument();
  });

  it('validates and saves Tamil-only name + single/combo planets + optional note in AddEditNaamaModal', async () => {
    const createMock = vi.fn().mockResolvedValue({ success: true });
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...baseMockContext,
      currentUser: { ...baseMockContext.currentUser, role: 'contributor' },
      isNaamaModalOpen: true,
      createNaamaVilakkam: createMock,
    } as any);

    render(<AddEditNaamaModal />);

    fireEvent.click(screen.getByRole('button', { name: /சனி/i }));
    fireEvent.click(screen.getByRole('button', { name: /ராகு/i }));
    fireEvent.change(screen.getByLabelText(/நாமம் \/ பெயர்/i), {
      target: { value: 'சனீஸ்வர ராகு நாமம்' },
    });
    fireEvent.change(screen.getByLabelText(/குறிப்பு/i), {
      target: { value: 'சிறப்பு குறிப்பு' },
    });

    fireEvent.click(screen.getByRole('button', { name: /சேமி/i }));

    await waitFor(() => {
      expect(createMock).toHaveBeenCalledWith({
        nameTamil: 'சனீஸ்வர ராகு நாமம்',
        planets: ['sani', 'rahu'],
        notes: 'சிறப்பு குறிப்பு',
      });
    });
  });

  it('excludes temples without planets from QuizTab and shows empty state when none have planets', () => {
    const planetTemple = {
      id: 'temple-with-planet',
      name: 'Vayalur Murugan Temple',
      location: 'Tiruchirappalli',
      state: 'Tamil Nadu',
      planets: ['sev'],
      deity: 'murugan',
      significance: 'செவ்வாய் பரிகார தலம்',
      remedies: [],
      imageUrl: '',
      videoUrl: '',
      timings: '',
      createdAt: '2026-11-20T00:00:00Z',
      updatedAt: '2026-11-20T00:00:00Z',
      viewsCount: 0,
    };
    const noPlanetTemple = {
      id: 'temple-no-planet',
      name: 'Parthasarathy Temple',
      location: 'Triplicane, Chennai',
      state: 'Tamil Nadu',
      planets: [],
      deity: 'vishnu',
      significance: 'Divya Desam',
      remedies: [],
      imageUrl: '',
      videoUrl: '',
      timings: '',
      createdAt: '2026-11-20T00:00:00Z',
      updatedAt: '2026-11-20T00:00:00Z',
      viewsCount: 0,
    };

    const quizBaseCtx = {
      ...baseMockContext,
      deities: [],
      openDetailModal: vi.fn(),
    };

    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...quizBaseCtx,
      temples: [noPlanetTemple, planetTemple],
    } as any);

    const { rerender } = render(<QuizTab />);
    expect(screen.getByText('Question 1 of 1')).toBeInTheDocument();
    expect(screen.getByText('Vayalur Murugan Temple')).toBeInTheDocument();
    expect(screen.queryByText('Parthasarathy Temple')).not.toBeInTheDocument();

    // If only planetless temples exist, show empty state instead of unwinnable quiz
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      ...quizBaseCtx,
      temples: [noPlanetTemple],
    } as any);

    rerender(<QuizTab />);
    expect(screen.getByText('No Planet-Tagged Temples Available')).toBeInTheDocument();
  });
});
