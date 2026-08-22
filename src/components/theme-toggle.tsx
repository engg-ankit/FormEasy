'use client';

import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    setIsDark(saved === 'dark');
  }, []);

  const toggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggle}
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
