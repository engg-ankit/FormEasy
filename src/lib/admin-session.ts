import crypto from 'crypto';
import { getAdminSecret } from '@/lib/auth-secret';

/**
 * Admin session cookie: `base64url({ sub, exp }) + "." + HMAC-SHA256`.
 *
 * The previous value was plain base64 of `adminId:timestamp`, so anyone who
 * knew an admin id could forge a session and nothing ever expired.
 */

export const ADMIN_COOKIE = 'admin_session';
export const ADMIN_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function sign(payload: string): string {
  return crypto.createHmac('sha256', getAdminSecret()).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function createAdminSessionToken(adminId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ sub: adminId, exp: Date.now() + ADMIN_SESSION_TTL_MS })
  ).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

/** Returns the admin id for a valid, unexpired token, else null. */
export function verifyAdminSessionToken(token: string): string | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;
    if (!safeEqual(signature, sign(payload))) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      sub?: string;
      exp?: number;
    };

    if (!data.sub || typeof data.exp !== 'number') return null;
    if (Date.now() > data.exp) return null;

    return data.sub;
  } catch {
    return null;
  }
}
