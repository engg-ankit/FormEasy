import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // No auth required - public page for users to submit OTP
    const { id } = await params;

    const otpRelay = await prisma.otpRelay.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        otp: true,
        portalName: true,
        submittedAt: true,
        expiresAt: true,
        createdAt: true,
      },
    });

    if (!otpRelay) {
      return NextResponse.json(
        { error: 'OTP request not found' },
        { status: 404 }
      );
    }

    // Check if expired and update status
    if (otpRelay.status === 'PENDING' && new Date() > otpRelay.expiresAt) {
      await prisma.otpRelay.update({
        where: { id },
        data: { status: 'EXPIRED' },
      });
      otpRelay.status = 'EXPIRED';
    }

    return NextResponse.json({
      success: true,
      otpRelay: {
        id: otpRelay.id,
        status: otpRelay.status,
        otp: otpRelay.status === 'SUBMITTED' ? otpRelay.otp : null, // Only reveal OTP when submitted
        portalName: otpRelay.portalName,
        submittedAt: otpRelay.submittedAt,
        expiresAt: otpRelay.expiresAt,
        createdAt: otpRelay.createdAt,
      },
    });

  } catch (error) {
    console.error('OTP Status Check Error:', error);
    return NextResponse.json(
      { error: 'Failed to check OTP status' },
      { status: 500 }
    );
  }
}
