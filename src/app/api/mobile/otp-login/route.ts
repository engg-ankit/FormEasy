import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { signUserToken } from '@/lib/mobile-auth';
import { verifyOtp } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { mobile, email, otp } = await request.json();

    // Support both mobile and email (email takes priority for OTP)
    const identifier = email || mobile;

    if (!identifier || !otp) {
      return NextResponse.json(
        { error: 'Email/mobile and OTP are required' },
        { status: 400 }
      );
    }

    // Validate email format if email is provided
    if (email && !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json(
        { error: 'Valid email is required' },
        { status: 400 }
      );
    }

    // Validate mobile format if mobile is provided (and no email)
    if (!email && !/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { error: 'Mobile number must be 10 digits' },
        { status: 400 }
      );
    }

    // Verify OTP
    const otpResult = await verifyOtp(identifier, otp, 'LOGIN');

    if (!otpResult.success) {
      return NextResponse.json(
        { error: otpResult.error || 'Invalid OTP' },
        { status: 401 }
      );
    }

    // Find user by email or mobile
    const user = email
      ? await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
      : await prisma.user.findUnique({ where: { mobile } });

    if (!user) {
      return NextResponse.json(
        { error: 'No account found. Please sign up first.' },
        { status: 404 }
      );
    }

    // Generate JWT token
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
    console.error('OTP login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
