import { NextRequest, NextResponse } from 'next/server';
import { sendOtp, OtpPurpose } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { mobile, purpose } = await request.json();

    // Validate required fields
    if (!mobile) {
      return NextResponse.json(
        { error: 'Mobile number is required' },
        { status: 400 }
      );
    }

    // Validate mobile format
    if (!/^\d{10}$/.test(mobile)) {
      return NextResponse.json(
        { error: 'Mobile number must be 10 digits' },
        { status: 400 }
      );
    }

    // Validate purpose
    const validPurposes: OtpPurpose[] = ['SIGNUP', 'FORM_FILL', 'LOGIN'];
    const otpPurpose: OtpPurpose = purpose && validPurposes.includes(purpose) 
      ? purpose 
      : 'FORM_FILL';

    // Send OTP
    const result = await sendOtp(mobile, otpPurpose);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message, cooldownSeconds: result.cooldownSeconds },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to send OTP. Please try again.' },
      { status: 500 }
    );
  }
}
