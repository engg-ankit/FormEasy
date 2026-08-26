import { NextRequest, NextResponse } from 'next/server';
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
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: `🧪 <b>ClickNsit Bot Test</b>\n\nBot is working! ✅\n⏰ ${new Date().toLocaleString('en-IN')}`,
        parse_mode: 'HTML',
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (res.ok) {
      return NextResponse.json({ success: true, message: 'Test message sent!' });
    } else {
      const data = await res.json();
      return NextResponse.json({ error: data.description || 'Failed' }, { status: 500 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
