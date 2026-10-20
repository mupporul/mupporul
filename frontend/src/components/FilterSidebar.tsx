import React, { useState } from 'react';
import { SlidersHorizontal, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLANETS, DEITIES, STATES } from '../data/constants';

export const FilterSidebar: React.FC = () => {
  const {
    filters,
    setFilters,
    resetFilters,
    togglePlanetFilter,
    setPlanetMatchMode,
  } = useApp();

  // Accordion collapsed state for sections (open by default for quick desktop filtering)
  const [openSections, setOpenSections] = useState({
    planet: true,
    deity: true,
    location: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const selectedPlanets = filters.planets && filters.planets.length > 0
    ? filters.planets
    : filters.planet
    ? [filters.planet]
    : [];

  const matchMode = filters.planetMatchMode || 'exact';

  const activeFilterCount =
    selectedPlanets.length +
    [filters.deity, filters.state, filters.searchQuery].filter(Boolean).length;

  const toggleDeity = (deityId: string) => {
    setFilters(prev => ({
      ...prev,
      deity: prev.deity === deityId ? null : deityId,
    }));
  };

  return (
    <div className="bg-[#121422] rounded-2xl border border-[#22253a] shadow-xl p-4 space-y-4 h-full flex flex-col w-full min-h-0">
      {/* Header: Filters + Count + Reset Button */}
      <div className="flex items-center justify-between pb-3 border-b border-[#1f2235] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-[#f5a623] flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-bold text-gray-100 tracking-wide uppercase">
              Filters
            </h2>
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-[#f5a623] text-black text-xs font-extrabold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>

          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs font-semibold text-[#f5a623] hover:text-amber-300 transition-colors cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="space-y-4 overflow-y-auto no-scrollbar overscroll-contain flex-1 pr-0.5 min-h-0">
          {/* Section 1: Planet (Graha) */}
          <div className="border-b border-[#1c1f32] pb-3.5">
            <button
              type="button"
              onClick={() => toggleSection('planet')}
              className="w-full flex items-center justify-between text-xs font-bold text-gray-200 tracking-wide mb-2.5 cursor-pointer hover:text-amber-300 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>Planet (Graha)</span>
                {selectedPlanets.length > 0 && (
                  <span className="text-[10px] text-amber-400 font-normal">({selectedPlanets.length})</span>
                )}
              </span>
              {openSections.planet ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>

            {openSections.planet && (
              <div className="space-y-2.5 animate-in fade-in duration-150">
                <div className="grid grid-cols-3 gap-1.5">
                  {PLANETS.map(planet => {
                    const isSelected = selectedPlanets.includes(planet.id);
                    return (
                      <button
                        key={planet.id}
                        type="button"
                        onClick={() => togglePlanetFilter(planet.id)}
                        className={`py-1.5 px-2 rounded-xl text-xs font-tamil font-medium transition-all text-center flex flex-col items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#f5a623] text-black font-bold shadow-md shadow-amber-500/20 ring-2 ring-amber-300'
                            : 'bg-[#161828] text-[#f5a623] border border-[#f5a623]/60 hover:bg-[#1f2235]'
                        }`}
                        title={`${planet.nameEnglish} (${planet.day})`}
                      >
                        <span className="text-xs sm:text-sm">{planet.nameTamil}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Match Mode Selector when multiple planets selected */}
                {selectedPlanets.length > 1 && (
                  <div className="p-2 bg-[#171a2a] rounded-xl border border-[#272b43] space-y-1">
                    <span className="text-[10px] text-gray-400 font-semibold block">
                      Multi-Planet Rule:
                    </span>
                    <div className="grid grid-cols-2 gap-1 text-[11px]">
                      <button
                        type="button"
                        onClick={() => setPlanetMatchMode('exact')}
                        className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                          matchMode === 'exact'
                            ? 'bg-[#f5a623] text-black font-bold shadow-xs'
                            : 'bg-[#121422] text-gray-300 hover:text-white border border-[#25283f]'
                        }`}
                      >
                        🎯 Exact Match
                      </button>
                      <button
                        type="button"
                        onClick={() => setPlanetMatchMode('all')}
                        className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold transition-all ${
                          matchMode === 'all'
                            ? 'bg-[#f5a623] text-black font-bold shadow-xs'
                            : 'bg-[#121422] text-gray-300 hover:text-white border border-[#25283f]'
                        }`}
                      >
                        🔍 Contains All
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Section 2: Deity (மூலவர்) */}
          <div className="border-b border-[#1c1f32] pb-3.5">
            <button
              type="button"
              onClick={() => toggleSection('deity')}
              className="w-full flex items-center justify-between text-xs font-bold text-gray-200 tracking-wide mb-2.5 cursor-pointer hover:text-amber-300 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>Deity (மூலவர்)</span>
                {filters.deity && (
                  <span className="text-[10px] text-blue-400 font-normal">(1)</span>
                )}
              </span>
              {openSections.deity ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>

            {openSections.deity && (
              <div className="grid grid-cols-2 gap-1.5 animate-in fade-in duration-150">
                {DEITIES.map(deity => {
                  const isSelected = filters.deity === deity.id;
                  return (
                    <button
                      key={deity.id}
                      type="button"
                      onClick={() => toggleDeity(deity.id)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-tamil transition-all text-center flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-[#f5a623] text-black font-bold shadow-md shadow-amber-500/20 ring-2 ring-amber-300'
                          : 'bg-[#161828] text-gray-200 border border-[#2e324c] hover:border-[#f5a623]/60 hover:bg-[#1f2235]'
                      }`}
                      title={deity.nameEnglish}
                    >
                      <span className="truncate">{deity.nameTamil}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Location (State) */}
          <div className="border-b border-[#1c1f32] pb-3.5">
            <button
              type="button"
              onClick={() => toggleSection('location')}
              className="w-full flex items-center justify-between text-xs font-bold text-gray-200 tracking-wide mb-2.5 cursor-pointer hover:text-amber-300 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <span>Location (State)</span>
                {filters.state && (
                  <span className="text-[10px] text-purple-400 font-normal">(1)</span>
                )}
              </span>
              {openSections.location ? (
                <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
              )}
            </button>

            {openSections.location && (
              <div className="relative animate-in fade-in duration-150">
                <select
                  value={filters.state || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, state: e.target.value || null }))}
                  className="w-full appearance-none bg-[#161828] text-gray-200 text-xs rounded-xl px-3 py-2 border border-[#2b2e46] focus:outline-none focus:border-[#f5a623] cursor-pointer"
                >
                  <option value="">Select state (All States)</option>
                  {STATES.map(s => (
                    <option key={s} value={s} className="bg-[#121422]">
                      {s}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-[#f5a623] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>
        </div>
      </div>
  );
};
