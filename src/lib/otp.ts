import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { sendVerificationOtp } from './sms';

// OTP Configuration
const OTP_LENGTH = 6;
const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 5;
const RATE_LIMIT_MINUTES = 1; // Minimum gap between OTP sends

// Purpose types
export type OtpPurpose = 'SIGNUP' | 'FORM_FILL' | 'LOGIN';

/**
 * Generate a numeric OTP of specified length
 */
export function generateOtp(length: number = OTP_LENGTH): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
}

/**
 * Send OTP to a mobile number via SMS provider
 * Uses the SMS service (MSG91 in production, console in dev)
 */
export async function sendOtpSms(mobile: string, otp: string): Promise<boolean> {
  const result = await sendVerificationOtp(mobile, otp);
  return result.success;
}

/**
 * Hash an OTP using bcrypt
 */
async function hashOtp(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

/**
 * Verify OTP against bcrypt hash
 */
async function verifyOtpHash(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

/**
 * Send OTP to a mobile number
 * Handles rate limiting, OTP generation, and storage
 */
export async function sendOtp(
  mobile: string,
  purpose: OtpPurpose
): Promise<{ success: boolean; message: string; cooldownSeconds?: number }> {
  // Validate mobile number
  if (!mobile || mobile.length !== 10 || !/^\d{10}$/.test(mobile)) {
    return { success: false, message: 'Invalid mobile number. Must be 10 digits.' };
  }

  // Check rate limiting - prevent sending OTP too frequently
  const recentOtp = await prisma.otpVerification.findFirst({
    where: {
      mobile,
      purpose,
      createdAt: {
        gte: new Date(Date.now() - RATE_LIMIT_MINUTES * 60 * 1000),
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (recentOtp) {
    const elapsed = Date.now() - recentOtp.createdAt.getTime();
    const remainingSeconds = Math.ceil(
      (RATE_LIMIT_MINUTES * 60 * 1000 - elapsed) / 1000
    );
    return {
      success: false,
      message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
      cooldownSeconds: remainingSeconds,
    };
  }

  // Generate and hash OTP
  const otp = generateOtp();
  const hashedOtp = await hashOtp(otp);
  const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

  // Store OTP in database
  await prisma.otpVerification.create({
    data: {
      mobile,
      otp: hashedOtp,
      purpose,
      expiresAt,
      attempts: 0,
      maxAttempts: MAX_ATTEMPTS,
      isVerified: false,
    },
  });

  // Send SMS
  const smsSent = await sendOtpSms(mobile, otp);

  if (!smsSent) {
    return { success: false, message: 'Failed to send OTP. Please try again.' };
  }

  return {
    success: true,
    message: `OTP sent to ${mobile}. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
  };
}

/**
 * Verify an OTP
 * Checks expiry, attempts, and validates the OTP
 */
export async function verifyOtp(
  mobile: string,
  otp: string,
  purpose: OtpPurpose
): Promise<{ success: boolean; message: string }> {
  // Validate OTP format
  if (!otp || otp.length !== OTP_LENGTH || !/^\d{6}$/.test(otp)) {
    return { success: false, message: 'Invalid OTP format. Must be 6 digits.' };
  }

  // Find the latest unverified OTP for this mobile and purpose
  const otpRecord = await prisma.otpVerification.findFirst({
    where: {
      mobile,
      purpose,
      isVerified: false,
    },
    orderBy: { createdAt: 'desc' },
  });

  if (!otpRecord) {
    return { success: false, message: 'No OTP found. Please request a new one.' };
  }

  // Check if OTP has expired
  if (new Date() > otpRecord.expiresAt) {
    return { success: false, message: 'OTP has expired. Please request a new one.' };
  }

  // Check if max attempts exceeded
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    return { success: false, message: 'Maximum attempts exceeded. Please request a new OTP.' };
  }

  // Increment attempts
  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data: { attempts: { increment: 1 } },
  });

  // Verify OTP
  const isValid = await verifyOtpHash(otp, otpRecord.otp);

  if (!isValid) {
    const remainingAttempts = otpRecord.maxAttempts - otpRecord.attempts - 1;
    return {
      success: false,
      message: `Invalid OTP. ${remainingAttempts} attempts remaining.`,
    };
  }

  // Mark OTP as verified
  await prisma.otpVerification.update({
    where: { id: otpRecord.id },
    data: { isVerified: true },
  });

  return { success: true, message: 'OTP verified successfully.' };
}

/**
 * Check if a mobile number has been verified for a specific purpose
 */
export async function isMobileVerified(
  mobile: string,
  purpose: OtpPurpose
): Promise<boolean> {
  const verifiedOtp = await prisma.otpVerification.findFirst({
    where: {
      mobile,
      purpose,
      isVerified: true,
      expiresAt: { gte: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  return !!verifiedOtp;
}

/**
 * Cleanup expired OTPs (call this periodically)
 */
export async function cleanupExpiredOtps(): Promise<number> {
  const result = await prisma.otpVerification.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });
  return result.count;
}
