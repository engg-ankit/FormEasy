'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { CheckCircle, AlertCircle, RefreshCw, Smartphone } from 'lucide-react';

interface OtpVerificationProps {
  mobile: string;
  purpose?: 'SIGNUP' | 'FORM_FILL' | 'LOGIN';
  onVerified: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export function OtpVerification({
  mobile,
  purpose = 'FORM_FILL',
  onVerified,
  onError,
  className = '',
}: OtpVerificationProps) {
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(0);

  // Cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // OTP expiry timer (5 minutes)
  useEffect(() => {
    if (!isOtpSent || isVerified) return;
    const timer = setInterval(() => {
      setOtpExpiry((prev) => {
        if (prev <= 1) {
          setIsOtpSent(false);
          setOtp('');
          setError('OTP has expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isOtpSent, isVerified]);

  const sendOtp = useCallback(async () => {
    if (!mobile || mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSending(true);
    setError('');

    try {
      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, purpose }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send OTP');
        if (data.cooldownSeconds) {
          setCooldown(data.cooldownSeconds);
        }
        onError?.(data.error);
        setIsSending(false);
        return;
      }

      setIsOtpSent(true);
      setCooldown(60); // 60 seconds cooldown before resend
      setOtpExpiry(300); // 5 minutes expiry
      setIsSending(false);
    } catch (err) {
      setError('Network error. Please try again.');
      onError?.('Network error');
      setIsSending(false);
    }
  }, [mobile, purpose, onError]);

  const verifyOtp = useCallback(async () => {
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp, purpose }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to verify OTP');
        setIsVerifying(false);
        return;
      }

      setIsVerified(true);
      setIsVerifying(false);
      onVerified();
    } catch (err) {
      setError('Network error. Please try again.');
      setIsVerifying(false);
    }
  }, [otp, mobile, purpose, onVerified]);

  const handleResend = useCallback(() => {
    if (cooldown > 0) return;
    setOtp('');
    setIsOtpSent(false);
    sendOtp();
  }, [cooldown, sendOtp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // If already verified, show success state
  if (isVerified) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
        <div className="flex items-center gap-3">
          <CheckCircle className="h-6 w-6 text-green-600" />
          <div>
            <p className="font-medium text-green-800">Mobile Verified</p>
            <p className="text-sm text-green-600">
              +91 {mobile} has been verified successfully
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Mobile number display */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Smartphone className="h-5 w-5 text-neutral-500" />
          <span className="text-sm font-medium text-neutral-700">
            +91 {mobile}
          </span>
        </div>
        {!isOtpSent && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={sendOtp}
            disabled={isSending || cooldown > 0}
            isLoading={isSending}
          >
            Send OTP
          </Button>
        )}
      </div>

      {/* OTP sent status */}
      {isOtpSent && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-blue-700">
              OTP sent to +91 {mobile}
            </p>
            {otpExpiry > 0 && (
              <span className="text-xs font-mono text-blue-600">
                Expires in {formatTime(otpExpiry)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* OTP input */}
      {isOtpSent && (
        <div className="space-y-3">
          <Input
            label="Enter OTP"
            type="tel"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '').slice(0, 6);
              setOtp(value);
              setError('');
            }}
            maxLength={6}
            error={error}
            className="text-center text-lg tracking-[0.3em] font-mono"
          />

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="primary"
              onClick={verifyOtp}
              disabled={otp.length !== 6 || isVerifying}
              isLoading={isVerifying}
              className="flex-1"
            >
              Verify OTP
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={handleResend}
              disabled={cooldown > 0 || isSending}
              className="flex items-center justify-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${cooldown > 0 ? 'animate-spin' : ''}`} />
              {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend OTP'}
            </Button>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && !isOtpSent && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Help text */}
      <p className="text-xs text-neutral-500">
        Didn't receive the OTP? Check your SMS or try again after{' '}
        {cooldown > 0 ? `${cooldown} seconds` : 'resending'}.
      </p>
    </div>
  );
}
