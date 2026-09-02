import { NextResponse } from 'next/server';

// This endpoint keeps the Vercel serverless function warm
// Scheduled every 5 minutes via cron-job.org

export const runtime = 'nodejs';
export const maxDuration = 10;

export async function GET() {
  const timestamp = new Date().toISOString();
  
  return NextResponse.json({
    ok: true,
    message: 'ClickNsit is alive!',
    timestamp,
  });
}
