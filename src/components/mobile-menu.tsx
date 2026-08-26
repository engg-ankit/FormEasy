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
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neon-500/10 hover:border-neon-500/30 transition-all duration-200"
        aria-label="Open menu"
      >
        <Menu className="h-5 w-5 text-neutral-300" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          onClick={closeMenu}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 max-w-[85vw] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ background: 'linear-gradient(180deg, #0d1420 0%, #0a0f1a 100%)' }}
      >
        {/* Header — CRT Monitor Style */}
        <div className="flex items-center justify-between p-5 border-b border-neon-500/10">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
          </div>
          <button
            onClick={closeMenu}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg bg-neutral-800 hover:bg-neutral-700 border border-neon-500/10 hover:border-red-500/30 transition-all duration-200"
            aria-label="Close menu"
          >
            <X className="h-5 w-5 text-neutral-400" />
          </button>
        </div>

        {/* Terminal status bar */}
        <div className="px-5 py-2 border-b border-neon-500/10 bg-[#060b14]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-neon-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-neutral-600 font-mono">session_active — cyberseva</span>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="overflow-y-auto py-3" style={{ maxHeight: 'calc(100vh - 220px)' }}>
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
                  className="flex items-center gap-3 px-5 py-3.5 text-neutral-400 hover:text-neon-400 hover:bg-neon-500/5 transition-all duration-200 min-h-[48px] w-full text-left border-l-2 border-transparent hover:border-neon-500/40"
                >
                  {item.icon && <span className="text-neutral-600 group-hover:text-neon-400">{item.icon}</span>}
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              );
            }

            return (
              <Link
                key={index}
                href={item.href || '#'}
                onClick={closeMenu}
                className="flex items-center gap-3 px-5 py-3.5 text-neutral-400 hover:text-neon-400 hover:bg-neon-500/5 transition-all duration-200 min-h-[48px] block border-l-2 border-transparent hover:border-neon-500/40"
              >
                {item.icon && <span className="text-neutral-600">{item.icon}</span>}
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* CTA */}
        {cta && (
          <div className="p-5 border-t border-neon-500/10">
            <Link
              href={cta.href}
              onClick={closeMenu}
              className="block w-full text-center bg-neon-500 text-white py-3 rounded-lg font-semibold hover:bg-neon-600 transition-all duration-200 min-h-[48px] shadow-neon"
            >
              {cta.label}
            </Link>
          </div>
        )}

        {/* Theme Toggle */}
        {themeToggle && (
          <div className="px-5 py-3 border-t border-neon-500/10">
            <div className="flex items-center justify-between">
              <span className="text-sm font-mono text-neutral-500">$ theme</span>
              {themeToggle}
            </div>
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="p-5 border-t border-neon-500/10">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};
