import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  white?: boolean;
}

export const Logo = ({ className = '', size = 'md', white = false }: LogoProps) => {
  const sizes = {
    sm: { width: 200, height: 56 },
    md: { width: 280, height: 78 },
    lg: { width: 360, height: 100 },
  };

  const { width, height } = sizes[size];

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 520 140"
      xmlns="http://www.w3.org/2000/svg"
      className={`max-w-full h-auto ${className}`}
      aria-label="FormEasy logo"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="markGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={white ? '#FFFFFF' : '#1B2559'} />
          <stop offset="100%" stopColor={white ? '#E0E7FF' : '#111834'} />
        </linearGradient>
      </defs>

      {/* ICON MARK */}
      <g transform="translate(10,10)">
        <rect x="0" y="0" width="120" height="120" rx="28" fill={white ? 'rgba(255,255,255,0.15)' : 'url(#markGrad)'} />

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
      </g>

      {/* WORDMARK */}
      <g transform="translate(150,0)" fontFamily="'Poppins','Sora',sans-serif" fontWeight="700">
        <text x="0" y="82" fontSize="52" fill={white ? '#FFFFFF' : '#111834'}>
          Form
          <tspan fill="#14B8A6">Easy</tspan>
        </text>
        <text
          x="2"
          y="106"
          fontSize="14"
          fontWeight="500"
          letterSpacing="2.5"
          fill={white ? 'rgba(255,255,255,0.7)' : '#6B7280'}
          fontFamily="'Inter',sans-serif"
        >
          EVERY FORM. ONE PLATFORM.
        </text>
      </g>
    </svg>
  );
};
