'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, CheckCircle, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { LogOut } from 'lucide-react';

export default function AdminSettingsPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (newPassword.length < 10) {
      setError('New password must be at least 10 characters');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 401) {
        router.push('/admin/login');
        return;
      }

      if (!response.ok) {
        setError(data.error || 'Could not change the password');
        return;
      }

      setSuccess('Password updated. Use the new password next time you sign in.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' }).catch(() => undefined);
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      <nav className="bg-primary-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center py-4 sm:py-5">
          <Link href="/admin" className="flex items-center gap-3">
            <Logo size="sm" white />
            <span className="text-lg font-display font-bold hidden sm:inline">Admin</span>
          </Link>
          <button
            onClick={handleLogout}
            className="text-white hover:bg-white/10 font-medium flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <Link href="/admin" className="inline-flex items-center text-sm text-neutral-600 dark:text-neutral-300 hover:text-primary-600 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to dashboard
        </Link>

        <Card>
          <CardHeader>
            <h1 className="text-xl font-display font-bold text-primary-900 dark:text-white flex items-center gap-2">
              <KeyRound className="h-5 w-5" />
              Change Password
            </h1>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Use at least 10 characters. Don&apos;t reuse the seeded password.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={10}
                autoComplete="new-password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={10}
                autoComplete="new-password"
              />

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="break-words">{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-start">
                  <CheckCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="break-words">{success}</span>
                </div>
              )}

              <Button type="submit" variant="primary" className="w-full min-h-[48px]" isLoading={isLoading}>
                Update Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
