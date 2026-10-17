import React from 'react';
import { X, Play, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VideoModal: React.FC = () => {
  const { videoModalUrl, closeVideoModal, isMobileFrame } = useApp();

  if (!videoModalUrl) return null;

  // Transform youtube url into embed if needed
  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      return url;
    } catch {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(videoModalUrl.url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className={`w-full bg-[#121422] rounded-3xl border border-[#272b42] shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
        isMobileFrame ? 'max-w-md' : 'max-w-2xl lg:max-w-3xl'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#22253a]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#f5a623] flex items-center justify-center text-black">
              <Play className="w-3 h-3 fill-black ml-0.5" />
            </div>
            <h3 className="text-sm font-bold text-gray-100 truncate max-w-[280px] sm:max-w-md">
              {videoModalUrl.title} — Video Tour
            </h3>
          </div>

          <button
            onClick={closeVideoModal}
            className="w-8 h-8 rounded-full bg-[#1b1e2f] text-gray-300 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Video Player Frame */}
        <div className="relative aspect-video w-full bg-black">
          {embedUrl.includes('youtube.com/embed') ? (
            <iframe
              src={embedUrl}
              title={videoModalUrl.title}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3">
              <Play className="w-12 h-12 text-[#f5a623]" />
              <p className="text-sm text-gray-300">
                Opening temple video stream for {videoModalUrl.title}
              </p>
              <a
                href={videoModalUrl.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f5a623] text-black font-semibold text-xs"
              >
                <span>Open in Video Player</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 bg-[#0d0f19] border-t border-[#1f2235] flex items-center justify-between text-xs text-gray-400">
          <span>Devotional Temple Darshan & Pariharam Documentary</span>
          <button
            onClick={closeVideoModal}
            className="text-amber-400 hover:underline font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
