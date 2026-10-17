import React from 'react';
import { SlidersHorizontal, Sparkles, FilterX } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TempleCard } from './TempleCard';
import { FilterSidebar } from './FilterSidebar';
import { PLANETS, DEITIES } from '../data/constants';

export const TemplesList: React.FC = () => {
  const {
    temples,
    filters,
    resetFilters,
    openAddModal,
    currentUser,
    setPlanetMatchMode,
    togglePlanetFilter,
    isMobileFrame,
  } = useApp();

  const selectedPlanets = filters.planets && filters.planets.length > 0
    ? filters.planets
    : filters.planet
    ? [filters.planet]
    : [];

  const matchMode = filters.planetMatchMode || 'exact';

  // Apply filters
  const filteredTemples = temples.filter(temple => {
    // 1. Planet filter (Exact match or Contains all)
    if (selectedPlanets.length > 0) {
      if (matchMode === 'exact') {
        const hasSameLength = temple.planets.length === selectedPlanets.length;
        const allPresent = selectedPlanets.every(p => temple.planets.includes(p));
        if (!hasSameLength || !allPresent) {
          return false;
        }
      } else {
        const allPresent = selectedPlanets.every(p => temple.planets.includes(p));
        if (!allPresent) {
          return false;
        }
      }
    }

    // 2. Deity filter
    if (filters.deity && temple.deity !== filters.deity) {
      return false;
    }

    // 3. State filter
    if (filters.state && temple.state !== filters.state) {
      return false;
    }

    // 4. Significance filter
    if (filters.significance && temple.significance !== filters.significance) {
      return false;
    }

    // 5. Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      const matchName = temple.name.toLowerCase().includes(q);
      const matchLocation = temple.location.toLowerCase().includes(q);
      const matchSignificance = temple.significance?.toLowerCase().includes(q);
      const matchDesc = temple.descriptionTamil?.toLowerCase().includes(q);
      const matchEng = temple.descriptionEnglish?.toLowerCase().includes(q);
      if (!matchName && !matchLocation && !matchSignificance && !matchDesc && !matchEng) {
        return false;
      }
    }

    return true;
  }).sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

  const activeDeityObj = filters.deity ? DEITIES.find(d => d.id === filters.deity) : null;
  const hasActiveFilters =
    selectedPlanets.length > 0 ||
    filters.deity ||
    filters.state ||
    filters.significance ||
    filters.searchQuery;

  return (
    <div className={`w-full ${isMobileFrame ? 'max-w-xl mx-auto py-3 px-3 sm:px-4' : 'flex-1 h-full min-h-0 flex flex-col'}`}>
      <div className={`flex gap-6 ${isMobileFrame ? 'flex-col' : 'flex-col md:flex-row flex-1 h-full min-h-0 px-3 sm:px-4 lg:px-6 py-4'}`}>
        {/* Left Filter Sidebar: 100% Locked and stationary on iPad & Desktop (zero jitter, zero movement on scroll) */}
        {!isMobileFrame && (
          <aside className="hidden md:flex w-72 lg:w-80 shrink-0 h-full min-h-0 select-none">
            <FilterSidebar />
          </aside>
        )}

        {/* Right Main Content Area: Smooth independent scrolling */}
        <div className={`flex-1 min-w-0 space-y-4 w-full ${!isMobileFrame ? 'h-full overflow-y-auto no-scrollbar overscroll-contain pr-1 pb-16' : ''}`}>
          {/* Active Filter Indicators Bar if filters applied */}
          {hasActiveFilters && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-2xl bg-[#141624] border border-[#25283f] text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-gray-400 font-medium">Filtering:</span>

                {/* Selected Planets */}
                {selectedPlanets.map(pId => {
                  const p = PLANETS.find(x => x.id === pId);
                  return p ? (
                    <span
                      key={p.id}
                      onClick={() => togglePlanetFilter(p.id)}
                      className="px-2 py-0.5 rounded-full bg-amber-500/20 text-[#f5a623] border border-[#f5a623]/40 font-tamil font-semibold flex items-center gap-1 cursor-pointer hover:bg-amber-500/30"
                      title="Click to remove"
                    >
                      <span>{p.nameTamil}</span>
                      <span className="text-xs ml-0.5">✕</span>
                    </span>
                  ) : null;
                })}

                {/* Match Mode Badge */}
                {selectedPlanets.length > 1 && (
                  <button
                    onClick={() => setPlanetMatchMode(matchMode === 'exact' ? 'all' : 'exact')}
                    className="px-2 py-0.5 rounded-full bg-[#1e2236] text-amber-300 border border-amber-500/30 text-[10px] font-bold hover:bg-[#252a44] transition-colors"
                    title="Click to toggle between Exact Match and Contains All"
                  >
                    {matchMode === 'exact' ? '🎯 Exact Match' : '🔍 Contains All'}
                  </button>
                )}
                {activeDeityObj && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 font-tamil">
                    {activeDeityObj.nameTamil}
                  </span>
                )}
                {filters.state && (
                  <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                    {filters.state}
                  </span>
                )}
                {filters.searchQuery && (
                  <span className="px-2 py-0.5 rounded-full bg-gray-800 text-gray-200">
                    "{filters.searchQuery}"
                  </span>
                )}
              </div>

              <button
                onClick={resetFilters}
                className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer text-xs"
              >
                <FilterX className="w-3.5 h-3.5" />
                <span>Clear All</span>
              </button>
            </div>
          )}

          {/* Contributor Quick Prompt Banner (When Contributor is active) */}
          {currentUser.role === 'contributor' && (
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 to-[#161826] border border-amber-500/30 text-xs">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-[#f5a623]" />
                <span className="text-gray-300">
                  Welcome, <strong>{currentUser.name}</strong>! You can contribute new temples or review pending submissions.
                </span>
              </div>
              <button
                onClick={openAddModal}
                className="flex-shrink-0 px-3 py-1.5 rounded-xl bg-[#f5a623] text-black font-bold text-xs hover:bg-[#e69818] transition-all cursor-pointer"
              >
                + Add Temple
              </button>
            </div>
          )}

          {/* Temples Grid: Multi-column on fluid wide iPad & Desktop, single column on mobile */}
          {filteredTemples.length > 0 ? (
            <div className={`grid gap-4 ${
              isMobileFrame
                ? 'grid-cols-1'
                : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'
            }`}>
              {filteredTemples.map(temple => (
                <TempleCard key={temple.id} temple={temple} />
              ))}
            </div>
          ) : temples.length === 0 ? (
            /* Database is empty (Clean Slate) */
            <div className="text-center py-20 px-4 rounded-3xl bg-[#141624] border border-[#22253a] space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-gray-100">
                Temple Catalog is Clean (0 Temples)
              </h3>
              <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                All sample temples have been cleared. You now have a clean slate ready for your team's authentic temple entries and Supabase cloud sync.
              </p>
              <div className="pt-2 flex flex-wrap justify-center gap-3">
                <button
                  onClick={openAddModal}
                  className="px-5 py-2.5 rounded-xl bg-[#f5a623] text-black font-bold text-xs hover:bg-[#e69818] shadow-lg cursor-pointer"
                >
                  + Add First Temple
                </button>
              </div>
            </div>
          ) : (
            /* Empty Filter State */
            <div className="text-center py-16 px-4 rounded-3xl bg-[#141624] border border-[#22253a] space-y-4">
              <div className="w-14 h-14 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <SlidersHorizontal className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-100">
                No temples matched your active filter
              </h3>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">
                Try resetting your filters or clearing search terms to explore all sacred temples.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 rounded-xl bg-[#f5a623] text-black font-bold text-xs hover:bg-[#e69818] shadow-md cursor-pointer"
                >
                  Reset Filters
                </button>
                {currentUser.role !== 'user' && (
                  <button
                    onClick={openAddModal}
                    className="px-4 py-2 rounded-xl bg-[#1e2236] text-gray-200 text-xs hover:bg-[#252a42] cursor-pointer"
                  >
                    + Add This Temple
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Footer count indicator */}
          <div className="pt-2 pb-6 text-center text-xs text-gray-500">
            Showing {filteredTemples.length} of {temples.length} sacred temples
          </div>
        </div>
      </div>
    </div>
  );
};
