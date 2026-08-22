import { prisma } from './prisma';

// ─── Telegram Bot Config ───────────────────────────────────────
// Admin ko Telegram pe instant notification bhejta hai
// Setup: @BotFather pe /newbot banao, phir token yahan daalo
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

interface NotificationData {
  type: 'SIGNUP' | 'FORM_SUBMIT' | 'PAYMENT' | 'STATUS_CHANGE' | 'FORM_REQUEST' | 'OTP_RELAY';
  title: string;
  message: string;
  userId?: string;
  userName?: string;
  examName?: string;
  amount?: number;
}

// ─── Send to Telegram ──────────────────────────────────────────
async function sendTelegram(message: string) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('📱 [DEV] Telegram notification:', message);
    return;
  }

  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });
    console.log('✅ Telegram notification sent');
  } catch (error) {
    console.error('❌ Telegram notification failed:', error);
  }
}

// ─── Main Notification Function ────────────────────────────────
export async function createNotification(data: NotificationData) {
  try {
    // 1. Save to database
    const notification = await prisma.notification.create({
      data: {
        type: data.type,
        title: data.title,
        message: data.message,
        userId: data.userId || null,
        userName: data.userName || null,
        examName: data.examName || null,
        amount: data.amount || null,
      },
    });

    // 2. Send to Telegram
    const emoji = {
      SIGNUP: '🎉',
      FORM_SUBMIT: '📝',
      PAYMENT: '💳',
      STATUS_CHANGE: '📋',
      FORM_REQUEST: '📩',
      OTP_RELAY: '🔑',
    }[data.type] || '📢';

    const telegramMessage = `${emoji} <b>${data.title}</b>\n\n${data.message}`;
    await sendTelegram(telegramMessage);

    return notification;
  } catch (error) {
    console.error('Notification error:', error);
    return null;
  }
}

// ─── Convenience Functions ─────────────────────────────────────

export async function notifyNewSignup(userId: string, userName: string, email: string) {
  return createNotification({
    type: 'SIGNUP',
    title: 'New User Signup',
    message: `👤 ${userName}\n📧 ${email}\n🎉 Welcome email sent!`,
    userId,
    userName,
  });
}

export async function notifyFormSubmitted(userId: string, userName: string, examTitle: string) {
  return createNotification({
    type: 'FORM_SUBMIT',
    title: 'Application Submitted',
    message: `👤 ${userName}\n📝 Form: ${examTitle}\n✅ Status: SUBMITTED`,
    userId,
    userName,
    examName: examTitle,
  });
}

export async function notifyPaymentDone(userId: string, userName: string, examTitle: string, amount: number) {
  return createNotification({
    type: 'PAYMENT',
    title: 'Payment Received',
    message: `👤 ${userName}\n💳 Amount: ₹${(amount / 100).toLocaleString('en-IN')}\n📝 Exam: ${examTitle}`,
    userId,
    userName,
    examName: examTitle,
    amount,
  });
}

export async function notifyStatusUpdated(examTitle: string, userName: string, newStatus: string) {
  const statusEmoji: Record<string, string> = {
    IN_PROCESS: '🔍',
    FORM_FILLED: '📝',
    COMPLETED: '🎉',
    REJECTED: '❌',
  };

  return createNotification({
    type: 'STATUS_CHANGE',
    title: `Status Updated: ${newStatus.replace(/_/g, ' ')}`,
    message: `👤 ${userName}\n📝 Exam: ${examTitle}\n${statusEmoji[newStatus] || '📋'} New Status: ${newStatus.replace(/_/g, ' ')}`,
    userName,
    examName: examTitle,
  });
}

export async function notifyFormRequest(userId: string, userName: string, formName: string, category: string) {
  return createNotification({
    type: 'FORM_REQUEST',
    title: 'New Form Request',
    message: `👤 ${userName}\n📝 Requested: ${formName}\n📂 Category: ${category}`,
    userId,
    userName,
    examName: formName,
  });
}
