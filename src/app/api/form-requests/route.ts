import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';

// User submits a form request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Please login to submit a request' }, { status: 401 });
    }

    const { formName, category, portalName, description, contactNumber } = await request.json();

    if (!formName || !category || !contactNumber) {
      return NextResponse.json({ error: 'Form name, category, and contact number are required' }, { status: 400 });
    }

    const formRequest = await prisma.formRequest.create({
      data: {
        userId: session.user.id,
        formName,
        category,
        portalName: portalName || null,
        description: description || null,
        contactNumber,
      },
    });

    return NextResponse.json({ success: true, request: formRequest });
  } catch (error) {
    console.error('Form request error:', error);
    return NextResponse.json({ error: 'Failed to submit request' }, { status: 500 });
  }
}

// User views their own requests
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await prisma.formRequest.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Form requests fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}
