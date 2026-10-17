import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Clock,
  Play,
  Bookmark,
  Share2,
  Sparkles,
  Phone,
  Compass,
  Edit3,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PLANETS, DEITIES } from '../data/constants';

export const TempleDetailModal: React.FC = () => {
  const {
    selectedTempleForDetail,
    closeDetailModal,
    openVideoModal,
    openEditModal,
    currentUser,
    toggleBookmark,
    bookmarkedIds,
    isMobileFrame,
  } = useApp();

  const [copiedShare, setCopiedShare] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeDetailModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeDetailModal]);

  if (!selectedTempleForDetail) return null;

  const temple = selectedTempleForDetail;
  const isBookmarked = bookmarkedIds.includes(temple.id);
  const canEdit = currentUser.role === 'contributor' || currentUser.role === 'admin';
  const deityObj = DEITIES.find(d => d.id === temple.deity);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Discover ${temple.name} (${temple.nameTamil || ''}) on Mupporul: ${window.location.origin}`
      );
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200 ${
        isMobileFrame
          ? 'items-end sm:items-center p-0 sm:p-4'
          : 'items-end md:items-center p-0 md:p-6'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) closeDetailModal();
      }}
    >
      <div
        className={`w-full bg-[#141624] border border-[#2b2f47] shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isMobileFrame
            ? 'max-w-md rounded-t-3xl sm:rounded-3xl max-h-[92vh]'
            : 'max-w-2xl lg:max-w-3xl rounded-t-3xl md:rounded-3xl max-h-[92vh] md:max-h-[90vh]'
        }`}
      >
        {/* Mobile Drawer Pull Indicator */}
        <div className="w-full flex justify-center pt-2.5 pb-1 md:hidden bg-[#141624]">
          <div className="w-12 h-1 rounded-full bg-gray-500/40" />
        </div>

        {/* Modal / Drawer Header (Matching Add New Temple Modal style with X icon) */}
        <div
          className={`flex items-center justify-between border-b border-[#24273c] bg-[#141624] shrink-0 ${
            isMobileFrame ? 'px-4 py-3' : 'px-5 sm:px-6 py-3.5 sm:py-4'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-[#f5a623] flex items-center justify-center font-bold shrink-0 text-sm">
              🕉️
            </span>
            <div className="min-w-0">
              <h2 className={`font-bold text-gray-100 truncate ${isMobileFrame ? 'text-base' : 'text-base sm:text-lg'}`}>
                {temple.name}
              </h2>
              <div className="flex items-center gap-1.5 text-[11px] text-amber-400 truncate">
                <MapPin className="w-3 h-3 text-[#f5a623] shrink-0" />
                <span className="truncate">{temple.location}</span>
              </div>
            </div>
          </div>

          {/* Right Header Actions: Bookmark, Share & X Close Button */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => toggleBookmark(temple.id)}
              aria-label="Bookmark temple"
              title={isBookmarked ? 'Saved to bookmarks' : 'Save temple'}
              className="w-8 h-8 rounded-full bg-[#1e2133] hover:bg-[#282d46] text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
            </button>

            <button
              onClick={handleShare}
              aria-label="Share temple"
              title={copiedShare ? 'Copied link!' : 'Share link'}
              className="w-8 h-8 rounded-full bg-[#1e2133] hover:bg-[#282d46] text-gray-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              {copiedShare ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={closeDetailModal}
              aria-label="Close"
              className="w-8 h-8 rounded-full bg-[#1e2133] hover:bg-[#282d46] text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 flex-1">
          {/* Temple Hero Banner: Kept on Fluid Wide desktop, hidden on Mobile viewport to save massive space */}
          <div className={`${isMobileFrame ? 'hidden' : 'hidden md:block'} relative aspect-[16/9] w-full rounded-2xl bg-[#0d0f18] overflow-hidden border border-[#23273c]`}>
            <img
              src={temple.imageUrl}
              alt={temple.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141624] via-transparent to-black/30 pointer-events-none" />

            {/* Floating Video Watch Button */}
            {temple.videoUrl && (
              <button
                onClick={() => openVideoModal(temple.videoUrl, temple.name)}
                className="absolute bottom-3 right-3 flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-[#f5a623] hover:bg-[#e69818] text-black font-bold text-xs shadow-lg shadow-amber-500/30 transition-transform hover:scale-105 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                <span>Watch Video Tour</span>
              </button>
            )}

            <div className="absolute bottom-3 left-3">
              <span className="px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-md text-amber-300 text-[11px] font-semibold border border-white/10">
                {temple.location}
              </span>
            </div>
          </div>

          {/* Mobile-Only Top Compact Bar: Quick Video Tour Button & Location Pill (saves vertical space) */}
          <div className={`${isMobileFrame ? 'flex' : 'flex md:hidden'} items-center justify-between gap-2 bg-[#181b2c] px-3.5 py-2.5 rounded-xl border border-[#282d44]`}>
            <div className="flex items-center gap-1.5 min-w-0 text-xs text-amber-300">
              <MapPin className="w-3.5 h-3.5 text-[#f5a623] shrink-0" />
              <span className="truncate">{temple.location}</span>
            </div>
            {temple.videoUrl && (
              <button
                onClick={() => openVideoModal(temple.videoUrl, temple.name)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f5a623] hover:bg-[#e69818] text-black font-bold text-xs shadow-md shadow-amber-500/20 shrink-0 cursor-pointer active:scale-95 transition-transform"
              >
                <Play className="w-3 h-3 fill-black ml-0.5" />
                <span>Video Tour</span>
              </button>
            )}
          </div>

          {/* Significance & Remedies (Hidden on cards, showcased here in full glory) */}
          {(temple.significance || temple.descriptionTamil) && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-[#1c1b27] to-[#151726] border border-amber-500/40 space-y-2 shadow-inner">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                <span>சிறப்பு & பரிகார பலன்கள் (Significance & Remedies)</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-100 leading-relaxed font-tamil whitespace-pre-line font-medium">
                {temple.significance || temple.descriptionTamil}
              </p>
              {temple.descriptionEnglish && (
                <p className="text-xs text-gray-400 leading-relaxed italic pt-2 border-t border-amber-500/20">
                  "{temple.descriptionEnglish}"
                </p>
              )}
            </div>
          )}

          {/* Planet (Grahas) & Deity Affiliations */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Navagraha & Deity Affiliation
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {temple.planets.map(planetId => {
                const p = PLANETS.find(x => x.id === planetId);
                if (!p) return null;
                return (
                  <div
                    key={p.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b1e2e] border border-[#f5a623]/60 text-xs shadow-sm"
                  >
                    <span className="font-tamil font-bold text-[#f5a623]">{p.nameTamil}</span>
                    <span className="text-[10px] text-gray-400 border-l border-gray-700 pl-1.5">
                      {p.day}
                    </span>
                  </div>
                );
              })}

              {deityObj && (
                <div className="px-3 py-1.5 rounded-xl bg-[#1e2136] border border-[#3b4060] text-xs font-tamil text-gray-200">
                  மூலவர்: {deityObj.nameTamil}
                </div>
              )}
            </div>
          </div>

          {/* Darshan Timings & Pooja Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3.5 rounded-2xl bg-[#181a29] border border-[#272a40] space-y-1.5">
              <div className="flex items-center gap-2 text-amber-400 font-semibold">
                <Clock className="w-4 h-4" />
                <span>தரிசன நேரம் (Timings)</span>
              </div>
              <p className="text-gray-300 font-tamil leading-relaxed">{temple.timings}</p>
            </div>

            {temple.poojaDetails && (
              <div className="p-3.5 rounded-2xl bg-[#181a29] border border-[#272a40] space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 font-semibold">
                  <span>🪔</span>
                  <span>விசேஷ பூஜைகள் (Poojas)</span>
                </div>
                <p className="text-gray-300 font-tamil leading-relaxed">{temple.poojaDetails}</p>
              </div>
            )}
          </div>

          {/* Sthala Puranam / History */}
          {temple.history && (
            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-gray-300 uppercase tracking-wider block">
                தல வரலாறு (Temple History & Legend)
              </span>
              <p className="text-gray-300 leading-relaxed bg-[#181a29] p-3.5 rounded-2xl border border-[#272a40]">
                {temple.history}
              </p>
            </div>
          )}

          {/* Contact or Location */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-gray-400">
            {temple.contactNumber && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400" />
                <span>Contact: {temple.contactNumber}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              <span>{temple.location} ({temple.state})</span>
            </div>
          </div>

          {/* Contributor / Verification info */}
          <div className="pt-2 text-[11px] text-gray-500 border-t border-[#1f2235]">
            {temple.submittedBy?.name ? (
              <span>Contributed by <strong className="text-gray-400">{temple.submittedBy.name}</strong> ({temple.submittedBy.role})</span>
            ) : (
              <span>Mupporul Verified Temple Sanctuary</span>
            )}
          </div>
        </div>

        {/* Bottom Actions Bar */}
        <div className="p-3.5 sm:p-4 border-t border-[#24273c] bg-[#111320] flex items-center justify-between shrink-0">
          <div>
            {canEdit && (
              <button
                onClick={() => {
                  closeDetailModal();
                  openEditModal(temple);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-semibold hover:bg-amber-500/25 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Temple ({currentUser.role})</span>
              </button>
            )}
          </div>

          <button
            onClick={closeDetailModal}
            className="px-6 py-2 rounded-xl bg-[#202336] hover:bg-[#282d46] text-gray-200 text-xs font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
