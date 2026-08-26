import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
  white?: boolean;
}

export const LogoIcon = ({ className = '', size = 48, white = false }: LogoIconProps) => {
  const screenBg = white ? 'rgba(255,255,255,0.12)' : '#0d1420';
  const screenBorder = white ? 'rgba(255,255,255,0.25)' : '#1a2744';
  const standColor = white ? 'rgba(255,255,255,0.2)' : '#1a2744';
  const neonGreen = '#16b35e';
  const neonCyan = '#06b6d4';
  const csColor = white ? '#FFFFFF' : '#16b35e';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="ClickNsit"
      style={{ display: 'block' }}
    >
      {/* Monitor Screen */}
      <rect x="12" y="14" width="116" height="82" rx="10" fill={screenBg} stroke={screenBorder} strokeWidth="2" />
      
      {/* Screen glow effect */}
      <rect x="16" y="18" width="108" height="74" rx="7" fill="none" stroke={neonGreen} strokeWidth="0.5" opacity="0.3" />
      
      {/* CS Text inside screen */}
      <text
        x="70"
        y="68"
        fontSize="36"
        fontWeight="800"
        fontFamily="'Sora','Poppins',sans-serif"
        fill={csColor}
        textAnchor="middle"
        dominantBaseline="central"
        letterSpacing="-1"
      >
        CS
      </text>

      {/* Small cursor blink after CS */}
      <rect x="98" y="52" width="2" height="18" rx="1" fill={neonGreen} opacity="0.8">
        <animate attributeName="opacity" values="0.8;0;0.8" dur="1s" repeatCount="indefinite" />
      </rect>

      {/* Screen stand */}
      <rect x="52" y="96" width="36" height="8" rx="2" fill={standColor} />
      
      {/* Monitor base */}
      <rect x="38" y="104" width="64" height="6" rx="3" fill={standColor} />
      
      {/* Neon accent line at bottom of screen */}
      <line x1="20" y1="92" x2="120" y2="92" stroke={neonGreen} strokeWidth="1.5" opacity="0.6" />
    </svg>
  );
};
