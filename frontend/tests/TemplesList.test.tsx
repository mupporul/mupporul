// @vitest-environment jsdom

import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TemplesList } from '../src/components/TemplesList';
import * as AppContextModule from '../src/context/AppContext';
import { Temple } from '../src/types';

vi.mock('../src/components/TempleCard', () => ({
  TempleCard: ({ temple }: { temple: Pick<Temple, 'name'> }) => <article>{temple.name}</article>,
}));

describe('TemplesList search', () => {
  const temple: Temple = {
    id: 'temple-test',
    name: 'Suryanar Kovil',
    nameTamil: 'சூரியனார் கோவில்',
    location: 'Kumbakonam',
    state: 'Tamil Nadu',
    planets: ['sun'],
    deity: 'suryan',
    significance: 'Sun deity pariharam sthalam',
    imageUrl: '',
    videoUrl: '',
    timings: '',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    viewsCount: 0,
  };

  beforeEach(() => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      temples: [temple],
      filters: {
        planets: [],
        planetMatchMode: 'exact',
        deity: null,
        state: null,
        significance: null,
        searchQuery: 'சூரியனார்',
      },
      resetFilters: vi.fn(),
      openAddModal: vi.fn(),
      currentUser: { role: 'user', name: 'Devotee' },
      setPlanetMatchMode: vi.fn(),
      togglePlanetFilter: vi.fn(),
      isMobileFrame: true,
      deities: [],
    } as unknown as ReturnType<typeof AppContextModule.useApp>);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('finds temples by their Tamil name', () => {
    render(<TemplesList />);

    expect(screen.getByText('Suryanar Kovil')).toBeTruthy();
    expect(screen.getByText('Showing 1 of 1 sacred temples')).toBeTruthy();
  });

  it('shows the empty filter state when the search has no matches', () => {
    vi.spyOn(AppContextModule, 'useApp').mockReturnValue({
      temples: [temple],
      filters: {
        planets: [],
        planetMatchMode: 'exact',
        deity: null,
        state: null,
        significance: null,
        searchQuery: 'not a temple',
      },
      resetFilters: vi.fn(),
      openAddModal: vi.fn(),
      currentUser: { role: 'user', name: 'Devotee' },
      setPlanetMatchMode: vi.fn(),
      togglePlanetFilter: vi.fn(),
      isMobileFrame: true,
      deities: [],
    } as unknown as ReturnType<typeof AppContextModule.useApp>);

    render(<TemplesList />);

    expect(screen.getByText('No temples matched your active filter')).toBeTruthy();
  });
});
