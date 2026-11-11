'use client';

import { useEffect } from 'react';
import { SessionProvider, signOut, useSession } from 'next-auth/react';

/**
 * A session can be revoked server-side (password reset bumps the user's
 * sessionVersion, and the JWT callback drops the user id). The cookie itself
 * still exists, so the client is told to sign out as soon as it notices.
 */
function RevokedSessionWatcher() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== 'authenticated') return;

    const id = (session?.user as { id?: string } | undefined)?.id;
    if (!id) {
      signOut({ redirect: false }).then(() => window.location.reload());
    }
  }, [session, status]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <RevokedSessionWatcher />
      {children}
    </SessionProvider>
  );
}
