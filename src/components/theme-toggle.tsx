'use client';

import { Sun, Moon } from 'lucide-react';
import { useEffect, useState } from 'react';

export const ThemeToggle = ({ className = '' }: { className?: string }) => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    setIsDark(saved === 'dark');
  }, []);

  const toggle = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newDark ? 'dark' : 'light');
  };

  // If no custom className with colors provided, use default visible colors
  const hasCustomColors = className.includes('text-');
  const iconColorClass = hasCustomColors ? '' : 'text-neutral-700 dark:text-neutral-300';

  return (
    <button
      onClick={toggle}
      className={`flex items-center justify-center gap-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] ${className}`}
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className={`h-5 w-5 ${iconColorClass}`} />
      ) : (
        <Moon className={`h-5 w-5 ${iconColorClass}`} />
      )}
    </button>
  );
};
