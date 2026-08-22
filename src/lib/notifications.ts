import nodemailer from 'nodemailer';

// Gmail SMTP Configuration (Free - No Domain Needed!)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER || '',
    pass: process.env.GMAIL_APP_PASSWORD || '',
  },
});

const FROM_EMAIL = process.env.GMAIL_USER || 'noreply@formeasy.in';
const FROM_NAME = 'FormEasy';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  // Check if Gmail is configured
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.log(`📧 [DEV MODE] Email would be sent to: ${to}`);
    console.log(`   Subject: ${subject}`);
    console.log(`   Configure GMAIL_USER and GMAIL_APP_PASSWORD in .env to send real emails`);
    return { success: true, dev: true };
  }

  try {
    const result = await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`✅ Email sent to ${to}: ${subject} (id: ${result.messageId})`);
    return { success: true, id: result.messageId };
  } catch (error) {
    console.error(`❌ Email failed to ${to}:`, error);
    return { success: false, error };
  }
}

// ─── Base Email Template ────────────────────────────────────────

function baseTemplate(title: string, content: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#1B2559;border-radius:12px 12px 0 0;padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">Form<span style="color:#2DD4BF;">Easy</span></h1>
      <p style="color:#9CA3AF;margin:5px 0 0;font-size:12px;letter-spacing:2px;">EVERY FORM. ONE PLATFORM.</p>
    </div>
    <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color:#1B2559;margin-top:0;">${title}</h2>
      ${content}
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="color:#9CA3AF;font-size:12px;text-align:center;margin:0;">
        This is an automated email from FormEasy.<br>
        © ${new Date().getFullYear()} FormEasy. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
}

// ─── Notification Functions ─────────────────────────────────────

export async function notifyWelcome(userEmail: string, userName: string) {
  return sendEmail({
    to: userEmail,
    subject: '🎉 Welcome to FormEasy!',
    html: baseTemplate(
      'Welcome to FormEasy!',
      `<p style="color:#374151;font-size:15px;">Hi <strong>${userName}</strong>,</p>
      <p style="color:#374151;font-size:15px;">Welcome to <strong style="color:#1B2559;">FormEasy</strong> — your one-stop platform for form filling!</p>
      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#5b21b6;font-size:14px;"><strong>🚀 Here's what you can do:</strong></p>
        <ul style="color:#5b21b6;font-size:14px;margin:8px 0;padding-left:20px;">
          <li>Browse & apply for exam forms</li>
          <li>Track application status in real-time</li>
          <li>Upload documents securely</li>
          <li>Make secure payments</li>
        </ul>
      </div>
      <a href="https://formeasy2.vercel.app/exams" style="display:inline-block;background:#1B2559;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Browse Forms →</a>`
    ),
  });
}

export async function notifyApplicationSubmitted(userEmail: string, userName: string, examTitle: string) {
  return sendEmail({
    to: userEmail,
    subject: `✅ Application Submitted - ${examTitle}`,
    html: baseTemplate(
      'Application Submitted Successfully!',
      `<p style="color:#374151;font-size:15px;">Hi <strong>${userName}</strong>,</p>
      <p style="color:#374151;font-size:15px;">Your application for <strong style="color:#1B2559;">${examTitle}</strong> has been submitted successfully.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#166534;font-size:14px;">📋 <strong>Status:</strong> Submitted</p>
        <p style="margin:8px 0 0;color:#166534;font-size:14px;">⏰ We'll process it within 24-48 hours.</p>
      </div>
      <a href="https://formeasy2.vercel.app/dashboard" style="display:inline-block;background:#1B2559;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">View Dashboard →</a>`
    ),
  });
}

