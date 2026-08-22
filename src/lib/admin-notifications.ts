import { prisma } from './prisma';

// ─── Telegram Bot Config ───────────────────────────────────────
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

// ─── Send to Telegram with Retry ───────────────────────────────
async function sendTelegram(message: string, retries = 3) {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('📱 [DEV] Telegram notification:', message);
    return;
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: TELEGRAM_CHAT_ID,
          text: message,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (res.ok) {
        console.log('✅ Telegram notification sent');
        return;
      }

      const err = await res.json();
      console.error(`❌ Telegram API error (attempt ${attempt}):`, err.description);
    } catch (error: any) {
      console.error(`❌ Telegram attempt ${attempt}/${retries} failed:`, error.message);
      if (attempt < retries) {
        // Wait before retry: 1s, 2s, 4s
        await new Promise(r => setTimeout(r, Math.pow(2, attempt - 1) * 1000));
      }
    }
  }
}

// ─── Main Notification Function ────────────────────────────────
export async function createNotification(data: NotificationData) {
  try {
    // 1. ALWAYS save to database (this always works)
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

    // 2. Send to Telegram (with retry, don't block response)
    const emoji: Record<string, string> = {
      SIGNUP: '🎉',
      FORM_SUBMIT: '📝',
      PAYMENT: '💳',
      STATUS_CHANGE: '📋',
      FORM_REQUEST: '📩',
      OTP_RELAY: '🔑',
    };

    const telegramMessage = `${emoji[data.type] || '📢'} ${data.title}\n\n${data.message}`;
    sendTelegram(telegramMessage).catch(err => {
      console.error('Telegram delivery failed (saved to DB):', err);
    });

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
