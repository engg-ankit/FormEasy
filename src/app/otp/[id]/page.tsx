'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/logo';
import { CheckCircle, AlertCircle, Clock, Smartphone } from 'lucide-react';

interface OtpRelayData {
  id: string;
  status: string;
  portalName: string;
  expiresAt: string;
}

export default function OtpEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const [otpRelayId, setOtpRelayId] = useState<string>('');
  const [otpRelay, setOtpRelay] = useState<OtpRelayData | null>(null);
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    params.then(({ id }) => {
      setOtpRelayId(id);
      fetchOtpRelay(id);
    });
  }, [params]);

  const fetchOtpRelay = async (id: string) => {
    try {
      const response = await fetch(`/api/otp-relay/status/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid OTP request');
        setIsLoading(false);
        return;
      }

      setOtpRelay(data.otpRelay);

      if (data.otpRelay.status === 'SUBMITTED') {
        setIsSubmitted(true);
      }

      // Calculate time left
      const expiresAt = new Date(data.otpRelay.expiresAt);
      const now = new Date();
      const diff = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      setTimeLeft(diff);

      setIsLoading(false);
    } catch (err) {
      setError('Failed to load OTP request');
      setIsLoading(false);
    }
  };

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || isSubmitted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setError('OTP request has expired. Please ask admin to send a new request.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isSubmitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/otp-relay/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpRelayId, otp }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to submit OTP');
        setIsSubmitting(false);
        return;
      }

      setIsSubmitted(true);
      setIsSubmitting(false);
    } catch (err) {
      setError('Network error. Please try again.');
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state (expired/invalid)
  if (error && !otpRelay) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="md" />
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-red-800">Invalid Request</h1>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-neutral-600 mb-4">{error}</p>
            <p className="text-sm text-neutral-500">
              Please contact FormEasy support for assistance.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Logo size="md" />
            </div>
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <h1 className="text-xl font-bold text-green-800">OTP Submitted!</h1>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-neutral-600 mb-2">
              Your OTP has been sent to FormEasy successfully.
            </p>
            <p className="text-sm text-neutral-500 mb-4">
              Your form for <strong>{otpRelay?.portalName}</strong> is being processed.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-700">
                ✅ You can close this page now. We&apos;ll notify you once the form is submitted.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main OTP entry form
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Logo size="md" />
          </div>
          <h1 className="text-xl font-bold text-primary-900">Enter OTP</h1>
          <p className="text-neutral-600">
            Your form is being filled on <strong>{otpRelay?.portalName}</strong>
          </p>
        </CardHeader>
        <CardContent>
          {/* Timer */}
          {timeLeft > 0 && (
            <div className="flex items-center justify-center gap-2 mb-6 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <Clock className="h-5 w-5 text-amber-600" />
              <span className="text-amber-800 font-medium">
                Expires in {formatTime(timeLeft)}
              </span>
            </div>
          )}

          {/* Mobile info */}
          <div className="flex items-center gap-2 mb-6 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
            <Smartphone className="h-5 w-5 text-neutral-500" />
            <span className="text-sm text-neutral-700">
              OTP sent to your registered mobile number
            </span>
          </div>

          {/* OTP Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                6-Digit OTP
              </label>
              <input
                type="tel"
                value={otp}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(value);
                  setError('');
                }}
                placeholder="Enter OTP"
                className="w-full text-center text-2xl tracking-[0.3em] font-mono px-4 py-4 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                maxLength={6}
                autoFocus
              />
              {error && (
                <p className="mt-2 text-sm text-red-600 text-center">{error}</p>
              )}
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={otp.length !== 6 || isSubmitting}
              isLoading={isSubmitting}
            >
              Submit OTP
            </Button>
          </form>

          {/* Help text */}
          <div className="mt-6 text-center">
            <p className="text-xs text-neutral-500">
              Didn&apos;t receive the OTP? Contact FormEasy support.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
