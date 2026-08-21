import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id } = await context.params;
    const body = await request.json();

    const updateData: any = {};

    if (body.discountType !== undefined) updateData.discountType = body.discountType;
    if (body.discountValue !== undefined) updateData.discountValue = body.discountValue;
    if (body.expiryDate !== undefined) updateData.expiryDate = new Date(body.expiryDate);
    if (body.usageLimit !== undefined) updateData.usageLimit = body.usageLimit;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const coupon = await prisma.coupon.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ coupon });
  } catch (error) {
    console.error('Admin coupon update error:', error);
    return NextResponse.json({ error: 'Failed to update coupon' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id } = await context.params;

    await prisma.coupon.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin coupon delete error:', error);
    return NextResponse.json({ error: 'Failed to delete coupon' }, { status: 500 });
  }
}