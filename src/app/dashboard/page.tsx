'use client';
import { PageHead } from '@/components/page-head';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  LogOut, FileText, Clock, CheckCircle, AlertCircle, User,
  Search, Phone, IndianRupee, ChevronRight, CreditCard,
  HelpCircle, BookOpen, Shield, LayoutDashboard, Settings, Gift, Plus
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { MobileMenu } from '@/components/mobile-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import { UserNotificationBell } from '@/components/user-notification-bell';
import { APPLICATION_STATUS } from '@/lib/types';
import { ReferralPanel } from '@/components/referral-panel';

interface Application {
  id: string;
  exam: {
    id: string;
    title: string;
    category: string;
    officialFee: number;
    serviceFee: number;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
  payment?: {
    amount: number;
    status: string;
    createdAt: string;
  } | null;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'payments' | 'profile' | 'referrals'>('overview');

  useEffect(() => {
    const checkTab = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['overview', 'applications', 'payments', 'profile', 'referrals'].includes(tab)) {
        setActiveTab(tab as 'overview' | 'applications' | 'payments' | 'profile' | 'referrals');
      }
    };
    checkTab();
    window.addEventListener('popstate', checkTab);
    return () => window.removeEventListener('popstate', checkTab);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated') {
      fetchApplications();
    }
  }, [status, router]);

  const fetchApplications = async () => {
    try {
      const response = await fetch('/api/applications/user');
      const data = await response.json();
      if (response.ok) {
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-orange-500/10 text-orange-400 border border-orange-500/20';
      case 'SUBMITTED': return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      case 'IN_PROCESS': return 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20';
      case 'FORM_FILLED': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
      case 'COMPLETED': return 'bg-neon-500/10 text-neon-400 border border-neon-500/20';
      case 'REJECTED': return 'bg-red-500/10 text-red-400 border border-red-500/20';
      default: return 'bg-neutral-500/10 text-neutral-400 border border-neutral-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="h-4 w-4" />;
      case 'SUBMITTED': return <Clock className="h-4 w-4" />;
      case 'IN_PROCESS': return <AlertCircle className="h-4 w-4" />;
      case 'FORM_FILLED': return <FileText className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      case 'REJECTED': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getProgress = (status: string) => {
    const statusOrder = ['SUBMITTED', 'IN_PROCESS', 'FORM_FILLED', 'COMPLETED'];
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  const totalApplications = applications.length;
  const completedApplications = applications.filter(a => a.status === 'COMPLETED').length;
  const pendingApplications = applications.filter(a => a.status === 'SUBMITTED' || a.status === 'IN_PROCESS').length;
  const submittedExamIds = new Set(
    applications.filter(a => a.status !== 'DRAFT').map(a => a.exam.id)
  );
  const draftApplications = applications.filter(
    a => a.status === 'DRAFT' && !submittedExamIds.has(a.exam.id)
  );
  const totalSpent = applications
    .filter(a => a.payment?.status === 'SUCCESS')
    .reduce((sum, a) => sum + (a.payment?.amount || 0), 0);
  const successfulPayments = applications.filter(a => a.payment?.status === 'SUCCESS');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0f1a]">
        <nav className="bg-[#0d1420] border-b border-neon-500/10"><div className="max-w-7xl mx-auto px-4 py-4 min-h-[88px]" /></nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-[#0d1420] rounded-xl border border-neon-500/10 p-6 animate-pulse">
                  <div className="h-4 bg-neutral-800 rounded w-24 mb-3" />
                  <div className="h-8 bg-neutral-800 rounded w-16 mb-1" />
                  <div className="h-3 bg-neutral-800 rounded w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <nav className="bg-[#0d1420] border-b border-neon-500/10 shadow-[0_1px_20px_rgba(22,179,94,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-5 min-h-[88px]">
            <Link href="/"><Logo size="md" /></Link>
            <div className="hidden sm:flex items-center gap-2 sm:gap-4">
              <Link href="/exams">
                <Button variant="ghost" className="text-neutral-300 hover:text-neon-400 hover:bg-neon-500/5 text-xs sm:text-sm px-2 sm:px-4">
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden md:inline">Browse Forms</span>
                </Button>
              </Link>
              <div className="hidden lg:flex items-center gap-2 bg-neon-500/5 border border-neon-500/10 rounded-lg px-3 py-1.5">
                <div className="bg-neon-500/20 rounded-full p-1">
                  <User className="h-3 w-3 text-neon-400" />
                </div>
                <span className="text-xs font-medium text-neutral-300 truncate max-w-[100px]">{session?.user?.name}</span>
              </div>
              <ThemeToggle className="text-neutral-400 hover:text-neon-400 hover:bg-neon-500/5" />
              <div className="text-neutral-300"><UserNotificationBell /></div>
              <Button variant="ghost" onClick={() => signOut()} className="text-neutral-300 hover:text-red-400 hover:bg-red-500/5 px-2 sm:px-4">
                <LogOut className="h-5 w-5" />
                <span className="hidden md:inline ml-2">Logout</span>
              </Button>
            </div>
            <div className="sm:hidden">
              <MobileMenu
                logoWhite
                items={[
                  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
                  { label: 'Browse Forms', href: '/exams', icon: <Search className="h-5 w-5" /> },
                  { label: 'Request Form', href: '/request-form', icon: <Plus className="h-5 w-5" /> },
                  { label: 'My Applications', onClick: () => setActiveTab('applications'), icon: <FileText className="h-5 w-5" /> },
                  { label: 'Payment History', onClick: () => setActiveTab('payments'), icon: <CreditCard className="h-5 w-5" /> },
                  { label: 'Contact Support', href: '/contact', icon: <Phone className="h-5 w-5" /> },
                ]}
                themeToggle={<ThemeToggle />}
                footer={
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300 font-medium py-3 rounded-lg hover:bg-red-500/5 transition-colors min-h-[48px]"
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

      {/* Tabs */}
      <div className="bg-[#0d1420] border-b border-neon-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar -mb-px">
            {[
              { id: 'overview' as const, label: 'Overview', icon: BookOpen },
              { id: 'applications' as const, label: 'My Applications', icon: FileText },
              { id: 'payments' as const, label: 'Payments', icon: CreditCard },
              { id: 'referrals' as const, label: 'Refer & Earn', icon: Gift },
              { id: 'profile' as const, label: 'Profile', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[52px] ${
                  activeTab === tab.id
                    ? 'border-neon-500 text-neon-400'
                    : 'border-transparent text-neutral-500 hover:text-neutral-300 hover:border-neutral-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ═══ Overview Tab ═══ */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-neon-600/20 to-cyber-600/20 border border-neon-500/20 rounded-2xl p-6 sm:p-8 relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(22,179,94,0.05) 2px, rgba(22,179,94,0.05) 4px)' }} />
              <div className="relative z-10">
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white mb-2">
                  Welcome back, {session?.user?.name}! 👋
                </h1>
                <p className="text-neutral-400 mb-6">
                  Manage your form applications, track progress, and more.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/exams">
                    <Button className="bg-neon-500 hover:bg-neon-600 text-white shadow-neon font-semibold">
                      <Search className="h-5 w-5 mr-2" />
                      Browse Forms
                    </Button>
                  </Link>
                  <Link href="/request-form">
                    <Button className="bg-cyber-500 hover:bg-cyber-600 text-white font-semibold">
                      <Plus className="h-5 w-5 mr-2" />
                      Request Form
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { icon: FileText, value: totalApplications, label: 'Total Forms', color: 'text-cyber-400', bg: 'bg-cyber-500/10 border-cyber-500/20' },
                { icon: CheckCircle, value: completedApplications, label: 'Completed', color: 'text-neon-400', bg: 'bg-neon-500/10 border-neon-500/20' },
                { icon: Clock, value: pendingApplications, label: 'In Progress', color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/20' },
                { icon: IndianRupee, value: `₹${totalSpent / 100}`, label: 'Total Spent', color: 'text-neon-400', bg: 'bg-neon-500/10 border-neon-500/20' },
              ].map((stat, i) => (
                <div key={i} className={`cyber-card hover:shadow-neon transition-all`}>
                  <div className="p-5">
                    <div className="flex items-center gap-3">
                      <div className={`${stat.bg} border rounded-xl p-3`}>
                        <stat.icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-sm text-neutral-500 font-mono">{stat.label}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* In Progress Alert */}
            {pendingApplications > 0 && (
              <div className="bg-yellow-500/5 border border-yellow-500/20 rounded-xl p-5 flex items-center gap-3">
                <div className="bg-yellow-500/10 rounded-lg p-2">
                  <Clock className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-yellow-400 text-sm">Forms In Progress</h3>
                  <p className="text-xs text-neutral-400">
                    You have {pendingApplications} application{pendingApplications !== 1 ? 's' : ''} being processed.
                  </p>
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-display font-bold text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { href: '/exams', icon: Search, title: 'Browse Forms', desc: 'Find exams & more', color: 'neon' },
                  { href: '/contact', icon: Phone, title: 'Contact Support', desc: 'Get help', color: 'cyber' },
                  { href: '/#how-it-works', icon: HelpCircle, title: 'How It Works', desc: 'Learn the process', color: 'neon' },
                ].map((action, i) => (
                  <Link key={i} href={action.href}>
                    <div className="cyber-card hover:shadow-neon transition-all cursor-pointer group">
                      <div className="p-5">
                        <div className="flex items-center gap-4">
                          <div className={`${action.color === 'neon' ? 'bg-neon-500/10 border-neon-500/20' : 'bg-cyber-500/10 border-cyber-500/20'} border rounded-xl p-3 group-hover:shadow-neon transition-all`}>
                            <action.icon className={`h-6 w-6 ${action.color === 'neon' ? 'text-neon-400' : 'text-cyber-400'}`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-white text-sm">{action.title}</h3>
                            <p className="text-xs text-neutral-500">{action.desc}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-neutral-600 group-hover:text-neon-400 transition-colors" />
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Applications */}
            {applications.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-display font-bold text-white">Recent Applications</h2>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-sm text-neon-400 hover:text-neon-300 font-medium min-h-[44px] flex items-center font-mono"
                  >
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-3">
                  {applications.slice(0, 3).map((application) => (
                    <Link key={application.id} href={`/dashboard/applications/${application.id}`}>
                      <div className="cyber-card hover:shadow-neon transition-all cursor-pointer">
                        <div className="cyber-card-header">
                          <span className="cyber-card-dot cyber-card-dot-red" />
                          <span className="cyber-card-dot cyber-card-dot-yellow" />
                          <span className="cyber-card-dot cyber-card-dot-green" />
                          <span className="ml-auto text-[10px] text-neutral-500 font-mono">{application.exam.category}</span>
                        </div>
                        <div className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-semibold text-white truncate">{application.exam.title}</h3>
                              <p className="text-xs text-neutral-500 font-mono">{new Date(application.createdAt).toLocaleDateString()}</p>
                            </div>
                            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(application.status)}`}>
                              {getStatusIcon(application.status)}
                              {APPLICATION_STATUS[application.status as keyof typeof APPLICATION_STATUS]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Applications Tab ═══ */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-display font-bold text-white">My Applications</h2>
              <Link href="/exams">
                <Button className="bg-neon-500 hover:bg-neon-600 text-white shadow-neon font-semibold">
                  <Search className="h-4 w-4 mr-2" />
                  New Application
                </Button>
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="cyber-card">
                <div className="cyber-card-body text-center py-16">
                  <FileText className="h-16 w-16 text-neutral-700 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Applications Yet</h3>
                  <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                    Start by browsing available forms and submitting your first application.
                  </p>
                  <Link href="/exams">
                    <Button className="bg-neon-500 hover:bg-neon-600 text-white shadow-neon font-semibold">
                      <Search className="h-5 w-5 mr-2" />
                      Browse Forms
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Link key={application.id} href={`/dashboard/applications/${application.id}`}>
                    <div className="cyber-card hover:shadow-neon transition-all cursor-pointer">
                      <div className="cyber-card-header">
                        <span className="cyber-card-dot cyber-card-dot-red" />
                        <span className="cyber-card-dot cyber-card-dot-yellow" />
                        <span className="cyber-card-dot cyber-card-dot-green" />
                        <span className="ml-auto text-[10px] text-neutral-500 font-mono">{application.exam.category}</span>
                      </div>
                      <div className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                          <div className="min-w-0">
                            <h3 className="text-lg font-semibold text-white truncate">{application.exam.title}</h3>
                            <p className="text-xs text-neutral-500 font-mono">{application.exam.category}</p>
                          </div>
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(application.status)}`}>
                            {getStatusIcon(application.status)}
                            {APPLICATION_STATUS[application.status as keyof typeof APPLICATION_STATUS]}
                          </span>
                        </div>

                        {/* Progress */}
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-sm font-mono text-neutral-500">progress</span>
                            <span className="text-sm font-mono text-neon-400">{Math.round(getProgress(application.status))}%</span>
                          </div>
                          <div className="w-full bg-neutral-800 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-neon-500 to-cyber-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${getProgress(application.status)}%` }}
                            />
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="flex justify-between items-start mb-4 overflow-x-auto no-scrollbar">
                          {[
                            { status: 'SUBMITTED', label: 'Submitted' },
                            { status: 'IN_PROCESS', label: 'In Review' },
                            { status: 'FORM_FILLED', label: 'Form Filled' },
                            { status: 'COMPLETED', label: 'Completed' },
                          ].map((step, index) => {
                            const isCompleted = ['SUBMITTED', 'IN_PROCESS', 'FORM_FILLED', 'COMPLETED'].indexOf(application.status) >= index;
                            return (
                              <div key={step.status} className="flex flex-col items-center flex-1 min-w-[70px]">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  isCompleted ? 'bg-neon-500 text-white' : 'bg-neutral-800 text-neutral-600 border border-neutral-700'
                                }`}>
                                  {isCompleted ? <CheckCircle className="h-4 w-4" /> : <span className="text-xs font-mono">{index + 1}</span>}
                                </div>
                                <span className="text-[10px] sm:text-xs mt-1.5 text-center text-neutral-500 font-mono">{step.label}</span>
                              </div>
                            );
                          })}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500 pt-3 border-t border-white/5 font-mono">
                          <div className="flex flex-wrap items-center gap-4">
                            <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                            {application.payment && (
                              <span className="text-neon-400">₹{application.payment.amount / 100}</span>
                            )}
                          </div>
                          <span className="text-neon-400 font-medium">View Details →</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ Payments Tab ═══ */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-white">Payment History</h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Total Spent', value: `₹${totalSpent / 100}`, color: 'text-neon-400' },
                { label: 'Successful', value: successfulPayments.length, color: 'text-neon-400' },
                { label: 'Pending', value: applications.filter(a => a.payment?.status === 'PENDING').length, color: 'text-yellow-400' },
              ].map((s, i) => (
                <div key={i} className="cyber-card">
                  <div className="p-5">
                    <p className="text-sm text-neutral-500 font-mono mb-1">{s.label}</p>
                    <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {successfulPayments.length === 0 ? (
              <div className="cyber-card">
                <div className="cyber-card-body text-center py-16">
                  <CreditCard className="h-16 w-16 text-neutral-700 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Payments Yet</h3>
                  <p className="text-neutral-500">Your payment history will appear here.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {successfulPayments.map((app) => (
                  <div key={app.id} className="cyber-card">
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-neon-500/10 border border-neon-500/20 rounded-xl p-2.5 flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-neon-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-white truncate">{app.exam.title}</p>
                            <p className="text-xs text-neutral-500 font-mono">{new Date(app.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-neon-400">₹{app.payment!.amount / 100}</p>
                          <span className="text-xs text-neon-400 font-mono">Paid</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══ Referrals Tab ═══ */}
        {activeTab === 'referrals' && <ReferralPanel />}

        {/* ═══ Profile Tab ═══ */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-white">Profile Details</h2>

            <div className="cyber-card">
              <div className="cyber-card-header">
                <span className="cyber-card-dot cyber-card-dot-red" />
                <span className="cyber-card-dot cyber-card-dot-yellow" />
                <span className="cyber-card-dot cyber-card-dot-green" />
                <span className="ml-3 text-[10px] text-neutral-500 font-mono">profile.info</span>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="bg-neon-500/10 border border-neon-500/20 rounded-2xl p-5">
                    <User className="h-12 w-12 text-neon-400" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-xs font-mono text-neutral-500">$ full_name</label>
                      <p className="text-lg font-semibold text-white">{session?.user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-xs font-mono text-neutral-500">$ email</label>
                      <p className="text-lg font-semibold text-white">{session?.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link href="/dashboard/profile/edit">
              <div className="cyber-card hover:shadow-neon transition-all cursor-pointer mb-6">
                <div className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="bg-neon-500/10 border border-neon-500/20 rounded-xl p-3">
                      <Settings className="h-6 w-6 text-neon-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white">Edit Profile</h3>
                      <p className="text-sm text-neutral-500">Update your name, email, or password</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-neutral-600" />
                  </div>
                </div>
              </div>
            </Link>

            <div className="cyber-card">
              <div className="cyber-card-header">
                <span className="cyber-card-dot cyber-card-dot-red" />
                <span className="cyber-card-dot cyber-card-dot-yellow" />
                <span className="cyber-card-dot cyber-card-dot-green" />
                <span className="ml-3 text-[10px] text-neutral-500 font-mono">help.support</span>
              </div>
              <div className="p-4">
                <div className="space-y-1">
                  {[
                    { href: '/contact', label: 'Contact Support', icon: Phone },
                    { href: '/terms', label: 'Terms & Conditions', icon: FileText },
                    { href: '/privacy', label: 'Privacy Policy', icon: Shield },
                    { href: '/refund', label: 'Refund Policy', icon: IndianRupee },
                  ].map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-neon-500/5 transition-colors cursor-pointer min-h-[48px]">
                        <link.icon className="h-5 w-5 text-neutral-600" />
                        <span className="font-medium text-neutral-300 text-sm flex-1">{link.label}</span>
                        <ChevronRight className="h-4 w-4 text-neutral-600" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Upcoming Deadlines Component
function UpcomingDeadlines({ applications }: { applications: any[] }) {
  const [exams, setExams] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/exams')
      .then(r => r.json())
      .then(data => setExams(data.exams || []))
      .catch(() => {});
  }, []);

  const appliedExamIds = new Set(applications.map(a => a.examId));
  const upcomingDeadlines = exams
    .filter(e => {
      const deadline = new Date(e.lastDate);
      const now = new Date();
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 && daysLeft <= 30;
    })
    .sort((a, b) => new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime())
    .slice(0, 5);

  if (upcomingDeadlines.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-display font-bold text-white mb-4">⏰ Upcoming Deadlines</h2>
      <div className="space-y-2">
        {upcomingDeadlines.map((exam) => {
          const deadline = new Date(exam.lastDate);
          const now = new Date();
          const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isApplied = appliedExamIds.has(exam.id);
          const isUrgent = daysLeft <= 3;

          return (
            <div key={exam.id} className={`flex items-center justify-between p-4 rounded-xl border ${
              isUrgent ? 'bg-red-500/5 border-red-500/20' : 'bg-[#0d1420] border-neon-500/10'
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white truncate">{exam.title}</span>
                  <span className="text-xs bg-cyber-500/10 text-cyber-400 border border-cyber-500/20 px-2 py-0.5 rounded font-mono">{exam.category}</span>
                </div>
                <p className="text-sm text-neutral-500 font-mono">
                  Due: {deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-sm font-bold font-mono ${isUrgent ? 'text-red-400' : 'text-yellow-400'}`}>
                  {daysLeft}d left
                </span>
                {isApplied ? (
                  <span className="text-xs bg-neon-500/10 text-neon-400 border border-neon-500/20 px-2 py-1 rounded-full font-medium">Applied ✓</span>
                ) : (
                  <Link href={`/apply/${exam.id}`}>
                    <button className="text-xs bg-neon-500 text-white px-3 py-1.5 rounded-lg hover:bg-neon-600 transition-colors font-medium whitespace-nowrap shadow-neon">
                      Apply Now
                    </button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
