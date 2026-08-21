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
  
  // Try Prisma connection
  try {
    await prisma.$queryRaw`SELECT 1 as alive`;
    checks.prismaConnection = 'OK';
  } catch (error) {
    checks.prismaConnection = 'FAILED';
    checks.prismaError = error instanceof Error ? error.message : String(error);
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
