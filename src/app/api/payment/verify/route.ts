import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { notifyPaymentConfirmed } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, applicationId } = await request.json();

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature || !applicationId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify signature
    const sign = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign)
      .digest('hex');

    if (razorpaySignature !== expectedSign) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Update payment record
    const payment = await prisma.payment.update({
      where: { razorpayOrderId },
      data: {
        razorpayPaymentId,
        razorpaySignature,
        status: 'SUCCESS',
      },
    });

    // Update application status
    await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: 'IN_PROCESS',
      },
    });

    // Log payment confirmation in status history
    await prisma.statusHistory.create({
      data: {
        applicationId,
        oldStatus: 'SUBMITTED',
        newStatus: 'IN_PROCESS',
        changedBy: 'system',
        changedByName: 'System',
        note: `Payment confirmed: ₹${payment.amount / 100}`,
      },
    });

    // Send payment notification
    const app = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true, exam: true },
    });
    if (app) {
      notifyPaymentConfirmed(app.user.email, app.user.fullName, app.exam.title, payment.amount).catch(console.error);
    }

    return NextResponse.json({
      success: true,
      payment,
    });

  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}