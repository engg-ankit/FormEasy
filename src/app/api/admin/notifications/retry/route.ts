import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

async function sendToTelegram(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) return false;

  try {
    const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
      }),
      signal: AbortSignal.timeout(10000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// POST - Retry sending unread notifications to Telegram
export async function POST() {
  try {
    await requireAdminAuth();

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return NextResponse.json({ error: 'Telegram not configured' }, { status: 400 });
    }

    // Get all unread notifications
    const unread = await prisma.notification.findMany({
      where: { status: 'UNREAD' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    if (unread.length === 0) {
      return NextResponse.json({ message: 'No unread notifications to retry', sent: 0 });
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
    for (const n of unread) {
      const msg = `${emojiMap[n.type] || '📢'} ${n.title}\n\n${n.message}`;
      const ok = await sendToTelegram(msg);
      if (ok) sent++;
    }

    return NextResponse.json({ sent, total: unread.length });
  } catch (error) {
    console.error('Retry notifications error:', error);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}
