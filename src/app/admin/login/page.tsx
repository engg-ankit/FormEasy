'use client';
import { PageHead } from '@/components/page-head';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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

    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setIsLoading(false);
        return;
      }

      router.push('/admin');
      router.refresh();
    } catch (error) {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-900 to-primary-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-6">
            <Logo size="md" />
          </div>
          <h1 className="text-2xl font-display font-bold text-primary-900">Admin Login</h1>
          <p className="text-neutral-600">Access the admin panel</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              name="email"
              type="email"
              placeholder="Enter admin email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter admin password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
            >
              Login to Admin Panel
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-neutral-600">
            <a href="/" className="text-primary-600 hover:underline">
              Back to Home
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}