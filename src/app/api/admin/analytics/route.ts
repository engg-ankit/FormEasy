import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth();
    
    const searchParams = request.nextUrl.searchParams;
    const days = parseInt(searchParams.get('days') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Applications by status
    const applicationsByStatus = await prisma.application.groupBy({
      by: ['status'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    const statusData = [
      { name: 'Submitted', value: 0, color: '#8B5CF6' },
      { name: 'In Process', value: 0, color: '#3B82F6' },
      { name: 'Form Filled', value: 0, color: '#10B981' },
      { name: 'Completed', value: 0, color: '#F59E0B' },
      { name: 'Rejected', value: 0, color: '#EF4444' },
    ];

    applicationsByStatus.forEach((item) => {
      const index = statusData.findIndex(s => s.name.toLowerCase().replace(' ', '_') === item.status);
      if (index !== -1) {
        statusData[index].value = item._count;
      }
    });

    // Applications by category
    const applicationsByCategory = await prisma.application.groupBy({
      by: ['examId'],
      where: {
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    const categoryData = await Promise.all(
      applicationsByCategory.map(async (item) => {
        const exam = await prisma.exam.findUnique({
          where: { id: item.examId },
          select: { category: true },
        });
        return {
          name: exam?.category || 'Unknown',
          applications: item._count,
        };
      })
    );

    // Group by category
    const groupedCategories = categoryData.reduce((acc, item) => {
      const existing = acc.find(c => c.name === item.name);
      if (existing) {
        existing.applications += item.applications;
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as Array<{ name: string; applications: number }>);

    // Revenue by month
    const payments = await prisma.payment.findMany({
      where: {
        createdAt: { gte: startDate },
        status: 'SUCCESS',
      },
      select: {
        createdAt: true,
        amount: true,
      },
    });

    const revenueByMonth = payments.reduce((acc, payment) => {
      const month = payment.createdAt.toLocaleString('default', { month: 'short', year: '2-digit' });
      const existing = acc.find(r => r.month === month);
      if (existing) {
        existing.revenue += payment.amount;
      } else {
        acc.push({ month, revenue: payment.amount });
      }
      return acc;
    }, [] as Array<{ month: string; revenue: number }>);

    // Applications by day
    const applicationsByDay = await prisma.application.findMany({
      where: {
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const dailyApplications = applicationsByDay.reduce((acc, app) => {
      const date = app.createdAt.toLocaleDateString();
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.applications += 1;
      } else {
        acc.push({ date, applications: 1 });
      }
      return acc;
    }, [] as Array<{ date: string; applications: number }>);

    // Summary statistics
    const totalApplications = await prisma.application.count({
      where: { createdAt: { gte: startDate } },
    });

    const totalRevenue = await prisma.payment.aggregate({
      where: {
        createdAt: { gte: startDate },
        status: 'SUCCESS',
      },
      _sum: { amount: true },
    });

    const successfulPayments = await prisma.payment.count({
      where: {
        createdAt: { gte: startDate },
        status: 'SUCCESS',
      },
    });

    const totalPayments = await prisma.payment.count({
      where: { createdAt: { gte: startDate } },
    });

    const successRate = totalPayments > 0 ? Math.round((successfulPayments / totalPayments) * 100) : 0;

    const activeUsers = await prisma.user.count({
      where: {
        applications: {
          some: {
            createdAt: { gte: startDate },
          },
        },
      },
    });

    return NextResponse.json({
      applicationsByStatus: statusData,
      applicationsByCategory: groupedCategories,
      revenueByMonth,
      applicationsByDay: dailyApplications,
      summary: {
        totalApplications,
        totalRevenue: totalRevenue._sum.amount || 0,
        successRate,
        activeUsers,
      },
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}