import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const params = await context.params;

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Only successful payments can be refunded' }, { status: 400 });
    }

    // Update payment status to refunded
    const updatedPayment = await prisma.payment.update({
      where: { id: params.id },
      data: { status: 'REFUNDED' },
    });

    return NextResponse.json({ payment: updatedPayment });
  } catch (error) {
    console.error('Admin refund error:', error);
    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
  }
}