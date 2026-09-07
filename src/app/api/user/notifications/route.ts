import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/mobile-auth';
import { prisma } from '@/lib/prisma';

// GET - Fetch user's notifications
export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await prisma.userNotification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const unreadCount = await prisma.userNotification.count({
      where: { userId, isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error('User notifications error:', error);
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }
}

// PATCH - Mark as read
export async function PATCH(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { ids, markAll } = await request.json();

    if (markAll) {
      await prisma.userNotification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else if (ids && ids.length > 0) {
      await prisma.userNotification.updateMany({
        where: { id: { in: ids }, userId },
        data: { isRead: true },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('User notification update error:', error);
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
  }
}
