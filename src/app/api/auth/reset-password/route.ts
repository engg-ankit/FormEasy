import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { verifyResetToken, matchesPasswordVersion } from '@/lib/password-reset';
import { enforceRateLimits, ipRule, rateLimitedResponse } from '@/lib/rate-limit';

// Token guessing is already infeasible; this only caps bulk abuse of the endpoint.
const WINDOW_MS = 15 * 60 * 1000;
const IP_LIMIT = 10;

export async function POST(request: NextRequest) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || typeof token !== 'string' || !newPassword || typeof newPassword !== 'string') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const gate = await enforceRateLimits([ipRule(request, 'reset', IP_LIMIT, WINDOW_MS)]);
    if (!gate.allowed) {
      return rateLimitedResponse(gate.retryAfter);
    }

    const claims = verifyResetToken(token);
    if (!claims) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({ where: { id: claims.userId } });
    // Also rejects tokens already used, because the password hash changed.
    if (!user || !matchesPasswordVersion(claims.passwordVersion, user.passwordHash)) {
      return NextResponse.json(
        { error: 'This reset link is invalid or has already been used.' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      // Bumping the version revokes every session and mobile token issued before now.
      data: { passwordHash, sessionVersion: { increment: 1 } },
    });

    return NextResponse.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
  }
}
