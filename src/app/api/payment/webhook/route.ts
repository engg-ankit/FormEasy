import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { notifyPaymentConfirmed } from '@/lib/notifications';
import { notifyPaymentDone } from '@/lib/admin-notifications';
import { notifyUserPaymentReceived } from '@/lib/user-notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      console.error('[Webhook] Missing signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('[Webhook] Invalid signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    const event = JSON.parse(body);

    console.log(`[Webhook] Received event: ${event.event}`);

    if (event.event === 'payment.captured') {
      const paymentData = event.payload.payment.entity;
      const razorpayOrderId = paymentData.order_id;
      const razorpayPaymentId = paymentData.id;

      console.log(`[Webhook] Payment captured for order ${razorpayOrderId}, payment ${razorpayPaymentId}`);

      // Find the payment record
      const payment = await prisma.payment.findUnique({
        where: { razorpayOrderId },
        include: { application: { include: { user: true, exam: true } } },
      });

      if (!payment) {
        console.log(`[Webhook] No payment found for order ${razorpayOrderId}`);
        return NextResponse.json({ received: true });
      }

      // If already SUCCESS, skip
      if (payment.status === 'SUCCESS') {
        console.log(`[Webhook] Payment ${payment.id} already SUCCESS, skipping`);
        return NextResponse.json({ received: true });
      }

      // Update payment record
      await prisma.payment.update({
        where: { razorpayOrderId },
        data: {
          razorpayPaymentId,
          status: 'SUCCESS',
        },
      });

      console.log(`[Webhook] Payment ${payment.id} updated to SUCCESS`);

      // Update application status
      await prisma.application.update({
        where: { id: payment.applicationId },
        data: { status: 'IN_PROCESS' },
      });

      // Log in status history
      await prisma.statusHistory.create({
        data: {
          applicationId: payment.applicationId,
          oldStatus: 'SUBMITTED',
          newStatus: 'IN_PROCESS',
          changedBy: 'system',
          changedByName: 'System (Webhook)',
          note: `Payment confirmed via webhook: ₹${payment.amount / 100}`,
        },
      });

      // Send notifications
      const app = payment.application;
      if (app) {
        notifyPaymentConfirmed(app.user.email, app.user.fullName, app.exam.title, payment.amount).catch(console.error);
        notifyPaymentDone(app.user.id, app.user.fullName, app.exam.title, payment.amount).catch(console.error);
        notifyUserPaymentReceived(app.user.id, app.exam.title, payment.amount).catch(console.error);
      }

      console.log(`[Webhook] All updates done for application ${payment.applicationId}`);
    }

    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('[Webhook] Error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
