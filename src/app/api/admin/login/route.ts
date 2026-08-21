import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Find admin
    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, admin.passwordHash);
    if (!isPasswordValid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

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
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}