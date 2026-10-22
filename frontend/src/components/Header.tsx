import React from 'react';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TempleLogoSvg } from './LoadingSpinner';

export const Header: React.FC = () => {
  const {
    filters,
    setFilters,
    setIsFilterOpen,
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
    ].filter(Boolean).length;

  return (
    <header className="w-full px-4 pt-3 pb-3 border-b border-[#1f2233]/70">
      {/* Top Row: Gopuram Logo + App Name + User Avatar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        {/* Logo and Brand */}
        <div 
          onClick={() => setActiveTab('temples')}
          className="flex items-center gap-2.5 cursor-pointer select-none group"
        >
          {/* Stylized Gopuram SVG matching Screenshot */}
          <div className="w-9 h-9 text-[#f5a623] flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-105">
            <TempleLogoSvg className="w-8 h-8" />
          </div>
          <div>
            <h1 className="font-cinzel text-xl sm:text-2xl font-bold tracking-[0.2em] text-[#f5a623] leading-none">
              MUPPORUL
            </h1>
            <span className="text-[10px] text-amber-300/60 font-tamil tracking-wider">
              திருக்கோவில்கள் & பரிகாரங்கள்
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* User Status / Login Pill */}
          {isLoggedIn ? (
            <button
              onClick={() => setActiveTab('profile')}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#181a27] border border-[#2e3146] hover:border-amber-500/50 cursor-pointer transition-all shadow-sm"
              title={`Logged in as ${currentUser.name} (@${currentUser.username || currentUser.name})`}
            >
              <div className={`w-5 h-5 rounded-full bg-gradient-to-tr ${currentUser.avatarColor} text-white font-bold text-[10px] flex items-center justify-center shrink-0`}>
                {currentUser.avatarText}
              </div>
              <span className="text-xs font-semibold text-gray-200 hidden sm:inline">
                @{currentUser.username || currentUser.name}
              </span>
              <span className="text-[10px] font-bold text-amber-400 uppercase bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
                {currentUser.role}
              </span>
            </button>
          ) : (
            <button
              onClick={openLoginModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold transition-all shadow-sm cursor-pointer"
            >
              <span>Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Row 2: Search Bar + Filter Button (Matching Screenshot 1) */}
      <div className="flex items-center gap-2.5">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
            placeholder="Search temples..."
            className="w-full bg-[#181a27] text-gray-100 placeholder-gray-400 text-sm rounded-full pl-10 pr-4 py-2.5 border border-[#2e3146] focus:outline-none focus:border-[#f5a623] focus:ring-1 focus:ring-[#f5a623] transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters(prev => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 text-xs bg-[#24273c] w-4 h-4 rounded-full flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filter Button with Count Badge (Visible on mobile view, hidden on desktop where sidebar is present) */}
        <button
          onClick={() => setIsFilterOpen(true)}
          className={`flex md:hidden items-center gap-1.5 px-4 py-2.5 rounded-full border text-sm font-medium transition-all ${
            activeFilterCount > 0
              ? 'bg-amber-500/15 border-[#f5a623] text-[#f5a623] shadow-sm'
              : 'bg-[#181a27] border-[#2e3146] text-gray-200 hover:border-gray-500'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 text-[#f5a623]" />
          <span>Filter</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-[#f5a623] text-black text-xs font-bold flex items-center justify-center ml-0.5">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>
    </header>
  );
};
