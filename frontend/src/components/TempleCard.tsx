import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Play, MoreVertical, Share2, Edit3, Trash2, Info } from 'lucide-react';
import { Temple } from '../types';
import { PLANETS, DEITIES } from '../data/constants';
import { useApp } from '../context/AppContext';

interface TempleCardProps {
  temple: Temple;
}

export const TempleCard: React.FC<TempleCardProps> = ({ temple }) => {
  const {
    currentUser,
    openEditModal,
    openDetailModal,
    openVideoModal,
    deleteTemple,
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const canEdit = currentUser.role === 'contributor' || currentUser.role === 'admin';
  const canDelete = currentUser.role === 'admin';

  // Close 3-dot menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(
        `Check out ${temple.name} (${temple.nameTamil}) on Mupporul: ${window.location.origin}`
      );
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2000);
    }
  };

  const deityObj = DEITIES.find(d => d.id === temple.deity);

  return (
    <article className="rounded-2xl bg-[#161825] border border-[#272a3d] overflow-hidden shadow-lg hover:border-[#383d58] transition-all flex flex-col">
      {/* Temple Banner Image with 3-dot action menu */}
      <div className="relative aspect-[16/9] w-full bg-[#10121d] overflow-hidden">
        <img
          src={temple.imageUrl}
          alt={temple.name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105 cursor-pointer"
          loading="lazy"
          onClick={() => openDetailModal(temple)}
        />

        {/* Gradient Overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#161825] via-transparent to-black/30 pointer-events-none" />

        {/* 3-dot Action Menu Button (Top Right) */}
        <div className="absolute top-3 right-3 z-10" ref={menuRef}>
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="More options"
            className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-gray-200 hover:text-white flex items-center justify-center border border-white/10 hover:bg-black/70 transition-colors shadow-md cursor-pointer"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {/* 3-dot Dropdown */}
          {isMenuOpen && (
            <div className="absolute right-0 mt-1.5 w-48 rounded-xl bg-[#1b1e2e] border border-[#31364e] shadow-xl py-1.5 z-20 text-xs">
              <button
                onClick={() => {
                  openDetailModal(temple);
                  setIsMenuOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:bg-[#252a3f] text-left cursor-pointer"
              >
                <Info className="w-3.5 h-3.5 text-amber-400" />
                <span>View Full Details</span>
              </button>

              {canEdit && (
                <button
                  onClick={() => {
                    openEditModal(temple);
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-amber-300 hover:bg-[#252a3f] text-left font-medium cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Temple ({currentUser.role})</span>
                </button>
              )}

              <button
                onClick={handleShare}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-gray-200 hover:bg-[#252a3f] text-left cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>{copiedShare ? 'Copied link!' : 'Share Temple'}</span>
              </button>

              {canDelete && (
                <button
                  onClick={() => {
                    if (confirm(`Admin Action: Are you sure you want to delete ${temple.name}?`)) {
                      deleteTemple(temple.id);
                    }
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-red-400 hover:bg-red-950/40 text-left border-t border-[#2d3249] mt-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Temple (Admin)</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Temple Title (English) */}
          <div className="cursor-pointer" onClick={() => openDetailModal(temple)}>
            <h3 className="text-lg font-bold text-gray-100 leading-snug hover:text-amber-400 transition-colors">
              {temple.name}
            </h3>
          </div>

          {/* Location */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#f5a623] flex-shrink-0" />
            <span className="truncate">{temple.location}</span>
          </div>

          {/* Associated Planet & Deity Badges */}
          <div className="flex items-center gap-1.5 flex-wrap mt-3">
            {temple.planets.map(planetId => {
              const p = PLANETS.find(x => x.id === planetId);
              if (!p) return null;
              return (
                <span
                  key={p.id}
                  className="px-2.5 py-0.5 rounded-full text-xs font-tamil text-[#f5a623] bg-[#1a1c29] border border-[#f5a623]/60 font-medium tracking-wide shadow-sm"
                  title={`${p.nameEnglish} - ${p.grahaLord}`}
                >
                  {p.nameTamil}
                </span>
              );
            })}

            {deityObj && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-tamil text-gray-300 bg-[#202334] border border-[#353952]">
                {deityObj.nameTamil}
              </span>
            )}
          </div>
        </div>

        {/* Bottom Actions Row (Matching Screenshot 1) */}
        <div className="mt-4 pt-3 border-t border-[#24273a] flex items-center justify-between">
          {/* "Watch this video" Link */}
          <button
            onClick={() => openVideoModal(temple.videoUrl, temple.name)}
            className="flex items-center gap-2 group cursor-pointer text-left"
          >
            <div className="w-6 h-6 rounded-full bg-[#f5a623] flex items-center justify-center text-black group-hover:scale-110 transition-transform shadow-md shadow-amber-500/20">
              <Play className="w-3 h-3 fill-black ml-0.5" />
            </div>
            <span className="text-xs font-semibold text-[#f5a623] underline decoration-[#f5a623]/60 group-hover:decoration-[#f5a623] transition-colors">
              Watch this video
            </span>
          </button>

          {/* "Details" Button -> Opens drawer / modal with X icon on click */}
          <button
            onClick={() => openDetailModal(temple)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium text-amber-300 border border-amber-500/50 hover:bg-amber-500/10 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            <span>Details</span>
            <Info className="w-3.5 h-3.5 text-amber-400" />
          </button>
        </div>
      </div>
    </article>
  );
};
