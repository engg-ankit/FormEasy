import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
  white?: boolean;
}

export const LogoIcon = ({ className = '', size = 48, white = false }: LogoIconProps) => {
  // Colors matching homepage primary (indigo) palette
  const badgeBg = white ? 'rgba(255,255,255,0.15)' : '#312e81';
  const badgeStroke = white ? 'rgba(255,255,255,0.3)' : '#4338ca';
  const cursorColor = white ? '#FFFFFF' : '#FFFFFF';
  const accentDot = '#f26338';

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
      {/* Rounded square badge */}
      <rect x="8" y="8" width="124" height="124" rx="30" fill={badgeBg} />
      <rect x="8" y="8" width="124" height="124" rx="30" fill="none" stroke={badgeStroke} strokeWidth="1.5" />

      {/* Mouse cursor arrow */}
      <path
        d="M52 40 L52 95 L65 80 L82 100 L92 94 L75 74 L92 72 Z"
        fill={cursorColor}
        stroke={badgeStroke}
        strokeWidth="1"
        strokeLinejoin="round"
      />

      {/* Click ripple dot */}
      <circle cx="92" cy="94" r="4" fill={accentDot} opacity="0.9" />
      <circle cx="92" cy="94" r="8" fill="none" stroke={accentDot} strokeWidth="1" opacity="0.4" />
    </svg>
  );
};
