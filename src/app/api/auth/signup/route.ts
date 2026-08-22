import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { notifyWelcome } from '@/lib/notifications';
import { notifyNewSignup } from '@/lib/admin-notifications';
import { notifyUserWelcome } from '@/lib/user-notifications';

export async function POST(request: NextRequest) {
  try {
    const { fullName, mobile, email, password, referralCode: inputReferralCode } = await request.json();

    // Validation
    if (!fullName || !mobile || !email || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (mobile.length !== 10) {
      return NextResponse.json({ error: 'Mobile number must be 10 digits' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
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
        email,
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
        // Create referral record + give bonus
        await prisma.referral.create({
          data: {
            referrerId: referrer.id,
            referredId: user.id,
            code: inputReferralCode,
            bonusAwarded: 2500, // ₹25 bonus
          },
        });
        await prisma.user.update({
          where: { id: referrer.id },
          data: { referralBonus: { increment: 2500 } },
        });
      }
    }

    // Send welcome email + admin + user notification
    notifyWelcome(user.email, user.fullName).catch(console.error);
    notifyNewSignup(user.id, user.fullName, user.email).catch(console.error);
    notifyUserWelcome(user.id).catch(console.error);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        referralCode: userCode,
      },
    });

  } catch (error) {
    console.error('Signup error:', error);
    
    // Check for specific database errors
    if (error instanceof Error) {
      const errorDetails = error.message;
      
      // Check if it's a connection error
      if (errorDetails.includes('Can\'t reach database server') || 
          errorDetails.includes('P1001') ||
          errorDetails.includes('ENOTFOUND') ||
          errorDetails.includes('ECONNREFUSED')) {
        return NextResponse.json({ 
          error: 'Database connection failed. Please try again later or contact support.',
          details: 'Service temporarily unavailable'
        }, { status: 503 });
      }
      
      // Check if it's a table doesn't exist error
      if (errorDetails.includes('relation') && errorDetails.includes('does not exist')) {
        return NextResponse.json({ 
          error: 'Database setup incomplete. Please contact support.',
          details: 'Configuration error'
        }, { status: 500 });
      }
      
      return NextResponse.json({ 
        error: 'Failed to create user', 
        details: errorDetails 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create user', 
      details: 'Unknown error occurred' 
    }, { status: 500 });
  }
}