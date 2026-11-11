import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { SignJWT, jwtVerify } from 'jose';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { getAuthSecret } from '@/lib/auth-secret';

/**
 * Mobile (Expo) authentication.
 *
 * The web app uses NextAuth session cookies. The React Native app can't use
 * cookies, so it logs in via POST /api/mobile/login and receives a JWT
 * (signed with NEXTAUTH_SECRET), which it sends as `Authorization: Bearer`.
 *
 * Every user-facing API route below resolves the user id through
 * getAuthUserId(request), so both web sessions and mobile tokens work.
 *
 * Tokens carry the user's `sessionVersion`; resetting the password bumps it,
 * which invalidates every token issued before the reset.
 */

export interface MobileTokenPayload {
  uid: string;
  email: string;
  sv: number;
}

const TOKEN_TTL = '30d';

function getSecret(): Uint8Array {
  return new TextEncoder().encode(getAuthSecret());
}

/** Sign a JWT for a user (used by /api/mobile/login and /api/auth/signup). */
export async function signUserToken(user: {
  id: string;
  email: string;
  sessionVersion?: number;
}): Promise<string> {
  return new SignJWT({ uid: user.id, email: user.email, sv: user.sessionVersion ?? 0 })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());
}

/** Verify a Bearer token, returning its claims or null. */
export async function verifyMobileToken(token: string): Promise<MobileTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (typeof payload.uid !== 'string') return null;

    return {
      uid: payload.uid,
      email: (payload.email as string) || '',
      // Tokens minted before sessionVersion existed count as version 0.
      sv: typeof payload.sv === 'number' ? payload.sv : 0,
    };
  } catch {
    return null;
  }
}

/** True when the token's session version still matches the user's current one. */
export async function isSessionCurrent(payload: MobileTokenPayload): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.uid },
      select: { sessionVersion: true },
    });
    return !!user && user.sessionVersion === payload.sv;
  } catch {
    return false;
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
 * mobile Bearer JWT. Returns null when unauthenticated or revoked.
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
    if (!payload) return null;
    if (!(await isSessionCurrent(payload))) return null;
    return payload.uid;
  }

  return null;
}
