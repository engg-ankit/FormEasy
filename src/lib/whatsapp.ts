// WhatsApp notification utility
// Uses wa.me URL API to send pre-filled messages
// For production, integrate with WhatsApp Business API or Twilio

interface WhatsAppMessage {
  mobile: string;
  message: string;
}

// Format mobile number for WhatsApp (remove +, spaces, dashes)
function formatMobile(mobile: string): string {
  return mobile.replace(/[^0-9]/g, '');
}

// Generate WhatsApp URL
export function getWhatsAppUrl(mobile: string, message: string): string {
  const formatted = formatMobile(mobile);
  const encoded = encodeURIComponent(message);
  return `https://wa.me/91${formatted}?text=${encoded}`;
}

// Pre-built message templates
export const WhatsAppTemplates = {
  applicationSubmitted: (userName: string, examTitle: string) =>
    `Hi ${userName}! 👋\n\nYour application for *${examTitle}* has been submitted successfully on FormEasy.\n\n📋 Application Status: Submitted\n⏰ We'll process it within 24-48 hours.\n\nTrack your application: formeasy.in/dashboard\n\nThank you for choosing FormEasy! 🎯`,

  paymentConfirmed: (userName: string, examTitle: string, amount: number) =>
    `Hi ${userName}! ✅\n\nYour payment of *₹${amount}* for *${examTitle}* has been confirmed.\n\n💳 Payment Status: Successful\n📋 Application Status: In Process\n\nOur team will start working on your form shortly.\n\nTrack: formeasy.in/dashboard\n\nThank you! 🙏`,

  formFilled: (userName: string, examTitle: string) =>
    `Hi ${userName}! 🎉\n\nGreat news! Your form for *${examTitle}* has been filled and submitted to the official portal.\n\n📋 Status: Form Filled\n⏳ Waiting for portal confirmation\n\nWe'll update you once it's completed.\n\nTrack: formeasy.in/dashboard`,

  applicationCompleted: (userName: string, examTitle: string) =>
    `Hi ${userName}! 🎊\n\nCongratulations! Your application for *${examTitle}* has been *COMPLETED*.\n\n✅ Status: Completed\n📄 All done - you're all set!\n\nThank you for choosing FormEasy! We'd love your feedback. ⭐\n\nDashboard: formeasy.in/dashboard`,

  applicationRejected: (userName: string, examTitle: string, reason: string) =>
    `Hi ${userName},\n\nUnfortunately, your application for *${examTitle}* could not be processed.\n\n❌ Status: Rejected\n📝 Reason: ${reason}\n\nPlease contact our support team for assistance:\n📞 +91 9650X XXX95\n📧 support@formeasy.com\n\nWe're here to help! 🤝`,

  deadlineReminder: (userName: string, examTitle: string, daysLeft: number) =>
    `Hi ${userName}! ⏰\n\nReminder: The last date for *${examTitle}* is in *${daysLeft} days*.\n\nIf you haven't applied yet, do it now before it's too late!\n\nApply: formeasy.in/exams\n\nDon't miss out! 🎯`,

  adminNewApplication: (adminName: string, userName: string, examTitle: string) =>
    `📋 New Application Received!\n\n👤 User: ${userName}\n📝 Exam: ${examTitle}\n⏰ Time: ${new Date().toLocaleString('en-IN')}\n\nLogin to process: formeasy.in/admin/applications`,
};

// Send WhatsApp message (opens WhatsApp with pre-filled message)
export function sendWhatsAppMessage({ mobile, message }: WhatsAppMessage): void {
  const url = getWhatsAppUrl(mobile, message);
  window.open(url, '_blank');
}

// Generate WhatsApp link for admin (doesn't auto-open)
export function getWhatsAppLink(mobile: string, message: string): string {
  return getWhatsAppUrl(mobile, message);
}
