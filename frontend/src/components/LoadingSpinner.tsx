import React from 'react';

interface LoadingSpinnerProps {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  text?: string;
  subtext?: string;
  className?: string;
  fullScreen?: boolean;
  color?: string;
}

/**
 * Authentic Tamil Nadu Temple Tower (ராஜகோபுரம் - Raja Gopuram)
 * Distinct Dravidian architectural silhouette with 7 apex Kalasams,
 * tapering ornamental tiers, sanctum torana doorway, and stone plinth.
 */
export const TempleLogoSvg: React.FC<{ className?: string; color?: string }> = ({
  className = "w-8 h-8",
  color = "#f5a623"
}) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
    {/* 7 Sacred Kalasams on top */}
    <path d="M14 6L16 11H12L14 6Z" fill={color} />
    <circle cx="14" cy="5" r="1" fill={color} />
    <path d="M20 5L22 11H18L20 5Z" fill={color} />
    <circle cx="20" cy="4" r="1.1" fill={color} />
    <path d="M26 4L28 11H24L26 4Z" fill={color} />
    <circle cx="26" cy="3" r="1.2" fill={color} />
    {/* Center Maha Kalasam */}
    <path d="M32 3L34.5 11H29.5L32 3Z" fill={color} />
    <circle cx="32" cy="2" r="1.5" fill={color} />
    <path d="M38 4L40 11H36L38 4Z" fill={color} />
    <circle cx="38" cy="3" r="1.2" fill={color} />
    <path d="M44 5L46 11H42L44 5Z" fill={color} />
    <circle cx="44" cy="4" r="1.1" fill={color} />
    <path d="M50 6L52 11H48L50 6Z" fill={color} />
    <circle cx="50" cy="5" r="1" fill={color} />

    {/* Top ridge beam */}
    <rect x="10" y="11" width="44" height="2" rx="0.5" fill={color} />

    {/* Tier 1 */}
    <path d="M22 13H42L44 19H20L22 13Z" fill={color} />
    <rect x="30.5" y="14.5" width="3" height="3" rx="0.5" fill="#0d0f18" />

    {/* Tier 2 */}
    <path d="M18 19H46L48 26H16L18 19Z" fill={color} />
    <rect x="23" y="21" width="3" height="3.5" rx="0.5" fill="#0d0f18" />
    <rect x="30.5" y="21" width="3" height="3.5" rx="0.5" fill="#0d0f18" />
    <rect x="38" y="21" width="3" height="3.5" rx="0.5" fill="#0d0f18" />

    {/* Tier 3 */}
    <path d="M14 26H50L52 34H12L14 26Z" fill={color} />
    <rect x="19" y="28.5" width="4" height="4" rx="0.5" fill="#0d0f18" />
    <rect x="26" y="28.5" width="3.5" height="4" rx="0.5" fill="#0d0f18" />
    <rect x="34.5" y="28.5" width="3.5" height="4" rx="0.5" fill="#0d0f18" />
    <rect x="41" y="28.5" width="4" height="4" rx="0.5" fill="#0d0f18" />

    {/* Tier 4 */}
    <path d="M10 34H54L56 44H8L10 34Z" fill={color} />
    <rect x="16" y="37" width="4" height="4.5" rx="0.5" fill="#0d0f18" />
    <rect x="24" y="37" width="4" height="4.5" rx="0.5" fill="#0d0f18" />
    <rect x="36" y="37" width="4" height="4.5" rx="0.5" fill="#0d0f18" />
    <rect x="44" y="37" width="4" height="4.5" rx="0.5" fill="#0d0f18" />

    {/* Grand Gateway Base */}
    <path d="M6 44H58L60 58H4L6 44Z" fill={color} />
    {/* Sanctum Doorway (Gopura Vaasal) */}
    <path d="M26 58V48C26 44.7 28.7 42 32 42C35.3 42 38 44.7 38 48V58H26Z" fill="#0d0f18" />
    {/* Architectural pillar moldings */}
    <rect x="12" y="47" width="3" height="9" rx="0.5" fill="#0d0f18" />
    <rect x="49" y="47" width="3" height="9" rx="0.5" fill="#0d0f18" />

    {/* Sacred Foundation Plinth */}
    <rect x="2" y="58" width="60" height="4" rx="1" fill="#e09217" />
  </svg>
);

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text = 'Loading...',
  subtext,
  className = '',
  fullScreen = false,
  color = '#f5a623',
}) => {
  const sizeConfig = {
    xs: {
      circle: 'w-6 h-6',
      logo: 'w-3.5 h-3.5',
      borderWidth: 'border-[1.5px]',
      textSize: 'text-[10px]',
      subtextSize: 'text-[9px]',
      gap: 'gap-1',
    },
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
      borderWidth: 'border-[3px]',
      textSize: 'text-base',
      subtextSize: 'text-xs',
      gap: 'gap-3.5',
    },
  }[size];

  const content = (
    <div className={`flex flex-col items-center justify-center ${sizeConfig.gap} select-none ${className}`}>
      {/* Circle with Tamil Nadu Temple Tower in the middle */}
      <div className={`relative ${sizeConfig.circle} flex items-center justify-center shrink-0`}>
        {/* Soft celestial glow behind circle */}
        {size !== 'xs' && (
          <div className="absolute inset-0 rounded-full bg-amber-500/15 blur-md animate-pulse" />
        )}

        {/* Circular background track */}
        <div className={`absolute inset-0 rounded-full ${sizeConfig.borderWidth} border-amber-500/20 bg-[#121422]/90 shadow-inner`} />

        {/* Animated outer spinning circular ring */}
        <div
          className={`absolute inset-0 rounded-full ${sizeConfig.borderWidth} border-transparent border-t-amber-400 border-r-amber-500/80 animate-spin`}
          style={{ animationDuration: '1.1s' }}
        />

        {/* Subtle counter-rotating dashed accent (for sm, md, lg) */}
        {size !== 'xs' && (
          <div
            className="absolute inset-1 rounded-full border border-dashed border-amber-400/25 animate-spin"
            style={{ animationDuration: '3.5s', animationDirection: 'reverse' }}
          />
        )}

        {/* Tamil Nadu Temple Tower (Gopuram) in the exact middle of the circle */}
        <div className="relative z-10 flex items-center justify-center animate-pulse">
          <TempleLogoSvg className={sizeConfig.logo} color={color} />
        </div>
      </div>

      {/* Text underneath loading circle */}
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#07090f]/90 backdrop-blur-md">
        {content}
      </div>
    );
  }

  return content;
};
