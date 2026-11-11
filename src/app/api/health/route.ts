import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE, verifyAdminSessionToken } from '@/lib/admin-session';

export const dynamic = 'force-dynamic';

/**
 * Uptime probe. The public response is deliberately tiny — no connection
 * strings, hostnames or row counts. Signed-in admins get the full diagnostic
 * payload, which is what you need when the database is the thing that broke.
 */
export async function GET() {
  const admin = await isAdminRequest();
  const started = Date.now();

  let connected = false;
  let connectionError: string | null = null;

  try {
    await prisma.$queryRaw`SELECT 1 as alive`;
    connected = true;
  } catch (error) {
    connectionError = error instanceof Error ? error.message : String(error);
  }

  const headers = { 'Cache-Control': 'no-store' };

  if (!admin) {
    return NextResponse.json(
      {
        status: connected ? 'ok' : 'degraded',
        time: new Date().toISOString(),
      },
      { status: connected ? 200 : 503, headers }
    );
  }

  const checks: Record<string, unknown> = {
    status: connected ? 'ok' : 'degraded',
    time: new Date().toISOString(),
    latencyMs: Date.now() - started,
    prismaConnection: connected ? 'OK' : 'FAILED',
  };

  const dbUrl = process.env.DATABASE_URL || '';
  checks.databaseUrlSet = !!dbUrl;
  checks.hasBrackets = dbUrl.includes('[');
  checks.hasSslMode = dbUrl.includes('sslmode');
  checks.dbUrlPort = dbUrl.includes(':6543')
    ? '6543 (transaction pooler)'
    : dbUrl.includes(':5432')
      ? '5432 (session/direct)'
      : 'unknown';

  if (connectionError) {
    checks.prismaError = connectionError;
    if (connectionError.includes('P1001')) {
      checks.prismaErrorHint = 'Database unreachable — is Supabase paused, or should the URL use the pooler host?';
    } else if (connectionError.includes('P1010')) {
      checks.prismaErrorHint = 'Authentication failed — check the DATABASE_URL password (no brackets).';
    } else if (connectionError.includes('ECONNREFUSED')) {
      checks.prismaErrorHint = 'Connection refused — the database may be paused.';
    }
  }

  if (connected) {
    try {
      checks.examCount = await prisma.exam.count();
      checks.userCount = await prisma.user.count();
    } catch (error) {
      checks.countError = error instanceof Error ? error.message : String(error);
    }
  }

  checks.nextauthUrl = process.env.NEXTAUTH_URL ? 'set' : 'NOT SET';
  checks.nextauthSecret = process.env.NEXTAUTH_SECRET ? 'set' : 'NOT SET';
  checks.razorpayKey = process.env.RAZORPAY_KEY_ID ? 'set' : 'NOT SET';
  checks.mailer = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD ? 'configured' : 'NOT SET';

  return NextResponse.json(checks, { status: connected ? 200 : 503, headers });
}

async function isAdminRequest(): Promise<boolean> {
  try {
    const token = (await cookies()).get(ADMIN_COOKIE)?.value;
    // Signature check only — diagnostics must stay reachable when the DB is down.
    return !!token && !!verifyAdminSessionToken(token);
  } catch {
    return false;
  }
}
