// Email notification service
// In production, replace with nodemailer, SendGrid, or AWS SES

interface NotificationData {
  to: string;
  subject: string;
  body: string;
}

export async function sendEmail(data: NotificationData) {
  // Placeholder: log to console in development
  console.log(`📧 Email Notification:
    To: ${data.to}
    Subject: ${data.subject}
    Body: ${data.body}
  `);

  // In production:
  // const transporter = nodemailer.createTransport({...});
  // await transporter.sendMail({ from: 'noreply@formeasy.com', ...data });

  return { success: true };
}

export async function notifyApplicationSubmitted(userEmail: string, userName: string, examTitle: string) {
  return sendEmail({
    to: userEmail,
    subject: `Application Submitted - ${examTitle}`,
    body: `Hi ${userName},\n\nYour application for "${examTitle}" has been submitted successfully. We will process it shortly.\n\nYou can track the status from your dashboard.\n\n Regards,\nFormEasy Team`,
  });
}

export async function notifyStatusChanged(userEmail: string, userName: string, examTitle: string, newStatus: string) {
  const statusMessages: Record<string, string> = {
    IN_PROCESS: 'Your application is now being reviewed by our team.',
    FORM_FILLED: 'Your form has been filled and submitted on the official portal.',
    COMPLETED: 'Your application has been completed successfully!',
    REJECTED: 'Your application could not be processed. Please contact support for details.',
  };

  return sendEmail({
    to: userEmail,
    subject: `Application Update - ${examTitle}`,
    body: `Hi ${userName},\n\nYour application for "${examTitle}" has been updated.\n\nStatus: ${newStatus}\n${statusMessages[newStatus] || ''}\n\nYou can check the details from your dashboard.\n\n Regards,\nFormEasy Team`,
  });
}

export async function notifyPaymentConfirmed(userEmail: string, userName: string, examTitle: string, amount: number) {
  return sendEmail({
    to: userEmail,
    subject: `Payment Confirmed - ${examTitle}`,
    body: `Hi ${userName},\n\nYour payment of ₹${amount / 100} for "${examTitle}" has been confirmed.\n\nThank you for using FormEasy!\n\n Regards,\nFormEasy Team`,
  });
}
