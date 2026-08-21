'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { LogoIcon } from '@/components/logo-icon';

interface MenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface MobileMenuProps {
  items: MenuItem[];
  logoWhite?: boolean;
  cta?: { label: string; href: string };
  footer?: React.ReactNode;
  themeToggle?: React.ReactNode;
  langToggle?: React.ReactNode;
}

export const MobileMenu = ({ items, logoWhite = false, cta, footer, themeToggle, langToggle }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10 transition-colors"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="h-full bg-white dark:bg-neutral-900 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-700">
            <Logo size="sm" />
            <button
              onClick={() => setIsOpen(false)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Close menu"
            >
              <X className="h-6 w-6 text-neutral-600" />
            </button>
          </div>

          {/* Nav Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            {items.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-5 py-3.5 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-700 transition-colors min-h-[48px]"
              >
                {item.icon && <span className="text-neutral-400">{item.icon}</span>}
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* CTA */}
          {cta && (
            <div className="p-5 border-t border-neutral-100">
              <Link
                href={cta.href}
                onClick={() => setIsOpen(false)}
                className="block w-full text-center bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors min-h-[48px] flex items-center justify-center"
              >
                {cta.label}
              </Link>
            </div>
          )}

          {/* Theme Toggle */}
          {themeToggle && (
            <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Dark Mode</span>
                {themeToggle}
              </div>
            </div>
          )}

          {/* Language Toggle */}
          {langToggle && (
            <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Language</span>
                {langToggle}
              </div>
            </div>
          )}

          {/* Footer */}
          {footer && (
            <div className="p-5 border-t border-neutral-100 dark:border-neutral-700">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
