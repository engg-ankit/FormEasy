import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  createResetToken,
  sendPasswordResetEmail,
  getAppUrl,
} from '@/lib/password-reset';
import { enforceRateLimits, ipRule, rateLimitedResponse } from '@/lib/rate-limit';

const GENERIC_MESSAGE =
  'If an account exists for that email, a password reset link has been sent.';

// 3 reset emails per address and 10 per IP, per 15 minutes.
const WINDOW_MS = 15 * 60 * 1000;
const EMAIL_LIMIT = 3;
const IP_LIMIT = 10;

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Per client IP first (one caller can't flood many addresses), then per
    // email address (one inbox can't be flooded).
    const gate = await enforceRateLimits([
      ipRule(request, 'forgot', IP_LIMIT, WINDOW_MS),
      { key: `forgot:email:${normalizedEmail}`, limit: EMAIL_LIMIT, windowMs: WINDOW_MS },
    ]);
    if (!gate.allowed) {
      return rateLimitedResponse(gate.retryAfter);
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
    });

    // Never reveal whether the account exists.
    if (!user) {
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
    }

    const token = createResetToken(user.id, user.passwordHash);
    const resetUrl = `${getAppUrl()}/forgot-password?token=${encodeURIComponent(token)}`;

    const result = await sendPasswordResetEmail(user.email, user.fullName, resetUrl);

    if (!result.success) {
      console.error('Password reset email failed:', result.error);
      return NextResponse.json(
        { error: 'Could not send the reset email. Please try again later.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
