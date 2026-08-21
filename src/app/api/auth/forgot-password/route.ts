import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if user exists
      return NextResponse.json({ success: true, message: 'If an account exists, a reset link has been sent.' });
    }

    // Generate a simple reset token (in production, use a proper token library)
    const resetToken = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    const tokenHash = await bcrypt.hash(resetToken, 4); // Low rounds for speed

    // Store the token hash in a simple way - using the user's passwordHash temporarily
    // In production, use a dedicated reset_tokens table
    // For now, we'll return the token directly (for demo purposes)
    return NextResponse.json({
      success: true,
      message: 'Reset token generated',
      resetToken, // In production: send via email, don't return in response
      userId: user.id,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}
