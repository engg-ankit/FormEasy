'use client';
import { PageHead } from '@/components/page-head';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import Link from 'next/link';

type LoginMode = 'password' | 'otp';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<LoginMode>('password');

  // Password login state
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // OTP login state
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [otpBusy, setOtpBusy] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      console.log('[Login] signIn result:', result);

      if (result?.error) {
        setError('Invalid email or password. Please check your credentials.');
        setIsLoading(false);
        return;
      }

      if (result?.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Login failed. Please try again.');
        setIsLoading(false);
      }
    } catch (error: any) {
      console.error('[Login] Error:', error);
      if (error?.message?.includes('fetch')) {
        setError('Network error. Please check your connection and try again.');
      } else {
        setError('Something went wrong. Please try again later.');
      }
      setIsLoading(false);
    }
  };

  // ---- Email OTP login ----

  const sendOtp = async (isResend = false) => {
    setOtpError('');
    if (!/^\S+@\S+\.\S+$/.test(otpEmail)) {
      setOtpError('Please enter a valid email address');
      return;
    }
    setOtpBusy(true);
    try {
      const res = await fetch('/api/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, purpose: 'LOGIN' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
      setOtp(['', '', '', '', '', '']);
      setCooldown(30);
      if (!isResend) {
        // no-op; UI switches to OTP step
      }
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : 'Could not send OTP. Try again.');
    } finally {
      setOtpBusy(false);
    }
  };

  const verifyOtp = async () => {
    const otpString = otp.join('');
    setOtpError('');
    if (otpString.length !== 6) {
      setOtpError('Enter the complete 6-digit OTP');
      return;
    }
    setOtpBusy(true);
    try {
      const res = await fetch('/api/mobile/otp-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: otpString }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid OTP');

      // The endpoint verified the OTP and returned a signed JWT.
      // Exchange it for a NextAuth session cookie (validated in auth-options).
      const result = await signIn('credentials', {
        email: otpEmail,
        otpToken: data.token,
        redirect: false,
      });

      if (result?.error) {
        console.error('[OTP Login] session sign-in failed:', result.error);
        throw new Error('Session could not be created. Please try again.');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (e) {
      setOtpError(e instanceof Error ? e.message : 'Invalid OTP. Try again.');
    } finally {
      setOtpBusy(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="md" />
          </div>
          <h1 className="text-2xl font-display font-bold text-primary-900 dark:text-white">Welcome</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Login</p>
        </CardHeader>
        <CardContent>
          {/* Mode switcher */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg mb-6">
            <button
              type="button"
              onClick={() => { setMode('password'); setError(''); setOtpError(''); }}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                mode === 'password'
                  ? 'bg-white dark:bg-neutral-700 text-primary-700 dark:text-white shadow'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              🔑 Password
            </button>
            <button
              type="button"
              onClick={() => { setMode('otp'); setError(''); setOtpError(''); }}
              className={`py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                mode === 'otp'
                  ? 'bg-white dark:bg-neutral-700 text-primary-700 dark:text-white shadow'
                  : 'text-neutral-600 dark:text-neutral-400'
              }`}
            >
              📧 Email OTP
            </button>
          </div>

          {mode === 'password' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded break-words">
                  {error}
                </div>
              )}
              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                Login
              </Button>
              <div className="text-right">
                <Link href="/forgot-password" className="text-sm text-primary-600 hover:underline">
                  Forgot Password?
                </Link>
          </div>
            </form>
          )}

          {mode === 'otp' && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Enter your registered email — we&apos;ll send a 6-digit OTP. It&apos;s FREE!
                  </p>
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={otpEmail}
                    onChange={(e) => setOtpEmail(e.target.value)}
                  />
                  {otpError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded break-words">
                      {otpError}
                    </div>
                  )}
                  <Button
                    variant="primary"
                    className="w-full"
                    isLoading={otpBusy}
                    onClick={() => sendOtp()}
                  >
                    Send OTP →
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 text-center">
                    OTP sent to <strong>{otpEmail}</strong>{' '}
                    <button type="button" className="text-primary-600 hover:underline" onClick={() => setOtpSent(false)}>
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
                  {otpError && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded break-words">
                      {otpError}
                    </div>
                  )}
                  <Button
                    variant="primary"
                    className="w-full"
                    isLoading={otpBusy}
                    onClick={verifyOtp}
                  >
                    Verify & Login
                  </Button>
                  <button
                    type="button"
                    className="w-full text-sm text-primary-600 hover:underline disabled:text-neutral-400 disabled:no-underline"
                    disabled={cooldown > 0 || otpBusy}
                    onClick={() => sendOtp(true)}
                  >
                    {cooldown > 0 ? `Resend OTP in ${cooldown}s` : 'Resend OTP'}
                  </button>
                </>
              )}
            </div>
          )}

          <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-primary-600 hover:underline font-medium">
              Create Account
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
