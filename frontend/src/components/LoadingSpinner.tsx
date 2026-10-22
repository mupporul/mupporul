import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
  subtext?: string;
  className?: string;
  fullScreen?: boolean;
}

export const TempleLogoSvg: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg viewBox="0 0 48 48" fill="none" className={className}>
    {/* Kalasam top */}
    <path d="M24 2L21 6H27L24 2Z" fill="#f5a623" />
    <circle cx="24" cy="7.5" r="1.5" fill="#f5a623" />
    {/* Tier 1 */}
    <path d="M20 9H28L29 14H19L20 9Z" fill="#f5a623" />
    <rect x="23" y="10.5" width="2" height="3" fill="#0d0f18" />
    {/* Tier 2 */}
    <path d="M17 15H31L32 21H16L17 15Z" fill="#f5a623" />
    <rect x="20" y="16.5" width="2" height="3.5" fill="#0d0f18" />
    <rect x="26" y="16.5" width="2" height="3.5" fill="#0d0f18" />
    {/* Tier 3 */}
    <path d="M14 22H34L35 29H13L14 22Z" fill="#f5a623" />
    <rect x="18" y="24" width="2.5" height="4" fill="#0d0f18" />
    <rect x="23" y="24" width="2" height="4" fill="#0d0f18" />
    <rect x="27.5" y="24" width="2.5" height="4" fill="#0d0f18" />
    {/* Tier 4 Base */}
    <path d="M11 30H37L39 42H9L11 30Z" fill="#f5a623" />
    {/* Temple Doorway (Sanctum sanctorum) */}
    <path d="M20 42V34C20 31.8 21.8 30 24 30C26.2 30 28 31.8 28 34V42H20Z" fill="#0d0f18" />
    {/* Base plinth */}
    <rect x="7" y="42" width="34" height="4" rx="1" fill="#e09217" />
  </svg>
);

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  subtext,
  className = '',
  fullScreen = false,
}) => {
  const sizeConfig = {
    sm: {
      circle: 'w-12 h-12',
      logo: 'w-6 h-6',
      borderWidth: 'border-2',
      textSize: 'text-xs',
      subtextSize: 'text-[10px]',
      gap: 'gap-2',
    },
    md: {
      circle: 'w-20 h-20',
      logo: 'w-10 h-10',
      borderWidth: 'border-[2.5px]',
      textSize: 'text-sm',
      subtextSize: 'text-xs',
      gap: 'gap-3',
    },
    lg: {
      circle: 'w-28 h-28',
      logo: 'w-14 h-14',
      borderWidth: 'border-3',
      textSize: 'text-base',
      subtextSize: 'text-xs',
      gap: 'gap-4',
    },
  }[size];

  const content = (
    <div className={`flex flex-col items-center justify-center ${sizeConfig.gap} select-none ${className}`}>
      {/* Circle with Temple Logo in the middle */}
      <div className={`relative ${sizeConfig.circle} flex items-center justify-center`}>
        {/* Soft celestial glow */}
        <div className="absolute inset-0 rounded-full bg-amber-500/15 blur-md animate-pulse" />

        {/* Circular background track */}
        <div className={`absolute inset-0 rounded-full ${sizeConfig.borderWidth} border-amber-500/20 bg-[#121422]/90 shadow-inner`} />

        {/* Animated outer spinning spinner ring */}
        <div
          className={`absolute inset-0 rounded-full ${sizeConfig.borderWidth} border-transparent border-t-amber-400 border-r-amber-500/80 animate-spin`}
          style={{ animationDuration: '1.1s' }}
        />

        {/* Subtle counter-rotating dashed accent */}
        <div
          className={`absolute inset-1 rounded-full border border-dashed border-amber-400/30 animate-spin`}
          style={{ animationDuration: '3.5s', animationDirection: 'reverse' }}
        />

        {/* Temple Logo centered in the middle of the circle */}
        <div className="relative z-10 flex items-center justify-center transition-transform animate-pulse">
          <TempleLogoSvg className={sizeConfig.logo} />
        </div>
      </div>

      {/* Text underneath loading spinner */}
      {text && (
        <div className="text-center space-y-0.5">
          <p className={`${sizeConfig.textSize} font-semibold font-cinzel text-amber-300 tracking-widest uppercase animate-pulse`}>
            {text}
          </p>
          {subtext && (
            <p className={`${sizeConfig.subtextSize} text-gray-400 font-tamil`}>
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090f]/90 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
};
