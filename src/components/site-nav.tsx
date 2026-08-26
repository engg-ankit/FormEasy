'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { MobileMenu } from '@/components/mobile-menu';
import { Search, FileText, Phone, BookOpen, LayoutDashboard, Plus, CreditCard, Shield } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNotificationBell } from '@/components/user-notification-bell';

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
        <Link href="/admin/login" className="text-xs text-neutral-600 hover:text-neon-400 transition-colors font-mono">
          <Shield className="h-3.5 w-3.5 inline mr-1" />
          admin
        </Link>
        {session ? (
          <div className="flex items-center gap-3">
            <UserNotificationBell />
            <Link href="/dashboard">
              <Button className="bg-neon-500 hover:bg-neon-600 text-white shadow-neon font-semibold">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                My Dashboard
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <Link href="/login">
              <Button variant="ghost" className="text-neutral-300 hover:text-neon-400 hover:bg-neon-500/5">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-neon-500 hover:bg-neon-600 text-white shadow-neon font-semibold">
                Sign Up
              </Button>
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
              <ThemeToggle className="flex-1 justify-center bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-neon-400 border border-neon-500/10 hover:border-neon-500/30 rounded-lg gap-2 transition-all duration-200" />
            </div>
          }
        />
      </div>
    </>
  );
};
