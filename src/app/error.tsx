'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  // Auto-retry on chunk load errors
  useEffect(() => {
    const isChunkError = 
      error?.message?.includes('Loading chunk') || 
      error?.message?.includes('Failed to fetch') ||
      error?.message?.includes('ChunkLoadError') ||
      error?.digest?.includes('ChunkLoadError');
    
    if (isChunkError) {
      const timer = setTimeout(() => {
        window.location.reload();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-6">
          {error?.message?.includes('Loading chunk') 
            ? 'Loading resources... refreshing automatically.'
            : 'An unexpected error occurred.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Reload
          </button>
          <button
            onClick={() => {
              if ('caches' in window) {
                caches.keys().then(names => {
                  names.forEach(name => caches.delete(name));
                });
              }
              window.location.href = '/';
            }}
            className="px-5 py-2.5 bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 rounded-lg font-medium hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}
