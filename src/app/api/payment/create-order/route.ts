import { NextRequest, NextResponse } from 'next/server';
import { razorpay } from '@/lib/razorpay-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { applicationId, amount: requestedAmount } = await request.json();

    if (!applicationId) {
      return NextResponse.json({ error: 'Missing applicationId' }, { status: 400 });
    }

    // Verify application exists with exam fees
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { payment: true, exam: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if payment already exists and is successful
    if (application.payment && application.payment.status === 'SUCCESS') {
      return NextResponse.json({ error: 'Payment already completed' }, { status: 400 });
    }

    // Use stored totalAmount from formData (includes coupon discount) or calculate from fees
    let defaultAmount = application.exam.officialFee + application.exam.serviceFee;
    try {
      const parsed = JSON.parse(application.formData);
      if (parsed.totalAmount && parsed.totalAmount > 0) {
        defaultAmount = parsed.totalAmount;
      }
    } catch {}
    const amount = requestedAmount || defaultAmount;

    // If a PENDING payment already exists, return the existing order
    if (application.payment && application.payment.status === 'PENDING') {
      return NextResponse.json({
        success: true,
        order: {
          id: application.payment.razorpayOrderId,
          amount: application.payment.amount,
        },
        exam: {
          title: application.exam.title,
          officialFee: application.exam.officialFee,
          serviceFee: application.exam.serviceFee,
        },
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    // Create Razorpay order
    const options = {
      amount: amount, // Amount in paise
      currency: 'INR',
      receipt: `receipt_${applicationId}`,
      notes: {
        applicationId: applicationId,
      },
    };

    const order = await razorpay.orders.create(options);

    // Create payment record
    await prisma.payment.create({
      data: {
        applicationId,
        amount,
        razorpayOrderId: order.id,
        status: 'PENDING',
      },
    });

    return NextResponse.json({
      success: true,
      order,
      exam: {
        title: application.exam.title,
        officialFee: application.exam.officialFee,
        serviceFee: application.exam.serviceFee,
      },
      keyId: process.env.RAZORPAY_KEY_ID,
    });

  } catch (error) {
    console.error('Payment order creation error:', error);
    return NextResponse.json({ error: 'Failed to create payment order' }, { status: 500 });
  }
}