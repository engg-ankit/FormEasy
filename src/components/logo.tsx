import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  white?: boolean;
}

export const Logo = ({ className = '', size = 'md', white = false }: LogoProps) => {
  const sizes = {
    sm: { width: 200, height: 52 },
    md: { width: 280, height: 72 },
    lg: { width: 360, height: 92 },
  };

  const { width, height } = sizes[size];

  // Colors
  const badgeBg = white ? 'rgba(255,255,255,0.15)' : '#1B2559';
  const badgeStroke = white ? 'rgba(255,255,255,0.3)' : '#2d3a7a';
  const cursorColor = '#FFFFFF';
  const accentDot = '#2DD4BF';
  // Text colors
  const clickColor = white ? '#FFFFFF' : '#1B2559';
  const nsitColor = white ? '#2DD4BF' : '#2DD4BF';
  const tagColor = white ? 'rgba(255,255,255,0.6)' : '#94a3b8';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 620 160"
      xmlns="http://www.w3.org/2000/svg"
      className={`max-w-full h-auto ${className}`}
      aria-label="ClickNsit logo"
      style={{ display: 'block' }}
    >
      {/* ICON MARK — Cursor in rounded square */}
      <g className="logo-square">
        {/* Badge */}
        <rect x="10" y="10" width="120" height="120" rx="28" fill={badgeBg} />
        <rect x="10" y="10" width="120" height="120" rx="28" fill="none" stroke={badgeStroke} strokeWidth="1.5" />

        {/* Cursor arrow */}
        <path
          d="M48 38 L48 90 L60 76 L75 96 L84 91 L69 72 L85 70 Z"
          fill={cursorColor}
          stroke={badgeStroke}
          strokeWidth="0.8"
          strokeLinejoin="round"
          className="logo-bar logo-bar-1"
        />

        {/* Click ripple */}
        <circle cx="84" cy="91" r="3.5" fill={accentDot} opacity="0.9" className="logo-bar logo-bar-2" />
        <circle cx="84" cy="91" r="7" fill="none" stroke={accentDot} strokeWidth="1" opacity="0.35" className="logo-bar logo-bar-3" />
      </g>

      {/* WORDMARK */}
      <g transform="translate(150,0)">
        <text
          x="0"
          y="78"
          fontSize="48"
          fontWeight="700"
          fontFamily="'Sora','Poppins',sans-serif"
          className="logo-word"
        >
          <tspan fill={clickColor}>Click</tspan>
          <tspan fill={nsitColor}>Nsit</tspan>
        </text>
        <text
          x="2"
          y="106"
          fontSize="12"
          fontWeight="500"
          letterSpacing="2.5"
          fill={tagColor}
          fontFamily="'Inter',sans-serif"
          className="logo-tagline"
        >
          CLICK. SIT. DONE.
        </text>
      </g>
    </svg>
  );
};
