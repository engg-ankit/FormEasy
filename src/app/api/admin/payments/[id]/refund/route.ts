import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();

    const payment = await prisma.payment.findUnique({
      where: { id: params.id },
      include: { application: true },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'SUCCESS') {
      return NextResponse.json({ error: 'Can only refund successful payments' }, { status: 400 });
    }

    // Update payment status to REFUNDED
    await prisma.payment.update({
      where: { id: params.id },
      data: { status: 'REFUNDED' },
    });

    // Update application status to REJECTED
    await prisma.application.update({
      where: { id: payment.applicationId },
      data: { status: 'REJECTED' },
    });

    return NextResponse.json({ success: true, message: 'Refund processed' });
  } catch (error) {
    console.error('Refund error:', error);
    return NextResponse.json({ error: 'Failed to process refund' }, { status: 500 });
  }
}
