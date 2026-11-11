/**
 * One place that decides how auth tokens are signed.
 *
 * Production must never fall back to a baked-in string: this repo is public, so
 * a fallback secret means anyone can mint valid sessions and mobile tokens.
 * Development gets a clearly-marked local secret so `npm run dev` still works.
 */

const DEV_SECRET = 'dev-only-insecure-secret-do-not-use-in-production';
const MIN_LENGTH = 24;

export function getAuthSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;

  if (secret && secret.length >= MIN_LENGTH) return secret;

  if (process.env.NODE_ENV !== 'production') {
    if (!secret) {
      console.warn('[auth] NEXTAUTH_SECRET is not set — using the insecure development secret.');
    } else {
      console.warn(`[auth] NEXTAUTH_SECRET is shorter than ${MIN_LENGTH} chars — treating it as unset.`);
    }
    return DEV_SECRET;
  }

  throw new Error(
    'NEXTAUTH_SECRET is missing or too short. Set a random value of at least ' +
      `${MIN_LENGTH} characters; refusing to sign tokens with a public fallback.`
  );
}

/** Optional separate secret for the admin cookie; falls back to the auth secret. */
export function getAdminSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (secret && secret.length >= MIN_LENGTH) return secret;
  return getAuthSecret();
}
