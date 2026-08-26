import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { notifyPaymentConfirmed } from '@/lib/notifications';
import { notifyPaymentDone } from '@/lib/admin-notifications';
import { notifyUserPaymentReceived } from '@/lib/user-notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = await request.json();
    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
    }

    // Get the payment record
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { payment: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    if (!application.payment) {
      return NextResponse.json({ error: 'No payment record found' }, { status: 404 });
    }

    if (application.payment.status === 'SUCCESS') {
      return NextResponse.json({ success: true, status: 'SUCCESS', message: 'Payment already verified' });
    }

    // Check with Razorpay if the order was paid
    try {
      const order = await razorpay.orders.fetch(application.payment.razorpayOrderId);
      console.log(`[PaymentCheck] Order ${order.id} status: ${order.status}, amount_paid: ${order.amount_paid}`);

      if (order.status === 'paid' || order.amount_paid > 0) {
        // Payment was made but verify route didn't fire — update manually
        console.log(`[PaymentCheck] Order ${order.id} is PAID. Updating payment to SUCCESS.`);

        // Find the payment from Razorpay
        const payments = await razorpay.orders.fetchPayments(order.id);
        const successfulPayment = payments.items?.find((p: any) => p.status === 'captured');

        if (successfulPayment) {
          await prisma.payment.update({
            where: { razorpayOrderId: order.id },
            data: {
              razorpayPaymentId: successfulPayment.id,
              status: 'SUCCESS',
            },
          });

          await prisma.application.update({
            where: { id: applicationId },
            data: { status: 'IN_PROCESS' },
          });

          await prisma.statusHistory.create({
            data: {
              applicationId,
              oldStatus: 'SUBMITTED',
              newStatus: 'IN_PROCESS',
              changedBy: 'system',
              changedByName: 'System (Manual Check)',
              note: `Payment verified manually: ₹${application.payment.amount / 100}`,
            },
          });

          // Send notifications
          const fullApp = await prisma.application.findUnique({
            where: { id: applicationId },
            include: { user: true, exam: true },
          });
          if (fullApp) {
            notifyPaymentConfirmed(fullApp.user.email, fullApp.user.fullName, fullApp.exam.title, application.payment.amount).catch(console.error);
            notifyPaymentDone(fullApp.user.id, fullApp.user.fullName, fullApp.exam.title, application.payment.amount).catch(console.error);
            notifyUserPaymentReceived(fullApp.user.id, fullApp.exam.title, application.payment.amount).catch(console.error);
          }

          return NextResponse.json({ success: true, status: 'SUCCESS', message: 'Payment verified and updated' });
        }
      }

      return NextResponse.json({ success: true, status: application.payment.status, message: 'Payment status unchanged' });
    } catch (razorpayError: any) {
      console.error(`[PaymentCheck] Razorpay API error:`, razorpayError.message);
      return NextResponse.json({ error: 'Failed to check payment status with Razorpay' }, { status: 500 });
    }

  } catch (error) {
    console.error('Payment check error:', error);
    return NextResponse.json({ error: 'Failed to check payment status' }, { status: 500 });
  }
}
