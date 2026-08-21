'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Users, IndianRupee, CheckCircle, Clock, BarChart3, PieChart } from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';
import Link from 'next/link';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';

interface AnalyticsData {
  applicationsByStatus: Array<{ name: string; value: number; color: string }>;
  applicationsByCategory: Array<{ name: string; applications: number }>;
  revenueByMonth: Array<{ month: string; revenue: number }>;
  applicationsByDay: Array<{ date: string; applications: number }>;
  summary: {
    totalApplications: number;
    totalRevenue: number;
    successRate: number;
    activeUsers: number;
  };
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('30'); // days

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?days=${timeRange}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load analytics');
        setIsLoading(false);
        return;
      }

      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">Failed to load analytics</p>
            <Link href="/admin" className="block mt-4">
              <Button variant="outline" className="w-full">Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
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
              <h1 className="text-xl font-display font-bold text-primary-900">Analytics Dashboard</h1>
            </div>
            <div className="flex gap-2">
              <Button
                variant={timeRange === '7' ? 'primary' : 'outline'}
                onClick={() => setTimeRange('7')}
                size="sm"
              >
                7 Days
              </Button>
              <Button
                variant={timeRange === '30' ? 'primary' : 'outline'}
                onClick={() => setTimeRange('30')}
                size="sm"
              >
                30 Days
              </Button>
              <Button
                variant={timeRange === '90' ? 'primary' : 'outline'}
                onClick={() => setTimeRange('90')}
                size="sm"
              >
                90 Days
              </Button>
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
                  <p className="text-sm text-neutral-600">Total Applications</p>
                  <p className="text-2xl font-bold text-primary-900">{analytics.summary.totalApplications}</p>
                </div>
                <Users className="h-8 w-8 text-primary-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Total Revenue</p>
                  <p className="text-2xl font-bold text-green-600">₹{analytics.summary.totalRevenue / 100}</p>
                </div>
                <IndianRupee className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Success Rate</p>
                  <p className="text-2xl font-bold text-blue-600">{analytics.summary.successRate}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-600">Active Users</p>
                  <p className="text-2xl font-bold text-purple-600">{analytics.summary.activeUsers}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Applications by Status */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-display font-bold text-primary-900">Applications by Status</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden"><ResponsiveContainer width="100%" height={300}><RechartsPieChart>
                  <Pie
                    data={analytics.applicationsByStatus}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics.applicationsByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart></ResponsiveContainer></div>
            </CardContent>
          </Card>

          {/* Applications by Category */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-display font-bold text-primary-900">Applications by Category</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden"><ResponsiveContainer width="100%" height={300}><BarChart data={analytics.applicationsByCategory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="applications" fill="#8B5CF6" />
                </BarChart></ResponsiveContainer></div>
            </CardContent>
          </Card>
        </div>

        {/* Revenue Chart */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-display font-bold text-primary-900">Revenue Trend</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden"><ResponsiveContainer width="100%" height={300}><LineChart data={analytics.revenueByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#10B981" 
                  strokeWidth={2}
                  name="Revenue (₹)"
                />
              </LineChart></ResponsiveContainer></div>
          </CardContent>
        </Card>

        {/* Daily Applications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-display font-bold text-primary-900">Daily Applications</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden"><ResponsiveContainer width="100%" height={300}><BarChart data={analytics.applicationsByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="applications" fill="#3B82F6" />
              </BarChart></ResponsiveContainer></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}