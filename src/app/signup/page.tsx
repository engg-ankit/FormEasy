'use client';
import { PageHead } from '@/components/page-head';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { Terminal, UserPlus, Gift } from 'lucide-react';

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
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(22,179,94,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(22,179,94,0.2) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />
      {/* Glow orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-neon-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/"><Logo size="md" /></Link>
        </div>

        {/* Signup Terminal Card */}
        <div className="cyber-card">
          <div className="cyber-card-header">
            <span className="cyber-card-dot cyber-card-dot-red" />
            <span className="cyber-card-dot cyber-card-dot-yellow" />
            <span className="cyber-card-dot cyber-card-dot-green" />
            <span className="ml-3 text-[10px] text-neutral-500 font-mono">signup@cyberseva</span>
          </div>
          <div className="p-8">
            {/* Welcome text */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-neon-500/10 border border-neon-500/20 rounded-lg flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-neon-400" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-white">Create Account</h1>
                <p className="text-neutral-500 text-xs font-mono">Join CyberSeva — it&apos;s free!</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-mono text-neon-400 mb-1.5">
                  $ full_name
                </label>
                <input
                  name="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#0a0f1a] border border-neon-500/20 rounded-lg text-sm text-neon-300 placeholder:text-neutral-600 font-mono focus:outline-none focus:ring-2 focus:ring-neon-500/40 focus:border-neon-500/40"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-xs font-mono text-neon-400 mb-1.5">
                  $ mobile_number
                </label>
                <input
                  name="mobile"
                  type="tel"
                  placeholder="10-digit mobile number"
                  value={formData.mobile}
                  onChange={handleChange}
                  required
                  maxLength={10}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#0a0f1a] border border-neon-500/20 rounded-lg text-sm text-neon-300 placeholder:text-neutral-600 font-mono focus:outline-none focus:ring-2 focus:ring-neon-500/40 focus:border-neon-500/40"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-mono text-neon-400 mb-1.5">
                  $ email
                </label>
                <input
                  name="email"
                  type="email"
                  placeholder="user@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#0a0f1a] border border-neon-500/20 rounded-lg text-sm text-neon-300 placeholder:text-neutral-600 font-mono focus:outline-none focus:ring-2 focus:ring-neon-500/40 focus:border-neon-500/40"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-mono text-neon-400 mb-1.5">
                  $ password
                </label>
                <input
                  name="password"
                  type="password"
                  placeholder="Min 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#0a0f1a] border border-neon-500/20 rounded-lg text-sm text-neon-300 placeholder:text-neutral-600 font-mono focus:outline-none focus:ring-2 focus:ring-neon-500/40 focus:border-neon-500/40"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-mono text-neon-400 mb-1.5">
                  $ confirm_password
                </label>
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#0a0f1a] border border-neon-500/20 rounded-lg text-sm text-neon-300 placeholder:text-neutral-600 font-mono focus:outline-none focus:ring-2 focus:ring-neon-500/40 focus:border-neon-500/40"
                />
              </div>

              {/* Referral Code */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-mono text-cyber-400 mb-1.5">
                  <Gift className="h-3 w-3" />
                  $ referral_code <span className="text-neutral-600">(optional — ₹25 bonus)</span>
                </label>
                <input
                  name="referralCode"
                  type="text"
                  placeholder="Enter referral code"
                  value={formData.referralCode}
                  onChange={handleChange}
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#0a0f1a] border border-cyber-500/20 rounded-lg text-sm text-cyber-300 placeholder:text-neutral-600 font-mono focus:outline-none focus:ring-2 focus:ring-cyber-500/40 focus:border-cyber-500/40"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg font-mono text-sm break-words">
                  <span className="text-red-500">✗</span> {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-neon-500 hover:bg-neon-600 text-white shadow-neon font-semibold min-h-[48px] text-base"
                isLoading={isLoading}
              >
                {isLoading ? 'Creating account...' : 'Create Account →'}
              </Button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-neon-500/10" />
              <span className="text-[10px] text-neutral-600 font-mono">or</span>
              <div className="flex-1 h-px bg-neon-500/10" />
            </div>

            {/* Login link */}
            <div className="text-center">
              <p className="text-neutral-500 text-sm">
                Already have an account?{' '}
                <Link href="/login" className="text-neon-400 hover:text-neon-300 font-semibold transition-colors">
                  Login →
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-neutral-600 text-[11px] font-mono mt-6">
          🔒 Your data is encrypted — CyberSeva Online Cyber Cafe
        </p>
      </div>
    </div>
  );
}
