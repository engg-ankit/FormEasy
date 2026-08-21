'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, IndianRupee, CheckCircle, XCircle, Clock, Download, Filter, Search } from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';
import Link from 'next/link';

interface Payment {
  id: string;
  amount: number;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  status: string;
  createdAt: string;
  application: {
    id: string;
    user: { fullName: string; mobile: string };
    exam: { title: string };
  };
}

export default function AdminPaymentsPage() {
  const router = useRouter();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    filterPayments();
  }, [payments, searchTerm, statusFilter, dateFilter]);

  const fetchPayments = async () => {
    try {
      const response = await fetch('/api/admin/payments');
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load payments');
        setIsLoading(false);
        return;
      }

      setPayments(data.payments);
      setFilteredPayments(data.payments);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterPayments = () => {
    let filtered = [...payments];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(payment =>
        payment.application.user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.application.user.mobile.includes(searchTerm) ||
        payment.razorpayOrderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.razorpayPaymentId?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(payment => payment.status === statusFilter);
    }

    // Date filter
    if (dateFilter !== 'ALL') {
      const now = new Date();
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.createdAt);
        if (dateFilter === 'TODAY') {
          return paymentDate.toDateString() === now.toDateString();
        } else if (dateFilter === 'WEEK') {
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return paymentDate >= weekAgo;
        } else if (dateFilter === 'MONTH') {
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return paymentDate >= monthAgo;
        }
        return true;
      });
    }

    setFilteredPayments(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS': return 'bg-green-100 text-green-700';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'FAILED': return 'bg-red-100 text-red-700';
      case 'REFUNDED': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const totalRevenue = filteredPayments
    .filter(p => p.status === 'SUCCESS')
    .reduce((sum, p) => sum + p.amount, 0);

  const successCount = filteredPayments.filter(p => p.status === 'SUCCESS').length;
  const pendingCount = filteredPayments.filter(p => p.status === 'PENDING').length;
  const failedCount = filteredPayments.filter(p => p.status === 'FAILED').length;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[72px]">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center text-primary-600 hover:text-primary-700">
                <ArrowLeft className="h-5 w-5" />
                <span className="ml-2">Back to Dashboard</span>
              </Link>
              <LogoIcon size={48} />
              <h1 className="text-xl font-display font-bold text-primary-900">Payments & Reports</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Summary Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary-900">₹{totalRevenue / 100}</p>
                </div>
                <IndianRupee className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Successful</p>
                  <p className="text-2xl font-bold text-green-600">{successCount}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Failed</p>
                  <p className="text-2xl font-bold text-red-600">{failedCount}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-display font-bold text-primary-900">Filters</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                  <Input
                    placeholder="Name, mobile, order ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="SUCCESS">Success</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                  <option value="REFUNDED">Refunded</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Date Range</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="w-full min-h-[44px] px-3 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today</option>
                  <option value="WEEK">Last 7 Days</option>
                  <option value="MONTH">Last 30 Days</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                    setDateFilter('ALL');
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-primary-900">
                Transactions ({filteredPayments.length})
              </h2>
              <Button variant="outline" size="sm" onClick={() => {
                const csv = [
                  ['ID', 'User', 'Mobile', 'Exam', 'Amount', 'Status', 'Date'],
                  ...filteredPayments.map(p => [
                    p.id,
                    p.application.user.fullName,
                    p.application.user.mobile,
                    p.application.exam.title,
                    `₹${p.amount / 100}`,
                    p.status,
                    new Date(p.createdAt).toLocaleString()
                  ])
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob([csv], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
              }}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredPayments.length === 0 ? (
              <p className="text-neutral-600 text-center py-8">No payments found</p>
            ) : (
              <div className="space-y-4">
                {filteredPayments.map((payment) => (
                  <div key={payment.id} className="border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <div className="bg-primary-100 rounded-full p-2">
                            <IndianRupee className="h-5 w-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-primary-900">₹{payment.amount / 100}</p>
                            <p className="text-sm text-neutral-600">{payment.application.user.fullName} • {payment.application.user.mobile}</p>
                          </div>
                        </div>
                        <div className="grid md:grid-cols-3 gap-4 mt-3">
                          <div>
                            <p className="text-xs text-neutral-500">Exam</p>
                            <p className="text-sm font-medium text-primary-900">{payment.application.exam.title}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-neutral-500">Order ID</p>
                            <p className="text-sm font-medium text-primary-900 truncate">{payment.razorpayOrderId}</p>
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs text-neutral-500">Payment ID</p>
                            <p className="text-sm font-medium text-primary-900 truncate">{payment.razorpayPaymentId || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(payment.status)}`}>
                            {payment.status}
                          </span>
                          <span className="text-xs text-neutral-500">
                            {new Date(payment.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
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