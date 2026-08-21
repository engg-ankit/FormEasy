import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdminAuth } from '@/lib/admin-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return NextResponse.json({ error: 'applicationId required' }, { status: 400 });
    }

    const notes = await prisma.note.findMany({
      where: { applicationId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Notes fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { applicationId, content } = await request.json();

    if (!applicationId || !content) {
      return NextResponse.json({ error: 'applicationId and content required' }, { status: 400 });
    }

    // Determine author from any valid session
    let authorId = '';
    let authorName = '';
    let authorRole = '';

    // Try admin session
    try {
      const admin = await requireAdminAuth();
      authorId = admin.id;
      authorName = admin.name;
      authorRole = 'admin';
    } catch {
      // Try user session
      const session = await getServerSession(authOptions);
      if (session?.user?.id) {
        authorId = session.user.id;
        authorName = session.user.name || 'User';
        authorRole = 'user';
      } else {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const note = await prisma.note.create({
      data: {
        applicationId,
        authorId,
        authorName,
        authorRole,
        content,
      },
    });

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Note creation error:', error);
    return NextResponse.json({ error: 'Failed to create note' }, { status: 500 });
  }
}
