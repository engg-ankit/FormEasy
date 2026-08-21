import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { code, examId, amount } = await request.json();

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });

    if (!coupon) {
      return NextResponse.json({ error: 'Invalid coupon code' }, { status: 400 });
    }

    if (!coupon.isActive) {
      return NextResponse.json({ error: 'Coupon is not active' }, { status: 400 });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return NextResponse.json({ error: 'Coupon has expired' }, { status: 400 });
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });
    }

    // Calculate discount
    let discount = 0;
    if (coupon.discountType === 'PERCENT') {
      discount = Math.floor((amount * coupon.discountValue) / 100);
    } else {
      discount = coupon.discountValue;
    }

    return NextResponse.json({ 
      success: true, 
      discount,
      coupon: {
        type: coupon.discountType,
        value: coupon.discountValue,
      }
    });

  } catch (error) {
    console.error('Error validating coupon:', error);
    return NextResponse.json({ error: 'Failed to validate coupon' }, { status: 500 });
  }
}