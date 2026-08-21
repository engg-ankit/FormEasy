'use client';

import { Logo } from '@/components/logo';
import { SiteNav } from '@/components/site-nav';

export const HomepageHeader = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4 sm:py-5 min-h-[88px]">
          <div className="flex items-center">
            <Logo size="md" />
          </div>
          <SiteNav />
        </div>
      </div>
    </nav>
  );
};
