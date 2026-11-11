import crypto from 'crypto';
import { sendMail, escapeHtml } from '@/lib/mailer';
import { getAuthSecret } from '@/lib/auth-secret';

/**
 * Password reset tokens are stateless HMAC-signed tokens — no DB table needed.
 *
 * token = base64url({ sub: userId, exp, pv }) + "." + base64url(HMAC-SHA256)
 *
 * `pv` is a short fingerprint of the current passwordHash, so a token stops
 * working as soon as the password changes (single use, no storage required).
 */

const TOKEN_TTL_MS = 30 * 60 * 1000; // 30 minutes

function getSecret(): string {
  // Never sign tokens with a guessable default; throws in production when unset.
  return getAuthSecret();
}

function sign(payload: string): string {
  return crypto.createHmac('sha256', getSecret()).update(payload).digest('base64url');
}

function passwordFingerprint(passwordHash: string): string {
  return crypto.createHash('sha256').update(passwordHash).digest('hex').slice(0, 16);
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB);
}

export function createResetToken(userId: string, passwordHash: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: userId,
      exp: Date.now() + TOKEN_TTL_MS,
      pv: passwordFingerprint(passwordHash),
    })
  ).toString('base64url');

  return `${payload}.${sign(payload)}`;
}

/** Returns the decoded payload, or null when the token is invalid/expired. */
export function verifyResetToken(
  token: string
): { userId: string; passwordVersion: string } | null {
  try {
    const [payload, signature] = token.split('.');
    if (!payload || !signature) return null;

    if (!safeEqual(signature, sign(payload))) return null;

    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8')) as {
      sub?: string;
      exp?: number;
      pv?: string;
    };

    if (!data.sub || !data.pv || typeof data.exp !== 'number') return null;
    if (Date.now() > data.exp) return null;

    return { userId: data.sub, passwordVersion: data.pv };
  } catch {
    return null;
  }
}

export function matchesPasswordVersion(passwordVersion: string, passwordHash: string): boolean {
  const current = passwordFingerprint(passwordHash);
  return safeEqual(passwordVersion, current);
}

export function getAppUrl(): string {
  const configured = process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (configured) return configured.replace(/\/$/, '');
  return process.env.NODE_ENV === 'production'
    ? 'https://clickandsit.vercel.app'
    : 'http://localhost:3000';
}

export async function sendPasswordResetEmail(
  to: string,
  fullName: string,
  resetUrl: string
): Promise<{ success: boolean; error?: string }> {
  const safeName = escapeHtml(fullName || 'there');
  const safeUrl = escapeHtml(resetUrl);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#1B2559;border-radius:12px 12px 0 0;padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">Click<span style="color:#f26338;">Nsit</span></h1>
      <p style="color:#9CA3AF;margin:5px 0 0;font-size:12px;letter-spacing:2px;">CLICK. SIT. DONE.</p>
    </div>
    <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color:#1B2559;margin-top:0;">Reset your password</h2>
      <p style="color:#374151;font-size:15px;">Hi ${safeName},</p>
      <p style="color:#374151;font-size:15px;">
        We received a request to reset the password for your ClickNsit account.
        Click the button below to choose a new password.
      </p>
      <div style="text-align:center;margin:28px 0;">
        <a href="${safeUrl}"
           style="display:inline-block;background:#f26338;color:#fff;text-decoration:none;padding:14px 28px;border-radius:8px;font-weight:600;font-size:15px;">
          Reset Password
        </a>
      </div>
      <p style="color:#ef4444;font-size:14px;font-weight:600;">⚠️ This link expires in 30 minutes and can be used only once.</p>
      <p style="color:#6b7280;font-size:13px;">
        If you didn't request this, you can safely ignore this email — your password will not change.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="color:#9CA3AF;font-size:12px;text-align:center;margin:0;">
        This is an automated email from ClickNsit.<br>
        © ${new Date().getFullYear()} ClickNsit. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

  return sendMail({
    to,
    subject: 'Reset your ClickNsit password',
    html,
    text: `Reset your ClickNsit password: ${resetUrl}\nThis link expires in 30 minutes and can be used only once.`,
  });
}
