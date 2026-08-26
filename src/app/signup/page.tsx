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
          <h1 className="text-2xl font-display font-bold text-primary-900 dark:text-white">Create Account</h1>
          <p className="text-neutral-600 dark:text-neutral-400">Sign up to get started with CyberSeva</p>
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
              onChange={handleChange}
              required
              maxLength={10}
            />
            
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
              Create Account
            </Button>
          </form>
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