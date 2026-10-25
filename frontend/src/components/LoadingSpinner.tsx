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
 * Authentic South Indian Dravidian Temple Tower (ராஜகோபுரம் - Raja Gopuram)
 * Modeled after the iconic Srirangam Sri Ranganathaswamy Rajagopuram:
 * - Sacred barrel-vaulted Sala Shikhara crown with upturned Makara horns
 * - Row of 9 sacred golden Kalasams (finials / stupis) atop the ridge
 * - 7 multi-tiered ornamental Talams with curved Kapota cornices & central Bhadra niches
 * - Grand Dravidian stone gateway (Maha Dwaram) with fluted pillars and layered Adhishthana plinth
 */
export const TempleLogoSvg: React.FC<{ className?: string; color?: string }> = ({
  className = "w-8 h-8",
  color = "#f5a623"
}) => {
  const gradId = React.useId();
  const goldGrad = `gopuramGold-${gradId}`;
  const highlightGrad = `gopuramHigh-${gradId}`;
  const deepGrad = `gopuramDeep-${gradId}`;
  const pillarGrad = `gopuramPillar-${gradId}`;

  return (
    <svg viewBox="0 0 100 100" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Rich temple gold linear gradient */}
        <linearGradient id={goldGrad} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="45%" stopColor={color} />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Shimmering horizontal cornice highlight */}
        <linearGradient id={highlightGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#b45309" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>

        {/* Deep dark tone for niche recesses and inner sanctum */}
        <linearGradient id={deepGrad} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0a0c16" />
          <stop offset="100%" stopColor="#141829" />
        </linearGradient>

        {/* Stone pillar fluting */}
        <linearGradient id={pillarGrad} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#d97706" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
      </defs>

      {/* ============================================================== */}
      {/* 1. NINE SACRED APEX KALASAMS (பொற்கலசங்கள் - Golden Stupis)     */}
      {/* ============================================================== */}
      {/* Center Maha Kalasam (Tallest) */}
      <path d="M50 4.5 L51.2 8.5 H48.8 Z" fill={`url(#${goldGrad})`} />
      <circle cx="50" cy="8.8" r="1.3" fill="#fef08a" />
      <path d="M48.5 9.8 H51.5 L52 11.5 H48 Z" fill={`url(#${goldGrad})`} />
      <circle cx="50" cy="3.8" r="0.8" fill="#fef08a" />

      {/* Flanking Kalasams Pair 1 (X: 44, 56) */}
      <path d="M44 5.5 L45 9 H43 Z" fill={`url(#${goldGrad})`} />
      <circle cx="44" cy="9.2" r="1.1" fill={`url(#${goldGrad})`} />
      <path d="M42.8 10 H45.2 L45.6 11.5 H42.4 Z" fill={`url(#${goldGrad})`} />
      <circle cx="44" cy="4.8" r="0.7" fill="#fef08a" />

      <path d="M56 5.5 L57 9 H55 Z" fill={`url(#${goldGrad})`} />
      <circle cx="56" cy="9.2" r="1.1" fill={`url(#${goldGrad})`} />
      <path d="M54.8 10 H57.2 L57.6 11.5 H54.4 Z" fill={`url(#${goldGrad})`} />
      <circle cx="56" cy="4.8" r="0.7" fill="#fef08a" />

      {/* Flanking Kalasams Pair 2 (X: 38, 62) */}
      <path d="M38 6.5 L39 9.5 H37 Z" fill={`url(#${goldGrad})`} />
      <circle cx="38" cy="9.7" r="1" fill={`url(#${goldGrad})`} />
      <path d="M36.9 10.3 H39.1 L39.5 11.6 H36.5 Z" fill={`url(#${goldGrad})`} />
      <circle cx="38" cy="5.8" r="0.6" fill="#fef08a" />

      <path d="M62 6.5 L63 9.5 H61 Z" fill={`url(#${goldGrad})`} />
      <circle cx="62" cy="9.7" r="1" fill={`url(#${goldGrad})`} />
      <path d="M60.9 10.3 H63.1 L63.5 11.6 H60.5 Z" fill={`url(#${goldGrad})`} />
      <circle cx="62" cy="5.8" r="0.6" fill="#fef08a" />

      {/* Flanking Kalasams Pair 3 (X: 32, 68) */}
      <path d="M32 7.2 L33 10 H31 Z" fill={`url(#${goldGrad})`} />
      <circle cx="32" cy="10.2" r="0.9" fill={`url(#${goldGrad})`} />
      <path d="M31 10.7 H33 L33.4 11.8 H30.6 Z" fill={`url(#${goldGrad})`} />
      <circle cx="32" cy="6.6" r="0.5" fill="#fef08a" />

      <path d="M68 7.2 L69 10 H67 Z" fill={`url(#${goldGrad})`} />
      <circle cx="68" cy="10.2" r="0.9" fill={`url(#${goldGrad})`} />
      <path d="M67 10.7 H69 L69.4 11.8 H66.6 Z" fill={`url(#${goldGrad})`} />
      <circle cx="68" cy="6.6" r="0.5" fill="#fef08a" />

      {/* Outer Kalasams Pair 4 (X: 26, 74) */}
      <path d="M26 8 L27 10.5 H25 Z" fill={`url(#${goldGrad})`} />
      <circle cx="26" cy="10.7" r="0.8" fill={`url(#${goldGrad})`} />
      <circle cx="26" cy="7.4" r="0.5" fill="#fef08a" />

      <path d="M74 8 L75 10.5 H73 Z" fill={`url(#${goldGrad})`} />
      <circle cx="74" cy="10.7" r="0.8" fill={`url(#${goldGrad})`} />
      <circle cx="74" cy="7.4" r="0.5" fill="#fef08a" />

      {/* ============================================================== */}
      {/* 2. SALA SHIKHARA CROWN (Wagon-Vault Roof with Makara Horns)    */}
      {/* ============================================================== */}
      {/* Top horizontal crest beam */}
      <rect x="22" y="11.8" width="56" height="1.8" rx="0.8" fill="#fef08a" />

      {/* Distinct upturned Makara Horns (Left & Right top crests) */}
      <path
        d="M23 12 C18 10 16 7 18 5 C20 7 21 10 24 12 Z"
        fill={`url(#${goldGrad})`}
      />
      <circle cx="18" cy="5" r="1.1" fill="#fef08a" />

      <path
        d="M77 12 C82 10 84 7 82 5 C80 7 79 10 76 12 Z"
        fill={`url(#${goldGrad})`}
      />
      <circle cx="82" cy="5" r="1.1" fill="#fef08a" />

      {/* Vaulted barrel roof body */}
      <path
        d="M21 13.5 Q50 11.5 79 13.5 L80 18 Q50 16 20 18 Z"
        fill={`url(#${goldGrad})`}
      />
      {/* Crown arch niche (center medallion) */}
      <path
        d="M46 17.5 C46 14.5 48 13.2 50 13.2 C52 13.2 54 14.5 54 17.5 Z"
        fill={`url(#${deepGrad})`}
      />
      <circle cx="50" cy="15.2" r="1" fill="#fef08a" />

      {/* Crown bottom eave cornice */}
      <path d="M19 18 H81 L82 19.8 H18 Z" fill={`url(#${highlightGrad})`} />

      {/* ============================================================== */}
      {/* 3. MULTI-TIERED DRAVIDIAN TALAMS (Stepped Pyramidal Tiers)     */}
      {/* ============================================================== */}

      {/* TIER 1 (Top Tier, Y: 20 to 26) */}
      <path d="M22 20 H78 L79 25 H21 Z" fill={`url(#${goldGrad})`} />
      {/* Central shrine bay */}
      <rect x="46" y="21" width="8" height="4" rx="0.6" fill={`url(#${deepGrad})`} />
      <rect x="48.8" y="21.5" width="2.4" height="3" rx="0.4" fill="#fef08a" />
      {/* Side ornamental niches */}
      <rect x="29" y="21.8" width="4.5" height="3.2" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="66.5" y="21.8" width="4.5" height="3.2" rx="0.5" fill={`url(#${deepGrad})`} />
      {/* Tier 1 Kapota Eave */}
      <path d="M18.5 25 H81.5 L83 26.8 H17 Z" fill={`url(#${highlightGrad})`} />

      {/* TIER 2 (Y: 27 to 33.5) */}
      <path d="M20 27 H80 L82 32.5 H18 Z" fill={`url(#${goldGrad})`} />
      {/* Central shrine bay with arched crown */}
      <path d="M44.5 32.5 V29 C44.5 27.8 46.5 27.2 50 27.2 C53.5 27.2 55.5 27.8 55.5 29 V32.5 Z" fill={`url(#${deepGrad})`} />
      <path d="M48.5 32.5 V29.5 C48.5 28.8 49.2 28.3 50 28.3 C50.8 28.3 51.5 28.8 51.5 29.5 V32.5 Z" fill="#fef08a" />
      {/* Flanking kudu niches */}
      <rect x="26" y="28.5" width="4.8" height="3.5" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="35" y="28.5" width="4.5" height="3.5" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="60.5" y="28.5" width="4.5" height="3.5" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="69.2" y="28.5" width="4.8" height="3.5" rx="0.5" fill={`url(#${deepGrad})`} />
      {/* Tier 2 Kapota Eave */}
      <path d="M16 32.5 H84 L85.5 34.5 H14.5 Z" fill={`url(#${highlightGrad})`} />

      {/* TIER 3 (Y: 34.5 to 41.5) */}
      <path d="M17.5 34.5 H82.5 L84.5 40.5 H15.5 Z" fill={`url(#${goldGrad})`} />
      {/* Central pavilion niche */}
      <path d="M43.5 40.5 V36.5 C43.5 35 46 34.5 50 34.5 C54 34.5 56.5 35 56.5 36.5 V40.5 Z" fill={`url(#${deepGrad})`} />
      <rect x="47.5" y="37" width="5" height="3.5" rx="0.4" fill="#fef08a" />
      {/* Side niches & pilasters */}
      <rect x="23" y="36" width="4.8" height="4" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="32.5" y="36" width="4.5" height="4" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="63" y="36" width="4.5" height="4" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="72.2" y="36" width="4.8" height="4" rx="0.5" fill={`url(#${deepGrad})`} />
      {/* Tier 3 Kapota Eave */}
      <path d="M13.5 40.5 H86.5 L88.2 42.6 H11.8 Z" fill={`url(#${highlightGrad})`} />

      {/* TIER 4 (Y: 42.6 to 50) */}
      <path d="M15 42.6 H85 L87.5 49 H12.5 Z" fill={`url(#${goldGrad})`} />
      {/* Central shrine projection */}
      <path d="M42.5 49 V44.8 C42.5 43.2 45.5 42.5 50 42.5 C54.5 42.5 57.5 43.2 57.5 44.8 V49 Z" fill={`url(#${deepGrad})`} />
      <path d="M47 49 V45.5 C47 44.8 48.2 44.2 50 44.2 C51.8 44.2 53 44.8 53 45.5 V49 Z" fill="#fef08a" />
      {/* Side niches */}
      <rect x="20" y="44.2" width="5" height="4.2" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="30" y="44.2" width="4.8" height="4.2" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="65.2" y="44.2" width="4.8" height="4.2" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="75" y="44.2" width="5" height="4.2" rx="0.5" fill={`url(#${deepGrad})`} />
      {/* Tier 4 Kapota Eave */}
      <path d="M10.8 49 H89.2 L91 51.3 H9 Z" fill={`url(#${highlightGrad})`} />

      {/* TIER 5 (Y: 51.3 to 59) */}
      <path d="M12.2 51.3 H87.8 L90.5 58 H9.5 Z" fill={`url(#${goldGrad})`} />
      {/* Central shrine pavilion */}
      <path d="M41.5 58 V53.5 C41.5 51.8 44.8 51 50 51 C55.2 51 58.5 51.8 58.5 53.5 V58 Z" fill={`url(#${deepGrad})`} />
      <rect x="46.5" y="54" width="7" height="4" rx="0.5" fill="#fef08a" />
      {/* Side niches */}
      <rect x="17" y="52.8" width="5.2" height="4.5" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="27.5" y="52.8" width="5" height="4.5" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="67.5" y="52.8" width="5" height="4.5" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="77.8" y="52.8" width="5.2" height="4.5" rx="0.5" fill={`url(#${deepGrad})`} />
      {/* Tier 5 Kapota Eave */}
      <path d="M8 58 H92 L93.8 60.5 H6.2 Z" fill={`url(#${highlightGrad})`} />

      {/* TIER 6 / Transition Tier (Y: 60.5 to 68) */}
      <path d="M9.5 60.5 H90.5 L93 67 H7 Z" fill={`url(#${goldGrad})`} />
      {/* Central niche */}
      <path d="M40.5 67 V62.5 C40.5 60.8 44.5 60 50 60 C55.5 60 59.5 60.8 59.5 62.5 V67 Z" fill={`url(#${deepGrad})`} />
      <rect x="46" y="63" width="8" height="4" rx="0.5" fill="#fef08a" />
      {/* Side decorative columns */}
      <rect x="15" y="62" width="5.5" height="4.5" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="25.5" y="62" width="5.2" height="4.5" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="69.3" y="62" width="5.2" height="4.5" rx="0.5" fill={`url(#${deepGrad})`} />
      <rect x="79.5" y="62" width="5.5" height="4.5" rx="0.5" fill={`url(#${deepGrad})`} />
      {/* Massive Grand Cornice (Maha Kapota) over Entrance */}
      <path d="M5.5 67 H94.5 L96.5 70.2 H3.5 Z" fill={`url(#${highlightGrad})`} />

      {/* ============================================================== */}
      {/* 4. GRAND GATEWAY BASE & DWARAM (கோபுர வாசல் / Dvarasala)        */}
      {/* ============================================================== */}
      {/* Heavy stone plinth facade */}
      <rect x="5.5" y="70.2" width="89" height="22" fill={`url(#${goldGrad})`} />

      {/* Carved Dravidian Stone Pillars (Stambhas) on Left Wing */}
      <rect x="9" y="72" width="3.2" height="19.5" rx="0.4" fill={`url(#${pillarGrad})`} />
      <rect x="15.5" y="72" width="3.2" height="19.5" rx="0.4" fill={`url(#${pillarGrad})`} />
      <rect x="22" y="72" width="3.2" height="19.5" rx="0.4" fill={`url(#${pillarGrad})`} />
      <rect x="28.5" y="72" width="3.2" height="19.5" rx="0.4" fill={`url(#${pillarGrad})`} />

      {/* Carved Dravidian Stone Pillars on Right Wing */}
      <rect x="68.3" y="72" width="3.2" height="19.5" rx="0.4" fill={`url(#${pillarGrad})`} />
      <rect x="74.8" y="72" width="3.2" height="19.5" rx="0.4" fill={`url(#${pillarGrad})`} />
      <rect x="81.3" y="72" width="3.2" height="19.5" rx="0.4" fill={`url(#${pillarGrad})`} />
      <rect x="87.8" y="72" width="3.2" height="19.5" rx="0.4" fill={`url(#${pillarGrad})`} />

      {/* Grand Entrance Gateway Arch Surround (Gopura Vaasal Outer Arch) */}
      <path
        d="M35 91.5 V75 C35 71 41 68.5 50 68.5 C59 68.5 65 71 65 75 V91.5 H59 V77 C59 74 55 72.5 50 72.5 C45 72.5 41 74 41 77 V91.5 Z"
        fill={`url(#${highlightGrad})`}
      />

      {/* Deep Sanctum Gateway Opening (Dark Void showing inner sanctum) */}
      <path
        d="M41 91.5 V77.5 C41 74.2 44.8 72.8 50 72.8 C55.2 72.8 59 74.2 59 77.5 V91.5 Z"
        fill={`url(#${deepGrad})`}
      />

      {/* Inner gateway depth jamb perspective */}
      <path
        d="M43 91.5 V79 C43 76.5 46 75.2 50 75.2 C54 75.2 57 76.5 57 79 V91.5 Z"
        fill="#04050a"
      />

      {/* Doorway golden threshold beam */}
      <rect x="34" y="91" width="32" height="1.2" fill="#fef08a" />

      {/* ============================================================== */}
      {/* 5. SACRED FOUNDATION PLINTH (உபபீடம் / Adhishthana Base)        */}
      {/* ============================================================== */}
      {/* Upper moulded base band */}
      <rect x="4" y="92.2" width="92" height="2.5" rx="0.5" fill={`url(#${highlightGrad})`} />
      {/* Bottom foundation plinth */}
      <rect x="2" y="94.7" width="96" height="3" rx="0.8" fill={`url(#${goldGrad})`} />
      <rect x="1" y="97.7" width="98" height="1.5" rx="0.5" fill="#92400e" />
    </svg>
  );
};

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
      logo: 'w-7 h-7',
      borderWidth: 'border-2',
      textSize: 'text-xs',
      subtextSize: 'text-[10px]',
      gap: 'gap-2',
    },
    md: {
      circle: 'w-20 h-20',
      logo: 'w-11 h-11',
      borderWidth: 'border-[2.5px]',
      textSize: 'text-sm',
      subtextSize: 'text-xs',
      gap: 'gap-3',
    },
    lg: {
      circle: 'w-28 h-28',
      logo: 'w-16 h-16',
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
