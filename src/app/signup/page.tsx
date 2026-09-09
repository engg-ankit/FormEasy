'use client';
import { PageHead } from '@/components/page-head';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import Link from 'next/link';

type Step = 'email' | 'otp' | 'details';

export default function SignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [busy, setBusy] = useState(false);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---- Step 1: Send OTP to email ----
  const sendOtp = async (isResend = false) => {
    setErrors({});
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email address' });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose: 'SIGNUP' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setStep('otp');
      setOtp(['', '', '', '', '', '']);
      setCooldown(30);
    } catch (e) {
      setErrors({ email: e instanceof Error ? e.message : 'Could not send OTP. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  // ---- Step 2: Verify OTP ----
  const verifyOtp = async () => {
    const otpString = otp.join('');
    setErrors({});
    if (otpString.length !== 6) {
      setErrors({ otp: 'Enter the complete 6-digit OTP' });
      return;
    }
    setBusy(true);
    try {
      const res = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: otpString, purpose: 'SIGNUP' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');
      setStep('details');
    } catch (e) {
      setErrors({ otp: e instanceof Error ? e.message : 'Invalid OTP. Try again.' });
    } finally {
      setBusy(false);
    }
  };

  // ---- Step 3: Create account (email already OTP-verified) ----
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (formData.password !== formData.confirmPassword) {
      setErrors({ password: 'Passwords do not match' });
      return;
    }
    if (formData.mobile.length !== 10 || !/^\d{10}$/.test(formData.mobile)) {
      setErrors({ mobile: 'Mobile number must be 10 digits' });
      return;
    }

    setBusy(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          mobile: formData.mobile,
          email,
          password: formData.password,
          referralCode: formData.referralCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ form: data.error || 'Signup failed' });
        if (data.details) {
          console.error('Signup error details:', data.details);
        }
        setBusy(false);
        return;
      }

      // Auto login after signup
      const result = await signIn('credentials', {
        email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        console.error('[Signup] auto-login failed:', result.error);
        router.push('/login');
        router.refresh();
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setErrors({ form: 'An error occurred. Please try again.' });
      setBusy(false);
    }
  };

  // ---- OTP input helpers ----
  const handleOtpChange = (index: number, value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) {
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      return;
    }
    const next = [...otp];
    digits.split('').forEach((d, i) => {
      if (index + i < 6) next[index + i] = d;
    });
    setOtp(next);
    const focusIdx = Math.min(index + digits.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      const next = [...otp];
      next[index - 1] = '';
      setOtp(next);
    }
  };

  const steps: Step[] = ['email', 'otp', 'details'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark:bg-neutral-800 dark:border-neutral-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="md" />
          </div>
          <h1 className="text-2xl font-display font-bold text-primary-900 dark:text-white">Create Account</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Sign up to get started with ClickNsit</p>
        </CardHeader>
        <CardContent>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            {steps.map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    steps.indexOf(step) >= i
                      ? 'bg-primary-600 text-white'
                      : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-500'
                  }`}
                >
                  {i + 1}
                </div>
                {i < steps.length - 1 && (
                  <div className={`w-6 h-0.5 ${steps.indexOf(step) > i ? 'bg-primary-600' : 'bg-neutral-200 dark:bg-neutral-700'}`} />
                )}
              </div>
            ))}
          </div>

          {/* ===== STEP 1: Email ===== */}
          {step === 'email' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Enter your email — we&apos;ll send an OTP to verify it. It&apos;s FREE!
              </p>
              <Input
                label="Email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={errors.email}
              />
              <Button variant="primary" className="w-full" isLoading={busy} onClick={() => sendOtp()}>
                Send OTP →
              </Button>
            </div>
          )}

          {/* ===== STEP 2: OTP Verification ===== */}
          {step === 'otp' && (
            <div className="space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                OTP sent to <strong>{email}</strong>{' '}
                <button type="button" className="text-primary-600 hover:underline" onClick={() => setStep('email')}>
                  change
                </button>
              </p>
              <div className="flex gap-2 justify-center">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-11 h-12 text-center text-lg font-semibold border border-neutral-300 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                ))}
              </div>
              {errors.otp && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded break-words">
                  {errors.otp}
                </div>
              )}
              <Button variant="primary" className="w-full" isLoading={busy} onClick={verifyOtp}>
                Verify OTP →
              </Button>
              <button
                type="button"
                className="w-full text-sm text-primary-600 hover:underline disabled:text-neutral-400 disabled:no-underline"
                disabled={cooldown > 0 || busy}
                onClick={() => sendOtp(true)}
              >
                {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
              </button>
            </div>
          )}

          {/* ===== STEP 3: Account details ===== */}
          {step === 'details' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <Input
                label="Full Name"
                name="fullName"
                type="text"
                placeholder="Enter your full name"
                value={formData.fullName}
                onChange={handleChange}
                required
              />
              <Input
                label="Mobile Number"
                name="mobile"
                type="tel"
                placeholder="Enter your 10-digit mobile number"
                value={formData.mobile}
                onChange={handleChange}
                required
                maxLength={10}
                error={errors.mobile}
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
              />
              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
              />
              <Input
                label="Referral Code (Optional)"
                name="referralCode"
                type="text"
                placeholder="Enter referral code for ₹25 bonus"
                value={formData.referralCode}
                onChange={handleChange}
              />
              {errors.form && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded break-words">
                  {errors.form}
                </div>
              )}
              <Button type="submit" variant="primary" className="w-full" isLoading={busy}>
                Create Account
              </Button>
            </form>
          )}

          <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Already have an account?{' '}
            <Link href="/login" className="text-primary-600 hover:underline font-medium">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
