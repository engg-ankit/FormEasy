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

  // Colors based on white prop and dark mode
  const isLightBadge = !white;
  const badgeBg = white ? 'rgba(255,255,255,0.15)' : '#242E63';
  const badgeStroke = white ? 'rgba(255,255,255,0.3)' : '#3F4A8C';
  const barColor = white ? '#FFFFFF' : '#F5F4FF';
  const tealColor = '#2DD4BF';
  const textColor = white ? '#FFFFFF' : '#1B2559';
  const tagColor = white ? 'rgba(255,255,255,0.7)' : '#6B7280';

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 620 160"
      xmlns="http://www.w3.org/2000/svg"
      className={`max-w-full h-auto ${className}`}
      aria-label="FormEasy logo"
      style={{ display: 'block' }}
    >
      {/* ICON MARK */}
      <g className="logo-square">
        <rect x="8" y="20" width="120" height="120" rx="30" fill={badgeBg} />
        <rect x="8" y="20" width="120" height="120" rx="30" fill="none" stroke={badgeStroke} strokeWidth="1.5" />

        {/* Vertical bar */}
        <rect x="46" y="50" width="9" height="60" rx="3" fill={barColor} />

        {/* Horizontal bars */}
        <rect x="46" y="50" width="30" height="10" rx="3" fill={barColor} className="logo-bar logo-bar-1" style={{ transformOrigin: '46px 55px' }} />
        <rect x="46" y="70" width="22" height="10" rx="3" fill={barColor} className="logo-bar logo-bar-2" style={{ transformOrigin: '46px 75px' }} />
        <rect x="46" y="90" width="30" height="10" rx="3" fill={tealColor} className="logo-bar logo-bar-3" style={{ transformOrigin: '46px 95px' }} />
        <rect x="46" y="110" width="22" height="10" rx="3" fill={tealColor} className="logo-bar logo-bar-4" style={{ transformOrigin: '46px 115px' }} />
      </g>

      {/* WORDMARK */}
      <g transform="translate(150,0)">
        <text
          x="0"
          y="88"
          fontSize="48"
          fontWeight="700"
          fontFamily="'Poppins','Sora',sans-serif"
          fill={textColor}
          className="logo-word"
        >
          Form<tspan fill={tealColor}>Easy</tspan>
        </text>
        <text
          x="2"
          y="114"
          fontSize="13"
          fontWeight="500"
          letterSpacing="2.3"
          fill={tagColor}
          fontFamily="'Inter',sans-serif"
          className="logo-tagline"
        >
          EVERY FORM. ONE PLATFORM.
        </text>
      </g>
    </svg>
  );
};
