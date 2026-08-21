import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
  white?: boolean;
}

export const LogoIcon = ({ className = '', size = 48, white = false }: LogoIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="FormEasy"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="markGradIcon" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={white ? '#FFFFFF' : '#1B2559'} />
          <stop offset="100%" stopColor={white ? '#E0E7FF' : '#111834'} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="120" height="120" rx="28" fill={white ? 'rgba(255,255,255,0.15)' : 'url(#markGradIcon)'} />
      {/* back sheet */}
      <g transform="rotate(-9 40 60)">
        <rect x="22" y="24" width="58" height="72" rx="6" fill={white ? 'rgba(255,255,255,0.2)' : '#2B3466'} />
      </g>
      {/* middle sheet */}
      <g transform="rotate(6 46 60)">
        <rect x="26" y="22" width="58" height="72" rx="6" fill={white ? 'rgba(255,255,255,0.3)' : '#3B4583'} />
      </g>
      {/* front sheet */}
      <rect x="30" y="20" width="60" height="76" rx="7" fill={white ? '#FFFFFF' : '#F5F4FF'} />
      <rect x="40" y="34" width="30" height="5.5" rx="2.75" fill={white ? '#C7D2FE' : '#B9B6E8'} />
      <rect x="40" y="46" width="40" height="5.5" rx="2.75" fill="#111834" opacity="0.8" />
      <rect x="40" y="57" width="40" height="5.5" rx="2.75" fill="#111834" opacity="0.35" />
      <rect x="40" y="68" width="26" height="5.5" rx="2.75" fill="#111834" opacity="0.35" />
      <rect x="40" y="79" width="34" height="5.5" rx="2.75" fill="#111834" opacity="0.35" />
      {/* checkmark badge */}
      <circle cx="90" cy="90" r="21" fill="#14B8A6" stroke={white ? 'rgba(255,255,255,0.3)' : '#111834'} strokeWidth="4" />
      <path
        d="M80 90 L87 97 L101 82"
        fill="none"
        stroke="#F5F4FF"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
