'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Save, Plus, X, Loader2, ExternalLink, Globe } from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';
import { getPortalLink, EXAM_CATEGORIES } from '@/lib/portal-links';
import Link from 'next/link';

export default function EditExamPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: 'SSC Exam',
    officialFee: '',
    serviceFee: '',
    lastDate: '',
    description: '',
    portalUrl: '',
    isActive: true,
  });

  // Auto-detect portal URL
  const detectedPortal = useMemo(() => {
    const input = formData.title || formData.category;
    return getPortalLink(input);
  }, [formData.title, formData.category]);

  const effectivePortalUrl = formData.portalUrl || detectedPortal.url;
  const [requiredDocuments, setRequiredDocuments] = useState<string[]>(['']);
  const [newDocument, setNewDocument] = useState('');

  useEffect(() => {
    fetchExam();
  }, [examId]);

  const fetchExam = async () => {
    try {
      const response = await fetch(`/api/admin/exams/${examId}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load exam');
        setIsLoading(false);
        return;
      }

      const exam = data.exam;
      setFormData({
        title: exam.title,
        category: exam.category,
        officialFee: String(exam.officialFee / 100),
        serviceFee: String(exam.serviceFee / 100),
        lastDate: new Date(exam.lastDate).toISOString().split('T')[0],
        description: exam.description,
        portalUrl: exam.portalUrl || '',
        isActive: exam.isActive,
      });

      const docs = JSON.parse(exam.requiredDocuments || '[]');
      setRequiredDocuments(docs.length > 0 ? docs : ['']);
    } catch (error) {
      console.error('Error fetching exam:', error);
      setError('An error occurred while loading the exam');
    } finally {
      setIsLoading(false);
    }
  };

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
      const response = await fetch(`/api/admin/exams/${examId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          portalUrl: formData.portalUrl || detectedPortal.url,
          requiredDocuments: docs,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update exam');
        setIsSubmitting(false);
        return;
      }

      router.push('/admin/exams');
    } catch (error) {
      setError('An error occurred. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-neutral-600">Loading exam...</p>
        </div>
      </div>
    );
  }

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
            <h1 className="text-xl font-display font-bold text-primary-900">Edit Form</h1>
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
                  {EXAM_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Auto-detected Portal URL */}
              <div className="w-full">
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Official Portal URL
                  {detectedPortal.url !== '#' && (
                    <span className="text-green-600 text-xs ml-2">✓ Auto-detected</span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      type="url"
                      name="portalUrl"
                      value={formData.portalUrl}
                      onChange={handleChange}
                      placeholder={detectedPortal.url}
                      className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                  </div>
                  {effectivePortalUrl && effectivePortalUrl !== '#' && (
                    <a href={effectivePortalUrl} target="_blank" rel="noopener noreferrer">
                      <Button type="button" variant="outline" size="sm" className="flex items-center gap-1 whitespace-nowrap">
                        <ExternalLink className="h-3.5 w-3.5" />
                        {detectedPortal.name}
                      </Button>
                    </a>
                  )}
                </div>
                <p className="text-xs text-neutral-500 mt-1">
                  {formData.portalUrl ? 'Custom URL entered' : `Auto-detected: ${detectedPortal.name} (${detectedPortal.url})`}
                </p>
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
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
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
