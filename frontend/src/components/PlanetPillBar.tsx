import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Check, X, SlidersHorizontal } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLANETS } from '../data/constants';

export const PlanetPillBar: React.FC = () => {
  const { filters, togglePlanetFilter, setPlanetMatchMode, resetFilters } = useApp();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const selectedPlanets = filters.planets || (filters.planet ? [filters.planet] : []);
  const matchMode = filters.planetMatchMode || 'exact';

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = scrollContainerRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, []);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -180, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 180, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#0d0f18]/98 backdrop-blur-md">
      {/* Horizontal Planet Carousel with Left/Right Chevrons and Multi-Select */}
      <div className="relative flex items-center py-2 px-2">
        {/* Left Scroll Chevron */}
        <button
          onClick={scrollLeft}
          aria-label="Scroll left"
          className={`absolute left-2 z-10 w-7 h-7 rounded-full bg-[#181a27]/95 text-gray-300 hover:text-amber-400 hover:border-amber-500/50 flex items-center justify-center border border-[#2e3146] shadow-lg backdrop-blur-md transition-all cursor-pointer ${
            canScrollLeft ? 'opacity-100' : 'opacity-40 hover:opacity-100'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Pills Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-9 w-full"
        >
          {PLANETS.map((planet) => {
            const isSelected = selectedPlanets.includes(planet.id);
            return (
              <button
                key={planet.id}
                onClick={() => togglePlanetFilter(planet.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-tamil transition-all whitespace-nowrap flex-shrink-0 cursor-pointer flex items-center gap-1.5 select-none ${
                  isSelected
                    ? 'bg-[#f5a623] text-black font-bold shadow-md shadow-amber-500/30 ring-2 ring-amber-300/80 scale-[1.03]'
                    : 'bg-[#181a27] text-[#f5a623] border border-[#3b3628] hover:border-[#f5a623] hover:bg-[#202235]'
                }`}
                title={`${planet.nameEnglish} - ${planet.grahaLord} (Tap to multi-select / unselect)`}
              >
                <span>{planet.nameTamil}</span>
                {isSelected && (
                  <Check className="w-3.5 h-3.5 stroke-[3] ml-0.5 text-black" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Chevron */}
        <button
          onClick={scrollRight}
          aria-label="Scroll right"
          className={`absolute right-2 z-10 w-7 h-7 rounded-full bg-[#181a27]/95 text-gray-300 hover:text-amber-400 hover:border-amber-500/50 flex items-center justify-center border border-[#2e3146] shadow-lg backdrop-blur-md transition-all cursor-pointer ${
            canScrollRight ? 'opacity-100' : 'opacity-40 hover:opacity-100'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Multi-Select Sub-Bar: Visible when 1 or more planets are tapped */}
      {selectedPlanets.length > 0 && (
        <div className="px-4 py-1.5 bg-[#121422] border-t border-[#1e2136] flex items-center justify-between text-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-gray-400 font-medium">Selected ({selectedPlanets.length}):</span>
            <div className="flex items-center gap-1">
              {selectedPlanets.map(pId => {
                const p = PLANETS.find(x => x.id === pId);
                return p ? (
                  <span
                    key={p.id}
                    onClick={() => togglePlanetFilter(p.id)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 text-[#f5a623] border border-amber-500/40 text-[11px] font-tamil font-bold cursor-pointer hover:bg-amber-500/30"
                    title="Click to remove"
                  >
                    <span>{p.nameTamil}</span>
                    <X className="w-2.5 h-2.5" />
                  </span>
                ) : null;
              })}
            </div>
          </div>

          {/* Exact Match Mode Toggle (Exact set match vs Contains all) */}
          <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
            <button
              onClick={() => setPlanetMatchMode(matchMode === 'exact' ? 'all' : 'exact')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                matchMode === 'exact'
                  ? 'bg-amber-500 text-black shadow-sm font-bold'
                  : 'bg-[#1b1e2f] text-gray-300 hover:text-white border border-[#2f334d]'
              }`}
              title={
                matchMode === 'exact'
                  ? 'Exact Match: Temples must have exactly these selected planets'
                  : 'Contains All: Temples must include all selected planets'
              }
            >
              <span>{matchMode === 'exact' ? '🎯 Exact Match' : '🔍 Contains All'}</span>
            </button>

            <button
              onClick={() => {
                selectedPlanets.forEach(id => togglePlanetFilter(id));
              }}
              className="text-gray-400 hover:text-amber-300 text-[11px] px-1.5 py-0.5"
              title="Clear planet selection"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
