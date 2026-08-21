import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}