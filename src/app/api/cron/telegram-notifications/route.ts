import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';
const CRON_SECRET = process.env.CRON_SECRET || 'formeasy-cron-secret-2026';

async function sendToTelegram(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

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
    return res.ok;
  } catch {
    return false;
  }
}

// GET - Cron job runs every 2 minutes via Vercel Cron
export async function GET(request: NextRequest) {
  // Verify cron secret
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return NextResponse.json({ error: 'Telegram not configured' }, { status: 400 });
  }

  try {
    // Find notifications that haven't been sent to Telegram yet
    // We track this with a simple approach: notifications older than 30 seconds
    // that are still UNREAD might have failed Telegram delivery
    const pending = await prisma.notification.findMany({
      where: {
        status: 'UNREAD',
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 10,
    });

    if (pending.length === 0) {
      return NextResponse.json({ message: 'No pending notifications', sent: 0 });
    }

    const emojiMap: Record<string, string> = {
      SIGNUP: '🎉',
      FORM_SUBMIT: '📝',
      PAYMENT: '💳',
      STATUS_CHANGE: '📋',
      FORM_REQUEST: '📩',
      OTP_RELAY: '🔑',
    };

    let sent = 0;
    let failed = 0;

    for (const n of pending) {
      const msg = `${emojiMap[n.type] || '📢'} ${n.title}\n\n${n.message}`;
      const ok = await sendToTelegram(msg);
      if (ok) {
        sent++;
        // Small delay between messages to avoid rate limiting
        await new Promise(r => setTimeout(r, 300));
      } else {
        failed++;
      }
    }

    console.log(`[CRON] Telegram retry: ${sent} sent, ${failed} failed out of ${pending.length}`);

    return NextResponse.json({
      message: `Processed ${pending.length} notifications`,
      sent,
      failed,
    });
  } catch (error) {
    console.error('[CRON] Telegram retry error:', error);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
