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
  const neonGreen = '#16b35e';
  const neonCyan = '#06b6d4';
  const screenBg = white ? 'rgba(255,255,255,0.12)' : '#0d1420';
  const screenBorder = white ? 'rgba(255,255,255,0.25)' : '#1a2744';
  const standColor = white ? 'rgba(255,255,255,0.2)' : '#1a2744';
  const csColor = white ? '#FFFFFF' : '#16b35e';
  const cyberColor = white ? '#FFFFFF' : '#16b35e';
  const sevaColor = white ? 'rgba(255,255,255,0.85)' : '#e2e8f0';
  const tagColor = white ? 'rgba(255,255,255,0.5)' : '#64748b';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 620 160"
      xmlns="http://www.w3.org/2000/svg"
      className={`max-w-full h-auto ${className}`}
      aria-label="CyberSeva logo"
      style={{ display: 'block' }}
    >
      {/* ICON MARK — Monitor with CS */}
      <g className="logo-square">
        {/* Monitor Screen */}
        <rect x="14" y="18" width="112" height="78" rx="10" fill={screenBg} stroke={screenBorder} strokeWidth="2" />
        <rect x="18" y="22" width="104" height="70" rx="7" fill="none" stroke={neonGreen} strokeWidth="0.5" opacity="0.3" />
        
        {/* CS Text */}
        <text
          x="70"
          y="60"
          fontSize="34"
          fontWeight="800"
          fontFamily="'Sora','Poppins',sans-serif"
          fill={csColor}
          textAnchor="middle"
          dominantBaseline="central"
          letterSpacing="-1"
          className="logo-word"
        >
          CS
        </text>
        
        {/* Cursor blink */}
        <rect x="96" y="44" width="2" height="16" rx="1" fill={neonGreen} opacity="0.8" className="logo-bar logo-bar-1">
          <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="indefinite" />
        </rect>

        {/* Neon line */}
        <line x1="22" y1="92" x2="118" y2="92" stroke={neonGreen} strokeWidth="1.5" opacity="0.6" className="logo-bar logo-bar-2" />

        {/* Stand */}
        <rect x="50" y="96" width="40" height="8" rx="2" fill={standColor} className="logo-bar logo-bar-3" />
        <rect x="36" y="104" width="68" height="6" rx="3" fill={standColor} className="logo-bar logo-bar-4" />
      </g>

      {/* WORDMARK */}
      <g transform="translate(150,0)">
        <text
          x="0"
          y="80"
          fontSize="46"
          fontWeight="700"
          fontFamily="'Sora','Poppins',sans-serif"
          className="logo-word"
        >
          <tspan fill={cyberColor}>Cyber</tspan>
          <tspan fill={sevaColor}>Seva</tspan>
        </text>
        <text
          x="2"
          y="108"
          fontSize="12"
          fontWeight="500"
          letterSpacing="3"
          fill={tagColor}
          fontFamily="'Inter',sans-serif"
          className="logo-tagline"
        >
          ONLINE CYBER CAFE
        </text>
      </g>
    </svg>
  );
};
