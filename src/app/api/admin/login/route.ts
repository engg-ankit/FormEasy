import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import {
  enforceRateLimits,
  getClientIp,
  rateLimitedResponse,
  resetRateLimit,
} from '@/lib/rate-limit';

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

    const emailKey = `admin-login:email:${String(email).toLowerCase()}`;
    const gate = await enforceRateLimits([
      { key: `admin-login:ip:${getClientIp(request)}`, limit: IP_LIMIT, windowMs: WINDOW_MS },
      { key: emailKey, limit: EMAIL_LIMIT, windowMs: WINDOW_MS },
    ]);
    if (!gate.allowed) {
      return rateLimitedResponse(gate.retryAfter);
    }

    // Find admin (with retry for connection pool issues)
    const admin = await withRetry(() =>
      prisma.admin.findUnique({ where: { email } })
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

    // Create session token (simple approach)
    const sessionToken = Buffer.from(`${admin.id}:${Date.now()}`).toString('base64');

    const response = NextResponse.json({ 
      success: true,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      }
    });

    // Set admin session cookie
    response.cookies.set('admin_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Login failed — server busy, try again' }, { status: 503 });
  }
}
