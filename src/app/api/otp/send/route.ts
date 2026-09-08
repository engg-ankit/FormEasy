import { NextRequest, NextResponse } from 'next/server';
import { sendOtp } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { mobile, email, purpose } = await request.json();

    // Support both mobile and email (email takes priority for OTP)
    const identifier = email || mobile;

    // Validate required fields
    if (!identifier) {
      return NextResponse.json(
        { error: 'Email or mobile number is required' },
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

    // Send OTP via email (100% FREE!)
    const result = await sendOtp(identifier, purpose || 'SIGNUP');

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      // Include OTP in dev mode for testing
      ...(result.devOtp && { devOtp: result.devOtp }),
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
