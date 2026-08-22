import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { otpRelayId, otp } = await request.json();

    if (!otpRelayId || !otp) {
      return NextResponse.json(
        { error: 'OTP Relay ID and OTP are required' },
        { status: 400 }
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return NextResponse.json(
        { error: 'OTP must be 6 digits' },
        { status: 400 }
      );
    }

    // Find the OTP relay request
    const otpRelay = await prisma.otpRelay.findUnique({
      where: { id: otpRelayId },
    });

    if (!otpRelay) {
      return NextResponse.json(
        { error: 'Invalid OTP request' },
        { status: 404 }
      );
    }

    // Check if already submitted
    if (otpRelay.status === 'SUBMITTED') {
      return NextResponse.json(
        { error: 'OTP already submitted' },
        { status: 400 }
      );
    }

    // Check if expired
    if (new Date() > otpRelay.expiresAt) {
      await prisma.otpRelay.update({
        where: { id: otpRelayId },
        data: { status: 'EXPIRED' },
      });
      return NextResponse.json(
        { error: 'OTP request has expired. Please ask admin to send a new request.' },
        { status: 400 }
      );
    }

    // Check if cancelled
    if (otpRelay.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'This OTP request has been cancelled' },
        { status: 400 }
      );
    }

    // Store OTP and mark as submitted
    await prisma.otpRelay.update({
      where: { id: otpRelayId },
      data: {
        otp,
        status: 'SUBMITTED',
        submittedAt: new Date(),
      },
    });

    console.log(`\n✅ OTP Submitted:`);
    console.log(`   Request ID: ${otpRelayId}`);
    console.log(`   Portal: ${otpRelay.portalName}`);
    console.log(`   OTP: ${otp}\n`);

    return NextResponse.json({
      success: true,
      message: 'OTP submitted successfully! Admin can now see it.',
    });

  } catch (error) {
    console.error('OTP Submit Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit OTP' },
      { status: 500 }
    );
  }
}
