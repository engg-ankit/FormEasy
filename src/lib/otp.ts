import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sendMail, escapeHtml } from '@/lib/mailer';

interface OtpResult {
  success: boolean;
  message: string;
  // In development, include OTP for testing
  devOtp?: string;
}

/**
 * Generate a 6-digit OTP
 */
function generateOtp(): string {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Hash OTP using bcrypt
 */
async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

/**
 * Send OTP via email (100% FREE!)
 */
async function sendOtpEmail(
  email: string,
  otp: string,
  purpose: string
): Promise<{ success: boolean; error?: string }> {
  const purposeLabels: Record<string, string> = {
    SIGNUP: 'Sign Up',
    LOGIN: 'Login',
    FORM_FILL: 'Form Fill',
    PASSWORD_RESET: 'Password Reset',
  };

  const purposeLabel = purposeLabels[purpose] || purpose;
  const safePurposeLabel = escapeHtml(purposeLabel);

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="background:#1B2559;border-radius:12px 12px 0 0;padding:30px;text-align:center;">
      <h1 style="color:#fff;margin:0;font-size:24px;">Click<span style="color:#f26338;">Nsit</span></h1>
      <p style="color:#9CA3AF;margin:5px 0 0;font-size:12px;letter-spacing:2px;">CLICK. SIT. DONE.</p>
    </div>
    <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
      <h2 style="color:#1B2559;margin-top:0;">Your OTP for ${safePurposeLabel}</h2>
      <p style="color:#374151;font-size:15px;">Use the following OTP to complete your ${safePurposeLabel.toLowerCase()}:</p>
      
      <div style="background:#f5f3ff;border:2px dashed #8b5cf6;border-radius:12px;padding:24px;margin:24px 0;text-align:center;">
        <p style="margin:0;font-size:36px;font-weight:bold;color:#1B2559;letter-spacing:8px;">${otp}</p>
      </div>
      
      <p style="color:#ef4444;font-size:14px;font-weight:600;">⚠️ This OTP expires in 5 minutes.</p>
      <p style="color:#6b7280;font-size:13px;">If you didn't request this OTP, please ignore this email.</p>
      
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="color:#9CA3AF;font-size:12px;text-align:center;margin:0;">
        This is an automated email from ClickNsit.<br>
        © ${new Date().getFullYear()} ClickNsit. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;

  // Gmail SMTP is the only provider (see src/lib/mailer.ts)
  const result = await sendMail({
    to: email,
    subject: `🔐 Your OTP for ${purposeLabel} - ClickNsit`,
    html,
    text: `Your ClickNsit OTP for ${purposeLabel} is ${otp}. It expires in 5 minutes. If you didn't request this, ignore this email.`,
  });

  return result.success
    ? { success: true }
    : { success: false, error: result.error || 'Email send failed' };
}

/**
 * Send OTP - generates, stores in DB, and sends via email
 * @param identifier - email address (for email OTP)
 * @param purpose - 'SIGNUP', 'LOGIN', 'FORM_FILL', 'PASSWORD_RESET'
 */
export async function sendOtp(
  identifier: string,
  purpose: string = 'SIGNUP'
): Promise<OtpResult> {
  try {
    // Generate OTP
    const otp = generateOtp();
    const hashedOtp = await hashOtp(otp);

    // Delete any existing OTPs for this identifier + purpose
    await prisma.otpVerification.deleteMany({
      where: {
        mobile: identifier,
        purpose,
      },
    });

    // Store hashed OTP in database (expires in 5 minutes)
    await prisma.otpVerification.create({
      data: {
        mobile: identifier, // We're reusing this field for email
        otp: hashedOtp,
        purpose,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
        maxAttempts: 5,
      },
    });

    // Send OTP via email
    const emailResult = await sendOtpEmail(identifier, otp, purpose);

    if (!emailResult.success) {
      return {
        success: false,
        message: `Failed to send OTP: ${emailResult.error}`,
      };
    }

    console.log(`✅ OTP sent to ${identifier} for ${purpose}`);

    return {
      success: true,
      message: `OTP sent to ${identifier}`,
      // Include OTP in dev mode for testing
      ...(process.env.NODE_ENV !== 'production' && { devOtp: otp }),
    };
  } catch (error) {
    console.error('Send OTP error:', error);
    return {
      success: false,
      message: 'Failed to send OTP. Please try again.',
    };
  }
}

/**
 * Verify OTP
 * @param identifier - email address
 * @param otp - 6-digit OTP
 * @param purpose - 'SIGNUP', 'LOGIN', 'FORM_FILL', 'PASSWORD_RESET'
 */
export async function verifyOtp(
  identifier: string,
  otp: string,
  purpose: string = 'SIGNUP'
): Promise<{ success: boolean; error?: string }> {
  try {
    // Find the latest OTP for this identifier + purpose
    const otpRecord = await prisma.otpVerification.findFirst({
      where: {
        mobile: identifier,
        purpose,
        isVerified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otpRecord) {
      return { success: false, error: 'No OTP found. Please request a new one.' };
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      return { success: false, error: 'OTP has expired. Please request a new one.' };
    }

    // Check if max attempts exceeded
    if (otpRecord.attempts >= otpRecord.maxAttempts) {
      return { success: false, error: 'Too many attempts. Please request a new OTP.' };
    }

    // Verify OTP
    const isValid = await bcrypt.compare(otp, otpRecord.otp);

    if (!isValid) {
      // Increment attempts
      await prisma.otpVerification.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts - 1;
      return {
        success: false,
        error: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
      };
    }

    // Mark as verified
    await prisma.otpVerification.update({
      where: { id: otpRecord.id },
      data: { isVerified: true },
    });

    console.log(`✅ OTP verified for ${identifier}`);
    return { success: true };
  } catch (error) {
    console.error('Verify OTP error:', error);
    return { success: false, error: 'Failed to verify OTP. Please try again.' };
  }
}

/**
 * Check if OTP was verified (for multi-step flows)
 */
export async function isOtpVerified(
  identifier: string,
  purpose: string = 'SIGNUP'
): Promise<boolean> {
  const verified = await prisma.otpVerification.findFirst({
    where: {
      mobile: identifier,
      purpose,
      isVerified: true,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  return !!verified;
}
