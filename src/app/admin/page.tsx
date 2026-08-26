'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Users, FileText, Clock, CheckCircle, TrendingUp, LogOut, Loader2, BarChart3, Tag, AlertCircle, ChevronRight, Bell, Mail } from 'lucide-react';
import { Logo } from '@/components/logo';
import { MobileMenu } from '@/components/mobile-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import Link from 'next/link';

interface Admin {
  id: string;
  name: string;
  email: string;
}

interface Stats {
  totalApplications: number;
  todayApplications: number;
  pendingApplications: number;
  inProcessApplications: number;
  completedApplications: number;
  completedThisWeek: number;
  revenueThisMonth: number;
}

interface RecentApplication {
  id: string;
  user: { fullName: string; mobile: string; email: string };
  exam: { title: string; category: string; officialFee: number; serviceFee: number };
  status: string;
  createdAt: string;
  payment: { status: string; amount: number } | null;
}

interface FormRequestItem {
  id: string;
  formName: string;
  category: string;
  portalName: string | null;
  description: string | null;
  status: string;
  createdAt: string;
  user: { fullName: string; email: string; mobile: string };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentApplications, setRecentApplications] = useState<RecentApplication[]>([]);
  const [formRequests, setFormRequests] = useState<FormRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', { credentials: 'include' });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) { window.location.href = '/admin/login'; return; }
        setError(data.error || 'Failed to load dashboard');
        setIsLoading(false);
        return;
      }
      setAdmin(data.admin);
      setStats(data.stats);
      setRecentApplications(data.recentApplications);
      try {
        const reqRes = await fetch('/api/admin/form-requests', { credentials: 'include' });
        if (reqRes.ok) { const reqData = await reqRes.json(); setFormRequests(reqData.requests || []); }
      } catch {}
    } catch { setError('Network error.'); }
    finally { setIsLoading(false); }
  };

  const handleLogout = async () => {
    await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
    router.push('/admin/login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'IN_PROCESS': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'FORM_FILLED': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'COMPLETED': return 'bg-neon-500/10 text-neon-400 border border-neon-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20';
    }
  };

  if (isLoading) return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-neon-400 mx-auto" />
        <p className="mt-4 text-neutral-400 font-mono text-sm">Loading dashboard...</p>
      </div>
    </div>
  );

  if (error && !admin) return (
    <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-lg mb-4 font-mono text-sm">{error}</div>
        <Button className="bg-neon-500 hover:bg-neon-600 text-white shadow-neon" onClick={() => { setError(''); setIsLoading(true); fetchDashboardData(); }}>Retry</Button>
      </div>
    </div>
  );

  if (!admin || !stats) return null;

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Nav */}
      <nav className="bg-[#0d1420] border-b border-neon-500/10 shadow-[0_1px_20px_rgba(22,179,94,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-5 min-h-[88px]">
            <div className="flex items-center gap-3">
              <Logo size="sm" />
              <div>
                <h1 className="text-lg font-display font-bold text-white">Admin Dashboard</h1>
                <p className="text-xs text-neutral-500 font-mono">Welcome, {admin.name}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <ThemeToggle className="text-neutral-400 hover:text-neon-400 hover:bg-neon-500/5" />
              <button onClick={handleLogout} className="text-neutral-400 hover:text-red-400 hover:bg-red-500/5 font-medium flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg transition-colors">
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
            <div className="sm:hidden">
              <MobileMenu
                logoWhite
                items={[
                  { label: 'Applications', href: '/admin/applications', icon: <Users className="h-5 w-5" /> },
                  { label: 'Forms', href: '/admin/exams', icon: <FileText className="h-5 w-5" /> },
                  { label: 'Payments', href: '/admin/payments', icon: <TrendingUp className="h-5 w-5" /> },
                  { label: 'Analytics', href: '/admin/analytics', icon: <BarChart3 className="h-5 w-5" /> },
                  { label: 'Coupons', href: '/admin/coupons', icon: <Tag className="h-5 w-5" /> },
                  { label: 'Requests', href: '/admin/form-requests', icon: <FileText className="h-5 w-5" /> },
                  { label: 'Notifications', href: '/admin/notifications', icon: <Bell className="h-5 w-5" /> },
                ]}
                footer={<button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 font-medium py-3 rounded-lg hover:bg-red-500/5 transition-colors min-h-[48px]"><LogOut className="h-5 w-5" /> Logout</button>}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-[#0d1420] border-b border-neon-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar -mb-px">
            {[
              { href: '/admin/applications', label: 'Applications' },
              { href: '/admin/exams', label: 'Forms' },
              { href: '/admin/payments', label: 'Payments' },
              { href: '/admin/analytics', label: 'Analytics' },
              { href: '/admin/coupons', label: 'Coupons' },
              { href: '/admin/form-requests', label: 'Requests' },
              { href: '/admin/notifications', label: 'Notifications' },
              { href: '/admin/contacts', label: 'Contacts' },
            ].map((tab) => (
              <Link key={tab.href} href={tab.href} className="whitespace-nowrap">
                <button className="flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 border-transparent text-neutral-500 hover:text-neutral-300 hover:border-neutral-700 transition-colors min-h-[52px]">
                  {tab.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[
            { icon: Users, value: stats.todayApplications, label: 'New Today', color: 'text-cyber-400', bg: 'bg-cyber-500/10 border-cyber-500/20' },
            { icon: Clock, value: stats.pendingApplications, label: 'Pending', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
            { icon: FileText, value: stats.inProcessApplications, label: 'In Process', color: 'text-cyber-400', bg: 'bg-cyber-500/10 border-cyber-500/20' },
            { icon: CheckCircle, value: stats.completedThisWeek, label: 'Done This Week', color: 'text-neon-400', bg: 'bg-neon-500/10 border-neon-500/20' },
          ].map((s, i) => (
            <div key={i} className="cyber-card hover:shadow-neon transition-all">
              <div className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className={`${s.bg} border rounded-xl p-2.5`}>
                    <s.icon className={`h-5 w-5 ${s.color}`} />
                  </div>
                  <span className="text-[10px] text-neutral-600 font-mono">{s.label}</span>
                </div>
                <div className="text-2xl font-bold text-white">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Revenue */}
        <div className="cyber-card mb-8">
          <div className="cyber-card-header">
            <span className="cyber-card-dot cyber-card-dot-red" />
            <span className="cyber-card-dot cyber-card-dot-yellow" />
            <span className="cyber-card-dot cyber-card-dot-green" />
            <span className="ml-3 text-[10px] text-neutral-500 font-mono">revenue.exe</span>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-neon-400" />
              <h2 className="text-lg font-display font-bold text-white">Revenue This Month</h2>
            </div>
            <div className="text-3xl font-bold text-neon-400 neon-text">₹{stats.revenueThisMonth / 100}</div>
            <p className="text-sm text-neutral-500 font-mono mt-1">
              from {stats.completedApplications} completed applications
            </p>
          </div>
        </div>

        {/* Processing Queue */}
        <div className="cyber-card mb-8 border-yellow-500/20">
          <div className="cyber-card-header bg-yellow-500/5 border-b-yellow-500/10">
            <span className="cyber-card-dot cyber-card-dot-red" />
            <span className="cyber-card-dot cyber-card-dot-yellow" />
            <span className="cyber-card-dot cyber-card-dot-green" />
            <span className="ml-3 text-[10px] text-yellow-500 font-mono">queue.pending</span>
            {stats.pendingApplications > 0 && (
              <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {stats.pendingApplications} pending
              </span>
            )}
          </div>
          <div className="p-5">
            {recentApplications.filter(a => a.status === 'SUBMITTED' || a.status === 'IN_PROCESS').length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-neon-400 mx-auto mb-3" />
                <p className="text-neon-400 font-medium">All caught up! No pending forms.</p>
                <p className="text-sm text-neutral-500 font-mono mt-1">$ echo "Queue is empty"</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications
                  .filter(a => a.status === 'SUBMITTED' || a.status === 'IN_PROCESS')
                  .slice(0, 5)
                  .map((app) => (
                  <div key={app.id} className="bg-[#0a0f1a] rounded-xl p-4 sm:p-5 border border-neon-500/10 hover:border-neon-500/30 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                            {app.status.replace('_', ' ')}
                          </span>
                          <span className="text-[10px] text-neutral-600 font-mono">
                            {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                          <div>
                            <p className="font-bold text-white">{app.user.fullName}</p>
                            <p className="text-xs text-neutral-500 font-mono">{app.user.mobile}</p>
                          </div>
                          <div className="sm:border-l sm:border-neutral-800 sm:pl-4">
                            <p className="font-medium text-cyber-400 text-sm">{app.exam.title}</p>
                            <p className="text-xs text-neutral-500 font-mono">₹{(app.exam.officialFee + app.exam.serviceFee) / 100}</p>
                          </div>
                          <div className="sm:border-l sm:border-neutral-800 sm:pl-4">
                            {app.payment?.status === 'SUCCESS' ? (
                              <span className="text-xs bg-neon-500/10 text-neon-400 border border-neon-500/20 px-2 py-1 rounded-full font-medium">Paid ₹{app.payment.amount / 100}</span>
                            ) : (
                              <span className="text-xs bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 px-2 py-1 rounded-full font-medium">Pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link href={`/admin/applications/${app.id}`}>
                        <button className="flex items-center gap-2 bg-neon-500 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-neon-600 transition-colors min-h-[44px] whitespace-nowrap shadow-neon">
                          Process <ChevronRight className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Requests */}
        {formRequests.filter(r => r.status === 'PENDING').length > 0 && (
          <div className="cyber-card mb-8 border-cyber-500/20">
            <div className="cyber-card-header bg-cyber-500/5 border-b-cyber-500/10">
              <span className="cyber-card-dot cyber-card-dot-red" />
              <span className="cyber-card-dot cyber-card-dot-yellow" />
              <span className="cyber-card-dot cyber-card-dot-green" />
              <span className="ml-3 text-[10px] text-cyber-400 font-mono">requests.inbox</span>
              <span className="ml-auto bg-cyber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                {formRequests.filter(r => r.status === 'PENDING').length} new
              </span>
            </div>
            <div className="p-5">
              <div className="space-y-3">
                {formRequests.filter(r => r.status === 'PENDING').slice(0, 3).map((req) => (
                  <div key={req.id} className="bg-[#0a0f1a] rounded-xl p-4 border border-neutral-800">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-white">{req.formName}</h3>
                          <span className="bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-xs px-2 py-0.5 rounded-full font-medium">Pending</span>
                        </div>
                        <p className="text-sm text-neutral-400">{req.category} • {req.user.fullName} ({req.user.mobile})</p>
                      </div>
                      <Link href="/admin/form-requests">
                        <button className="bg-cyber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cyber-600 transition-colors min-h-[40px] whitespace-nowrap">
                          Review →
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recent Applications */}
        <div className="cyber-card">
          <div className="cyber-card-header">
            <span className="cyber-card-dot cyber-card-dot-red" />
            <span className="cyber-card-dot cyber-card-dot-yellow" />
            <span className="cyber-card-dot cyber-card-dot-green" />
            <span className="ml-3 text-[10px] text-neutral-500 font-mono">recent.log</span>
          </div>
          <div className="p-5">
            {recentApplications.length === 0 ? (
              <p className="text-neutral-600 text-center py-8 font-mono">No applications yet</p>
            ) : (
              <div className="space-y-3">
                {recentApplications.slice(0, 5).map((app) => (
                  <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[#0a0f1a] rounded-xl border border-neutral-800 gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white truncate">{app.user.fullName} → {app.exam.title}</p>
                      <p className="text-xs text-neutral-500 font-mono">{app.exam.category} • {app.user.mobile}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start sm:self-center ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
