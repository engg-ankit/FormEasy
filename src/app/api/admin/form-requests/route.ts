import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

// Admin gets all form requests
export async function GET() {
  try {
    await requireAdminAuth();

    const requests = await prisma.formRequest.findMany({
      include: {
        user: { select: { fullName: true, email: true, mobile: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Admin form requests error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
