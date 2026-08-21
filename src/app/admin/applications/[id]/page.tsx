'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, CheckCircle, Clock, FileText, Download, User, Upload, Calendar, IndianRupee, AlertCircle, ExternalLink, Copy, Check } from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';
import { PdfExport } from '@/components/pdf-export';
import { getPortalLink, FORM_FIELD_LABELS } from '@/lib/portal-links';
import Link from 'next/link';

interface ApplicationDetail {
  id: string;
  user: { fullName: string; mobile: string; email: string };
  exam: { title: string; category: string; officialFee: number; serviceFee: number };
  formData: any;
  status: string;
  createdAt: string;
  updatedAt: string;
  documents: Array<{ id: string; docType: string; fileUrl: string }>;
  payment: {
    id: string;
    amount: number;
    razorpayOrderId: string;
    razorpayPaymentId: string | null;
    status: string;
    createdAt: string;
  } | null;
  statusHistory: Array<{ id: string; oldStatus: string | null; newStatus: string; changedByName: string; note: string | null; createdAt: string }>;
}

export default function AdminApplicationDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState<string>(params.id);
  const [application, setApplication] = useState<ApplicationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchApplication(params.id);
  }, [params.id]);

  const fetchApplication = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${id}`);
      const data = await response.json();

      if (!response.ok) {
        router.push('/admin/applications');
        return;
      }

      setApplication({ ...data.application, statusHistory: data.statusHistory });
    } catch (error) {
      console.error('Error fetching application:', error);
      setError('Failed to load application');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update status');
        setIsUpdating(false);
        return;
      }

      setSuccess('Status updated successfully');
      setApplication(prev => prev ? { ...prev, status: newStatus } : null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRefund = async () => {
    if (!confirm('Are you sure you want to process a refund for this payment?')) return;

    setIsUpdating(true);
    setError('');
    setSuccess('');

    if (!application || !application.payment) {
      setError('No payment found for this application');
      setIsUpdating(false);
      return;
    }

    try {
      const response = await fetch(`/api/admin/payments/${application.payment.id}/refund`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to process refund');
        setIsUpdating(false);
        return;
      }

      setSuccess('Refund processed successfully');
      fetchApplication(applicationId);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to process refund');
    } finally {
      setIsUpdating(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">Application not found</p>
            <Link href="/admin/applications" className="block mt-4">
              <Button variant="outline" className="w-full">Back to Applications</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formData = typeof application.formData === 'string' ? JSON.parse(application.formData) : application.formData;

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[72px]">
            <div className="flex items-center gap-4">
              <Link href="/admin/applications" className="flex items-center text-primary-600 hover:text-primary-700">
                <ArrowLeft className="h-5 w-5" />
                <span className="ml-2">Back to Applications</span>
              </Link>
              <LogoIcon size={48} />
              <h1 className="text-xl font-display font-bold text-primary-900">Application Details</h1>
            </div>
            <PdfExport
              applicationId={application.id}
              applicantName={formData.fullName || application.user.fullName}
              examTitle={application.exam.title}
              formData={formData}
              status={application.status}
              documents={application.documents}
              payment={application.payment || undefined}
            />
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6 flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            {success}
          </div>
        )}

        {/* Status and Assignment */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-display font-bold text-primary-900">Application Status</h2>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Current Status</label>
                <select
                  value={application.status}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={isUpdating}
                  className="w-full min-h-[44px] px-3 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="SUBMITTED">Submitted</option>
                  <option value="IN_PROCESS">In Process</option>
                  <option value="FORM_FILLED">Form Filled</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* PORTAL PROCESSING SECTION */}
        <PortalProcessingCard formData={formData} examCategory={application.exam.category} applicationId={application.id} />

        {/* Applicant Information */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-display font-bold text-primary-900">Applicant Information</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-neutral-600">Full Name</p>
                <p className="font-medium text-primary-900">{formData.fullName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Mobile</p>
                <p className="font-medium text-primary-900">{formData.mobile || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Email</p>
                <p className="font-medium text-primary-900">{formData.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Date of Birth</p>
                <p className="font-medium text-primary-900">{formData.dateOfBirth || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Gender</p>
                <p className="font-medium text-primary-900">{formData.gender || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Father's Name</p>
                <p className="font-medium text-primary-900">{formData.fatherName || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Mother's Name</p>
                <p className="font-medium text-primary-900">{formData.motherName || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-display font-bold text-primary-900">Education Details</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-neutral-600">Qualification</p>
                <p className="font-medium text-primary-900">{formData.qualification || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Board/University</p>
                <p className="font-medium text-primary-900">{formData.board || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Year of Passing</p>
                <p className="font-medium text-primary-900">{formData.yearOfPassing || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Percentage/CGPA</p>
                <p className="font-medium text-primary-900">{formData.percentage || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address Details */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-display font-bold text-primary-900">Address Details</h2>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <p className="text-sm text-neutral-600">Address Line 1</p>
                <p className="font-medium text-primary-900">{formData.addressLine1 || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-neutral-600">Address Line 2</p>
                <p className="font-medium text-primary-900">{formData.addressLine2 || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">City</p>
                <p className="font-medium text-primary-900">{formData.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">State</p>
                <p className="font-medium text-primary-900">{formData.state || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Pincode</p>
                <p className="font-medium text-primary-900">{formData.pincode || 'N/A'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-display font-bold text-primary-900">Uploaded Documents</h2>
            </div>
          </CardHeader>
          <CardContent>
            {(!application.documents || application.documents.length === 0) ? (
              <p className="text-neutral-600 text-center py-4">No documents uploaded</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {(application.documents || []).map((doc) => (
                  <div key={doc.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-primary-900">{doc.docType}</span>
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                    <div className="bg-neutral-100 rounded overflow-hidden">
                      {doc.fileUrl.endsWith('.pdf') ? (
                        <iframe
                          src={doc.fileUrl}
                          className="w-full h-48 border-0"
                          title={doc.docType}
                        />
                      ) : (
                        <img
                          src={doc.fileUrl}
                          alt={doc.docType}
                          className="w-full h-48 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                      )}
                      <div className="hidden h-48 flex items-center justify-center">
                        <span className="text-sm text-neutral-500">Preview not available</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Details */}
        {application.payment && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <IndianRupee className="h-5 w-5 text-primary-600" />
                <h2 className="text-xl font-display font-bold text-primary-900">Payment Details</h2>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-neutral-600">Amount</p>
                  <p className="font-medium text-primary-900">₹{application.payment.amount / 100}</p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    application.payment.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                    application.payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                    application.payment.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {application.payment.status}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-neutral-600">Razorpay Order ID</p>
                  <p className="font-medium text-primary-900 text-sm truncate">{application.payment.razorpayOrderId}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-neutral-600">Payment ID</p>
                  <p className="font-medium text-primary-900 text-sm truncate">{application.payment.razorpayPaymentId || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-neutral-600">Payment Date</p>
                  <p className="font-medium text-primary-900">{new Date(application.payment.createdAt).toLocaleString()}</p>
                </div>
              </div>
              {application.payment.status === 'SUCCESS' && (
                <div className="mt-4 pt-4 border-t border-neutral-200">
                  <Button
                    variant="danger"
                    onClick={handleRefund}
                    disabled={isUpdating}
                  >
                    Process Refund
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Exam Information */}
        <Card className="mb-6">
          <CardHeader>
            <h2 className="text-xl font-display font-bold text-primary-900">Exam Information</h2>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-neutral-600">Exam Title</p>
                <p className="font-medium text-primary-900">{application.exam.title}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Category</p>
                <p className="font-medium text-primary-900">{application.exam.category}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Official Fee</p>
                <p className="font-medium text-primary-900">₹{application.exam.officialFee / 100}</p>
              </div>
              <div>
                <p className="text-sm text-neutral-600">Service Fee</p>
                <p className="font-medium text-primary-900">₹{application.exam.serviceFee / 100}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-neutral-600">Application Date</p>
                <p className="font-medium text-primary-900">{new Date(application.createdAt).toLocaleString()}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-neutral-600">Last Updated</p>
                <p className="font-medium text-primary-900">{new Date(application.updatedAt).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-display font-bold text-primary-900">Application Timeline</h2>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-start overflow-x-auto no-scrollbar">
              {[
                { status: 'SUBMITTED', label: 'Submitted', date: application.createdAt },
                { status: 'IN_PROCESS', label: 'Under Review', date: application.updatedAt },
                { status: 'FORM_FILLED', label: 'Form Filled', date: application.updatedAt },
                { status: 'COMPLETED', label: 'Completed', date: application.updatedAt },
              ].map((step, index) => {
                const isCompleted = ['SUBMITTED', 'IN_PROCESS', 'FORM_FILLED', 'COMPLETED'].indexOf(application.status) >= index;
                const isCurrent = application.status === step.status;
                
                return (
                  <div key={step.status} className="flex flex-col items-center flex-1 min-w-[80px]">
                    <div
                      className={`w-8 h-8 min-w-[32px] min-h-[32px] rounded-full flex items-center justify-center ${
                        isCompleted
                          ? 'bg-green-600 text-white'
                          : isCurrent
                          ? 'bg-primary-600 text-white'
                          : 'bg-neutral-200 text-neutral-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <span className="text-xs font-medium">{index + 1}</span>
                      )}
                    </div>
                    <span className="text-[10px] sm:text-xs mt-2 text-center text-neutral-600">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Status History */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-display font-bold text-primary-900">Status History</h2>
            </div>
          </CardHeader>
          <CardContent>
            {application.statusHistory && application.statusHistory.length > 0 ? (
              <div className="space-y-3">
                {application.statusHistory.map((entry: any) => (
                  <div key={entry.id} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                    <div className="bg-primary-100 rounded-full p-2 flex-shrink-0">
                      <CheckCircle className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-1">
                        <span className="text-sm font-medium text-primary-900">
                          {entry.oldStatus ? `${entry.oldStatus} → ${entry.newStatus}` : entry.newStatus}
                        </span>
                        <span className="text-xs text-neutral-500">
                          by {entry.changedByName}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        {new Date(entry.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-sm text-center py-4">No status changes recorded yet</p>
            )}
          </CardContent>
        </Card>

        {/* Notes / Comments */}
        <NotesSection applicationId={applicationId} />
      </div>
    </div>
  );
}

function NotesSection({ applicationId }: { applicationId: string }) {
  const [notes, setNotes] = useState<Array<{ id: string; authorName: string; authorRole: string; content: string; createdAt: string }>>([]);
  const [newNote, setNewNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch(`/api/notes?applicationId=${applicationId}`)
      .then(r => r.json())
      .then(data => setNotes(data.notes || []))
      .catch(() => {});
  }, [applicationId]);

  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, content: newNote }),
      });
      if (res.ok) {
        const data = await res.json();
        setNotes(prev => [data.note, ...prev]);
        setNewNote('');
      }
    } catch {}
    setIsSubmitting(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary-600" />
          <h2 className="text-xl font-display font-bold text-primary-900">Notes & Comments</h2>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add an internal note or comment..."
            className="w-full min-h-[80px] p-3 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            rows={3}
          />
          <Button
            onClick={handleAddNote}
            disabled={isSubmitting || !newNote.trim()}
            className="mt-2 min-h-[44px] px-6"
            size="sm"
          >
            {isSubmitting ? 'Adding...' : 'Add Note'}
          </Button>
        </div>
        {notes.length > 0 ? (
          <div className="space-y-3">
            {notes.map(note => (
              <div key={note.id} className="p-3 bg-neutral-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-primary-900">{note.authorName}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    note.authorRole === 'admin' ? 'bg-purple-100 text-purple-700' :
                    note.authorRole === 'agent' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {note.authorRole}
                  </span>
                  <span className="text-xs text-neutral-400">
                    {new Date(note.createdAt).toLocaleString('en-IN')}
                  </span>
                </div>
                <p className="text-sm text-neutral-700">{note.content}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-neutral-500 text-sm text-center py-4">No notes yet</p>
        )}
      </CardContent>
    </Card>
  );
}

// Portal Processing Component
function PortalProcessingCard({ formData, examCategory, applicationId }: { formData: any; examCategory: string; applicationId: string }) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const portal = getPortalLink(examCategory);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAllFields = () => {
    const allData = Object.entries(formData)
      .filter(([key, val]) => val && typeof val === 'string' && !key.includes('file') && !key.includes('File') && !key.includes('upload'))
      .map(([key, val]) => `${FORM_FIELD_LABELS[key] || key}: ${val}`)
      .join('\n');
    navigator.clipboard.writeText(allData);
    setCopiedField('ALL');
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fieldsToShow = Object.entries(formData)
    .filter(([key, val]) => val && typeof val === 'string' && !key.includes('file') && !key.includes('File') && !key.includes('upload') && val !== '')
    .slice(0, 20); // Show max 20 fields

  return (
    <Card className="mb-6 border-2 border-primary-300 bg-primary-50/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-display font-bold text-primary-900">Portal Processing</h2>
          </div>
        </div>
        <p className="text-sm text-neutral-600">
          Open the official portal, copy data from below, and fill the form.
        </p>
      </CardHeader>
      <CardContent>
        {/* Portal Link + Copy All */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <a
            href={portal.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition-colors min-h-[48px]"
          >
            <ExternalLink className="h-5 w-5" />
            Open {portal.name}
          </a>
          <button
            onClick={copyAllFields}
            className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors min-h-[48px]"
          >
            {copiedField === 'ALL' ? <><Check className="h-5 w-5" /> Copied!</> : <><Copy className="h-5 w-5" /> Copy All Fields</>}
          </button>
        </div>

        {/* Copy-Ready Fields */}
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          {fieldsToShow.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between px-4 py-2.5 hover:bg-neutral-50 group">
              <div className="flex-1 min-w-0">
                <span className="text-xs text-neutral-500 block">{FORM_FIELD_LABELS[key] || key}</span>
                <span className="text-sm font-medium text-primary-900 break-all">{String(value)}</span>
              </div>
              <button
                onClick={() => copyToClipboard(String(value), key)}
                className="ml-3 p-2 rounded-lg hover:bg-primary-100 transition-colors opacity-50 group-hover:opacity-100 min-h-[36px] min-w-[36px] flex items-center justify-center"
                title={`Copy ${FORM_FIELD_LABELS[key] || key}`}
              >
                {copiedField === key ? (
                  <Check className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4 text-neutral-400" />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Workflow Steps */}
        <div className="mt-5 p-4 bg-accent-50 rounded-xl">
          <h3 className="font-bold text-primary-900 mb-2">📋 Processing Steps:</h3>
          <ol className="text-sm text-neutral-700 space-y-1.5 list-decimal list-inside">
            <li>Click &quot;Open {portal.name}&quot; to open the official portal</li>
            <li>Login with portal credentials (if required)</li>
            <li>Click &quot;Copy All Fields&quot; or copy individual fields</li>
            <li>Paste data into the portal form fields</li>
            <li>Upload photo and signature from the documents section below</li>
            <li>Pay the official fee on the portal</li>
            <li>Submit the form and note the confirmation number</li>
            <li>Change status to &quot;Form Filled&quot; or &quot;Completed&quot; above</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}