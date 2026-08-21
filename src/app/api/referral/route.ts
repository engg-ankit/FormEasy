import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { referralCode: true, referralBonus: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get referral stats
    const referrals = await prisma.referral.findMany({
      where: { referrerId: session.user.id },
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
