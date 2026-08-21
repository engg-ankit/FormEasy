import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    await requireAdminAuth();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { user: { fullName: { contains: search } } },
        { user: { email: { contains: search } } },
        { user: { mobile: { contains: search } } },
        { exam: { title: { contains: search } } },
        { id: { contains: search } },
      ];
    }

    const [applications, total] = await Promise.all([
      prisma.application.findMany({
        where,
        include: {
          user: { select: { fullName: true, mobile: true, email: true } },
          exam: { select: { title: true, category: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.application.count({ where }),
    ]);

    return NextResponse.json({
      applications,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin applications error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}