import { NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const admin = await requireAdminAuth();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

    const [
      totalApplications,
      todayApplications,
      pendingApplications,
      inProcessApplications,
      completedApplications,
      completedThisWeek,
      revenueThisMonth,
      recentApplications,
    ] = await Promise.all([
      prisma.application.count(),
      prisma.application.count({
        where: {
          createdAt: { gte: today },
        },
      }),
      prisma.application.count({
        where: { status: 'SUBMITTED' },
      }),
      prisma.application.count({
        where: { status: 'IN_PROCESS' },
      }),
      prisma.application.count({
        where: { status: 'COMPLETED' },
      }),
      prisma.application.count({
        where: {
          status: 'COMPLETED',
          updatedAt: { gte: weekAgo },
        },
      }),
      prisma.payment.aggregate({
        where: {
          status: 'SUCCESS',
          createdAt: { gte: monthStart },
        },
        _sum: { amount: true },
      }),
      prisma.application.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { fullName: true, mobile: true, email: true } },
          exam: { select: { title: true, category: true, officialFee: true, serviceFee: true } },
          payment: { select: { status: true, amount: true } },
        },
      }),
    ]);

    return NextResponse.json({
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
      },
      stats: {
        totalApplications,
        todayApplications,
        pendingApplications,
        inProcessApplications,
        completedApplications,
        completedThisWeek,
        revenueThisMonth: revenueThisMonth._sum.amount || 0,
      },
      recentApplications,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}