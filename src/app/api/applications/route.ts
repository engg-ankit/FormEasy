import { NextRequest, NextResponse } from 'next/server';
import { getAuthUserId } from '@/lib/mobile-auth';
import { prisma } from '@/lib/prisma';
import { notifyApplicationSubmitted } from '@/lib/notifications';
import { notifyFormSubmitted } from '@/lib/admin-notifications';
import { notifyUserFormSubmitted } from '@/lib/user-notifications';
import { sendPushToUser } from '@/lib/push';

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthUserId(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { examId, formData, totalAmount } = await request.json();

    // Store totalAmount in formData so payment API can use it
    const formDataWithAmount = { ...formData, totalAmount };

    // Delete any existing DRAFT for this user+exam (cleanup leftover drafts)
    await prisma.application.deleteMany({
      where: {
        userId,
        examId,
        status: 'DRAFT',
      },
    });

    // Create application
    const application = await prisma.application.create({
      data: {
        userId,
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
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const exam = await prisma.exam.findUnique({ where: { id: examId } });
    if (user && exam) {
      notifyApplicationSubmitted(user.email, user.fullName, exam.title).catch(console.error);
      notifyFormSubmitted(user.id, user.fullName, exam.title).catch(console.error);
      notifyUserFormSubmitted(user.id, exam.title).catch(console.error);
      sendPushToUser(user.id, 'Application Submitted ✅', `We received your ${exam.title} application. Pay the fees to start processing.`).catch(console.error);
    }

    return NextResponse.json({ applicationId: application.id });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}