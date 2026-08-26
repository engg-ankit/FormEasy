'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PageHead } from '@/components/page-head';
import { Logo } from '@/components/logo';
import { SiteNav } from '@/components/site-nav';
import { MobileMenu } from '@/components/mobile-menu';
import {
  FileText, Send, Clock, CheckCircle, XCircle, AlertCircle,
  Search, Phone, LayoutDashboard, Loader2, Plus, ChevronRight
} from 'lucide-react';
import Link from 'next/link';

interface FormRequest {
  id: string;
  formName: string;
  category: string;
  portalName: string | null;
  description: string | null;
  status: string;
  adminNote: string | null;
  estimatedFee: number | null;
  createdAt: string;
}

const CATEGORIES = [
  'Government Exam',
  'College Admission',
  'Scholarship',
  'University Registration',
  'Passport',
  'Driving License',
  'Property Registration',
  'Income Tax',
  'GST Registration',
  'Other',
];

export default function RequestFormPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [myRequests, setMyRequests] = useState<FormRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    formName: '',
    category: '',
    portalName: '',
    description: '',
    contactNumber: '',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (session) {
      fetchMyRequests();
    }
  }, [session, status]);

  const fetchMyRequests = async () => {
    try {
      const res = await fetch('/api/form-requests');
      const data = await res.json();
      setMyRequests(data.requests || []);
    } catch (err) {
      console.error('Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/form-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to submit request');
        setIsSubmitting(false);
        return;
      }

      setSuccess('Request submitted successfully! We will review it and get back to you.');
      setShowForm(false);
      setFormData({ formName: '', category: '', portalName: '', description: '', contactNumber: '' });
      fetchMyRequests();
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    }
    setIsSubmitting(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'APPROVED': return 'bg-green-100 text-green-700 border-green-200';
      case 'DECLINED': return 'bg-red-100 text-red-700 border-red-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />;
      case 'APPROVED': return <CheckCircle className="h-4 w-4" />;
      case 'DECLINED': return <XCircle className="h-4 w-4" />;
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHead
        title="Request a Form | CyberSeva"
        description="Can't find the form you need? Request any form and we'll add it for you."
      />

      {/* Header */}
      <nav className="bg-primary-900 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-5 min-h-[88px]">
            <Link href="/"><Logo size="md" white /></Link>
            <div className="hidden sm:flex items-center gap-3">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/exams">
                <Button variant="ghost" className="text-white hover:bg-white/10">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Forms
                </Button>
              </Link>
            </div>
            <div className="sm:hidden">
              <MobileMenu
                logoWhite
                items={[
                  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
                  { label: 'Browse Forms', href: '/exams', icon: <Search className="h-5 w-5" /> },
                  { label: 'Contact Support', href: '/contact', icon: <Phone className="h-5 w-5" /> },
                ]}
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-900 mb-2">Request a Form</h1>
          <p className="text-neutral-600">
            Can't find the form you need? Tell us about it and we'll add it for you!
          </p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            {success}
          </div>
        )}

        {/* New Request Button */}
        {!showForm && (
          <Button
            onClick={() => setShowForm(true)}
            className="mb-6 min-h-[48px] px-6"
            variant="primary"
          >
            <Plus className="h-5 w-5 mr-2" />
            Request New Form
          </Button>
        )}

        {/* Request Form */}
        {showForm && (
          <Card className="mb-8 border-2 border-primary-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary-600" />
                  <h2 className="text-xl font-display font-bold text-primary-900">New Form Request</h2>
                </div>
                <button
                  onClick={() => setShowForm(false)}
                  className="text-neutral-500 hover:text-neutral-700 text-2xl min-h-[44px] min-w-[44px] flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Form/Exam Name *"
                  placeholder="e.g., Delhi University Admission 2025"
                  value={formData.formName}
                  onChange={(e) => setFormData({ ...formData, formName: e.target.value })}
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full min-h-[44px] px-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <Input
                  label="Official Portal Name/URL (if known)"
                  placeholder="e.g., admission.du.ac.in"
                  value={formData.portalName}
                  onChange={(e) => setFormData({ ...formData, portalName: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Additional Details</label>
                  <textarea
                    placeholder="Any extra info — deadline, specific requirements, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>

                <Input
                  label="Contact Number *"
                  placeholder="Your phone number for follow-up"
                  type="tel"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                  maxLength={10}
                />

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button type="submit" variant="primary" className="min-h-[48px] px-8" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting...</>
                    ) : (
                      <><Send className="h-4 w-4 mr-2" /> Submit Request</>
                    )}
                  </Button>
                  <Button type="button" variant="outline" className="min-h-[48px]" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* My Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-display font-bold text-primary-900">My Requests</h2>
              {myRequests.length > 0 && (
                <span className="bg-primary-100 text-primary-700 text-xs font-bold px-2 py-0.5 rounded-full">
                  {myRequests.length}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {myRequests.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
                <p className="text-neutral-500">No requests yet</p>
                <p className="text-sm text-neutral-400 mt-1">Click "Request New Form" to get started</p>
              </div>
            ) : (
              <div className="space-y-3">
                {myRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-primary-900">{req.formName}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(req.status)}`}>
                          {getStatusIcon(req.status)}
                          {req.status}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500">
                        {new Date(req.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-sm text-neutral-600 mb-2">
                      <span className="bg-primary-50 text-primary-700 px-2 py-0.5 rounded">{req.category}</span>
                      {req.portalName && <span className="text-neutral-500">Portal: {req.portalName}</span>}
                    </div>
                    {req.description && (
                      <p className="text-sm text-neutral-600 mb-2">{req.description}</p>
                    )}
                    {req.adminNote && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                        <p className="text-sm text-blue-800"><strong>Admin Response:</strong> {req.adminNote}</p>
                        {req.estimatedFee && (
                          <p className="text-sm text-blue-700 mt-1">Estimated Fee: ₹{req.estimatedFee / 100}</p>
                        )}
                      </div>
                    )}
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
