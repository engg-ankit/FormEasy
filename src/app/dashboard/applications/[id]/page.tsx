'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ArrowLeft, FileText, Clock, CheckCircle, AlertCircle, Smartphone,
  User, Calendar, IndianRupee, Download, Phone, Shield,
  FileCheck, AlertTriangle, Loader2, CreditCard, CheckSquare
} from 'lucide-react';
import Link from 'next/link';
import { Logo } from '@/components/logo';
import { MobileMenu } from '@/components/mobile-menu';
import { PdfExport } from '@/components/pdf-export';
import { APPLICATION_STATUS } from '@/lib/types';

interface ApplicationDetail {
  id: string;
  formData: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  exam: {
    id: string;
    title: string;
    category: string;
    officialFee: number;
    serviceFee: number;
    lastDate: string;
    description: string;
    requiredDocuments: string;
  };
  documents: {
    id: string;
    docType: string;
    fileUrl: string;
    uploadedAt: string;
  }[];
  payment: {
    id: string;
    amount: number;
    status: string;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    createdAt: string;
  } | null;

  user: {
    fullName: string;
    mobile: string;
    email: string;
  };
}

export default function ApplicationDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'authenticated' && params.id) {
      fetchApplication();
    }
  }, [status, params.id, router]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(`/api/applications/${params.id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load application');
        setIsLoading(false);
        return;
      }

      setApplication(data.application);
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'SUBMITTED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'IN_PROCESS': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'FORM_FILLED': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'COMPLETED': return 'bg-green-100 text-green-700 border-green-200';
      case 'REJECTED': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DRAFT': return <FileText className="h-5 w-5" />;
      case 'SUBMITTED': return <Clock className="h-5 w-5" />;
      case 'IN_PROCESS': return <AlertCircle className="h-5 w-5" />;
      case 'FORM_FILLED': return <FileCheck className="h-5 w-5" />;
      case 'COMPLETED': return <CheckCircle className="h-5 w-5" />;
      case 'REJECTED': return <AlertTriangle className="h-5 w-5" />;
      default: return <Clock className="h-5 w-5" />;
    }
  };

  const getProgress = (status: string) => {
    const statusOrder = ['SUBMITTED', 'IN_PROCESS', 'FORM_FILLED', 'COMPLETED'];
    const currentIndex = statusOrder.indexOf(status);
    return ((currentIndex + 1) / statusOrder.length) * 100;
  };

  let parsedFormData: Record<string, unknown> = {};
  if (application?.formData) {
    try {
      parsedFormData = JSON.parse(application.formData);
    } catch {
      parsedFormData = {};
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-neutral-600 dark:text-neutral-300">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
        <nav className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700 dark:border-neutral-700">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4 sm:py-5 min-h-[88px]">
              <Link href="/dashboard"><Logo size="md" /></Link>
            </div>
          </div>
        </nav>
        <div className="max-w-3xl mx-auto px-4 py-16 text-center">
          <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-primary-900 dark:text-white mb-2">Application Not Found</h2>
          <p className="text-neutral-500 dark:text-neutral-400 mb-6">{error}</p>
          <Link href="/dashboard">
            <Button variant="primary">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!application) return null;

  const statusSteps = [
    { status: 'SUBMITTED', label: 'Submitted', desc: 'Application received', icon: FileText },
    { status: 'IN_PROCESS', label: 'In Review', desc: 'Team reviewing documents', icon: Clock },
    { status: 'FORM_FILLED', label: 'Form Filled', desc: 'Form submitted on portal', icon: FileCheck },
    { status: 'COMPLETED', label: 'Completed', desc: 'Process finished', icon: CheckCircle },
  ];

  const currentStatusIndex = ['SUBMITTED', 'IN_PROCESS', 'FORM_FILLED', 'COMPLETED'].indexOf(application.status);
  const isRejected = application.status === 'REJECTED';

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      {/* Header */}
      <nav className="bg-white dark:bg-neutral-800 shadow-sm border-b border-neutral-200 dark:border-neutral-700 dark:border-neutral-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-5 min-h-[88px]">
            <Link href="/dashboard"><Logo size="md" /></Link>
            <div className="hidden sm:block">
              <Link href="/dashboard">
                <Button variant="ghost">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
            <div className="sm:hidden">
              <MobileMenu
                items={[
                  { label: 'Dashboard', href: '/dashboard', icon: <User className="h-5 w-5" /> },
                  { label: 'Browse Forms', href: '/exams', icon: <FileText className="h-5 w-5" /> },
                  { label: 'Contact Support', href: '/contact', icon: <Phone className="h-5 w-5" /> },
                ]}
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link href="/dashboard" className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-6 min-h-[44px]">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Title & Status Banner */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0">
              <span className="inline-block bg-accent-100 text-accent-700 text-xs font-semibold px-2.5 py-1 rounded mb-2">
                {application.exam.category}
              </span>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white break-words">
                {application.exam.title}
              </h1>
              <p className="text-neutral-500 dark:text-neutral-400 mt-1 text-sm">
                Application ID: <span className="font-mono text-xs">{application.id}</span>
              </p>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold whitespace-nowrap flex-shrink-0 ${getStatusColor(application.status)}`}>
              {getStatusIcon(application.status)}
              {APPLICATION_STATUS[application.status as keyof typeof APPLICATION_STATUS] || application.status}
            </div>
          </div>
          {/* Continue Button for DRAFT */}
          {application.status === 'DRAFT' && (
            <div className="mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="font-semibold text-orange-800">This form is incomplete</p>
                    <p className="text-sm text-orange-600">Continue from where you left off</p>
                  </div>
                </div>
                <Link href={`/apply/${application.exam.id}`}>
                  <Button variant="primary" className="bg-orange-600 hover:bg-orange-700">
                    Continue Filling →
                  </Button>
                </Link>
              </div>
            </div>
          )}
          <div className="mt-4">
            <PdfExport
              applicationId={application.id}
              applicantName={String(parsedFormData.fullName || application.user.fullName)}
              examTitle={application.exam.title}
              formData={parsedFormData as Record<string, any>}
              status={application.status}
              documents={application.documents}
              payment={application.payment || undefined}
            />
          </div>
        </div>

        {/* Progress Bar */}
        {!isRejected && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Overall Progress</span>
                <span className="text-sm font-bold text-primary-600">{Math.round(getProgress(application.status))}%</span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-3 mb-6">
                <div
                  className="bg-gradient-to-r from-primary-500 to-primary-700 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${getProgress(application.status)}%` }}
                />
              </div>

              {/* Status Timeline */}
              <div className="relative">
                <div className="flex justify-between">
                  {statusSteps.map((step, index) => {
                    const isCompleted = currentStatusIndex >= index;
                    const isCurrent = application.status === step.status;
                    return (
                      <div key={step.status} className="flex flex-col items-center flex-1 relative">
                        {/* Connector line */}
                        {index < statusSteps.length - 1 && (
                          <div className={`absolute top-4 left-1/2 w-full h-0.5 ${
                            currentStatusIndex > index ? 'bg-green-500' : 'bg-neutral-200'
                          }`} />
                        )}
                        {/* Step circle */}
                        <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${
                          isCompleted && !isCurrent
                            ? 'bg-green-600 text-white'
                            : isCurrent
                            ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                            : 'bg-neutral-200 text-neutral-400'
                        }`}>
                          {isCompleted && !isCurrent ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <step.icon className="h-4 w-4" />
                          )}
                        </div>
                        <span className={`text-xs mt-2 text-center font-medium ${
                          isCompleted ? 'text-primary-900 dark:text-white' : 'text-neutral-400'
                        }`}>
                          {step.label}
                        </span>
                        <span className={`text-[10px] text-center mt-0.5 ${
                          isCompleted ? 'text-neutral-500 dark:text-neutral-400' : 'text-neutral-300'
                        }`}>
                          {step.desc}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {isRejected && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                    <div>
                      <p className="font-semibold text-red-800">Application Rejected</p>
                      <p className="text-sm text-red-600">Please contact support for more details.</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Exam Details */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-display font-bold text-primary-900 dark:text-white">Form Details</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Form Name</label>
                <p className="font-medium text-primary-900 dark:text-white break-words">{application.exam.title}</p>
              </div>
              <div>
                <label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Category</label>
                <p className="font-medium text-primary-900 dark:text-white">{application.exam.category}</p>
              </div>
              <div>
                <label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Description</label>
                <p className="text-sm text-neutral-600 dark:text-neutral-300 break-words">{application.exam.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Last Date</label>
                  <p className="font-medium text-primary-900 dark:text-white">{new Date(application.exam.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Required Docs</label>
                  <p className="font-medium text-primary-900 dark:text-white">{application.exam.requiredDocuments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Application Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-display font-bold text-primary-900 dark:text-white">Application Info</h2>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Applied On</label>
                  <p className="font-medium text-primary-900 dark:text-white">
                    {new Date(application.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Last Updated</label>
                  <p className="font-medium text-primary-900 dark:text-white">
                    {new Date(application.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {parsedFormData && Object.keys(parsedFormData).length > 0 && (
                <div>
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-2 block">Personal Details</label>
                  <div className="bg-neutral-50 dark:bg-neutral-900 rounded-lg p-3 space-y-2">
                    {Object.entries(parsedFormData).filter(([key]) => key !== 'documents' && key !== 'terms').map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="text-neutral-500 dark:text-neutral-400 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                        <span className="font-medium text-primary-900 dark:text-white truncate ml-2 max-w-[60%] text-right">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Documents */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-display font-bold text-primary-900 dark:text-white">Uploaded Documents</h2>
              </div>
            </CardHeader>
            <CardContent>
              {!application.documents || application.documents.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-10 w-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">No documents uploaded</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {application.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="bg-primary-100 rounded-lg p-2 flex-shrink-0">
                          <FileText className="h-4 w-4 text-primary-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-primary-900 dark:text-white text-sm truncate">{doc.docType}</p>
                          <p className="text-xs text-neutral-500 dark:text-neutral-400">
                            Uploaded {new Date(doc.uploadedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 ml-3"
                      >
                        <Button variant="ghost" size="sm" className="min-h-[40px] min-w-[40px]">
                          <Download className="h-4 w-4" />
                        </Button>
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Info */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-display font-bold text-primary-900 dark:text-white">Payment Information</h2>
              </div>
            </CardHeader>
            <CardContent>
              {/* Fee Breakdown */}
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Official Fee</span>
                  <span className="font-medium text-primary-900 dark:text-white">₹{application.exam.officialFee / 100}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-500 dark:text-neutral-400">Service Fee</span>
                  <span className="font-medium text-primary-900 dark:text-white">₹{application.exam.serviceFee / 100}</span>
                </div>
                <div className="border-t border-neutral-200 dark:border-neutral-700 pt-3 flex justify-between">
                  <span className="font-semibold text-primary-900 dark:text-white">Total</span>
                  <span className="font-bold text-lg text-primary-900 dark:text-white">
                    ₹{(application.exam.officialFee + application.exam.serviceFee) / 100}
                  </span>
                </div>
              </div>

              {/* Payment Status */}
              {application.payment ? (
                <div className={`rounded-lg p-4 ${
                  application.payment.status === 'SUCCESS'
                    ? 'bg-green-50 border border-green-200'
                    : application.payment.status === 'PENDING'
                    ? 'bg-yellow-50 border border-yellow-200'
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <div className="flex items-center gap-3">
                    {application.payment.status === 'SUCCESS' ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : application.payment.status === 'PENDING' ? (
                      <Clock className="h-5 w-5 text-yellow-600" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                    )}
                    <div>
                      <p className={`font-semibold ${
                        application.payment.status === 'SUCCESS' ? 'text-green-800' :
                        application.payment.status === 'PENDING' ? 'text-yellow-800' : 'text-red-800'
                      }`}>
                        Payment {application.payment.status === 'SUCCESS' ? 'Successful' :
                               application.payment.status === 'PENDING' ? 'Pending' : 'Failed'}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">
                        ₹{application.payment.amount / 100} • {new Date(application.payment.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  {application.payment.razorpayPaymentId && (
                    <div className="mt-3 text-xs text-neutral-500 dark:text-neutral-400 space-y-1">
                      <p className="truncate">Order ID: <span className="font-mono">{application.payment.razorpayOrderId}</span></p>
                      <p className="truncate">Payment ID: <span className="font-mono">{application.payment.razorpayPaymentId}</span></p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 text-center">
                  <IndianRupee className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm">No payment yet</p>
                  <Link href={`/payment/${application.id}`} className="mt-3 inline-block">
                    <Button variant="primary" size="sm">
                      Pay Now
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Cancel Application */}
        {application.status === 'SUBMITTED' && (
          <Card className="mt-6 border-red-200">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="bg-red-100 rounded-xl p-3">
                  <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-red-800">Cancel Application</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    You can cancel this application if you no longer need it. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="danger"
                  onClick={async () => {
                    if (!confirm('Are you sure you want to cancel this application? This cannot be undone.')) return;
                    try {
                      const res = await fetch('/api/applications/cancel', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ applicationId: application.id }),
                      });
                      if (res.ok) {
                        alert('Application cancelled successfully.');
                        router.push('/dashboard');
                      } else {
                        const data = await res.json();
                        alert(data.error || 'Failed to cancel application.');
                      }
                    } catch (err) {
                      alert('Network error. Please try again.');
                    }
                  }}
                >
                  Cancel Application
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Help Section */}
        <Card className="mt-6">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="bg-primary-100 rounded-xl p-3">
                <Phone className="h-6 w-6 text-primary-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-primary-900 dark:text-white">Need Help?</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  Have questions about your application? Our support team is here to help.
                </p>
              </div>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/919650000000?text=${encodeURIComponent(`Hi! I need help with my application for ${application.exam.title}. Application ID: ${application.id}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-50">
                    <Smartphone className="h-4 w-4 mr-2" />
                    WhatsApp
                  </Button>
                </a>
                <Link href="/contact">
                  <Button variant="outline">
                    <Phone className="h-4 w-4 mr-2" />
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
