import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const checks: Record<string, unknown> = {};
  
  // Check DATABASE_URL exists
  checks.databaseUrlSet = !!process.env.DATABASE_URL;
  checks.databaseUrlLength = process.env.DATABASE_URL?.length || 0;
  
  // Check if URL has brackets (common mistake)
  const dbUrl = process.env.DATABASE_URL || '';
  checks.hasBrackets = dbUrl.includes('[');
  checks.hasSslMode = dbUrl.includes('sslmode');
  
  // Database URL analysis
  checks.dbUrlPort = dbUrl.includes(':5432') ? '5432 (direct)' : dbUrl.includes(':6543') ? '6543 (pooler)' : 'unknown';
  checks.dbUrlHasPassword = dbUrl.split('@')[0].split(':').slice(2).join(':').length > 0;
  
  // Try Prisma connection
  try {
    await prisma.$queryRaw`SELECT 1 as alive`;
    checks.prismaConnection = 'OK';
  } catch (error) {
    checks.prismaConnection = 'FAILED';
    const errMsg = error instanceof Error ? error.message : String(error);
    checks.prismaError = errMsg;
    if (errMsg.includes('P1001')) {
      checks.prismaErrorHint = 'Database server unreachable. Check if Supabase is paused or connection string is wrong.';
    } else if (errMsg.includes('P1010')) {
      checks.prismaErrorHint = 'Authentication failed. Check DATABASE_URL password (remove brackets if present).';
    } else if (errMsg.includes('ECONNREFUSED')) {
      checks.prismaErrorHint = 'Connection refused. Database may be paused in Supabase free tier.';
    }
  }
  
  // Try to count exams
  try {
    const count = await prisma.exam.count();
    checks.examCount = count;
  } catch (error) {
    checks.examCountError = error instanceof Error ? error.message : String(error);
  }
  
  // Try to count users
  try {
    const count = await prisma.user.count();
    checks.userCount = count;
  } catch (error) {
    checks.userCountError = error instanceof Error ? error.message : String(error);
  }
  
  // Auth config
  checks.nextauthUrl = process.env.NEXTAUTH_URL ? 'set' : 'NOT SET';
  checks.nextauthSecret = process.env.NEXTAUTH_SECRET ? 'set' : 'NOT SET';
  checks.razorpayKey = process.env.RAZORPAY_KEY_ID ? 'set' : 'NOT SET';
  
  return NextResponse.json(checks, {
    status: checks.prismaConnection === 'OK' ? 200 : 500,
  });
}
