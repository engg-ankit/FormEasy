import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { sendOtpRelaySms } from '@/lib/sms';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, portalName } = await request.json();

    if (!applicationId || !portalName) {
      return NextResponse.json(
        { error: 'Application ID and portal name are required' },
        { status: 400 }
      );
    }

    // Get application with user details
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true, exam: true },
    });

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    // Check for existing pending OTP request (prevent duplicates)
    const existingRequest = await prisma.otpRelay.findFirst({
      where: {
        applicationId,
        status: 'PENDING',
        expiresAt: { gte: new Date() },
      },
    });

    if (existingRequest) {
      return NextResponse.json({
        success: true,
        otpRelayId: existingRequest.id,
        message: 'OTP request already active',
        expiresAt: existingRequest.expiresAt,
      });
    }

    // Cancel any expired pending requests
    await prisma.otpRelay.updateMany({
      where: {
        applicationId,
        status: 'PENDING',
        expiresAt: { lt: new Date() },
      },
      data: { status: 'EXPIRED' },
    });

    // Create new OTP relay request
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    const otpRelay = await prisma.otpRelay.create({
      data: {
        applicationId,
        portalName,
        requestedBy: session.user.name || session.user.email || 'Unknown',
        requestedById: session.user.id || '',
        userMobile: application.user.mobile,
        status: 'PENDING',
        expiresAt,
      },
    });

    // Send SMS to user with OTP entry link
    const smsResult = await sendOtpRelaySms(
      application.user.mobile,
      portalName,
      otpRelay.id
    );

    // Update SMS sent status
    if (smsResult.success) {
      await prisma.otpRelay.update({
        where: { id: otpRelay.id },
        data: {
          smsSent: true,
          smsSentAt: new Date(),
        },
      });
    }

    console.log(`\n📱 OTP Relay Request Created:`);
    console.log(`   Application: ${applicationId}`);
    console.log(`   Portal: ${portalName}`);
    console.log(`   User Mobile: ${application.user.mobile}`);
    console.log(`   OTP Entry Link: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/otp/${otpRelay.id}`);
    console.log(`   SMS Sent: ${smsResult.success}`);
    console.log(`   Expires: ${expiresAt.toLocaleString()}\n`);

    return NextResponse.json({
      success: true,
      otpRelayId: otpRelay.id,
      userMobile: application.user.mobile,
      expiresAt,
      otpEntryUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/otp/${otpRelay.id}`,
    });

  } catch (error) {
    console.error('OTP Relay Request Error:', error);
    return NextResponse.json(
      { error: 'Failed to create OTP request' },
      { status: 500 }
    );
  }
}
