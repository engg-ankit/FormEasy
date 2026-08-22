'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogoIcon } from '@/components/logo-icon';
import Link from 'next/link';
import {
  ArrowLeft, Clock, CheckCircle, XCircle, FileText, User,
  Phone, Loader2, Trash2, ExternalLink, IndianRupee
} from 'lucide-react';

interface FormRequest {
  id: string;
  formName: string;
  category: string;
  portalName: string | null;
  description: string | null;
  status: string;
  adminNote: string | null;
  estimatedFee: number | null;
  contactNumber: string;
  createdAt: string;
  user: { fullName: string; email: string; mobile: string };
}

export default function AdminFormRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<FormRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showActionModal, setShowActionModal] = useState<string | null>(null);
  const [actionData, setActionData] = useState({ status: '', adminNote: '', estimatedFee: '' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/form-requests', { credentials: 'include' });
      if (res.status === 401) {
        router.push('/admin/login');
        return;
      }
      const data = await res.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Failed to fetch requests');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (id: string) => {
    setProcessingId(id);
    try {
      const res = await fetch(`/api/admin/form-requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: actionData.status,
          adminNote: actionData.adminNote || null,
          estimatedFee: actionData.estimatedFee ? parseInt(actionData.estimatedFee) * 100 : null,
        }),
      });

      if (res.ok) {
        setRequests(prev => prev.map(r =>
          r.id === id ? { ...r, status: actionData.status, adminNote: actionData.adminNote, estimatedFee: actionData.estimatedFee ? parseInt(actionData.estimatedFee) * 100 : null } : r
        ));
        setShowActionModal(null);
        setActionData({ status: '', adminNote: '', estimatedFee: '' });
      }
    } catch (error) {
      console.error('Failed to update request');
    }
    setProcessingId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this request?')) return;
    try {
      await fetch(`/api/admin/form-requests/${id}`, { method: 'DELETE' });
      setRequests(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error('Failed to delete');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-700';
      case 'APPROVED': return 'bg-green-100 text-green-700';
      case 'DECLINED': return 'bg-red-100 text-red-700';
      case 'COMPLETED': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[72px]">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center text-primary-600 hover:text-primary-700">
                <ArrowLeft className="h-5 w-5" />
                <span className="ml-2 hidden sm:inline">Dashboard</span>
              </Link>
              <LogoIcon size={48} />
              <h1 className="text-xl font-display font-bold text-primary-900">Form Requests</h1>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total', count: requests.length, color: 'text-primary-600' },
            { label: 'Pending', count: requests.filter(r => r.status === 'PENDING').length, color: 'text-yellow-600' },
            { label: 'Approved', count: requests.filter(r => r.status === 'APPROVED').length, color: 'text-green-600' },
            { label: 'Declined', count: requests.filter(r => r.status === 'DECLINED').length, color: 'text-red-600' },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="p-4 text-center">
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Requests List */}
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="h-12 w-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-neutral-500 text-lg">No form requests yet</p>
              <p className="text-sm text-neutral-400">Users will submit requests here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <Card key={req.id}>
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <h3 className="text-lg font-bold text-primary-900">{req.formName}</h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${getStatusColor(req.status)}`}>
                          {req.status}
                        </span>
                        <span className="bg-primary-50 text-primary-700 text-xs px-2 py-0.5 rounded">{req.category}</span>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-neutral-600 mb-2">
                        <span className="flex items-center gap-1"><User className="h-4 w-4" /> {req.user.fullName}</span>
                        <span className="flex items-center gap-1"><Phone className="h-4 w-4" /> {req.contactNumber}</span>
                        <span>{req.user.email}</span>
                      </div>

                      {req.portalName && (
                        <p className="text-sm text-neutral-500 mb-1 flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" /> Portal: {req.portalName}
                        </p>
                      )}
                      {req.description && (
                        <p className="text-sm text-neutral-600 mb-2">"{req.description}"</p>
                      )}
                      {req.adminNote && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                          <p className="text-sm text-blue-800"><strong>Admin Note:</strong> {req.adminNote}</p>
                          {req.estimatedFee && (
                            <p className="text-sm text-blue-700 mt-1 flex items-center gap-1">
                              <IndianRupee className="h-3 w-3" /> Estimated Fee: ₹{req.estimatedFee / 100}
                            </p>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-neutral-400 mt-2">
                        Requested on {new Date(req.createdAt).toLocaleString('en-IN')}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 flex-shrink-0">
                      {req.status === 'PENDING' && (
                        <>
                          <Button
                            onClick={() => { setShowActionModal(req.id); setActionData({ status: 'APPROVED', adminNote: '', estimatedFee: '' }); }}
                            className="min-h-[40px] px-4 bg-green-600 hover:bg-green-700 text-white text-sm"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button
                            onClick={() => { setShowActionModal(req.id); setActionData({ status: 'DECLINED', adminNote: '', estimatedFee: '' }); }}
                            variant="outline"
                            className="min-h-[40px] px-4 text-red-600 border-red-300 hover:bg-red-50 text-sm"
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Decline
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => handleDelete(req.id)}
                        variant="ghost"
                        className="min-h-[40px] min-w-[40px] px-2 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Action Modal */}
                  {showActionModal === req.id && (
                    <div className="mt-4 p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                      <h4 className="font-bold text-primary-900 mb-3">
                        {actionData.status === 'APPROVED' ? '✅ Approve Request' : '❌ Decline Request'}
                      </h4>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-1">Note to User (optional)</label>
                          <textarea
                            value={actionData.adminNote}
                            onChange={(e) => setActionData({ ...actionData, adminNote: e.target.value })}
                            placeholder={actionData.status === 'APPROVED' ? "e.g., We'll add this form within 24 hours" : "e.g., This form is not available in our service area"}
                            rows={2}
                            className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        {actionData.status === 'APPROVED' && (
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-1">Estimated Service Fee (₹)</label>
                            <input
                              type="number"
                              value={actionData.estimatedFee}
                              onChange={(e) => setActionData({ ...actionData, estimatedFee: e.target.value })}
                              placeholder="e.g., 150"
                              className="w-full px-3 py-2 border border-neutral-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleAction(req.id)}
                            disabled={processingId === req.id}
                            className={`min-h-[40px] px-4 text-sm ${actionData.status === 'APPROVED' ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'}`}
                          >
                            {processingId === req.id ? 'Processing...' : 'Confirm'}
                          </Button>
                          <Button
                            onClick={() => setShowActionModal(null)}
                            variant="outline"
                            className="min-h-[40px] text-sm"
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