export async function notifyPaymentConfirmed(userEmail: string, userName: string, examTitle: string, amount: number) {
  return sendEmail({
    to: userEmail,
    subject: `💳 Payment Confirmed - ${examTitle}`,
    html: baseTemplate(
      'Payment Confirmed!',
      `<p style="color:#374151;font-size:15px;">Hi <strong>${userName}</strong>,</p>
      <p style="color:#374151;font-size:15px;">Your payment for <strong style="color:#1B2559;">${examTitle}</strong> has been confirmed.</p>
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#1e40af;font-size:20px;font-weight:bold;">₹${(amount / 100).toLocaleString('en-IN')}</p>
        <p style="margin:8px 0 0;color:#1e40af;font-size:14px;">💳 Payment Status: <strong>Successful</strong></p>
        <p style="margin:4px 0 0;color:#1e40af;font-size:14px;">📋 Application Status: <strong>In Process</strong></p>
      </div>
      <a href="https://formeasy2.vercel.app/dashboard" style="display:inline-block;background:#1B2559;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Track Application →</a>`
    ),
  });
}

export async function notifyFormRequestSubmitted(userEmail: string, userName: string, formName: string, category: string) {
  return sendEmail({
    to: userEmail,
    subject: `📝 Form Request Received - ${formName}`,
    html: baseTemplate(
      'Form Request Received!',
      `<p style="color:#374151;font-size:15px;">Hi <strong>${userName}</strong>,</p>
      <p style="color:#374151;font-size:15px;">We've received your request for <strong style="color:#1B2559;">${formName}</strong>.</p>
      <div style="background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:#9a3412;font-size:14px;">📋 <strong>Form:</strong> ${formName}</p>
        <p style="margin:4px 0 0;color:#9a3412;font-size:14px;">📂 <strong>Category:</strong> ${category}</p>
        <p style="margin:8px 0 0;color:#9a3412;font-size:14px;">⏰ Our team will review and add this form within 24-48 hours.</p>
      </div>
      <p style="color:#374151;font-size:15px;">We'll notify you once the form is available!</p>
      <a href="https://formeasy2.vercel.app/exams" style="display:inline-block;background:#1B2559;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">Browse Available Forms →</a>`
    ),
  });
}

export async function notifyStatusChanged(userEmail: string, userName: string, examTitle: string, newStatus: string) {
  const statusConfig: Record<string, { color: string; bg: string; border: string; emoji: string; message: string }> = {
    IN_PROCESS: { color: '#92400e', bg: '#fffbeb', border: '#fde68a', emoji: '🔍', message: 'Your application is now being reviewed by our team.' },
    FORM_FILLED: { color: '#1e40af', bg: '#eff6ff', border: '#bfdbfe', emoji: '📝', message: 'Your form has been filled and submitted on the official portal.' },
    COMPLETED: { color: '#166534', bg: '#f0fdf4', border: '#bbf7d0', emoji: '🎉', message: 'Your application has been completed successfully!' },
    REJECTED: { color: '#991b1b', bg: '#fef2f2', border: '#fecaca', emoji: '❌', message: 'Your application could not be processed. Please contact support.' },
  };

  const config = statusConfig[newStatus] || { color: '#374151', bg: '#f9fafb', border: '#e5e7eb', emoji: '📋', message: `Status updated to: ${newStatus}` };

  return sendEmail({
    to: userEmail,
    subject: `${config.emoji} Application Update - ${examTitle}`,
    html: baseTemplate(
      'Application Status Updated',
      `<p style="color:#374151;font-size:15px;">Hi <strong>${userName}</strong>,</p>
      <p style="color:#374151;font-size:15px;">Your application for <strong style="color:#1B2559;">${examTitle}</strong> has been updated.</p>
      <div style="background:${config.bg};border:1px solid ${config.border};border-radius:8px;padding:16px;margin:16px 0;">
        <p style="margin:0;color:${config.color};font-size:16px;font-weight:bold;">${config.emoji} ${newStatus.replace(/_/g, ' ')}</p>
        <p style="margin:8px 0 0;color:${config.color};font-size:14px;">${config.message}</p>
      </div>
      <a href="https://formeasy2.vercel.app/dashboard" style="display:inline-block;background:#1B2559;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin:16px 0;">View Details →</a>`
    ),
  });
}
