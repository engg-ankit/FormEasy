'use client';

import { useTranslation, Language } from '@/lib/i18n';

interface LanguageToggleProps {
  className?: string;
}

export function LanguageToggle({ className = '' }: LanguageToggleProps) {
  const { lang, setLang } = useTranslation();

  const toggleLanguage = () => {
    setLang(lang === 'en' ? 'hi' : 'en');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800 ${className}`}
      title={lang === 'en' ? 'हिंदी में बदलें' : 'Switch to English'}
    >
      <span className="text-base">{lang === 'en' ? '🇮🇳' : '🌐'}</span>
      <span>{lang === 'en' ? 'हिंदी' : 'English'}</span>
    </button>
  );
}
