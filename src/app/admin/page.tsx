'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, FileText, Clock, CheckCircle, TrendingUp, LogOut, Loader2, LayoutDashboard, BarChart3, Tag, ExternalLink, AlertCircle, ChevronRight, Bell, Mail } from 'lucide-react';
import { Logo } from '@/components/logo';
import { LogoIcon } from '@/components/logo-icon';
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
  payment: { status: string; amount: number; razorpayPaymentId: string | null } | null;
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

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 15 seconds for live stats
    const interval = setInterval(fetchDashboardData, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard', { credentials: 'include', cache: 'no-store' });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          window.location.href = '/admin/login';
          return;
        }
        setError(data.error || 'Failed to load dashboard');
        setIsLoading(false);
        return;
      }

      setAdmin(data.admin);
      setStats(data.stats);
      setRecentApplications(data.recentApplications);

      // Fetch form requests
      try {
        const reqRes = await fetch('/api/admin/form-requests', { credentials: 'include' });
        if (reqRes.ok) {
          const reqData = await reqRes.json();
          setFormRequests(reqData.requests || []);
        }
      } catch {}
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST', credentials: 'include' });
      router.push('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED':
        return 'bg-blue-100 text-blue-700';
      case 'IN_PROCESS':
        return 'bg-yellow-100 text-yellow-700';
      case 'FORM_FILLED':
        return 'bg-purple-100 text-purple-700';
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'REJECTED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error && !admin) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-4">
            {error}
          </div>
          <Button variant="primary" onClick={() => { setError(''); setIsLoading(true); fetchDashboardData(); }}>
            Retry
          </Button>
          <div className="mt-4">
            <a href="/admin/login" className="text-primary-600 hover:underline text-sm">Go to Login</a>
          </div>
        </div>
      </div>
    );
  }

  if (!admin || !stats) {
    return null;
  }

  return (
    <div className="min-h-screen bg-neutral-100 dark:bg-neutral-900">
      {/* Admin Navigation */}
      <nav className="bg-primary-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-5 min-h-[88px]">
            <div className="flex items-center gap-3">
              <Logo size="sm" white />
              <div>
                <h1 className="text-xl font-display font-bold">Admin Dashboard</h1>
                <p className="text-sm text-primary-200">Welcome, {admin.name}</p>
              </div>
            </div>
            <div className="hidden sm:flex items-center gap-2">
              <ThemeToggle className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white" />
              <button 
                onClick={handleLogout}
                className="text-white hover:bg-white/10 font-medium flex items-center gap-2 min-h-[44px] px-4 py-2 rounded-lg transition-colors"
              >
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
                footer={
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 text-red-600 hover:text-red-700 font-medium py-3 rounded-lg hover:bg-red-50 transition-colors min-h-[48px]"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                }
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Admin Tabs */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar -mb-px">
            {[
              { href: '/admin/applications', label: 'Applications', icon: Users },
              { href: '/admin/exams', label: 'Forms', icon: FileText },
              { href: '/admin/payments', label: 'Payments', icon: TrendingUp },
              { href: '/admin/analytics', label: 'Analytics', icon: TrendingUp },
              { href: '/admin/coupons', label: 'Coupons', icon: FileText },
              { href: '/admin/form-requests', label: 'Requests', icon: FileText },
              { href: '/admin/notifications', label: 'Notifications', icon: Bell },
              { href: '/admin/contacts', label: 'Contacts', icon: Mail },
            ].map((tab) => (
              <Link key={tab.href} href={tab.href} className="whitespace-nowrap">
                <button className="flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:text-neutral-200 hover:border-neutral-300 transition-colors min-h-[52px]">
                  {tab.label}
                </button>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Users className="h-5 w-5 text-primary-600" />
                <span className="text-sm text-neutral-600 dark:text-neutral-300">Today</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900">{stats.todayApplications}</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">New Applications</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-sm text-neutral-600 dark:text-neutral-300">Pending</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900">{stats.pendingApplications}</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Awaiting Review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="text-sm text-neutral-600 dark:text-neutral-300">In Process</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900">{stats.inProcessApplications}</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Being Processed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="text-sm text-neutral-600 dark:text-neutral-300">This Week</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary-900">{stats.completedThisWeek}</div>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-display font-bold text-primary-900">Revenue This Month</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-primary-900">
              ₹{stats.revenueThisMonth / 100}
            </div>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mt-1">
              Total from {stats.completedApplications} completed applications
            </p>
          </CardContent>
        </Card>

        {/* PENDING FORMS PROCESSING QUEUE */}
        <Card className="mb-8 border-2 border-yellow-300 bg-yellow-50/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <h2 className="text-xl font-display font-bold text-primary-900">Forms To Process</h2>
                {stats.pendingApplications > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {stats.pendingApplications} pending
                  </span>
                )}
              </div>
              <Link href="/admin/applications">
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View All Applications →
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentApplications.filter(a => a.status === 'SUBMITTED' || a.status === 'IN_PROCESS').length === 0 ? (
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-green-700 font-medium">All caught up! No pending forms.</p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">New applications will appear here when users submit them.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentApplications
                  .filter(a => a.status === 'SUBMITTED' || a.status === 'IN_PROCESS')
                  .slice(0, 5)
                  .map((app) => (
                  <div key={app.id} className="bg-white dark:bg-neutral-800 rounded-xl p-4 sm:p-5 border border-neutral-200 dark:border-neutral-700 hover:border-primary-300 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(app.status)}`}>
                            {app.status.replace('_', ' ')}
                          </span>
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">
                            {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4">
                          <div>
                            <p className="font-bold text-primary-900">{app.user.fullName}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{app.user.mobile} • {app.user.email}</p>
                          </div>
                          <div className="sm:border-l sm:pl-4">
                            <p className="font-medium text-primary-700 text-sm">{app.exam.title}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{app.exam.category} • Fee: ₹{(app.exam.officialFee + app.exam.serviceFee) / 100}</p>
                          </div>
                          <div className="sm:border-l sm:pl-4">
                            {app.payment?.status === 'SUCCESS' ? (
                              <div>
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">💰 Paid ₹{app.payment.amount / 100}</span>
                                {app.payment.razorpayPaymentId && (
                                  <p className="text-[10px] text-neutral-400 font-mono mt-1 truncate max-w-[140px]" title={app.payment.razorpayPaymentId}>ID: {app.payment.razorpayPaymentId}</p>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-medium">⏳ Payment pending</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Link href={`/admin/applications/${app.id}`}>
                        <button className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2.5 rounded-lg font-medium text-sm hover:bg-primary-700 transition-colors min-h-[44px] whitespace-nowrap">
                          Process Form
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* FORM REQUESTS */}
        {formRequests.filter(r => r.status === 'PENDING').length > 0 && (
          <Card className="mb-8 border-2 border-blue-300 bg-blue-50/50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-display font-bold text-primary-900">Form Requests</h2>
                  <span className="bg-blue-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                    {formRequests.filter(r => r.status === 'PENDING').length} new
                  </span>
                </div>
                <Link href="/admin/form-requests">
                  <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">View All →</button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {formRequests.filter(r => r.status === 'PENDING').slice(0, 3).map((req) => (
                  <div key={req.id} className="bg-white dark:bg-neutral-800 rounded-xl p-4 border border-neutral-200 dark:border-neutral-700">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-primary-900">{req.formName}</h3>
                          <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-0.5 rounded-full font-medium">Pending</span>
                        </div>
                        <p className="text-sm text-neutral-600 dark:text-neutral-300">{req.category} • Requested by {req.user.fullName} ({req.user.mobile})</p>
                        {req.portalName && <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">Portal: {req.portalName}</p>}
                      </div>
                      <Link href="/admin/form-requests">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors min-h-[40px] whitespace-nowrap">
                          Review →
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-primary-900">Recent Applications</h2>
              <Link href="/admin/applications">
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View All
                </button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? (
              <p className="text-neutral-600 dark:text-neutral-300 text-center py-8">No applications yet</p>
            ) : (
              <div className="space-y-4">
                {recentApplications.map((app) => (
                  <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-neutral-50 rounded-lg gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                        <div className="min-w-0">
                          <p className="font-medium text-primary-900 truncate">{app.user.fullName}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300">{app.user.mobile}</p>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-primary-900 truncate">{app.exam.title}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300">{app.exam.category}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap self-start sm:self-center ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}