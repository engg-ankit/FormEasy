'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, Tag, Trash2, Edit, CheckCircle, XCircle, Clock, Percent, IndianRupee } from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';
import Link from 'next/link';

interface Coupon {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  expiryDate: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    expiryDate: '',
    usageLimit: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await fetch('/api/admin/coupons', { credentials: 'include' });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load coupons');
        setIsLoading(false);
        return;
      }

      setCoupons(data.coupons);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.code || !formData.discountValue || !formData.expiryDate || !formData.usageLimit) {
      setError('All fields are required');
      return;
    }

    try {
      const response = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountValue: parseInt(formData.discountValue),
          usageLimit: parseInt(formData.usageLimit),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to add coupon');
        return;
      }

      setSuccess('Coupon added successfully');
      setFormData({ code: '', discountType: 'PERCENTAGE', discountValue: '', expiryDate: '', usageLimit: '' });
      setShowAddForm(false);
      fetchCoupons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to add coupon');
    }
  };

  const handleUpdateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editingCoupon) return;

    try {
      const response = await fetch(`/api/admin/coupons/${editingCoupon.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          discountValue: parseInt(formData.discountValue),
          usageLimit: parseInt(formData.usageLimit),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update coupon');
        return;
      }

      setSuccess('Coupon updated successfully');
      setEditingCoupon(null);
      setFormData({ code: '', discountType: 'PERCENTAGE', discountValue: '', expiryDate: '', usageLimit: '' });
      fetchCoupons();
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError('Failed to update coupon');
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    if (!confirm('Are you sure you want to delete this coupon?')) return;

    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCoupons(coupons.filter(coupon => coupon.id !== id));
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/admin/coupons/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setCoupons(coupons.map(coupon => 
          coupon.id === id ? { ...coupon, isActive: !isActive } : coupon
        ));
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error);
    }
  };

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      expiryDate: coupon.expiryDate.split('T')[0],
      usageLimit: coupon.usageLimit.toString(),
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setEditingCoupon(null);
    setFormData({ code: '', discountType: 'PERCENTAGE', discountValue: '', expiryDate: '', usageLimit: '' });
    setShowAddForm(false);
    setError('');
    setSuccess('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-300">Loading coupons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 dark:border-neutral-700 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[72px]">
            <div className="flex items-center gap-4">
              <Link href="/admin" className="flex items-center text-primary-600 hover:text-primary-700">
                <ArrowLeft className="h-5 w-5" />
                <span className="ml-2">Back to Dashboard</span>
              </Link>
              <LogoIcon size={48} />
              <h1 className="text-xl font-display font-bold text-primary-900">Coupon Management</h1>
            </div>
            <Button variant="primary" onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Coupon
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add/Edit Coupon Form */}
        {showAddForm && (
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-xl font-display font-bold text-primary-900">
                {editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={editingCoupon ? handleUpdateCoupon : handleAddCoupon} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Coupon Code</label>
                  <Input
                    placeholder="e.g., FIRST10"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    required
                    disabled={!!editingCoupon}
                  />
                </div>
                <div>                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Discount Type</label>
                  <select
                    value={formData.discountType}
                    onChange={(e) => setFormData({ ...formData, discountType: e.target.value })}
                    className="w-full min-h-[44px] px-3 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="PERCENTAGE">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">
                    Discount Value ({formData.discountType === 'PERCENTAGE' ? '%' : '₹'})
                  </label>
                  <Input
                    type="number"
                    placeholder={formData.discountType === 'PERCENTAGE' ? 'e.g., 10' : 'e.g., 50'}
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Expiry Date</label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-200 mb-1">Usage Limit</label>
                  <Input
                    type="number"
                    placeholder="e.g., 100"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                    {success}
                  </div>
                )}
                <div className="flex gap-2">
                  <Button type="submit" variant="primary">
                    {editingCoupon ? 'Update Coupon' : 'Add Coupon'}
                  </Button>
                  <Button variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Coupons List */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-primary-600" />
              <h2 className="text-xl font-display font-bold text-primary-900">
                Active Coupons ({coupons.filter(c => c.isActive).length})
              </h2>
            </div>
          </CardHeader>
          <CardContent>
            {coupons.length === 0 ? (
              <p className="text-neutral-600 dark:text-neutral-300 text-center py-8">No coupons found</p>
            ) : (
              <div className="space-y-4">
                {coupons.map((coupon) => (
                  <div key={coupon.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 min-w-0">
                          <div className="bg-primary-100 rounded-full p-2 flex-shrink-0">
                            <Tag className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-primary-900 truncate">{coupon.code}</p>
                            <div className="flex items-center gap-2 flex-wrap">
                              {coupon.discountType === 'PERCENTAGE' ? (
                                <span className="text-sm text-neutral-600 dark:text-neutral-300 flex items-center">
                                  <Percent className="h-3 w-3 mr-1" />
                                  {coupon.discountValue}% off
                                </span>
                              ) : (
                                <span className="text-sm text-neutral-600 dark:text-neutral-300 flex items-center">
                                  <IndianRupee className="h-3 w-3 mr-1" />
                                  {coupon.discountValue} off
                                </span>
                              )}
                              <span className="text-sm text-neutral-400">•</span>
                              <span className="text-sm text-neutral-600 dark:text-neutral-300">
                                {coupon.usedCount}/{coupon.usageLimit} used
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-neutral-400" />
                            <span className="text-sm text-neutral-600 dark:text-neutral-300">
                              Expires: {new Date(coupon.expiryDate).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                            coupon.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {coupon.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(coupon.id, coupon.isActive)}
                          className="min-h-[44px] min-w-[44px]"
                        >
                          {coupon.isActive ? (
                            <XCircle className="h-4 w-4" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(coupon)}
                          className="min-h-[44px] min-w-[44px]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteCoupon(coupon.id)}
                          className="min-h-[44px] min-w-[44px]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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