'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowLeft, Filter, Search, Download } from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';
import Link from 'next/link';

interface Application {
  id: string;
  user: { fullName: string; mobile: string; email: string };
  exam: { title: string; category: string; officialFee: number; serviceFee: number };
  status: string;
  createdAt: string;
  payment?: { status: string; amount: number; razorpayPaymentId: string | null; razorpayOrderId: string; createdAt: string } | null;
}

export default function AdminApplicationsPage() {
  const router = useRouter();
  const [applications, setApplications] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchApplications();
  }, [page, statusFilter]);

  useEffect(() => {
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      setPage(1);
      fetchApplications();
    }, 400);
    setSearchTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (searchTerm) params.set('search', searchTerm);
      if (statusFilter && statusFilter !== 'All') params.set('status', statusFilter);

      const response = await fetch(`/api/admin/applications?${params}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load applications');
        setIsLoading(false);
        return;
      }

      setApplications(data.applications);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.user.mobile.includes(searchTerm) ||
      app.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'bg-blue-100 text-blue-700';
      case 'IN_PROCESS': return 'bg-yellow-100 text-yellow-700';
      case 'FORM_FILLED': return 'bg-purple-100 text-purple-700';
      case 'COMPLETED': return 'bg-green-100 text-green-700';
      case 'REJECTED': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Mobile', 'Email', 'Exam', 'Category', 'Status', 'Applied Date'];
    const rows = filteredApplications.map(app => [
      app.user.fullName,
      app.user.mobile,
      app.user.email,
      app.exam.title,
      app.exam.category,
      app.status,
      new Date(app.createdAt).toLocaleDateString('en-IN'),
    ]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clicknsit-applications-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[72px] gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link href="/admin" className="flex items-center text-primary-600 hover:text-primary-700 flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
                <span className="ml-2 hidden sm:inline">Back to Dashboard</span>
              </Link>
              <LogoIcon size={48} />
              <h1 className="text-lg sm:text-xl font-display font-bold text-primary-900 truncate">Applications</h1>
            </div>
            <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              <Link href="/admin/exams" className="whitespace-nowrap">
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm min-h-[44px] px-2 py-2">Forms</button>
              </Link>
              <Link href="/admin/payments" className="whitespace-nowrap">
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm min-h-[44px] px-2 py-2">Payments</button>
              </Link>
              <Link href="/admin/analytics" className="whitespace-nowrap">
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm min-h-[44px] px-2 py-2">Analytics</button>
              </Link>
              <Link href="/admin/coupons" className="whitespace-nowrap">
                <button className="text-primary-600 hover:text-primary-700 font-medium text-sm min-h-[44px] px-2 py-2">Coupons</button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search by name, mobile, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-neutral-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="min-h-[44px] px-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                >
                  <option value="All">All Status</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="IN_PROCESS">In Process</option>
                  <option value="FORM_FILLED">Form Filled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-md hover:bg-green-700 transition-colors min-h-[44px] text-sm font-medium whitespace-nowrap"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications List */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-display font-bold text-primary-900">
              All Applications ({filteredApplications.length})
            </h2>
          </CardHeader>
          <CardContent>
            {filteredApplications.length === 0 ? (
              <p className="text-neutral-600 text-center py-8">No applications found</p>
            ) : (
              <div className="space-y-4">
                {filteredApplications.map((app) => (
                  <div key={app.id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <p className="font-semibold text-primary-900 truncate">{app.user.fullName}</p>
                          <p className="text-sm text-neutral-600 truncate">{app.user.mobile} • {app.user.email}</p>
                        </div>
                        <div>
                          <p className="font-medium text-primary-900 truncate">{app.exam.title}</p>
                          <p className="text-sm text-neutral-600">{app.exam.category}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <p className="text-xs text-neutral-500">
                            Applied: {new Date(app.createdAt).toLocaleString()}
                          </p>
                          {app.payment ? (
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${app.payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {app.payment.status === 'SUCCESS' ? `Paid ₹${app.payment.amount / 100}` : 'Payment Pending'}
                            </span>
                          ) : (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">No Payment</span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                        <Link href={`/admin/applications/${app.id}`}>
                          <button className="text-sm text-primary-600 hover:text-primary-700 min-h-[44px] min-w-[44px] flex items-center justify-center">
                            View Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 min-h-[40px]"
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`w-10 h-10 rounded-lg text-sm font-medium min-w-[40px] min-h-[40px] ${
                        page === pageNum ? 'bg-primary-600 text-white' : 'border border-neutral-300 hover:bg-neutral-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-2 rounded-lg text-sm font-medium border border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 min-h-[40px]"
                >
                  Next →
                </button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}