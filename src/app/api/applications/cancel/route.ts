import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID required' }, { status: 400 });
    }

    const application = await prisma.application.findFirst({
      where: {
        id: applicationId,
        userId: session.user.id,
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Can only cancel SUBMITTED applications (not yet being processed)
    if (application.status !== 'SUBMITTED') {
      return NextResponse.json({ error: 'Cannot cancel application that is already being processed' }, { status: 400 });
    }

    await prisma.application.update({
      where: { id: applicationId },
      data: { status: 'REJECTED' },
    });

    // Log status change
    await prisma.statusHistory.create({
      data: {
        applicationId,
        oldStatus: 'SUBMITTED',
        newStatus: 'REJECTED',
        changedBy: session.user.id,
        changedByName: session.user.name || 'User',
        note: 'Cancelled by user',
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cancel application error:', error);
    return NextResponse.json({ error: 'Failed to cancel application' }, { status: 500 });
  }
}
