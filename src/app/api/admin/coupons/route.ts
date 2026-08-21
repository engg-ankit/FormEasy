import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdminAuth();

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ coupons });
  } catch (error) {
    console.error('Admin coupons error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();
    const body = await request.json();
    const { code, discountType, discountValue, expiryDate, usageLimit } = body;

    // Check if coupon code already exists
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (existingCoupon) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: code.toUpperCase(),
        discountType,
        discountValue,
        expiryDate: new Date(expiryDate),
        usageLimit,
        usedCount: 0,
        isActive: true,
      },
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Admin coupon creation error:', error);
    return NextResponse.json({ error: 'Failed to create coupon' }, { status: 500 });
  }
}