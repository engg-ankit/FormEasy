import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET /api/admin/cleanup-drafts - cleans up orphaned DRAFT applications
export async function GET() {
  try {
    // Find all DRAFT applications
    const drafts = await prisma.application.findMany({
      where: { status: 'DRAFT' },
      select: { id: true, userId: true, examId: true },
    });

    // Find which ones have a submitted+ application for same user+exam
    const toDelete: string[] = [];
    for (const draft of drafts) {
      const hasSubmitted = await prisma.application.findFirst({
        where: {
          userId: draft.userId,
          examId: draft.examId,
          status: { not: 'DRAFT' },
        },
      });
      if (hasSubmitted) {
        toDelete.push(draft.id);
      }
    }

    // Delete orphaned drafts
    if (toDelete.length > 0) {
      await prisma.application.deleteMany({
        where: { id: { in: toDelete } },
      });
    }

    return NextResponse.json({
      totalDrafts: drafts.length,
      orphanedDeleted: toDelete.length,
    });
  } catch (error) {
    console.error('Cleanup error:', error);
    return NextResponse.json({ error: 'Cleanup failed' }, { status: 500 });
  }
}
