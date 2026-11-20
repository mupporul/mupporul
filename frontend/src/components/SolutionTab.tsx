import React, { useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Plus,
  X,
  RotateCcw,
  Settings2,
  Compass,
  Search,
  SlidersHorizontal,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TempleCard } from './TempleCard';
import { AdminSolutionTagsPanel } from './AdminSolutionTagsPanel';

export const SolutionTab: React.FC = () => {
  const {
    temples,
    solutionTags,
    currentUser,
    isMobileFrame,
    openAddModal,
  } = useApp();

  // Dynamic one-by-one problem dropdown rows (starts with 1 empty dropdown)
  const [dropdownRows, setDropdownRows] = useState<string[]>(['']);
  // Match mode: 'any' (Best Match ranked by matched count) or 'all' (must solve every selected problem)
  const [matchMode, setMatchMode] = useState<'any' | 'all'>('any');
  // Optional search filter within Solution dropdown options / results
  const [tagSearch, setTagSearch] = useState('');
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);

  const selectedTagIds = useMemo(
    () => Array.from(new Set(dropdownRows.filter(Boolean))),
    [dropdownRows]
  );

  // Also ensure any orphan row value referencing a deleted tag clears gracefully
  const validSelectedIds = useMemo(
    () => selectedTagIds.filter(id => solutionTags.some(t => t.id === id)),
    [selectedTagIds, solutionTags]
  );

  const filteredDropdownTags = useMemo(() => {
    const q = tagSearch.trim().toLowerCase();
    if (!q) return solutionTags;
    return solutionTags.filter(
      t =>
        t.nameTamil.toLowerCase().includes(q) ||
        (t.nameEnglish && t.nameEnglish.toLowerCase().includes(q))
    );
  }, [solutionTags, tagSearch]);

  const handleRowChange = (rowIndex: number, tagId: string) => {
    setDropdownRows(prev => prev.map((val, idx) => (idx === rowIndex ? tagId : val)));
  };

  const handleAddRow = () => {
    setDropdownRows(prev => [...prev, '']);
  };

  const handleRemoveRow = (rowIndex: number) => {
    setDropdownRows(prev => {
      if (prev.length <= 1) {
        return [''];
      }
      return prev.filter((_, idx) => idx !== rowIndex);
    });
  };

  const handleReset = () => {
    setDropdownRows(['']);
    setTagSearch('');
  };

  const handleQuickSelectTag = (tagId: string) => {
    setDropdownRows(prev => {
      if (prev.includes(tagId)) return prev;
      const emptyIdx = prev.findIndex(v => !v);
      if (emptyIdx >= 0) {
        return prev.map((v, idx) => (idx === emptyIdx ? tagId : v));
      }
      return [...prev, tagId];
    });
  };

  // Compute matching temples for 'any' (ranked by match count desc) and 'all' (exact AND)
  const { rankedAnyMatches, exactAllMatches, displayedResults } = useMemo(() => {
    if (validSelectedIds.length === 0) {
      return {
        rankedAnyMatches: [] as { temple: typeof temples[number]; matchedIds: string[] }[],
        exactAllMatches: [] as { temple: typeof temples[number]; matchedIds: string[] }[],
        displayedResults: [] as { temple: typeof temples[number]; matchedIds: string[] }[],
      };
    }

    const withMatches = temples
      .map(temple => {
        const assigned = Array.isArray(temple.solutionTags) ? temple.solutionTags : [];
        const matchedIds = validSelectedIds.filter(id => assigned.includes(id));
        return { temple, matchedIds };
      })
      .filter(item => item.matchedIds.length > 0)
      .sort((a, b) => {
        if (b.matchedIds.length !== a.matchedIds.length) {
          return b.matchedIds.length - a.matchedIds.length;
        }
        return (
          new Date(b.temple.createdAt || 0).getTime() -
          new Date(a.temple.createdAt || 0).getTime()
        );
      });

    const allOnly = withMatches.filter(
      item => item.matchedIds.length === validSelectedIds.length
    );

    return {
      rankedAnyMatches: withMatches,
      exactAllMatches: allOnly,
      displayedResults: matchMode === 'all' ? allOnly : withMatches,
    };
  }, [temples, validSelectedIds, matchMode]);

  const remainingAvailableCount = solutionTags.filter(
    t => !validSelectedIds.includes(t.id)
  ).length;

  return (
    <div
      className={`w-full ${
        isMobileFrame
          ? 'max-w-xl mx-auto py-3 px-3 sm:px-4 overflow-y-auto no-scrollbar flex-1 min-h-0'
          : 'flex-1 h-full min-h-0 flex flex-col'
      }`}
    >
      <div
        className={`flex gap-5 ${
          isMobileFrame
            ? 'flex-col pb-6'
            : 'flex-col md:flex-row flex-1 h-full min-h-0 px-3 sm:px-4 lg:px-6 py-4 overflow-y-auto md:overflow-hidden no-scrollbar'
        }`}
      >
        {/* Left Panel: Dynamic One-by-One Problem Dropdowns (Mirrors FilterSidebar layout) */}
        <aside
          className={`${
            isMobileFrame
              ? 'w-full'
              : 'w-full md:w-72 lg:w-80 shrink-0 md:h-full md:min-h-0'
          }`}
        >
          <div className="bg-[#121422] rounded-2xl border border-[#22253a] shadow-xl p-4 space-y-4 md:h-full flex flex-col w-full min-h-0">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#1f2235] shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-amber-500/15 text-[#f5a623] flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-gray-100 tracking-wide truncate">
                    Solution Finder
                  </h2>
                  <p className="text-[11px] text-amber-300/80 font-tamil truncate">
                    பிரச்சனைக்கான கோவில் தீர்வு
                  </p>
                </div>
              </div>

              {(validSelectedIds.length > 0 || dropdownRows.length > 1 || tagSearch) && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-1 text-xs font-semibold text-[#f5a623] hover:text-amber-300 transition-colors cursor-pointer shrink-0"
                  title="Clear selected problems"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Body Controls */}
            <div className="space-y-4 md:overflow-y-auto no-scrollbar md:flex-1 pr-0.5 min-h-0">
              {/* Match Mode Segmented Control (BOTH: Best Match Ranked OR + Match All AND) */}
              <div className="space-y-1.5">
                <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                  Match Mode
                </span>
                <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-[#0c0e18] border border-[#23273d]">
                  <button
                    type="button"
                    onClick={() => setMatchMode('any')}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      matchMode === 'any'
                        ? 'bg-[#f5a623] text-black shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Best Match (Any)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMatchMode('all')}
                    className={`py-1.5 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                      matchMode === 'all'
                        ? 'bg-[#f5a623] text-black shadow-sm'
                        : 'text-gray-400 hover:text-gray-200'
                    }`}
                  >
                    Match All (Exact)
                  </button>
                </div>
                <p className="text-[11px] text-gray-400 leading-snug">
                  {matchMode === 'any'
                    ? 'Temples matching all selected problems rank first, followed by partial matches.'
                    : 'Only shows temples that address every problem selected below.'}
                </p>
              </div>

              {/* Optional quick keyword filter when many tags exist */}
              {solutionTags.length > 5 && (
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={tagSearch}
                    onChange={(e) => setTagSearch(e.target.value)}
                    placeholder="Filter problem tags..."
                    aria-label="Filter problem tags"
                    className="w-full bg-[#181a29] text-gray-100 placeholder-gray-500 text-xs rounded-xl pl-8 pr-3 py-2 border border-[#2a2e45] focus:border-[#f5a623] focus:outline-none font-tamil"
                  />
                </div>
              )}

              {/* Dynamic Dropdown Rows */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-200 font-tamil">
                    பிரச்சனைகளைத் தேர்ந்தெடுக்கவும்
                  </span>
                  <span className="text-[11px] text-gray-400 tabular-nums">
                    {validSelectedIds.length} selected
                  </span>
                </div>

                {dropdownRows.map((selectedVal, idx) => {
                  // Exclude tags already chosen in OTHER rows, always keeping current row's selected value
                  const availableOptions = filteredDropdownTags.filter(
                    t =>
                      t.id === selectedVal ||
                      !dropdownRows.some((otherVal, otherIdx) => otherIdx !== idx && otherVal === t.id)
                  );
                  // Also guarantee selected value stays in options even if search string hides it
                  const currentTag = selectedVal
                    ? solutionTags.find(t => t.id === selectedVal)
                    : undefined;
                  const finalOptions =
                    currentTag && !availableOptions.some(t => t.id === currentTag.id)
                      ? [currentTag, ...availableOptions]
                      : availableOptions;

                  return (
                    <div key={`problem-row-${idx}`} className="space-y-1">
                      <label
                        htmlFor={`solution-problem-select-${idx}`}
                        className="block text-[11px] font-medium text-gray-400"
                      >
                        Problem {idx + 1}
                      </label>
                      <div className="flex items-center gap-1.5">
                        <select
                          id={`solution-problem-select-${idx}`}
                          aria-label={`Problem ${idx + 1}`}
                          value={selectedVal}
                          onChange={(e) => handleRowChange(idx, e.target.value)}
                          className="min-w-0 flex-1 bg-[#181a29] text-gray-100 text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-[#2d314b] focus:border-[#f5a623] focus:outline-none cursor-pointer font-tamil"
                        >
                          <option value="">-- பிரச்சனை தேர்வு செய்யவும் --</option>
                          {finalOptions.map(tag => (
                            <option key={tag.id} value={tag.id}>
                              {tag.nameTamil}
                              {tag.nameEnglish ? ` (${tag.nameEnglish})` : ''}
                            </option>
                          ))}
                        </select>

                        {(dropdownRows.length > 1 || selectedVal !== '') && (
                          <button
                            type="button"
                            onClick={() => handleRemoveRow(idx)}
                            aria-label={`Remove Problem ${idx + 1}`}
                            title="Remove problem"
                            className="w-9 h-9 rounded-xl bg-[#1a1d2e] hover:bg-rose-500/20 text-gray-400 hover:text-rose-300 border border-[#2d314b] flex items-center justify-center shrink-0 cursor-pointer transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Dynamic Add Another Problem Dropdown Button */}
                <button
                  type="button"
                  onClick={handleAddRow}
                  disabled={remainingAvailableCount === 0 && dropdownRows.every(Boolean)}
                  className="w-full flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#1a1e30] hover:bg-[#22273f] text-amber-300 border border-dashed border-amber-500/50 text-xs font-semibold transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 shrink-0" />
                  <span className="font-tamil">+ Add Problem (மற்றொரு பிரச்சனை சேர்)</span>
                </button>
              </div>
            </div>

            {/* Admin-Only Manage Tags Footer Action */}
            {currentUser.role === 'admin' && (
              <div className="pt-3 border-t border-[#1f2235] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsManageTagsOpen(true)}
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/50 border border-purple-500/40 text-purple-200 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Settings2 className="w-3.5 h-3.5 text-purple-300 shrink-0" />
                  <span>Configure Solution Tags (Admin)</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Right Panel: Live Matching Temples Grid (Mirrors TemplesList) */}
        <div
          className={`flex-1 min-w-0 space-y-4 w-full ${
            !isMobileFrame
              ? 'md:h-full md:overflow-y-auto no-scrollbar overscroll-contain pr-1 pb-16'
              : 'pb-10'
          }`}
        >
          {validSelectedIds.length === 0 ? (
            /* Guidance & Quick-Start View */
            <div className="p-6 sm:p-8 rounded-2xl bg-[#141624] border border-[#23273d] space-y-5">
              <div className="space-y-1.5">
                <h3 className="text-base sm:text-lg font-bold text-gray-100">
                  Astrologer Consultation — Temple Solution Finder
                </h3>
                <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
                  Select one or more client problems on the left to prescribe matching temples. Use{' '}
                  <strong className="text-amber-300">+ Add Problem</strong> to stack multiple issues dynamically.
                </p>
              </div>

              {solutionTags.length > 0 && (
                <div className="space-y-2.5 pt-2 border-t border-[#22263b]">
                  <span className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Quick Pick Configured Problems
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {solutionTags.map(tag => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleQuickSelectTag(tag.id)}
                        className="px-3.5 py-2 rounded-xl bg-[#1a1d2e] hover:bg-amber-500/15 border border-[#2d324d] hover:border-amber-500/60 text-xs font-tamil font-medium text-gray-100 hover:text-amber-200 transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#f5a623]" />
                        <span>{tag.nameTamil}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Active Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-2xl bg-[#141624] border border-[#25283f] text-xs">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="text-gray-400 font-medium">
                    {matchMode === 'all' ? 'Matching all:' : 'Best match for:'}
                  </span>
                  <span className="font-tamil text-amber-300 font-semibold">
                    {validSelectedIds
                      .map(id => solutionTags.find(t => t.id === id)?.nameTamil || id)
                      .join(' · ')}
                  </span>
                  <span className="text-gray-600" aria-hidden="true">·</span>
                  <span className="text-gray-300 tabular-nums">
                    {displayedResults.length} {displayedResults.length === 1 ? 'temple' : 'temples'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleReset}
                  className="text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 whitespace-nowrap cursor-pointer text-xs self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              </div>

              {displayedResults.length > 0 ? (
                <div
                  className={`grid gap-4 ${
                    isMobileFrame
                      ? 'grid-cols-1'
                      : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-3'
                  }`}
                >
                  {displayedResults.map(({ temple, matchedIds }) => (
                    <TempleCard
                      key={temple.id}
                      temple={temple}
                      matchedSolutionTagIds={matchedIds}
                      totalRequestedSolutions={validSelectedIds.length}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-14 px-4 rounded-2xl bg-[#141624] border border-[#22253a] space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                    <SlidersHorizontal className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-gray-100">
                    {matchMode === 'all' && rankedAnyMatches.length > 0
                      ? 'No single temple matches all selected problems'
                      : 'No temples are tagged with these problems yet'}
                  </h3>
                  <p className="text-xs text-gray-400 max-w-md mx-auto leading-relaxed">
                    {matchMode === 'all' && rankedAnyMatches.length > 0
                      ? `${rankedAnyMatches.length} temple(s) solve at least one of these problems individually.`
                      : 'Assign problem tags to temples in Add / Edit Temple so astrologers can prescribe them here.'}
                  </p>
                  <div className="pt-1 flex flex-wrap justify-center gap-2.5">
                    {matchMode === 'all' && rankedAnyMatches.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setMatchMode('any')}
                        className="px-4 py-2 rounded-xl bg-[#f5a623] hover:bg-[#e69818] text-black font-bold text-xs cursor-pointer"
                      >
                        Switch to Best Match ({rankedAnyMatches.length})
                      </button>
                    )}
                    {currentUser.role !== 'user' && (
                      <button
                        type="button"
                        onClick={openAddModal}
                        className="px-4 py-2 rounded-xl bg-[#1e2236] hover:bg-[#262b44] text-gray-200 border border-[#303554] text-xs font-semibold cursor-pointer"
                      >
                        + Add Temple
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 rounded-xl bg-[#1a1d2d] hover:bg-[#24283e] text-gray-300 text-xs font-semibold cursor-pointer"
                    >
                      Reset Selection
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Admin Manage Solution Tags Modal */}
      {isManageTagsOpen &&
        currentUser.role === 'admin' &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-150"
            onClick={() => setIsManageTagsOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label="Configure Solution Tags"
              className="w-full max-w-xl max-h-[88dvh] overflow-y-auto bg-[#141624] border border-[#2b2f47] rounded-2xl shadow-2xl p-5"
              onClick={(e) => e.stopPropagation()}
            >
              <AdminSolutionTagsPanel
                compact
                onClose={() => setIsManageTagsOpen(false)}
              />
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
