import React from 'react';
import { Search, SlidersHorizontal, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TempleLogoSvg } from './LoadingSpinner';

export const Header: React.FC = () => {
  const {
    filters,
    setFilters,
    setIsFilterOpen,
    activeTab,
    setActiveTab,
    currentUser,
    isLoggedIn,
    openLoginModal,
  } = useApp();

  // Calculate active filter count
  const activeFilterCount =
    (filters.planets && filters.planets.length > 0 ? filters.planets.length : (filters.planet ? 1 : 0)) +
    [
      filters.deity,
      filters.state,
      filters.jothidarPaarvaiOnly,
    ].filter(Boolean).length;

  const showTemplesSearchRow = activeTab !== 'solution' && activeTab !== 'naama_vilakkam' && activeTab !== 'quiz';

  return (
    <header className="w-full px-4 pt-3 pb-3 border-b border-[#1f2233]/70">
      {/* Top Row: Gopuram Logo + App Name + User Badge (all uniform h-9 & top-aligned) */}
      <div className={`flex items-start justify-between gap-2 sm:gap-3 ${showTemplesSearchRow ? 'mb-3' : ''}`}>
        {/* Logo and Brand */}
        <div 
          onClick={() => setActiveTab('temples')}
          className="flex items-start gap-2 sm:gap-2.5 cursor-pointer select-none group min-w-0"
        >
          {/* Stylized Gopuram SVG */}
          <div className="w-9 h-9 text-[#f5a623] flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
            <TempleLogoSvg className="w-9 h-9" />
          </div>
          <div className="min-w-0 h-9 flex items-center">
            <h1 className="font-tamil text-[14px] sm:text-xl font-bold tracking-normal text-[#f5a623] leading-[18px] sm:leading-none flex flex-col sm:flex-row sm:items-center sm:gap-x-1.5">
              <span className="whitespace-nowrap">கிரஹங்களே</span>
              <span className="whitespace-nowrap">கோவில்களாய்</span>
            </h1>
          </div>
        </div>

        <div className="flex items-start gap-2 shrink-0 h-9">
          {/* User Status / Login Pill */}
          {isLoggedIn ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="h-9 flex items-center gap-1.5 px-2.5 rounded-full bg-[#181a27] border border-[#2e3146] hover:border-amber-500/50 cursor-pointer transition-all shadow-sm"
              title={`Logged in as ${currentUser.name} (@${currentUser.username || currentUser.name})`}
            >
              <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${currentUser.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                {currentUser.avatarText}
              </div>
              <span className="text-[11px] sm:text-xs font-semibold text-gray-200 max-w-[115px] sm:max-w-none truncate">
                @{currentUser.username || currentUser.name}
              </span>
              <span className="hidden sm:inline text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {currentUser.role}
              </span>
            </button>
          ) : (
            <button
              onClick={openLoginModal}
              className="h-9 flex items-center gap-1.5 px-3 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Search Bar + Desktop பாவ/ராசி தொடர்பு + Mobile Filter Icon Button */}
      {showTemplesSearchRow && (
        <div className="flex flex-nowrap items-center gap-2 sm:gap-2.5 mt-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              placeholder="Search temples..."
              className="w-full bg-[#181a27] text-gray-100 placeholder-gray-400 text-sm rounded-full pl-10 pr-8 py-2.5 border border-[#2e3146] focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] transition-all"
            />
            {filters.searchQuery && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs bg-[#24273c] w-4 h-4 rounded-full flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          {/* பாவ/ராசி தொடர்பு Filter Checkbox (Desktop/Tablet only; available inside FilterModal on mobile) */}
          {activeTab === 'temples' && (
            <label
              className={`hidden md:flex items-center gap-2 px-3.5 py-2.5 rounded-full border text-xs sm:text-sm font-medium cursor-pointer select-none transition-all shrink-0 ${
                filters.jothidarPaarvaiOnly
                  ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300 shadow-sm'
                  : 'bg-[#181a27] border-[#2e3146] text-gray-200 hover:border-cyan-400/50'
              }`}
              title="பாவ/ராசி தொடர்பு"
            >
              <input
                type="checkbox"
                checked={Boolean(filters.jothidarPaarvaiOnly)}
                onChange={(e) =>
                  setFilters(prev => ({
                    ...prev,
                    jothidarPaarvaiOnly: e.target.checked,
                  }))
                }
                className="w-3.5 h-3.5 rounded accent-cyan-400 cursor-pointer"
              />
              <Star
                className={`w-3.5 h-3.5 shrink-0 ${
                  filters.jothidarPaarvaiOnly ? 'fill-cyan-400 text-cyan-400' : 'text-cyan-400/80'
                }`}
              />
              <span className="whitespace-nowrap font-tamil">பாவ/ராசி தொடர்பு</span>
            </label>
          )}

          {/* Compact Filter Icon Button (Mobile view only, next to search text box) */}
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            aria-label="Filter"
            title="Filter"
            className={`relative flex md:hidden items-center justify-center w-10 h-10 rounded-full border transition-all shrink-0 cursor-pointer ${
              activeFilterCount > 0
                ? 'bg-amber-500/15 border-[#f5a623] text-[#f5a623] shadow-sm'
                : 'bg-[#181a27] border-[#2e3146] text-gray-200 hover:border-gray-500'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4 text-[#f5a623]" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-[#f5a623] text-black text-[10px] font-bold flex items-center justify-center ring-1 ring-[#0d0f18]">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      )}
    </header>
  );
};
