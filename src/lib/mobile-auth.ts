import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { SignJWT, jwtVerify } from 'jose';
import { authOptions } from '@/lib/auth-options';

/**
 * Mobile (Expo) authentication.
 *
 * The web app uses NextAuth session cookies. The React Native app can't use
 * cookies, so it logs in via POST /api/mobile/login and receives a JWT
 * (signed with NEXTAUTH_SECRET), which it sends as `Authorization: Bearer`.
 *
 * Every user-facing API route below resolves the user id through
 * getAuthUserId(request), so both web sessions and mobile tokens work.
 */

export interface MobileTokenPayload {
  uid: string;
  email: string;
}

function getSecret(): Uint8Array {
  const secret = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';
  return new TextEncoder().encode(secret);
}

/** Sign a JWT for a user (used by /api/mobile/login). */
export async function signUserToken(user: { id: string; email: string }): Promise<string> {
  return new SignJWT({ uid: user.id, email: user.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getSecret());
}

/** Verify a Bearer token, returning the user id or null. */
export async function verifyMobileToken(token: string): Promise<MobileTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.uid === 'string') {
      return { uid: payload.uid, email: (payload.email as string) || '' };
    }
    return null;
  } catch {
    return null;
  }
}

/** Extract the Bearer token from a request, if present. */
function getBearerToken(request: NextRequest): string | null {
  const header = request.headers.get('authorization');
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1] : null;
}

/**
 * Resolve the authenticated user id from either a NextAuth session or a
 * mobile Bearer JWT. Returns null when unauthenticated.
 */
export async function getAuthUserId(request: NextRequest): Promise<string | null> {
  // 1) Web: NextAuth session
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) return session.user.id;
  } catch {
    // session check failure shouldn't block token auth
  }

  // 2) Mobile: Bearer JWT
  const token = getBearerToken(request);
  if (token) {
    const payload = await verifyMobileToken(token);
    return payload?.uid || null;
  }

  return null;
}