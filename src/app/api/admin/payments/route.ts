import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdminAuth();

    const payments = await prisma.payment.findMany({
      include: {
        application: {
          include: {
            user: {
              select: { fullName: true, mobile: true },
            },
            exam: {
              select: { title: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ payments });
  } catch (error) {
    console.error('Admin payments error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}