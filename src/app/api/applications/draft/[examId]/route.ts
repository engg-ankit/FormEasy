import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  context: { params: { examId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { examId } = context.params;
    
    // Find existing draft application
    const draft = await prisma.application.findFirst({
      where: {
        userId: session.user.id,
        examId,
        status: 'SUBMITTED', // Using SUBMITTED as draft status for simplicity
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!draft) {
      return NextResponse.json({ draft: null });
    }

    return NextResponse.json({ draft });
  } catch (error) {
    console.error('Error loading draft:', error);
    return NextResponse.json({ error: 'Failed to load draft' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: { examId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { examId } = context.params;
    const { formData } = await request.json();

    // Check if draft exists
    const existingDraft = await prisma.application.findFirst({
      where: {
        userId: session.user.id,
        examId,
        status: 'SUBMITTED',
      },
    });

    if (existingDraft) {
      // Update existing draft
      await prisma.application.update({
        where: { id: existingDraft.id },
        data: { formData: JSON.stringify(formData) },
      });
    } else {
      // Create new draft
      await prisma.application.create({
        data: {
          userId: session.user.id,
          examId,
          formData: JSON.stringify(formData),
          status: 'SUBMITTED',
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving draft:', error);
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 });
  }
}