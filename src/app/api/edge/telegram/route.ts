import { NextRequest, NextResponse } from 'next/server';

// API route for Telegram notifications
export async function POST(request: NextRequest) {
  try {
    const { message, chat_id, bot_token } = await request.json();

    if (!message || !chat_id || !bot_token) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const res = await fetch(`https://api.telegram.org/bot${bot_token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id,
        text: message,
      }),
    });

    const data = await res.json();

    if (data.ok) {
      console.log('✅ Edge Telegram sent');
      return NextResponse.json({ success: true, messageId: data.result?.message_id });
    } else {
      console.error('❌ Telegram API error:', data.description);
      return NextResponse.json({ error: data.description }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ Edge Telegram failed:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
