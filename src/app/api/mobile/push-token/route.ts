import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/mobile-auth';
import { prisma } from '@/lib/prisma';

// POST - Register an Expo push token for the authenticated user
export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { expoPushToken, platform } = await request.json();
    if (!expoPushToken || typeof expoPushToken !== 'string') {
      return NextResponse.json({ error: 'expoPushToken is required' }, { status: 400 });
    }

    await prisma.pushToken.upsert({
      where: { token: expoPushToken },
      create: {
        userId,
        token: expoPushToken,
        platform: platform === 'ios' ? 'ios' : 'android',
      },
      update: { userId, updatedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push token register error:', error);
    return NextResponse.json({ error: 'Failed to register push token' }, { status: 500 });
  }
}

// DELETE - Remove a push token (user logged out / disabled notifications)
export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { expoPushToken } = await request.json();
    if (!expoPushToken) return NextResponse.json({ error: 'expoPushToken is required' }, { status: 400 });

    await prisma.pushToken.deleteMany({ where: { token: expoPushToken, userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Push token delete error:', error);
    return NextResponse.json({ error: 'Failed to remove push token' }, { status: 500 });
  }
}