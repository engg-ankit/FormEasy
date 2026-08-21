'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted ? theme === 'dark' : false;

  return (
    <button
      onClick={() => {
        if (!mounted) return;
        setTheme(isDark ? 'light' : 'dark');
      }}
      className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors ${className}`}
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
};
