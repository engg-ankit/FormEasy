import { NextResponse } from 'next/server';

// This endpoint keeps the Vercel serverless function warm
// by executing every 5 minutes via a cron job or external ping

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function GET() {
  const timestamp = new Date().toISOString();
  
  // Touch Prisma to keep the connection pool warm
  try {
    const { prisma } = await import('@/lib/prisma');
    await prisma.$queryRaw`SELECT 1`;
    console.log(`[Keep-Alive] DB warm at ${timestamp}`);
  } catch (err: any) {
    console.error(`[Keep-Alive] DB error:`, err.message);
  }

  return NextResponse.json({
    ok: true,
    message: 'ClickNsit bot is alive!',
    timestamp,
  });
}
