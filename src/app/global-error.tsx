'use client';

import { useEffect, useState } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [retryCount, setRetryCount] = useState(0);

  // Auto-retry on chunk load errors (max 3 times)
  useEffect(() => {
    if (error?.message?.includes('Loading chunk') || 
        error?.message?.includes('Failed to fetch') ||
        error?.message?.includes('ChunkLoadError') ||
        error?.digest?.includes('ChunkLoadError')) {
      if (retryCount < 3) {
        const timer = setTimeout(() => {
          setRetryCount(prev => prev + 1);
          reset();
        }, 1000 * (retryCount + 1)); // 1s, 2s, 3s delay
        return () => clearTimeout(timer);
      }
    }
  }, [error, retryCount, reset]);

  return (
    <html lang="en">
      <body style={{
        margin: 0,
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        backgroundColor: '#f5f5f5',
      }}>
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          maxWidth: '400px',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
          <h2 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 600, 
            color: '#1f2937',
            marginBottom: '0.5rem',
          }}>
            Page Load Error
          </h2>
          <p style={{ 
            color: '#6b7280', 
            marginBottom: '1.5rem',
            lineHeight: 1.5,
          }}>
            {retryCount > 0 
              ? `Retrying... (${retryCount}/3)` 
              : 'Something went wrong loading this page.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              onClick={() => {
                setRetryCount(0);
                window.location.reload();
              }}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: 'none',
                backgroundColor: '#2563eb',
                color: 'white',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Reload Page
            </button>
            <button
              onClick={() => {
                // Clear all caches and reload
                if ('caches' in window) {
                  caches.keys().then(names => {
                    names.forEach(name => caches.delete(name));
                  });
                }
                window.location.href = '/';
              }}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: 500,
                cursor: 'pointer',
                fontSize: '0.875rem',
              }}
            >
              Go Home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
