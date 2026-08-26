import { prisma } from './prisma';

interface UserNotificationData {
  userId: string;
  type: 'WELCOME' | 'FORM_SUBMITTED' | 'PAYMENT_RECEIVED' | 'STATUS_UPDATE' | 'FORM_AVAILABLE' | 'REQUEST_RECEIVED';
  title: string;
  message: string;
}

export async function createUserNotification(data: UserNotificationData) {
  try {
    return await prisma.userNotification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
      },
    });
  } catch (error) {
    console.error('User notification error:', error);
    return null;
  }
}

// ─── Convenience Functions ─────────────────────────────────────

export async function notifyUserWelcome(userId: string) {
  return createUserNotification({
    userId,
    type: 'WELCOME',
    title: 'Welcome to ClickNsit! 🎉',
    message: 'Your account has been created successfully. Browse exam forms and start applying!',
  });
}

export async function notifyUserFormSubmitted(userId: string, examTitle: string) {
  return createUserNotification({
    userId,
    type: 'FORM_SUBMITTED',
    title: 'Application Submitted ✅',
    message: `Your application for "${examTitle}" has been submitted successfully. Our team will process it within 24-48 hours.`,
  });
}

export async function notifyUserPaymentReceived(userId: string, examTitle: string, amount: number) {
  return createUserNotification({
    userId,
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Confirmed 💳',
    message: `Payment of ₹${(amount / 100).toLocaleString('en-IN')} received for "${examTitle}". Your application is now in process.`,
  });
}

export async function notifyUserStatusUpdate(userId: string, examTitle: string, newStatus: string) {
  const statusMessages: Record<string, string> = {
    IN_PROCESS: 'is now being reviewed by our team',
    FORM_FILLED: 'has been filled and submitted on the official portal',
    COMPLETED: 'has been completed successfully! 🎉',
    REJECTED: 'could not be processed. Please contact support',
  };

  return createUserNotification({
    userId,
    type: 'STATUS_UPDATE',
    title: `Application Update: ${newStatus.replace(/_/g, ' ')}`,
    message: `Your application for "${examTitle}" ${statusMessages[newStatus] || 'has been updated'}.`,
  });
}

export async function notifyUserFormRequestReceived(userId: string, formName: string) {
  return createUserNotification({
    userId,
    type: 'REQUEST_RECEIVED',
    title: 'Form Request Received 📩',
    message: `Your request for "${formName}" has been received. We'll add it within 24-48 hours and notify you.`,
  });
}
