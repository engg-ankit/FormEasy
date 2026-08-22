// Instant Telegram notifications via Pipedream webhook
// Pipedream is free and forwards webhooks to Telegram instantly

const PIPEDREAM_WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || '';

interface TelegramMessage {
  type: string;
  title: string;
  message: string;
  userName?: string;
  examName?: string;
  amount?: number;
}

// Send to Telegram via Pipedream webhook (INSTANT - no Vercel network issues)
export async function sendTelegramInstant(data: TelegramMessage) {
  if (!PIPEDREAM_WEBHOOK_URL) {
    console.log('📱 [DEV] Telegram would send:', data.title, data.message);
    return;
  }

  try {
    const emojiMap: Record<string, string> = {
      SIGNUP: '🎉',
      FORM_SUBMIT: '📝',
      PAYMENT: '💳',
      STATUS_CHANGE: '📋',
      FORM_REQUEST: '📩',
    };

    const text = `${emojiMap[data.type] || '📢'} ${data.title}\n\n${data.message}`;

    const res = await fetch(PIPEDREAM_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        chat_id: process.env.TELEGRAM_CHAT_ID,
        bot_token: process.env.TELEGRAM_BOT_TOKEN,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.error(`❌ Telegram webhook HTTP ${res.status}`);
    }

    console.log(`✅ Telegram instant: ${data.title}`);
  } catch (error: any) {
    console.error(`❌ Telegram instant failed:`, error.message);
    // Save to DB for cron retry (fallback)
  }
}
