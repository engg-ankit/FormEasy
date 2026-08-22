// Instant Telegram notifications via Edge API route
// Edge Runtime has better external API access on Vercel

interface TelegramMessage {
  type: string;
  title: string;
  message: string;
  userName?: string;
  examName?: string;
  amount?: number;
}

// Send to Telegram via Edge API (INSTANT - works from Vercel)
export async function sendTelegramInstant(data: TelegramMessage) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log('📱 [DEV] Telegram would send:', data.title);
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

    // Call Edge API route directly
    const res = await fetch(`https://formeasy2.vercel.app/api/edge/telegram`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: text,
        chat_id: chatId,
        bot_token: botToken,
      }),
      signal: AbortSignal.timeout(15000),
    });

    if (res.ok) {
      const result = await res.json();
      console.log(`✅ Telegram instant sent: ${data.title}`);
      return result;
    } else {
      const err = await res.json();
      console.error(`❌ Edge Telegram error:`, err.error);
    }
  } catch (error: any) {
    console.error(`❌ Telegram instant failed:`, error.message);
  }
}
