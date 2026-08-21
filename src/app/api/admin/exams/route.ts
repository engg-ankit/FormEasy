import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    await requireAdminAuth();

    const exams = await prisma.exam.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ exams });
  } catch (error) {
    console.error('Admin exams error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminAuth();

    const body = await request.json();
    const { title, category, officialFee, serviceFee, lastDate, requiredDocuments, description, isActive } = body;

    const exam = await prisma.exam.create({
      data: {
        title,
        category,
        officialFee: parseInt(officialFee) * 100, // Convert to paise
        serviceFee: parseInt(serviceFee) * 100, // Convert to paise
        lastDate: new Date(lastDate),
        requiredDocuments: JSON.stringify(requiredDocuments),
        description,
        isActive: isActive !== false,
      },
    });

    return NextResponse.json({ exam });
  } catch (error) {
    console.error('Admin exam creation error:', error);
    return NextResponse.json({ error: 'Failed to create exam' }, { status: 500 });
  }
}