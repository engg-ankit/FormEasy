import { NextResponse } from 'next/server';
import { ADMIN_COOKIE } from '@/lib/admin-session';

export async function POST() {
  const response = NextResponse.json({ success: true });

  // Same path/attributes as when it was issued, otherwise browsers keep it.
  response.cookies.set(ADMIN_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}
