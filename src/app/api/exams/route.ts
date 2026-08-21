import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const exams = await prisma.exam.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Error fetching exams:', error);
    return NextResponse.json({ error: 'Failed to fetch exams' }, { status: 500 });
  }
}