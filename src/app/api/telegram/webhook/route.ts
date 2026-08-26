import { NextRequest, NextResponse } from 'next/server';
import { handleMessage, handleCallback, handleDocument } from '@/lib/telegram-bot';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle regular text messages
    if (body.message?.text) {
      handleMessage(body.message).catch(console.error);
    }

    // Handle document uploads (for admin receipt upload)
    if (body.message?.document) {
      handleDocument(body.message).catch(console.error);
    }

    // Handle inline button clicks
    if (body.callback_query) {
      handleCallback(body.callback_query).catch(console.error);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[TG Webhook] Error:', error);
    return NextResponse.json({ ok: true });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    bot: 'ClickNsit Telegram Bot v2',
    features: ['messages', 'callbacks', 'documents'],
    timestamp: new Date().toISOString(),
  });
}
