import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  enforceRateLimits,
  ipRule,
  rateLimitedResponse,
  resetRateLimit,
} from '@/lib/rate-limit';
import { ADMIN_COOKIE, ADMIN_SESSION_TTL_MS, createAdminSessionToken } from '@/lib/admin-session';

const WINDOW_MS = 15 * 60 * 1000;
const EMAIL_LIMIT = 5;
const IP_LIMIT = 10;

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await fn();
    } catch (err: any) {
      if (i === retries || !err?.message?.includes('max clients')) throw err;
      await new Promise(r => setTimeout(r, 500 * (i + 1)));
    }
  }
  throw new Error('unreachable');
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Autofill and copy-paste regularly bring a trailing space or a capital
    // letter; the email column is case-sensitive, so normalise before lookup.
    const emailKey = `admin-login:email:${String(email).trim().toLowerCase()}`;
    const gate = await enforceRateLimits([
      ipRule(request, 'admin-login', IP_LIMIT, WINDOW_MS),
      { key: emailKey, limit: EMAIL_LIMIT, windowMs: WINDOW_MS },
    ]);
    if (!gate.allowed) {
      return rateLimitedResponse(gate.retryAfter);
    }

    // Find admin (with retry for connection pool issues)
    const admin = await withRetry(() =>
      prisma.admin.findFirst({
        where: { email: { equals: String(email).trim(), mode: 'insensitive' } },
      })
    );

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    await resetRateLimit(emailKey);

    // Signed, expiring session token — the cookie cannot be forged or replayed forever.
    const sessionToken = createAdminSessionToken(admin.id);

    const response = NextResponse.json({ 
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      }
    });

    // Set admin session cookie
    response.cookies.set(ADMIN_COOKIE, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: Math.floor(ADMIN_SESSION_TTL_MS / 1000),
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Login failed — server busy, try again' }, { status: 503 });
  }
}
