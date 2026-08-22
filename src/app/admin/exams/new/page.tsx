'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Plus, X } from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';
import Link from 'next/link';

const CATEGORIES = [
  'College Registration',
  'University Admission',
  'Scholarship',
  'Banking Exam',
  'Government Exam',
  'SSC Exam',
  'Railway Exam',
  'Entrance Exam',
  'Professional Certification',
  'Other',
];

export default function NewExamPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'Banking',
    officialFee: '',
    serviceFee: '',
    lastDate: '',
    description: '',
    isActive: true,
  });
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>(['']);
  const [newDocument, setNewDocument] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addDocument = () => {
    if (newDocument.trim() && !requiredDocuments.includes(newDocument.trim())) {
      setRequiredDocuments([...requiredDocuments.filter(Boolean), newDocument.trim()]);
      setNewDocument('');
    }
  };

  const removeDocument = (index: number) => {
    setRequiredDocuments(requiredDocuments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.officialFee || !formData.lastDate || !formData.description) {
      setError('Please fill in all required fields');
      return;
    }

    const docs = requiredDocuments.filter(Boolean);

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/admin/exams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          requiredDocuments: docs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create exam');
        setIsSubmitting(false);
        return;
      }

      router.push('/admin/exams');
    } catch (error) {
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16 gap-4">
            <Link
              href="/admin/exams"
              className="flex items-center text-primary-600 hover:text-primary-700"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="ml-2">Back to Forms</span>
            </Link>
            <LogoIcon size={48} />
            <h1 className="text-xl font-display font-bold text-primary-900">Add New Form</h1>
          </div>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <h2 className="text-xl font-display font-bold text-primary-900">Form Details</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              <Input
                label="Exam Title *"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Bank PO 2024"
                required
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-neutral-700 mb-1">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Official Fee (₹) *"
                  name="officialFee"
                  type="number"
                  min="0"
                  value={formData.officialFee}
                  onChange={handleChange}
                  placeholder="e.g. 500"
                  required
                />
                <Input
                  label="Service Fee (₹) *"
                  name="serviceFee"
                  type="number"
                  min="0"
                  value={formData.serviceFee}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  required
                />
              </div>

              <Input
                label="Last Date to Apply *"
                name="lastDate"
                type="date"
                value={formData.lastDate}
                onChange={handleChange}
                required
              />

              <div className="w-full">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe the exam, eligibility, important dates, etc."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="w-full">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Required Documents
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newDocument}
                    onChange={(e) => setNewDocument(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addDocument();
                      }
                    }}
                    placeholder="e.g. Aadhaar Card, 10th Marksheet"
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <Button type="button" variant="outline" onClick={addDocument}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {requiredDocuments.filter(Boolean).length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {requiredDocuments.filter(Boolean).map((doc, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                      >
                        {doc}
                        <button
                          type="button"
                          onClick={() => removeDocument(requiredDocuments.indexOf(doc))}
                          className="text-primary-400 hover:text-primary-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                />
                <label className="text-sm font-medium text-neutral-700">
                  Active (visible to users)
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Create Form
                </Button>
                <Link href="/admin/exams">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
