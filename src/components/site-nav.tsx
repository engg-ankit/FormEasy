'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { MobileMenu } from '@/components/mobile-menu';
import { Search, FileText, Phone, BookOpen, LayoutDashboard, Plus, CreditCard } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNotificationBell } from '@/components/user-notification-bell';
import { LanguageToggle } from '@/components/language-toggle';

export const SiteNav = () => {
  const { data: session } = useSession();

  const menuItems = session
    ? [
        { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
        { label: 'Browse Forms', href: '/exams', icon: <Search className="h-5 w-5" /> },
        { label: 'Request Form', href: '/request-form', icon: <Plus className="h-5 w-5" /> },
        { label: 'My Applications', href: '/dashboard?tab=applications', icon: <FileText className="h-5 w-5" /> },
        { label: 'Payment History', href: '/dashboard?tab=payments', icon: <CreditCard className="h-5 w-5" /> },
        { label: 'Contact Support', href: '/contact', icon: <Phone className="h-5 w-5" /> },
        { label: 'How It Works', href: '/#how-it-works', icon: <BookOpen className="h-5 w-5" /> },
      ]
    : [
        { label: 'Browse Forms', href: '/exams', icon: <Search className="h-5 w-5" /> },
        { label: 'How It Works', href: '/#how-it-works', icon: <BookOpen className="h-5 w-5" /> },
        { label: 'Contact', href: '/contact', icon: <Phone className="h-5 w-5" /> },
      ];

  return (
    <>
      {/* Desktop buttons — hidden on mobile */}
      <div className="hidden sm:flex items-center gap-4">
        <LanguageToggle />
        <Link href="/admin/login" className="text-sm text-neutral-500 hover:text-primary-600 transition-colors">
          Admin
        </Link>
        {session ? (
          <div className="flex items-center gap-3">
            <UserNotificationBell />
            <Link href="/dashboard">
              <Button variant="primary">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                My Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button variant="primary">Sign Up</Button>
            </Link>
          </>
        )}
      </div>

      {/* Mobile menu — hidden on desktop */}
      <div className="sm:hidden">
        <MobileMenu
          items={menuItems}
          cta={
            session
              ? undefined
              : { label: 'Sign Up Free', href: '/signup' }
          }
          themeToggle={
            <div className="flex gap-2">
              <LanguageToggle className="flex-1 justify-center bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 rounded-lg" />
              <ThemeToggle className="flex-1 justify-center bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 text-primary-700 dark:text-primary-300 border border-primary-200 dark:border-primary-800 rounded-lg gap-2" />
            </div>
          }
        />
      </div>
    </>
  );
};
