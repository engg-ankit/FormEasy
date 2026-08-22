import { NextRequest, NextResponse } from 'next/server';
import { verifyOtp, OtpPurpose } from '@/lib/otp';

export async function POST(request: NextRequest) {
  try {
    const { mobile, otp, purpose } = await request.json();

    // Validate required fields
    if (!mobile || !otp) {
      return NextResponse.json(
        { error: 'Mobile number and OTP are required' },
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

    // Validate OTP format
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    // Validate purpose
    const validPurposes: OtpPurpose[] = ['SIGNUP', 'FORM_FILL', 'LOGIN'];
    const otpPurpose: OtpPurpose = purpose && validPurposes.includes(purpose) 
      ? purpose 
      : 'FORM_FILL';

    // Verify OTP
    const result = await verifyOtp(mobile, otp, otpPurpose);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });

  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP. Please try again.' },
      { status: 500 }
    );
  }
}
