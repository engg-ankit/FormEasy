import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { notifyStatusChanged } from '@/lib/notifications';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id } = await context.params;

    const application = await prisma.application.findUnique({
      where: { id },
      include: {
        user: { select: { fullName: true, mobile: true, email: true } },
        exam: { select: { title: true, category: true, officialFee: true, serviceFee: true } },
        documents: true,
        payment: true,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const statusHistory = await prisma.statusHistory.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ 
      application,
      statusHistory 
    });
  } catch (error) {
    console.error('Admin application fetch error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id } = await context.params;
    const body = await request.json();

    const updateData: any = {};

    if (body.status) {
      updateData.status = body.status;
    }



    // Log status change in history
    if (body.status) {
      const current = await prisma.application.findUnique({ where: { id }, select: { status: true } });
      if (current && current.status !== body.status) {
        await prisma.statusHistory.create({
          data: {
            applicationId: id,
            oldStatus: current.status,
            newStatus: body.status,
            changedBy: 'admin',
            changedByName: 'Admin',
          },
        });
      }
    }

    const application = await prisma.application.update({
      where: { id },
      data: updateData,
    });

    // Send notification + award commission on status change
    if (body.status) {
      const fullApp = await prisma.application.findUnique({
        where: { id },
        include: { user: true, exam: true },
      });
      if (fullApp) {
        notifyStatusChanged(fullApp.user.email, fullApp.user.fullName, fullApp.exam.title, body.status).catch(console.error);
      }

    }

    // Return application with status history
    const history = await prisma.statusHistory.findMany({
      where: { applicationId: id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ application, statusHistory: history });
  } catch (error) {
    console.error('Admin application update error:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}