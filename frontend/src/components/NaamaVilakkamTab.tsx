import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Search,
  Plus,
  X,
  Check,
  Edit3,
  Trash2,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FilterX,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLANETS } from '../data/constants';
import { NaamaVilakkamEntry } from '../types';

export const NaamaVilakkamTab: React.FC = () => {
  const {
    naamaVilakkamList,
    currentUser,
    isMobileFrame,
    openAddNaamaModal,
    openEditNaamaModal,
    deleteNaamaVilakkam,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanets, setSelectedPlanets] = useState<string[]>([]);
  // Default = 'any' (Contains Any), with option to switch to 'exact' (Exact Combo)
  const [matchMode, setMatchMode] = useState<'any' | 'exact'>('any');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const mobileStripRef = useRef<HTMLDivElement>(null);
  const canEdit = currentUser.role === 'contributor' || currentUser.role === 'admin';

  // Close card dropdown on outside click
  useEffect(() => {
    const handleDocClick = () => {
      setOpenMenuId(null);
      setConfirmDeleteId(null);
    };
    if (openMenuId) {
      document.addEventListener('click', handleDocClick);
      return () => document.removeEventListener('click', handleDocClick);
    }
  }, [openMenuId]);

  const togglePlanet = (planetId: string) => {
    setSelectedPlanets(prev =>
      prev.includes(planetId) ? prev.filter(p => p !== planetId) : [...prev, planetId]
    );
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedPlanets([]);
  };

  const scrollStrip = (delta: number) => {
    if (mobileStripRef.current) {
      mobileStripRef.current.scrollBy({ left: delta, behavior: 'smooth' });
    }
  };

  // Core 2-way filter: (1) Tamil Name / Notes Search + (2) 9-Planet Contains Any (default) / Exact Combo
  const filteredEntries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const scored = naamaVilakkamList
      .map(entry => {
        const entryPlanets = Array.isArray(entry.planets) ? entry.planets : [];

        // Text filter (Tamil Name or Tamil Note)
        if (query) {
          const matchName = entry.nameTamil.toLowerCase().includes(query);
          const matchNotes = (entry.notes || '').toLowerCase().includes(query);
          if (!matchName && !matchNotes) {
            return null;
          }
        }

        // Planet filter
        let matchedPlanetCount = 0;
        if (selectedPlanets.length > 0) {
          matchedPlanetCount = selectedPlanets.filter(p => entryPlanets.includes(p)).length;

          if (matchMode === 'exact') {
            const sameSize = entryPlanets.length === selectedPlanets.length;
            const allMatch = matchedPlanetCount === selectedPlanets.length;
            if (!sameSize || !allMatch) {
              return null;
            }
          } else {
            // Contains Any: matches if at least 1 selected planet is present
            if (matchedPlanetCount === 0) {
              return null;
            }
          }
        }

        return { entry, matchedPlanetCount };
      })
      .filter((item): item is { entry: NaamaVilakkamEntry; matchedPlanetCount: number } => Boolean(item));

    // Sort: most matched planets first in Contains Any mode, then newest created
    scored.sort((a, b) => {
      if (b.matchedPlanetCount !== a.matchedPlanetCount) {
        return b.matchedPlanetCount - a.matchedPlanetCount;
      }
      return (
        new Date(b.entry.createdAt || 0).getTime() -
        new Date(a.entry.createdAt || 0).getTime()
      );
    });

    return scored.map(s => s.entry);
  }, [naamaVilakkamList, searchQuery, selectedPlanets, matchMode]);

  const hasActiveFilters = searchQuery.trim().length > 0 || selectedPlanets.length > 0;
  const trimmedSearch = searchQuery.trim();

  const handleConfirmDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteNaamaVilakkam(id);
    } finally {
      setDeletingId(null);
      setConfirmDeleteId(null);
      setOpenMenuId(null);
    }
  };

  const getPlanetMeta = (planetId: string) =>
    PLANETS.find(p => p.id === planetId);

  const renderPlanetBadgeRow = (planetIds: string[]) => {
    const resolved = planetIds
      .map(id => getPlanetMeta(id))
      .filter((p): p is NonNullable<typeof p> => Boolean(p));

    if (resolved.length === 0) return null;

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {resolved.map(planet => {
          const isActiveFilter = selectedPlanets.includes(planet.id);
          return (
            <button
              key={planet.id}
              type="button"
              onClick={() => togglePlanet(planet.id)}
              title={`Filter by ${planet.nameTamil}`}
              className={`min-h-[30px] px-2.5 py-1 rounded-lg text-xs font-tamil font-semibold flex items-center gap-1.5 border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isActiveFilter
                  ? 'bg-amber-500/20 border-[#f5a623] text-amber-200'
                  : 'bg-[#101320] border-[#292d47] text-gray-200 hover:border-amber-500/50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: planet.color }}
              />
              <span>{planet.nameTamil}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`w-full ${
        isMobileFrame
          ? 'max-w-xl mx-auto py-3 px-3 sm:px-4 overflow-y-auto no-scrollbar flex-1 min-h-0'
          : 'flex-1 h-full min-h-0 flex flex-col'
      }`}
    >
      {/* Top Bar: Title, 2-Way Tamil Search Input, and Add Button (Admin & Contributor only) */}
      <div className="shrink-0 px-3 sm:px-4 lg:px-6 pt-3 pb-2.5 border-b border-[#1f2233] bg-[#0d0f18] space-y-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-gray-100 font-tamil truncate">
                நாம விளக்கம்
              </h2>
              <span className="text-xs text-gray-400 tabular-nums whitespace-nowrap">
                {filteredEntries.length} / {naamaVilakkamList.length} நாமங்கள்
              </span>
            </div>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={openAddNaamaModal}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#f5a623] hover:bg-[#e69818] text-black font-bold text-xs sm:text-sm font-tamil flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
              <span>நாமம் சேர்</span>
            </button>
          )}
        </div>

        {/* Name Search Input (Name -> Planet Combo Output & Text Search) */}
        <div className="relative">
          <Search className="w-4 h-4 text-amber-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="நாமம் தேடுக — கிரகச் சேர்க்கை காண..."
            aria-label="நாமத்தைத் தட்டச்சு செய்க"
            className="w-full min-h-[44px] pl-10 pr-11 py-2 rounded-xl bg-[#151828] border border-[#282d47] focus:border-[#f5a623] focus:outline-none text-sm text-gray-100 font-tamil placeholder:text-gray-400"
          />
          {trimmedSearch && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              aria-label="Clear name search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 min-w-[36px] min-h-[36px] rounded-lg text-gray-400 hover:text-white hover:bg-[#22263e] flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2-Way Name Search -> Instant Planet Combination Output Strip */}
        {trimmedSearch.length > 0 && (
          <div className="rounded-xl bg-[#141727] border border-[#2a2f4a] px-3.5 py-2.5 space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-semibold text-amber-300 font-tamil">
                கிரகச் சேர்க்கை முடிவு
              </span>
              <span className="text-gray-400 tabular-nums font-tamil">
                {filteredEntries.length} பொருத்தம்
              </span>
            </div>

            {filteredEntries.length === 0 ? (
              <p className="text-xs text-gray-400 font-tamil">
                "{trimmedSearch}" என்ற நாமத்திற்கு கிரகச் சேர்க்கை ஏதும் கிடைக்கவில்லை.
              </p>
            ) : (
              <div className="flex flex-col gap-1.5 max-h-36 overflow-y-auto pr-1">
                {filteredEntries.slice(0, 6).map(item => {
                  const planetLabels = (item.planets || [])
                    .map(pid => getPlanetMeta(pid))
                    .filter((p): p is NonNullable<typeof p> => Boolean(p));

                  return (
                    <div
                      key={`combo-${item.id}`}
                      className="flex flex-wrap items-center justify-between gap-2 py-1 border-b border-[#1f2338] last:border-b-0 text-xs"
                    >
                      <span className="font-tamil font-semibold text-gray-100">
                        {item.nameTamil}
                      </span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-gray-400" aria-hidden="true">→</span>
                        {planetLabels.map(p => (
                          <span
                            key={p.id}
                            className="inline-flex items-center gap-1 font-tamil font-semibold text-amber-200 bg-[#0d101b] border border-[#2a2f4a] px-2 py-0.5 rounded-md whitespace-nowrap"
                          >
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: p.color }}
                            />
                            <span>{p.nameTamil}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {filteredEntries.length > 6 && (
                  <p className="text-[11px] text-gray-400 font-tamil pt-0.5">
                    மேலும் {filteredEntries.length - 6} முடிவுகள் கீழே உள்ளன...
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Mobile Planet Bar + Mode Toggle (Shown on mobile & Mobile Frame preview) */}
        <div className={`${isMobileFrame ? 'block' : 'md:hidden'} space-y-2 pt-0.5`}>
          <div className="relative flex items-center">
            <button
              type="button"
              onClick={() => scrollStrip(-160)}
              aria-label="Scroll planets left"
              className="min-w-[34px] min-h-[38px] rounded-lg bg-[#16192a] border border-[#292e49] text-gray-300 hover:text-amber-300 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={mobileStripRef}
              className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth px-2 flex-1"
            >
              {PLANETS.map(planet => {
                const isSelected = selectedPlanets.includes(planet.id);
                return (
                  <button
                    key={planet.id}
                    type="button"
                    onClick={() => togglePlanet(planet.id)}
                    aria-pressed={isSelected}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-tamil font-semibold flex items-center gap-1.5 whitespace-nowrap shrink-0 border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#f5a623] text-black border-[#f5a623]'
                        : 'bg-[#16192a] text-gray-200 border-[#292e49] hover:border-amber-500/50'
                    }`}
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: isSelected ? '#000000' : planet.color }}
                    />
                    <span>{planet.nameTamil}</span>
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => scrollStrip(160)}
              aria-label="Scroll planets right"
              className="min-w-[34px] min-h-[38px] rounded-lg bg-[#16192a] border border-[#292e49] text-gray-300 hover:text-amber-300 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Match Mode Switch: Contains Any (default) & Exact Combo */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1 p-1 rounded-xl bg-[#151828] border border-[#252a42] flex-1">
              <button
                type="button"
                onClick={() => setMatchMode('any')}
                className={`flex-1 min-h-[36px] px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  matchMode === 'any'
                    ? 'bg-[#f5a623] text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Contains Any
              </button>
              <button
                type="button"
                onClick={() => setMatchMode('exact')}
                className={`flex-1 min-h-[36px] px-2 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  matchMode === 'exact'
                    ? 'bg-[#f5a623] text-black'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                Exact Combo
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#16192a] border border-[#2a2f4a] text-amber-300 text-xs font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Split Workspace (Desktop Sidebar + Cards Grid / Mobile Single Column) */}
      <div
        className={`flex gap-6 ${
          isMobileFrame
            ? 'flex-col pt-3 pb-16'
            : 'flex-col md:flex-row flex-1 h-full min-h-0 px-3 sm:px-4 lg:px-6 py-4'
        }`}
      >
        {/* Desktop Left Filter Sidebar (Hidden on Mobile / Mobile Frame) */}
        {!isMobileFrame && (
          <aside className="hidden md:flex flex-col w-72 lg:w-80 shrink-0 h-full min-h-0 bg-[#121523] border border-[#22263c] rounded-2xl p-4 space-y-4 overflow-y-auto no-scrollbar">
            {/* Both Filter Match Modes Visible, Default = Contains Any */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-semibold text-gray-300 font-tamil block">
                  தேடல் முறை
                </span>
                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={resetAllFilters}
                    className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 whitespace-nowrap cursor-pointer"
                  >
                    <FilterX className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-[#0c0e18] border border-[#22263c]">
                <button
                  type="button"
                  onClick={() => setMatchMode('any')}
                  className={`min-h-[40px] px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    matchMode === 'any'
                      ? 'bg-[#f5a623] text-black shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Contains Any
                </button>
                <button
                  type="button"
                  onClick={() => setMatchMode('exact')}
                  className={`min-h-[40px] px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                    matchMode === 'exact'
                      ? 'bg-[#f5a623] text-black shadow-sm'
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  Exact Combo
                </button>
              </div>
            </div>

            {/* 9 Planets Multi-Select Buttons (Tamil Only) */}
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-gray-300 font-tamil block">
                9 கிரகங்கள்
              </span>
              <div className="grid grid-cols-1 gap-1.5">
                {PLANETS.map(planet => {
                  const isSelected = selectedPlanets.includes(planet.id);
                  const countForPlanet = naamaVilakkamList.filter(item =>
                    item.planets?.includes(planet.id)
                  ).length;

                  return (
                    <button
                      key={planet.id}
                      type="button"
                      onClick={() => togglePlanet(planet.id)}
                      aria-pressed={isSelected}
                      className={`min-h-[44px] w-full px-3 py-2 rounded-xl border text-sm font-tamil flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-amber-500/15 border-[#f5a623] text-amber-200 font-semibold'
                          : 'bg-[#171a2b] border-[#252941] text-gray-200 hover:border-[#394066]'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: planet.color }}
                        />
                        <span>{planet.nameTamil}</span>
                      </span>
                      <span className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 tabular-nums">
                          {countForPlanet}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-[#f5a623] stroke-[2.5]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>
        )}

        {/* Right Results Pane */}
        <div
          className={`flex-1 min-w-0 space-y-4 ${
            !isMobileFrame ? 'h-full overflow-y-auto no-scrollbar pr-1 pb-16' : ''
          }`}
        >
          {/* Active Planet Selection Summary Strip */}
          {selectedPlanets.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-[#131625] border border-[#252a42] text-xs">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-gray-400 font-tamil">தேர்ந்தெடுத்த கிரகங்கள்:</span>
                {selectedPlanets.map(pid => {
                  const p = getPlanetMeta(pid);
                  if (!p) return null;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => togglePlanet(p.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-[#f5a623]/50 text-amber-200 font-tamil font-semibold cursor-pointer hover:bg-amber-500/25"
                    >
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span>{p.nameTamil}</span>
                      <X className="w-3 h-3" />
                    </button>
                  );
                })}
                <span className="text-gray-400">·</span>
                <span className="text-amber-300 font-semibold whitespace-nowrap">
                  {matchMode === 'exact' ? 'Exact Combo' : 'Contains Any'}
                </span>
              </div>

              <button
                type="button"
                onClick={resetAllFilters}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          )}

          {/* Results Grid or Clean Empty States */}
          {filteredEntries.length > 0 ? (
            <div
              className={`grid gap-4 ${
                isMobileFrame
                  ? 'grid-cols-1'
                  : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
              }`}
            >
              {filteredEntries.map(entry => {
                const entryPlanets = (entry.planets || [])
                  .map(id => getPlanetMeta(id))
                  .filter((p): p is NonNullable<typeof p> => Boolean(p));

                // Top Graha Aura Bar gradient
                const gradientStops =
                  entryPlanets.length >= 2
                    ? `linear-gradient(90deg, ${entryPlanets.map(p => p.color).join(', ')})`
                    : entryPlanets.length === 1
                    ? entryPlanets[0].color
                    : '#f5a623';

                const isMenuOpen = openMenuId === entry.id;
                const isConfirmingDel = confirmDeleteId === entry.id;

                return (
                  <article
                    key={entry.id}
                    className="rounded-2xl bg-[#151827] border border-[#262a42] hover:border-[#394066] transition-colors flex flex-col overflow-visible relative"
                  >
                    {/* Thin top Graha Aura Line */}
                    <div
                      className="h-1 w-full rounded-t-2xl shrink-0"
                      style={{ background: gradientStops }}
                    />

                    <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                      <div className="space-y-3">
                        {/* Planet Combo Header + Contributor/Admin Menu */}
                        <div className="flex items-start justify-between gap-2">
                          {renderPlanetBadgeRow(entry.planets || [])}

                          {canEdit && (
                            <div
                              className="relative shrink-0"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenMenuId(isMenuOpen ? null : entry.id);
                                  setConfirmDeleteId(null);
                                }}
                                aria-label="Entry options"
                                className="min-w-[36px] min-h-[36px] rounded-xl bg-[#101320] border border-[#272b45] text-gray-300 hover:text-white flex items-center justify-center cursor-pointer"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>

                              {isMenuOpen && (
                                <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-[#191d30] border border-[#323856] shadow-2xl py-1.5 z-30 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setOpenMenuId(null);
                                      openEditNaamaModal(entry);
                                    }}
                                    className="w-full min-h-[38px] flex items-center gap-2 px-3 py-2 text-amber-300 hover:bg-[#232842] text-left font-tamil font-semibold cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                    <span>திருத்து (Edit)</span>
                                  </button>

                                  {!isConfirmingDel ? (
                                    <button
                                      type="button"
                                      onClick={() => setConfirmDeleteId(entry.id)}
                                      className="w-full min-h-[38px] flex items-center gap-2 px-3 py-2 text-rose-400 hover:bg-rose-500/10 text-left font-tamil font-semibold cursor-pointer"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>நீக்கு (Delete)</span>
                                    </button>
                                  ) : (
                                    <div className="px-3 py-2 border-t border-[#2a2f4a] space-y-1.5">
                                      <p className="text-[11px] text-rose-300 font-tamil font-semibold">
                                        உறுதியாக நீக்கவா?
                                      </p>
                                      <div className="flex items-center gap-1.5">
                                        <button
                                          type="button"
                                          disabled={deletingId === entry.id}
                                          onClick={() => handleConfirmDelete(entry.id)}
                                          className="flex-1 min-h-[32px] px-2 py-1 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-tamil font-bold cursor-pointer disabled:opacity-50"
                                        >
                                          ஆம்
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => setConfirmDeleteId(null)}
                                          className="flex-1 min-h-[32px] px-2 py-1 rounded-lg bg-[#252a44] text-gray-300 font-tamil cursor-pointer"
                                        >
                                          இல்லை
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Tamil Name Display */}
                        <h3 className="text-base sm:text-lg font-bold text-amber-100 font-tamil leading-snug">
                          {entry.nameTamil}
                        </h3>

                        {/* Optional Note Box Underneath (Only when note exists) */}
                        {entry.notes && entry.notes.trim().length > 0 && (
                          <div className="p-3 rounded-xl bg-[#0f111d] border border-[#23273d] space-y-1">
                            <span className="text-[11px] font-semibold text-amber-300/90 font-tamil block">
                              குறிப்பு
                            </span>
                            <p className="text-xs sm:text-sm text-gray-300 font-tamil leading-relaxed whitespace-pre-line">
                              {entry.notes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : naamaVilakkamList.length === 0 ? (
            /* Clean Empty DB State */
            <div className="text-center py-16 px-4 rounded-2xl bg-[#131523] border border-[#23273f] space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                <BookOpen className="w-7 h-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-bold text-gray-100 font-tamil">
                  நாம விளக்கம் பட்டியல் காலியாக உள்ளது
                </h3>
                <p className="text-xs text-gray-400 font-tamil max-w-md mx-auto">
                  {canEdit
                    ? '1 அல்லது கூட்டுக் கிரகங்களுடன் முதல் தமிழ் நாமத்தைச் சேர்க்கவும்.'
                    : 'தற்போது நாம விளக்கம் பதிவுகள் எதுவும் சேர்க்கப்படவில்லை.'}
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={openAddNaamaModal}
                  className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#f5a623] hover:bg-[#e69818] text-black font-bold text-xs sm:text-sm font-tamil inline-flex items-center gap-2 shadow-lg cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>முதல் நாமம் சேர்</span>
                </button>
              )}
            </div>
          ) : (
            /* Empty Search / Planet Filter State */
            <div className="text-center py-14 px-4 rounded-2xl bg-[#131523] border border-[#23273f] space-y-3">
              <h3 className="text-base font-bold text-gray-100 font-tamil">
                பொருந்தக்கூடிய நாமங்கள் இல்லை
              </h3>
              <p className="text-xs text-gray-400 font-tamil max-w-sm mx-auto">
                தேடல் வார்த்தை அல்லது கிரக வடிகட்டிகளை மாற்றி மீண்டும் முயற்சிக்கவும்.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-[#f5a623] hover:bg-[#e69818] text-black font-bold text-xs font-tamil inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>வடிகட்டிகளை நீக்கு</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
