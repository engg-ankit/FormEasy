import { NextRequest, NextResponse } from 'next/server';
import { handleMessage } from '@/lib/telegram-bot';

// Telegram sends updates here via POST
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Handle regular messages
    if (body.message) {
      // Process in background (don't block response)
      handleMessage(body.message).catch((err) => {
        console.error('[Telegram Webhook] Handler error:', err);
      });
    }

    // Always respond 200 to Telegram (or it'll keep retrying)
    return NextResponse.json({ ok: true });

  } catch (error) {
    console.error('[Telegram Webhook] Error:', error);
    return NextResponse.json({ ok: true }); // Still 200 to prevent retries
  }
}

// GET — Health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    bot: 'ClickNsit Telegram Bot',
    timestamp: new Date().toISOString(),
  });
}
