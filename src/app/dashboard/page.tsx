'use client';
import { PageHead } from '@/components/page-head';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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

  // Read tab from URL query params - runs on mount AND on URL change
  useEffect(() => {
    const checkTab = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab && ['overview', 'applications', 'payments', 'profile', 'referrals'].includes(tab)) {
        setActiveTab(tab as 'overview' | 'applications' | 'payments' | 'profile' | 'referrals');
      }
    };
    // Initial check
    checkTab();
    // Listen for URL changes (back/forward + same-page navigation)
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
      case 'DRAFT': return 'bg-orange-100 text-orange-700';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-700';
      case 'IN_PROCESS': return 'bg-yellow-100 text-yellow-700';
      case 'FORM_FILLED': return 'bg-purple-100 text-purple-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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

  // Stats computation
  const totalApplications = applications.length;
  const completedApplications = applications.filter(a => a.status === 'COMPLETED').length;
  const pendingApplications = applications.filter(a => a.status === 'SUBMITTED' || a.status === 'IN_PROCESS').length;
  // Filter out drafts if there's already a submitted+ application for the same exam
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
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <nav className="bg-primary-900 shadow-lg"><div className="max-w-7xl mx-auto px-4 py-4 min-h-[88px]" /></nav>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[1,2,3,4].map(i => (
                <div key={i} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 animate-pulse">
                  <div className="flex items-center justify-between mb-3">
                    <div className="h-4 bg-neutral-200 dark:bg-neutral-600 rounded w-24" />
                    <div className="h-10 w-10 bg-neutral-200 dark:bg-neutral-600 rounded-lg" />
                  </div>
                  <div className="h-8 bg-neutral-200 dark:bg-neutral-600 rounded w-16 mb-1" />
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-600 rounded w-20" />
                </div>
              ))}
            </div>
            {[1,2].map(i => (
              <div key={i} className="bg-white dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700 p-6 animate-pulse">
                <div className="h-6 bg-neutral-200 dark:bg-neutral-600 rounded w-40 mb-4" />
                <div className="space-y-3">
                  {[1,2].map(j => (
                    <div key={j} className="h-16 bg-neutral-100 dark:bg-neutral-700 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <nav className="bg-primary-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-5 min-h-[88px]">
            <Link href="/">
              <Logo size="md" white />
            </Link>
            <div className="hidden sm:flex items-center gap-2 sm:gap-4">
              <Link href="/exams">
                <Button variant="ghost" className="text-white hover:bg-white/10 text-xs sm:text-sm px-2 sm:px-4">
                  <Search className="h-4 w-4 sm:mr-2" />
                  <span className="hidden md:inline">Browse Forms</span>
                </Button>
              </Link>
              <div className="hidden lg:flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5">
                <div className="bg-primary-500 rounded-full p-1">
                  <User className="h-3 w-3 text-white" />
                </div>
                <span className="text-xs font-medium truncate max-w-[100px]">{session?.user?.name}</span>
              </div>
              <ThemeToggle className="text-white hover:bg-white/10" />
              <div className="text-white"><UserNotificationBell /></div>
              <Button variant="ghost" onClick={() => signOut()} className="text-white hover:bg-white/10 px-2 sm:px-4">
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

      {/* Tabs */}
      <div className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar -mb-px">
            {[
              { id: 'overview' as const, label: 'Overview', icon: BookOpen },
              { id: 'applications' as const, label: 'My Applications', icon: FileText },
              { id: 'payments' as const, label: 'Payment History', icon: CreditCard },
              { id: 'referrals' as const, label: 'Refer & Earn', icon: Gift },
              { id: 'profile' as const, label: 'Profile', icon: User },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[52px] ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:border-neutral-300'
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
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Welcome Banner */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 sm:p-8 text-white dark:from-primary-700 dark:to-primary-950">
              <h1 className="text-2xl sm:text-3xl font-display font-bold mb-2">
                Welcome back, {session?.user?.name}! 👋
              </h1>
              <p className="text-primary-100 mb-6">
                Manage your form applications, track progress, and more.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/exams">
                  <Button variant="secondary" size="lg" className="bg-white text-primary-700 hover:bg-primary-50">
                    <Search className="h-5 w-5 mr-2" />
                    Browse Forms
                  </Button>
                </Link>
                <Link href="/request-form">
                  <Button variant="secondary" size="lg" className="bg-accent-500 text-white hover:bg-accent-600">
                    <Plus className="h-5 w-5 mr-2" />
                    Request Form
                  </Button>
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="hover:shadow-medium transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 rounded-xl p-3">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary-900 dark:text-white">{totalApplications}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Forms</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-medium transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-100 rounded-xl p-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary-900 dark:text-white">{completedApplications}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Completed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-medium transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 rounded-xl p-3">
                      <Clock className="h-6 w-6 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary-900 dark:text-white">{pendingApplications}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">In Progress</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="hover:shadow-medium transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary-100 rounded-xl p-3">
                      <IndianRupee className="h-6 w-6 text-primary-600" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-primary-900 dark:text-white">₹{totalSpent / 100}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Total Spent</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Deadline Reminders */}
            {pendingApplications > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
                <div className="flex items-center gap-3">
                  <div className="bg-amber-100 rounded-lg p-2">
                    <Clock className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-amber-900">Forms In Progress</h3>
                    <p className="text-sm text-amber-700">
                      You have {pendingApplications} application{pendingApplications !== 1 ? 's' : ''} being processed. Our team is working on them.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Upcoming Exam Deadlines */}
            <UpcomingDeadlines applications={applications} />

            {/* Quick Actions */}
            <div>
              <h2 className="text-lg font-display font-bold text-primary-900 dark:text-white mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Link href="/exams">
                  <Card className="hover:shadow-medium transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-primary-100 rounded-xl p-3 group-hover:bg-primary-200 transition-colors">
                          <Search className="h-6 w-6 text-primary-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary-900 dark:text-white">Browse Forms</h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">Find exams, registrations & more</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-primary-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/contact">
                  <Card className="hover:shadow-medium transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-green-100 rounded-xl p-3 group-hover:bg-green-200 transition-colors">
                          <Phone className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary-900 dark:text-white">Contact Support</h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">Get help with your application</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-green-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/about">
                  <Card className="hover:shadow-medium transition-shadow cursor-pointer group">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="bg-accent-100 rounded-xl p-3 group-hover:bg-accent-200 transition-colors">
                          <HelpCircle className="h-6 w-6 text-accent-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-primary-900 dark:text-white">How It Works</h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">Learn about our process</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-400 group-hover:text-accent-600 transition-colors" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </div>

            {/* Incomplete Forms (Drafts) */}
            {draftApplications.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <h2 className="text-lg font-display font-bold text-orange-800">Incomplete Forms</h2>
                </div>
                <div className="space-y-3">
                  {draftApplications.map((application) => (
                    <Card key={application.id} className="border-2 border-orange-200 bg-orange-50/50">
                      <CardContent className="p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="bg-orange-100 rounded-xl p-3 flex-shrink-0">
                              <FileText className="h-5 w-5 text-orange-600" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-primary-900 truncate">{application.exam.title}</h3>
                              <p className="text-sm text-orange-600">You left this form incomplete</p>
                            </div>
                          </div>
                          <Link href={`/apply/${application.exam.id}`}>
                            <Button variant="primary" size="sm" className="bg-orange-600 hover:bg-orange-700">
                              Continue Filling →
                            </Button>
                          </Link>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Applications */}
            {applications.length > 0 && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-display font-bold text-primary-900 dark:text-white">Recent Applications</h2>
                  <button
                    onClick={() => setActiveTab('applications')}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium min-h-[44px] flex items-center"
                  >
                    View All <ChevronRight className="h-4 w-4 ml-1" />
                  </button>
                </div>
                <div className="space-y-4">
                  {applications.slice(0, 3).map((application) => (
                    <Link key={application.id} href={`/dashboard/applications/${application.id}`}>
                      <Card className="hover:shadow-medium transition-shadow cursor-pointer">
                        <CardContent className="p-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="bg-primary-100 rounded-xl p-3 flex-shrink-0">
                                <FileText className="h-5 w-5 text-primary-600" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="font-semibold text-primary-900 truncate">{application.exam.title}</h3>
                                <p className="text-sm text-neutral-500 dark:text-neutral-400">{application.exam.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3 flex-shrink-0">
                              <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(application.status)}`}>
                                {getStatusIcon(application.status)}
                                {APPLICATION_STATUS[application.status as keyof typeof APPLICATION_STATUS]}
                              </span>
                              <ChevronRight className="h-4 w-4 text-neutral-400" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-display font-bold text-primary-900 dark:text-white">My Applications</h2>
              <Link href="/exams">
                <Button variant="primary">
                  <Search className="h-4 w-4 mr-2" />
                  New Application
                </Button>
              </Link>
            </div>

            {applications.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <FileText className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-primary-900 mb-2">No Applications Yet</h3>
                  <p className="text-neutral-500 mb-6 max-w-md mx-auto">
                    Start by browsing available forms and submitting your first application.
                  </p>
                  <Link href="/exams">
                    <Button variant="primary" size="lg">
                      <Search className="h-5 w-5 mr-2" />
                      Browse Forms
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {applications.map((application) => (
                  <Link key={application.id} href={`/dashboard/applications/${application.id}`}>
                    <Card className="hover:shadow-medium transition-shadow cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                        <div className="min-w-0">
                          <h3 className="text-lg font-semibold text-primary-900 truncate">{application.exam.title}</h3>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{application.exam.category}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(application.status)}`}>
                          {getStatusIcon(application.status)}
                          {APPLICATION_STATUS[application.status as keyof typeof APPLICATION_STATUS]}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mb-4">
                        <div className="flex justify-between items-center mb-1.5">
                          <span className="text-sm font-medium text-neutral-600">Progress</span>
                          <span className="text-sm font-medium text-primary-600">{Math.round(getProgress(application.status))}%</span>
                        </div>
                        <div className="w-full bg-neutral-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
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
                          const isCurrent = application.status === step.status;
                          return (
                            <div key={step.status} className="flex flex-col items-center flex-1 min-w-[70px]">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                isCompleted ? 'bg-green-600 text-white' : isCurrent ? 'bg-primary-600 text-white' : 'bg-neutral-200 text-neutral-400'
                              }`}>
                                {isCompleted ? <CheckCircle className="h-4 w-4" /> : <span className="text-xs font-medium">{index + 1}</span>}
                              </div>
                              <span className="text-[10px] sm:text-xs mt-1.5 text-center text-neutral-500 dark:text-neutral-400">{step.label}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-400 pt-3 border-t border-neutral-100">
                        <div className="flex flex-wrap items-center gap-4">
                          <span>Applied: {new Date(application.createdAt).toLocaleDateString()}</span>
                          <span>Updated: {new Date(application.updatedAt).toLocaleDateString()}</span>
                          {application.payment && (
                            <span className="flex items-center gap-1">
                              <IndianRupee className="h-3 w-3" />
                              ₹{application.payment.amount / 100}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {application.status === 'SUBMITTED' && (
                            <button
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!confirm('Are you sure you want to cancel this application?')) return;
                                const res = await fetch('/api/applications/cancel', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({ applicationId: application.id }),
                                });
                                if (res.ok) fetchApplications();
                              }}
                              className="text-red-500 hover:text-red-600 font-medium"
                            >
                              Cancel
                            </button>
                          )}
                          <span className="text-primary-600 font-medium hover:text-primary-700">View Details →</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                    </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Payments Tab */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-display font-bold text-primary-900 dark:text-white">Payment History</h2>
            </div>

            {/* Payment Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-neutral-500 mb-1">Total Spent</p>
                  <p className="text-2xl font-bold text-primary-900 dark:text-white">₹{totalSpent / 100}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-neutral-500 mb-1">Successful Payments</p>
                  <p className="text-2xl font-bold text-green-600">{successfulPayments.length}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5">
                  <p className="text-sm text-neutral-500 mb-1">Pending Payments</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {applications.filter(a => a.payment?.status === 'PENDING').length}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Payment List */}
            {successfulPayments.length === 0 ? (
              <Card>
                <CardContent className="py-16 text-center">
                  <CreditCard className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-primary-900 mb-2">No Payments Yet</h3>
                  <p className="text-neutral-500 dark:text-neutral-400">Your payment history will appear here after your first transaction.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {successfulPayments.map((app) => (
                  <Card key={app.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="bg-green-100 rounded-xl p-2.5 flex-shrink-0">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-primary-900 truncate">{app.exam.title}</p>
                            <p className="text-xs text-neutral-500 dark:text-neutral-400">{new Date(app.updatedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-semibold text-primary-900 dark:text-white">₹{app.payment!.amount / 100}</p>
                          <span className="text-xs text-green-600 font-medium">Paid</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <ReferralPanel />
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-display font-bold text-primary-900 dark:text-white">Profile Details</h2>

            {/* Profile Card */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="bg-primary-100 rounded-2xl p-5">
                    <User className="h-12 w-12 text-primary-600" />
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <label className="text-sm text-neutral-500 dark:text-neutral-400">Full Name</label>
                      <p className="text-lg font-semibold text-primary-900 dark:text-white">{session?.user?.name || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm text-neutral-500 dark:text-neutral-400">Email Address</label>
                      <p className="text-lg font-semibold text-primary-900 dark:text-white">{session?.user?.email || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Info */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-display font-bold text-primary-900 dark:text-white">Account Information</h3>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm text-neutral-500 dark:text-neutral-400">Account Status</label>
                    <p className="font-medium text-green-600 flex items-center gap-2 mt-1">
                      <CheckCircle className="h-4 w-4" /> Active
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 dark:text-neutral-400">Total Applications</label>
                    <p className="font-medium text-primary-900 mt-1">{totalApplications}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 dark:text-neutral-400">Completed Forms</label>
                    <p className="font-medium text-primary-900 mt-1">{completedApplications}</p>
                  </div>
                  <div>
                    <label className="text-sm text-neutral-500 dark:text-neutral-400">Total Amount Spent</label>
                    <p className="font-medium text-primary-900 mt-1">₹{totalSpent / 100}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Edit Profile */}
            <Link href="/dashboard/profile/edit">
              <Card className="hover:shadow-medium transition-shadow cursor-pointer mb-6">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="bg-primary-100 rounded-xl p-3">
                      <Settings className="h-6 w-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-primary-900 dark:text-white">Edit Profile</h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">Update your name, email, or password</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-neutral-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-display font-bold text-primary-900 dark:text-white">Help & Support</h3>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { href: '/contact', label: 'Contact Support', desc: 'Get help with your application', icon: Phone },
                    { href: '/terms', label: 'Terms & Conditions', desc: 'Read our terms of service', icon: FileText },
                    { href: '/privacy', label: 'Privacy Policy', desc: 'How we protect your data', icon: Shield },
                    { href: '/refund', label: 'Refund Policy', desc: 'Learn about our refund process', icon: IndianRupee },
                  ].map((link) => (
                    <Link key={link.href} href={link.href}>
                      <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-neutral-50 transition-colors cursor-pointer min-h-[52px]">
                        <div className="bg-neutral-100 rounded-lg p-2">
                          <link.icon className="h-5 w-5 text-neutral-600" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-primary-900 dark:text-white">{link.label}</p>
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">{link.desc}</p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-neutral-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
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

  // Get exams the user has applied to
  const appliedExamIds = new Set(applications.map(a => a.examId));
  const upcomingDeadlines = exams
    .filter(e => {
      const deadline = new Date(e.lastDate);
      const now = new Date();
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return daysLeft > 0 && daysLeft <= 30; // Show deadlines within 30 days
    })
    .sort((a, b) => new Date(a.lastDate).getTime() - new Date(b.lastDate).getTime())
    .slice(0, 5);

  if (upcomingDeadlines.length === 0) return null;

  return (
    <div>
      <h2 className="text-lg font-display font-bold text-primary-900 dark:text-white mb-4">⏰ Upcoming Deadlines</h2>
      <div className="space-y-2">
        {upcomingDeadlines.map((exam) => {
          const deadline = new Date(exam.lastDate);
          const now = new Date();
          const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
          const isApplied = appliedExamIds.has(exam.id);
          const isUrgent = daysLeft <= 3;

          return (
            <div key={exam.id} className={`flex items-center justify-between p-4 rounded-xl border ${
              isUrgent ? 'bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800' :
              'bg-white border-neutral-200 dark:bg-neutral-800 dark:border-neutral-700'
            }`}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-primary-900 dark:text-white truncate">{exam.title}</span>
                  <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded dark:bg-primary-900 dark:text-primary-300">{exam.category}</span>
                </div>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Deadline: {deadline.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className={`text-sm font-bold ${isUrgent ? 'text-red-600' : 'text-amber-600'}`}>
                  {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                </span>
                {isApplied ? (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">Applied ✓</span>
                ) : (
                  <Link href={`/apply/${exam.id}`}>
                    <button className="text-xs bg-primary-600 text-white px-3 py-1.5 rounded-lg hover:bg-primary-700 transition-colors font-medium whitespace-nowrap">
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
