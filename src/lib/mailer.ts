import nodemailer from 'nodemailer';

/**
 * Central Gmail SMTP mailer — the ONLY email provider for ClickNsit.
 *
 * Required env vars:
 *   GMAIL_USER           — full Gmail address (e.g. clicknsit@gmail.com)
 *   GMAIL_APP_PASSWORD   — 16-char App Password (spaces are stripped automatically)
 *   APP_FROM_NAME        — optional display name (defaults to "ClickNsit")
 */

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

function getTransporter() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');

  if (!user || !pass) return null;

  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: { user, pass },
  });
}

/**
 * Send an email via Gmail SMTP.
 * Returns the provider message id on success.
 */
export async function sendMail({ to, subject, html, text }: MailOptions): Promise<{ success: boolean; id?: string; error?: string }> {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`📧 [DEV MODE — GMAIL not configured] Email to: ${to} | Subject: ${subject}`);
    return { success: true, id: 'dev-mode' };
  }

  try {
    const info = await transporter.sendMail({
      from: `${process.env.APP_FROM_NAME || 'ClickNsit'} <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
      ...(text && { text }),
    });
    console.log(`✅ Email sent via Gmail SMTP to ${to} (id: ${info.messageId}) [${subject}]`);
    return { success: true, id: info.messageId };
  } catch (error: any) {
    console.error(`❌ Gmail SMTP failed to ${to}:`, error?.message || error);
    return { success: false, error: error?.message || 'Email send failed' };
  }
}

/** Escape user content embedded in HTML templates. */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
