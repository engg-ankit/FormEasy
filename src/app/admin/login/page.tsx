'use client';
import { PageHead } from '@/components/page-head';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { Shield, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: '', password: '' });
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
      window.location.href = '/admin';
    } catch {
      setError('An error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: 'linear-gradient(rgba(22,179,94,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(22,179,94,0.2) 1px, transparent 1px)', backgroundSize: '40px 40px' }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        <div className="flex justify-center mb-8">
          <Link href="/"><Logo size="md" /></Link>
        </div>

        <div className="cyber-card">
          <div className="cyber-card-header">
            <span className="cyber-card-dot cyber-card-dot-red" />
            <span className="cyber-card-dot cyber-card-dot-yellow" />
            <span className="cyber-card-dot cyber-card-dot-green" />
            <span className="ml-3 text-[10px] text-neutral-500 font-mono">admin@cyberseva</span>
          </div>
          <div className="p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <h1 className="text-xl font-display font-bold text-white">Admin Login</h1>
                <p className="text-neutral-500 text-xs font-mono">Restricted access — admin only</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-neon-400 mb-1.5">$ admin_email</label>
                <input
                  name="email" type="email" placeholder="admin@cyberseva.in"
                  value={formData.email} onChange={handleChange} required
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#0a0f1a] border border-neon-500/20 rounded-lg text-sm text-neon-300 placeholder:text-neutral-600 font-mono focus:outline-none focus:ring-2 focus:ring-neon-500/40 focus:border-neon-500/40"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-neon-400 mb-1.5">$ admin_password</label>
                <input
                  name="password" type="password" placeholder="••••••••"
                  value={formData.password} onChange={handleChange} required
                  className="w-full min-h-[44px] px-4 py-2.5 bg-[#0a0f1a] border border-neon-500/20 rounded-lg text-sm text-neon-300 placeholder:text-neutral-600 font-mono focus:outline-none focus:ring-2 focus:ring-neon-500/40 focus:border-neon-500/40"
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg font-mono text-sm break-words">
                  <span className="text-red-500">✗</span> {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-red-500/80 hover:bg-red-600 text-white font-semibold min-h-[48px]" isLoading={isLoading}>
                {isLoading ? 'Authenticating...' : 'Access Admin Panel →'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-xs text-neutral-600 hover:text-neon-400 font-mono transition-colors">
                ← back to home
              </Link>
            </div>
          </div>
        </div>

        <p className="text-center text-neutral-700 text-[11px] font-mono mt-6">
          🔒 Secured admin access — CyberSeva
        </p>
      </div>
    </div>
  );
}
