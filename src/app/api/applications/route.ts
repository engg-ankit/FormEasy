import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { prisma } from '@/lib/prisma';
import { notifyApplicationSubmitted } from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { examId, formData, totalAmount } = await request.json();

    // Store totalAmount in formData so payment API can use it
    const formDataWithAmount = { ...formData, totalAmount };

    // Create application
    const application = await prisma.application.create({
      data: {
        userId: session.user.id,
        examId,
        formData: JSON.stringify(formDataWithAmount),
        status: 'SUBMITTED',
      },
    });

    // Create documents
    for (const doc of formData.documents) {
      if (doc.url) {
        await prisma.document.create({
          data: {
            applicationId: application.id,
            docType: doc.type,
            fileUrl: doc.url,
          },
        });
      }
    }

    // Send notification
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (user && exam) {
      notifyApplicationSubmitted(user.email, user.fullName, exam.title).catch(console.error);
    }

    return NextResponse.json({ applicationId: application.id });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}