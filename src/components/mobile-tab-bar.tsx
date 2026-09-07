'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Home, Search, LayoutDashboard, Phone } from 'lucide-react';

/**
 * App-like bottom tab navigation for mobile (hidden on desktop).
 * Shows 4 primary destinations so users never need the hamburger menu.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hide on admin (has its own nav), auth, and splash pages
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/forgot-password')
  ) {
    return null;
  }

  const tabs = [
    { label: 'Home', href: '/', icon: Home, match: (p: string) => p === '/' },
    { label: 'Forms', href: '/exams', icon: Search, match: (p: string) => p.startsWith('/exams') },
    session
      ? {
          label: 'Dashboard',
          href: '/dashboard',
          icon: LayoutDashboard,
          match: (p: string) => p.startsWith('/dashboard'),
        }
      : { label: 'Login', href: '/login', icon: LayoutDashboard, match: (p: string) => p.startsWith('/dashboard') },
    { label: 'Contact', href: '/contact', icon: Phone, match: (p: string) => p.startsWith('/contact') },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 dark:bg-neutral-900/95 backdrop-blur-lg border-t border-neutral-200 dark:border-neutral-800 shadow-[0_-4px_24px_rgba(0,0,0,0.08)] pb-safe"
      aria-label="Primary"
    >
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const isActive = tab.match(pathname);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.label}
              href={tab.href}
              className={`flex flex-col items-center gap-1 py-2.5 min-h-[56px] transition-colors duration-200 ${
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              <span
                className={`flex items-center justify-center w-12 h-7 rounded-full transition-all duration-300 ease-premium ${
                  isActive ? 'bg-primary-50 dark:bg-primary-900/40' : ''
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
              </span>
              <span className={`text-[10px] font-medium ${isActive ? 'font-semibold' : ''}`}>{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}