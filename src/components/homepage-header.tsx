'use client';

import { Logo } from '@/components/logo';
import { SiteNav } from '@/components/site-nav';
import { ThemeToggle } from '@/components/theme-toggle';

export const HomepageHeader = () => {
  return (
    <nav className="bg-[#0d1420] border-b border-neon-500/10 shadow-[0_1px_20px_rgba(22,179,94,0.05)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 sm:py-5 min-h-[88px]">
          <div className="flex items-center">
            <Logo size="md" />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle className="w-10 h-10 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neon-400 border border-neon-500/10 hover:border-neon-500/30 transition-all duration-200 gap-0" />
            <SiteNav />
          </div>
        </div>
      </div>
    </nav>
  );
};
