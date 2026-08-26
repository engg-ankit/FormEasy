import React from 'react';

interface LogoIconProps {
  className?: string;
  size?: number;
  white?: boolean;
}

export const LogoIcon = ({ className = '', size = 48, white = false }: LogoIconProps) => {
  // Colors based on white prop
  const badgeBg = white ? 'rgba(255,255,255,0.15)' : '#242E63';
  const badgeStroke = white ? 'rgba(255,255,255,0.3)' : '#3F4A8C';
  const barColor = white ? '#FFFFFF' : '#F5F4FF';
  const tealColor = '#2DD4BF';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 140 140"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="CyberSeva"
      style={{ display: 'block' }}
    >
      {/* Badge */}
      <rect x="8" y="10" width="120" height="120" rx="30" fill={badgeBg} />
      <rect x="8" y="10" width="120" height="120" rx="30" fill="none" stroke={badgeStroke} strokeWidth="1.5" />

      {/* Vertical bar */}
      <rect x="46" y="40" width="9" height="60" rx="3" fill={barColor} />

      {/* Horizontal bars */}
      <rect x="46" y="40" width="30" height="10" rx="3" fill={barColor} />
      <rect x="46" y="60" width="22" height="10" rx="3" fill={barColor} />
      <rect x="46" y="80" width="30" height="10" rx="3" fill={tealColor} />
      <rect x="46" y="100" width="22" height="10" rx="3" fill={tealColor} />
    </svg>
  );
};
