import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signUserToken } from '@/lib/mobile-auth';
import {
  enforceRateLimits,
  getClientIp,
  rateLimitedResponse,
  resetRateLimit,
} from '@/lib/rate-limit';

const WINDOW_MS = 15 * 60 * 1000;
const EMAIL_LIMIT = 5;
const IP_LIMIT = 15;

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase();
    const emailKey = `login:email:${normalizedEmail}`;

    const gate = await enforceRateLimits([
      { key: `login:ip:${getClientIp(request)}`, limit: IP_LIMIT, windowMs: WINDOW_MS },
      { key: emailKey, limit: EMAIL_LIMIT, windowMs: WINDOW_MS },
    ]);
    if (!gate.allowed) {
      return rateLimitedResponse(gate.retryAfter);
    }

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    // Successful login clears the failure counter for this account.
    await resetRateLimit(emailKey);

    const token = await signUserToken({ id: user.id, email: user.email });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        referralCode: user.referralCode,
        referralBonus: user.referralBonus,
      },
    });
  } catch (error) {
    console.error('Mobile login error:', error);
    return NextResponse.json({ error: 'Login failed. Please try again.' }, { status: 500 });
  }
}