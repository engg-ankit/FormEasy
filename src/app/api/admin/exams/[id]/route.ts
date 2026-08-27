import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id } = await context.params;

    const exam = await prisma.exam.findUnique({
      where: { id },
    });

    if (!exam) {
      return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
    }

    return NextResponse.json({ exam });
  } catch (error) {
    console.error('Admin exam fetch error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id } = await context.params;
    const body = await request.json();

    const exam = await prisma.exam.update({
      where: { id },
      data: {
        title: body.title,
        category: body.category,
        portalUrl: body.portalUrl || null,
        officialFee: parseInt(body.officialFee) * 100,
        serviceFee: parseInt(body.serviceFee) * 100,
        lastDate: new Date(body.lastDate),
        requiredDocuments: JSON.stringify(body.requiredDocuments),
        description: body.description,
        isActive: body.isActive !== false,
      },
    });

    return NextResponse.json({ exam });
  } catch (error) {
    console.error('Admin exam update error:', error);
    return NextResponse.json({ error: 'Failed to update exam' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id } = await context.params;

    await prisma.exam.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin exam delete error:', error);
    return NextResponse.json({ error: 'Failed to delete exam' }, { status: 500 });
  }
}