'use client';

import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';

interface MenuItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

interface MobileMenuProps {
  items: MenuItem[];
  logoWhite?: boolean;
  cta?: { label: string; href: string };
  footer?: React.ReactNode;
  themeToggle?: React.ReactNode;
}

export const MobileMenu = ({ items, logoWhite = false, cta, footer, themeToggle }: MobileMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);

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

  const closeMenu = () => setIsOpen(false);

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
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeMenu}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 bg-white dark:bg-neutral-900 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-700">
          <Logo size="sm" />
          <button
            onClick={closeMenu}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Close menu"
          >
            <X className="h-6 w-6 text-neutral-600" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="overflow-y-auto py-4" style={{ maxHeight: 'calc(100vh - 200px)' }}>
          {items.map((item, index) => {
            const handleClick = () => {
              closeMenu();
              item.onClick?.();
            };

            // If item has onClick, use button; otherwise use Link
            if (item.onClick) {
              return (
                <button
                  key={index}
                  onClick={handleClick}
                  className="flex items-center gap-3 px-5 py-3.5 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-700 transition-colors min-h-[48px] w-full text-left"
                >
                  {item.icon && <span className="text-neutral-400">{item.icon}</span>}
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={index}
                href={item.href || '#'}
                onClick={closeMenu}
                className="flex items-center gap-3 px-5 py-3.5 text-neutral-700 dark:text-neutral-300 hover:bg-primary-50 dark:hover:bg-primary-950 hover:text-primary-700 transition-colors min-h-[48px] block"
              >
                {item.icon && <span className="text-neutral-400">{item.icon}</span>}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        {cta && (
          <div className="p-5 border-t border-neutral-100 dark:border-neutral-700">
            <Link
              href={cta.href}
              onClick={closeMenu}
              className="block w-full text-center bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors min-h-[48px]"
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

        {/* Footer */}
        {footer && (
          <div className="p-5 border-t border-neutral-100 dark:border-neutral-700">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};
