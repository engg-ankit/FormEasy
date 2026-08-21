'use client';

import { useTranslation } from '@/lib/i18n';
import { Globe } from 'lucide-react';

export function LanguageToggle({ className }: { className?: string }) {
  const { lang, setLang } = useTranslation();

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${className || ''}`}
      title={lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
    >
      <Globe className="h-4 w-4" />
      <span>{lang === 'en' ? 'हि' : 'EN'}</span>
    </button>
  );
}
