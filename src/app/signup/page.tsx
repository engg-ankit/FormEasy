'use client';
import { PageHead } from '@/components/page-head';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { OtpVerification } from '@/components/otp-verification';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.mobile.length !== 10) {
      setError('Mobile number must be 10 digits');
      setIsLoading(false);
      return;
    }

    if (!isMobileVerified) {
      setError('Please verify your mobile number before signing up');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          mobile: formData.mobile,
          email: formData.email,
          password: formData.password,
          referralCode: formData.referralCode || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Signup failed');
        if (data.details) {
          console.error('Signup error details:', data.details);
        }
        setIsLoading(false);
        return;
      }

      // Auto login after signup
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Login failed after signup');
        setIsLoading(false);
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md dark:bg-neutral-800 dark:border-neutral-700">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="md" />
          </div>
          <h1 className="text-2xl font-display font-bold text-primary-900 dark:text-white">{t('auth.signup')}</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Sign up to get started with FormEasy</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
              onChange={(e) => {
                handleChange(e);
                // Reset verification when mobile changes
                if (isMobileVerified) {
                  setIsMobileVerified(false);
                }
              }}
              required
              maxLength={10}
            />
            
            {/* OTP Verification Section */}
            {formData.mobile.length === 10 && !isMobileVerified && (
              <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-neutral-800">Verify Mobile Number</h4>
                  {!showOtpVerification && (
                    <button
                      type="button"
                      className="text-sm text-primary-600 hover:underline"
                      onClick={() => setShowOtpVerification(true)}
                    >
                      Verify Now
                    </button>
                  )}
                </div>
                {showOtpVerification && (
                  <OtpVerification
                    mobile={formData.mobile}
                    purpose="SIGNUP"
                    onVerified={() => {
                      setIsMobileVerified(true);
                      setShowOtpVerification(false);
                    }}
                    onError={(err) => setError(err)}
                  />
                )}
              </div>
            )}
            
            {/* Show verification success */}
            {isMobileVerified && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-green-800">
                    Mobile number verified!
                  </span>
                </div>
              </div>
            )}
            
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
              {t('auth.signup')}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-neutral-600 dark:text-neutral-400">
            {t('auth.hasAccount')}{' '}
            <Link href="/login" className="text-primary-600 hover:underline font-medium">
              {t('auth.login')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}