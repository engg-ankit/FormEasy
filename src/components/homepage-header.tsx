'use client';

import { Logo } from '@/components/logo';
import { SiteNav } from '@/components/site-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export const HomepageHeader = () => {
  return (
    <nav className="bg-white dark:bg-neutral-900 shadow-sm border-b border-neutral-200 dark:border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 sm:py-5 min-h-[88px]">
          <div className="flex items-center">
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="w-10 h-10 rounded-full bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 text-primary-700 dark:text-primary-300 border border-neutral-200 dark:border-neutral-600 shadow-sm" />
            <SiteNav />
          </div>
        </div>
      </div>
    </nav>
  );
};
