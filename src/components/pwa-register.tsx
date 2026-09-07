'use client';

import { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISS_KEY = 'clicknsit-install-dismissed';

export function PwaRegister() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    // Already installed as an app?
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    setStandalone(isStandalone);

    // Register service worker (works even if the page already finished loading)
    if ('serviceWorker' in navigator) {
      const register = () => {
        navigator.serviceWorker.register('/sw.js').catch(() => {
          /* SW is progressive enhancement — ignore failures */
        });
      };
      if (document.readyState === 'complete') {
        register();
      } else {
        window.addEventListener('load', register);
      }
    }

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallEvent(e as BeforeInstallPromptEvent);
      if (!localStorage.getItem(DISMISS_KEY)) {
        setShowBanner(true);
      }
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setShowBanner(false);
    };

    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (standalone || !showBanner || !installEvent) return null;

  const handleInstall = async () => {
    try {
      await installEvent.prompt();
      const { outcome } = await installEvent.userChoice;
      if (outcome === 'accepted') {
        setShowBanner(false);
      }
    } catch {
      /* prompt can throw if called twice */
    }
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, '1');
    setShowBanner(false);
  };

  return (
    <div className="fixed bottom-[5.5rem] md:bottom-6 left-1/2 -translate-x-1/2 z-[70] w-[calc(100%-2rem)] max-w-md">
      <div className="flex items-center gap-3 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-strong p-3 pl-4 animate-scale-in">
        <LogoIcon size={40} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-primary-900 dark:text-white truncate">Install ClickNsit App</p>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">One tap — forms, payments &amp; status on your home screen</p>
        </div>
        <button
          onClick={handleInstall}
          className="flex items-center gap-1.5 shrink-0 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors min-h-[40px] active:scale-[0.97]"
        >
          <Download className="h-4 w-4" />
          Install
        </button>
        <button
          onClick={dismiss}
          className="shrink-0 w-8 h-8 flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}