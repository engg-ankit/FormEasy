import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAdminSession } from '@/lib/admin-auth';
import { ADMIN_COOKIE, createAdminSessionToken } from '@/lib/admin-session';
import { enforceRateLimits, ipRule, rateLimitedResponse } from '@/lib/rate-limit';

const MIN_LENGTH = 10;

export async function POST(request: NextRequest) {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const gate = await enforceRateLimits([
      ipRule(request, 'admin-password', 5, 15 * 60 * 1000),
    ]);
    if (!gate.allowed) {
      return rateLimitedResponse(gate.retryAfter);
    }

    const { currentPassword, newPassword } = await request.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Current and new password are required' }, { status: 400 });
    }

    if (typeof newPassword !== 'string' || newPassword.length < MIN_LENGTH) {
      return NextResponse.json(
        { error: `New password must be at least ${MIN_LENGTH} characters` },
        { status: 400 }
      );
    }

    if (newPassword === currentPassword) {
      return NextResponse.json({ error: 'New password must be different' }, { status: 400 });
    }

    const valid = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: await bcrypt.hash(newPassword, 10) },
    });

    const response = NextResponse.json({ success: true, message: 'Password updated' });

    // Fresh token so this browser stays signed in; other sessions expire naturally.
    response.cookies.set(ADMIN_COOKIE, createAdminSessionToken(admin.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Change password error:', error);
    return NextResponse.json({ error: 'Failed to change password' }, { status: 500 });
  }
}
