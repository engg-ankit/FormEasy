import { NextRequest, NextResponse } from 'next/server';
import { sendMessage } from '@/lib/telegram-bot';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

export async function GET() {
  if (!BOT_TOKEN) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN not set' }, { status: 500 });
  }
  if (!CHAT_ID) {
    return NextResponse.json({ error: 'TELEGRAM_CHAT_ID not set' }, { status: 500 });
  }

  try {
    await sendMessage(parseInt(CHAT_ID),
      `🧪 <b>Test Message</b>\n\n` +
      `ClickNsit Telegram Bot is working! ✅\n\n` +
      `⏰ ${new Date().toLocaleString('en-IN')}`
    );

    return NextResponse.json({ success: true, message: 'Test message sent!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
