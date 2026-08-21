import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

// Admin updates a form request (approve/decline)
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id } = await context.params;
    const body = await request.json();

    const { status, adminNote, estimatedFee } = body;

    if (!status || !['APPROVED', 'DECLINED', 'COMPLETED'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await prisma.formRequest.update({
      where: { id },
      data: {
        status,
        adminNote: adminNote || null,
        estimatedFee: estimatedFee || null,
      },
    });

    return NextResponse.json({ request: updated });
  } catch (error) {
    console.error('Admin form request update error:', error);
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
  }
}

// Admin deletes a form request
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id } = await context.params;

    await prisma.formRequest.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin form request delete error:', error);
    return NextResponse.json({ error: 'Failed to delete request' }, { status: 500 });
  }
}
