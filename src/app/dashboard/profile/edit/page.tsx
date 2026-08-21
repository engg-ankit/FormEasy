'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Logo } from '@/components/logo';
import { ArrowLeft, Save, User, Shield, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { MobileMenu } from '@/components/mobile-menu';

export default function ProfileEditPage() {
  const { data: session, update: updateSession } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    mobile: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          fullName: data.user.fullName,
          email: data.user.email,
          mobile: data.user.mobile,
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters');
      return;
    }

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          currentPassword: formData.currentPassword || undefined,
          newPassword: formData.newPassword || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update profile');
        setIsSaving(false);
        return;
      }

      setSuccess('Profile updated successfully');
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));

      // Update session if name/email changed
      if (formData.fullName !== session?.user?.name || formData.email !== session?.user?.email) {
        await updateSession({ name: formData.fullName, email: formData.email });
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <nav className="bg-primary-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex justify-between items-center min-h-[72px]">
            <Link href="/dashboard">
              <Logo size="md" white />
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <div className="sm:hidden">
              <MobileMenu
                logoWhite
                items={[
                  { label: 'Dashboard', href: '/dashboard', icon: <User className="h-5 w-5" /> },
                  { label: 'Browse Forms', href: '/exams' },
                  { label: 'Back to Dashboard', href: '/dashboard', icon: <ArrowLeft className="h-5 w-5" /> },
                ]}
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-display font-bold text-primary-900">Edit Profile</h1>
          <p className="text-neutral-500 mt-1">Update your personal information and password</p>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5 flex-shrink-0" />
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-display font-bold text-primary-900">Personal Information</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Full Name"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <Input
                label="Mobile Number"
                value={formData.mobile}
                disabled
                className="bg-neutral-50"
              />
              <p className="text-xs text-neutral-400">Mobile number cannot be changed. Contact support if needed.</p>
            </CardContent>
          </Card>

          {/* Change Password */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-display font-bold text-primary-900">Change Password</h2>
              </div>
              <p className="text-sm text-neutral-500">Leave blank to keep current password</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                placeholder="Enter current password"
              />
              <Input
                label="New Password"
                type="password"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                placeholder="Enter new password"
                minLength={6}
              />
              <Input
                label="Confirm New Password"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirm new password"
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button type="submit" variant="primary" isLoading={isSaving} className="flex-1">
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
            <Link href="/dashboard">
              <Button type="button" variant="outline" className="min-w-[120px]">
                Cancel
              </Button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
