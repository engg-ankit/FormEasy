import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { notifyWelcome } from '@/lib/notifications';
import { notifyNewSignup } from '@/lib/admin-notifications';
import { notifyUserWelcome } from '@/lib/user-notifications';
import { signUserToken } from '@/lib/mobile-auth';
// Supabase handles OTP verification internally.
// If verifyOtp succeeds in the frontend/backend flow,
// we trust the phone is verified.

export async function POST(request: NextRequest) {
  try {
    const { fullName, mobile, email, password, referralCode: inputReferralCode } = await request.json();

    // Validation
    if (!fullName || !mobile || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
      return NextResponse.json({ error: 'Mobile number must be 10 digits' }, { status: 400 });
    }

    if (!/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    // Note: OTP verification happens via /api/otp/verify before calling signup.
    // Supabase Auth internally tracks phone verification status.

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { mobile },
        ],
      },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'User with this email or mobile already exists' }, { status: 400 });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Generate unique referral code
    const userCode = 'FE' + mobile.slice(-4) + Math.random().toString(36).slice(2, 6).toUpperCase();

    // Create user
    const user = await prisma.user.create({
      data: {
        fullName,
        mobile,
        email: email.toLowerCase(),
        passwordHash,
        referralCode: userCode,
        referredBy: inputReferralCode || null,
      },
    });

    // Track referral if valid code provided
    if (inputReferralCode) {
      const referrer = await prisma.user.findFirst({
        where: { referralCode: inputReferralCode },
      });
      if (referrer && referrer.id !== user.id) {
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: user.id,
            code: inputReferralCode,
            bonusAwarded: 2500,
          },
        });
        await prisma.user.update({
          where: { id: referrer.id },
          data: { referralBonus: { increment: 2500 } },
        });
      }
    }

    // Send notifications
    notifyWelcome(user.email, user.fullName).catch(console.error);
    notifyNewSignup(user.id, user.fullName, user.email).catch(console.error);
    notifyUserWelcome(user.id).catch(console.error);

    // Generate JWT token for auto-login
    const token = await signUserToken({ id: user.id, email: user.email });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        mobile: user.mobile,
        referralCode: userCode,
        referralBonus: 0,
      },
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    if (error instanceof Error) {
      const errorDetails = error.message;
      
      if (errorDetails.includes('Can\'t reach database server') || 
          errorDetails.includes('P1001') ||
          errorDetails.includes('ENOTFOUND') ||
          errorDetails.includes('ECONNREFUSED')) {
        return NextResponse.json({ 
          error: 'Database connection failed. Please try again later.',
          details: 'Service temporarily unavailable'
        }, { status: 503 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to create user', 
        details: errorDetails 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create user' 
    }, { status: 500 });
  }
}
