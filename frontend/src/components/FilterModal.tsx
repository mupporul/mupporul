import React, { useState } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLANETS, DEITIES, STATES, SIGNIFICANCE_OPTIONS } from '../data/constants';
import { FilterState } from '../types';

export const FilterModal: React.FC = () => {
  const { filters, setFilters, resetFilters, isFilterOpen, setIsFilterOpen, isMobileFrame } = useApp();

  // Local draft filter state before applying
  const [draftFilters, setDraftFilters] = useState<FilterState>(filters);

  // Accordion collapsed state for sections
  const [openSections, setOpenSections] = useState({
    planet: true,
    deity: true,
    location: true,
    significance: true,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (!isFilterOpen) return null;

  const handleApply = () => {
    setFilters(draftFilters);
    setIsFilterOpen(false);
  };

  const handleReset = () => {
    resetFilters();
    setDraftFilters({
      planets: [],
      planetMatchMode: 'exact',
      planet: null,
      deity: null,
      state: null,
      significance: null,
      searchQuery: draftFilters.searchQuery,
    });
  };

  const togglePlanet = (planetId: string) => {
    setDraftFilters(prev => {
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

  const toggleDeity = (deityId: string) => {
    setDraftFilters(prev => ({
      ...prev,
      deity: prev.deity === deityId ? null : deityId,
    }));
  };

  return (
    <div className={`fixed inset-0 z-50 flex justify-center bg-black/75 backdrop-blur-sm animate-in fade-in duration-200 ${
      isMobileFrame ? 'items-end sm:items-center p-0 sm:p-4' : 'items-center p-4'
    }`}>
      {/* Modal Card */}
      <div className={`w-full bg-[#121422] rounded-t-3xl sm:rounded-3xl border border-[#26293f] max-h-[92vh] flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${
        isMobileFrame ? 'max-w-md' : 'max-w-xl'
      }`}>
        {/* Header: [X] Filter [Reset] */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-[#22253a]">
          <button
            onClick={() => setIsFilterOpen(false)}
            className="w-8 h-8 rounded-full bg-[#1b1e2f] text-gray-300 hover:text-white flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <h2 className="text-xl font-bold text-gray-100">
            Filter
          </h2>

          <button
            onClick={handleReset}
            className="text-sm font-semibold text-[#f5a623] hover:text-amber-300 transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>

        {/* Scrollable Filter Categories */}
        <div className="overflow-y-auto px-6 py-4 space-y-5 no-scrollbar flex-1">
          {/* Section 1: Planet (Graha) */}
          <div className="border-b border-[#1f2235] pb-4">
            <button
              onClick={() => toggleSection('planet')}
              className="w-full flex items-center justify-between text-base font-semibold text-gray-100 mb-3"
            >
              <span>Planet (Graha)</span>
              {openSections.planet ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {openSections.planet && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2.5">
                  {PLANETS.map(planet => {
                    const isSelected = (draftFilters.planets || []).includes(planet.id);
                    return (
                      <button
                        key={planet.id}
                        type="button"
                        onClick={() => togglePlanet(planet.id)}
                        className={`py-2 px-3 rounded-full text-sm font-tamil font-medium transition-all text-center flex items-center justify-center cursor-pointer ${
                          isSelected
                            ? 'bg-[#f5a623] text-black font-bold shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                            : 'bg-[#151726] text-[#f5a623] border border-[#f5a623]/70 hover:bg-[#1f2235]'
                        }`}
                      >
                        <span className="text-base">{planet.nameTamil}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Match Mode Selector when planets selected */}
                {(draftFilters.planets || []).length > 0 && (
                  <div className="p-2.5 bg-[#171a2b] rounded-xl border border-[#2b304c] space-y-1.5">
                    <span className="text-[11px] text-gray-300 font-semibold block">
                      Multi-Planet Filtering Rule:
                    </span>
                    <div className="grid grid-cols-2 gap-1.5">
                      <button
                        type="button"
                        onClick={() =>
                          setDraftFilters(prev => ({ ...prev, planetMatchMode: 'exact' }))
                        }
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                          draftFilters.planetMatchMode === 'exact'
                            ? 'bg-[#f5a623] text-black shadow-sm font-bold'
                            : 'bg-[#121422] text-gray-300 hover:text-white border border-[#25283f]'
                        }`}
                      >
                        🎯 Exact Match
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setDraftFilters(prev => ({ ...prev, planetMatchMode: 'all' }))
                        }
                        className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                          draftFilters.planetMatchMode === 'all'
                            ? 'bg-[#f5a623] text-black shadow-sm font-bold'
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

          {/* Section 2: Deity */}
          <div className="border-b border-[#1f2235] pb-4">
            <button
              onClick={() => toggleSection('deity')}
              className="w-full flex items-center justify-between text-base font-semibold text-gray-100 mb-3"
            >
              <span>Deity</span>
              {openSections.deity ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {openSections.deity && (
              <div className="grid grid-cols-3 gap-2.5">
                {DEITIES.map(deity => {
                  const isSelected = draftFilters.deity === deity.id;
                  return (
                    <button
                      key={deity.id}
                      onClick={() => toggleDeity(deity.id)}
                      className={`py-2 px-2.5 rounded-full text-xs font-tamil transition-all text-center flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-[#f5a623] text-black font-bold shadow-md shadow-amber-500/25 ring-2 ring-amber-300'
                          : 'bg-[#151726] text-gray-200 border border-[#f5a623]/70 hover:bg-[#1f2235]'
                      }`}
                    >
                      <span className="text-sm">{deity.nameTamil}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 3: Location */}
          <div className="border-b border-[#1f2235] pb-4">
            <button
              onClick={() => toggleSection('location')}
              className="w-full flex items-center justify-between text-base font-semibold text-gray-100 mb-3"
            >
              <span>Location</span>
              {openSections.location ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {openSections.location && (
              <div className="space-y-2.5">
                {/* State Dropdown */}
                <div className="relative">
                  <select
                    value={draftFilters.state || ''}
                    onChange={(e) =>
                      setDraftFilters(prev => ({
                        ...prev,
                        state: e.target.value || null,
                      }))
                    }
                    className="w-full appearance-none bg-[#151726] text-gray-200 text-sm rounded-xl px-4 py-3 border border-[#2b2e46] focus:outline-none focus:border-[#f5a623] cursor-pointer"
                  >
                    <option value="">Select state (All States)</option>
                    {STATES.map(s => (
                      <option key={s} value={s} className="bg-[#121422]">
                        {s}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-[#f5a623] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Significance */}
          <div className="pb-2">
            <button
              onClick={() => toggleSection('significance')}
              className="w-full flex items-center justify-between text-base font-semibold text-gray-100 mb-3"
            >
              <span>Significance & Remedies</span>
              {openSections.significance ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {openSections.significance && (
              <div className="relative">
                <select
                  value={draftFilters.significance || ''}
                  onChange={(e) =>
                    setDraftFilters(prev => ({
                      ...prev,
                      significance: e.target.value || null,
                    }))
                  }
                  className="w-full appearance-none bg-[#151726] text-gray-200 text-sm rounded-xl px-4 py-3 border border-[#2b2e46] focus:outline-none focus:border-[#f5a623] cursor-pointer"
                >
                  <option value="">Select significance</option>
                  {SIGNIFICANCE_OPTIONS.map(opt => (
                    <option key={opt.id} value={opt.id} className="bg-[#121422]">
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-[#f5a623] absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Apply Golden Button - Exact Match to Screenshot 2 */}
        <div className="p-5 border-t border-[#22253a] bg-[#121422]">
          <button
            onClick={handleApply}
            className="w-full py-3.5 px-6 rounded-2xl bg-[#f5a623] hover:bg-[#e69818] text-black font-bold text-base shadow-lg shadow-amber-500/20 active:scale-[0.99] transition-all cursor-pointer text-center"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
