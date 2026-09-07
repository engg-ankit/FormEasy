import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/mobile-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, referralBonus: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get referral stats
    const referrals = await prisma.referral.findMany({
      where: { referrerId: userId },
      include: { referredUser: { select: { fullName: true, createdAt: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      referralCode: user.referralCode,
      referralBonus: user.referralBonus,
      totalReferrals: referrals.length,
      referrals: referrals.map(r => ({
        name: r.referredUser.fullName,
        joinedAt: r.createdAt,
        bonus: r.bonusAwarded,
      })),
    });
  } catch (error) {
    console.error('Referral fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch referral info' }, { status: 500 });
  }
}
