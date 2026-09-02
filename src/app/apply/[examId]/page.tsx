'use client';
import { PageHead } from '@/components/page-head';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';

interface Exam {
  id: string;
  title: string;
  officialFee: number;
  serviceFee: number;
  requiredDocuments: string;
}

interface FormData {
  // Basic Info only — cyber cafe style
  fullName: string;
  mobile: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  
  // Documents
  documents: Array<{
    type: string;
    file: File | null;
    url: string;
  }>;
}

const STEPS = [
  { id: 1, title: 'Basic Info' },
  { id: 2, title: 'Documents' },
  { id: 3, title: 'Review & Pay' },
];

export default function ApplicationWizardPage({ params }: { params: Promise<{ examId: string }> }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [examId, setExamId] = useState<string>('');
  const [currentStep, setCurrentStep] = useState(1);
  const [exam, setExam] = useState<Exam | null>(null);
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    mobile: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    documents: [],
  });
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showInfoAlert, setShowInfoAlert] = useState(true);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!exam) return;
    const interval = setInterval(() => {
      saveDraft();
      setLastSaved(new Date());
    }, 30000);
    return () => clearInterval(interval);
  }, [exam, formData]);

  useEffect(() => {
    if (!session) {
      router.push('/login');
      return;
    }

    params.then(({ examId: id }) => {
      setExamId(id);
      fetchExam(id);
      loadDraft(id);
    });
  }, [session, params, router]);

  const fetchExam = async (id: string) => {
    try {
      const response = await fetch(`/api/exams/${id}`);
      const data = await response.json();
      if (response.ok) {
        setExam(data.exam);
        // Initialize documents array
        const requiredDocs = JSON.parse(data.exam.requiredDocuments);
        setFormData(prev => ({
          ...prev,
          documents: requiredDocs.map((doc: string) => ({
            type: doc,
            file: null,
            url: '',
          })),
        }));
      }
    } catch (error) {
      console.error('Error fetching exam:', error);
    }
  };

  const loadDraft = async (id: string) => {
    try {
      const response = await fetch(`/api/applications/draft/${id}`);
      const data = await response.json();
      if (response.ok && data.draft) {
        setFormData(JSON.parse(data.draft.formData));
      }
    } catch (error) {
      console.error('Error loading draft:', error);
    }
  };

  const saveDraft = async () => {
    setIsSaving(true);
    try {
      await fetch(`/api/applications/draft/${examId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formData }),
      });
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.fullName) newErrors.fullName = 'Full name is required';
      if (!formData.mobile || formData.mobile.length !== 10) newErrors.mobile = 'Valid 10-digit mobile number required';
      if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Valid email is required';
      if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
      if (!formData.gender) newErrors.gender = 'Gender is required';
    }

    if (step === 2) {
      formData.documents.forEach((doc, index) => {
        if (!doc.file && !doc.url) {
          newErrors[`doc_${index}`] = `${doc.type} is required`;
        }
      });
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      saveDraft();
      setCurrentStep(Math.min(currentStep + 1, STEPS.length));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
  };

  const handleFileUpload = async (index: number, file: File) => {
    const formDataObj = new FormData();
    formDataObj.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formDataObj,
      });
      const data = await response.json();

      if (response.ok) {
        setFormData(prev => ({
          ...prev,
          documents: prev.documents.map((doc, i) =>
            i === index ? { ...doc, file, url: data.fileUrl } : doc
          ),
        }));
        delete errors[`doc_${index}`];
        setErrors({ ...errors });
      } else {
        setError(data.error || 'Failed to upload file');
      }
    } catch (error) {
      setError('Failed to upload file');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;

    try {
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: couponCode, 
          examId,
          amount: exam!.officialFee + exam!.serviceFee 
        }),
      });
      const data = await response.json();

      if (response.ok) {
        setDiscount(data.discount);
      } else {
        setError(data.error || 'Invalid coupon code');
      }
    } catch (error) {
      setError('Failed to validate coupon');
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          examId,
          formData,
          totalAmount: (exam!.officialFee + exam!.serviceFee - discount),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push(`/payment/${data.applicationId}`);
      } else {
        setError(data.error || 'Failed to submit application');
      }
    } catch (error) {
      setError('Failed to submit application');
    } finally {
      setIsLoading(false);
    }
  };

  if (!exam) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  const totalFee = exam.officialFee + exam.serviceFee - discount;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[72px]">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Info Popup Alert */}
        {showInfoAlert && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 rounded-full p-3">
                  <Info className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-primary-900">Important Notice</h3>
              </div>
              <p className="text-neutral-700 leading-relaxed mb-6">
                Fill in your basic details below and upload all required documents clearly. 
                Our team will fill the official form on the official portal for you.
              </p>
              <button
                onClick={() => setShowInfoAlert(false)}
                className="w-full bg-primary-600 text-white font-semibold py-3 rounded-xl hover:bg-primary-700 transition-colors min-h-[44px]"
              >
                Got it, Continue →
              </button>
            </div>
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between overflow-x-auto no-scrollbar pb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center flex-shrink-0">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 min-w-[40px] min-h-[40px] rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.id
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {currentStep > step.id ? <CheckCircle className="h-5 w-5" /> : step.id}
                  </div>
                  <span className="text-[10px] sm:text-xs mt-2 text-neutral-600 text-center max-w-[60px] sm:max-w-none">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-8 sm:w-16 h-1 mx-1 sm:mx-2 flex-shrink-0 ${
                      currentStep > step.id ? 'bg-primary-600' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <h2 className="text-2xl font-display font-bold text-primary-900">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-neutral-600">
              Step {currentStep} of {STEPS.length}
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            {/* Step 1: Basic Info Only */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <Input
                  label="Full Name (as per ID proof)"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  error={errors.fullName}
                  placeholder="Enter your full name"
                />
                <Input
                  label="Mobile Number"
                  type="tel"
                  value={formData.mobile}
                  onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  error={errors.mobile}
                  maxLength={10}
                  placeholder="10-digit mobile number"
                />
                
                <Input
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={errors.email}
                  placeholder="your@email.com"
                />
                <Input
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                  error={errors.dateOfBirth}
                />
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full min-h-[44px] px-3 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender}</p>}
                </div>
              </div>
            )}

            {/* Step 2: Documents */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-sm text-neutral-600 mb-4">
                  Upload clear and readable copies of all required documents. 
                  Accepted formats: JPEG, PNG, PDF. Max size: 3MB each.
                </p>
                {formData.documents.map((doc, index) => (
                  <div key={index} className="border border-neutral-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      {doc.type}
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(index, file);
                        }}
                        className="flex-1 min-h-[44px]"
                      />
                      {doc.url && (
                        <div className="flex items-center text-green-600">
                          <CheckCircle className="h-5 w-5 mr-1" />
                          Uploaded
                        </div>
                      )}
                    </div>
                    {/* Document Preview */}
                    {doc.url && (
                      <div className="mt-3 border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                        <p className="text-xs text-neutral-500 px-3 py-1.5 bg-neutral-100 border-b border-neutral-200">Preview — verify this is the correct file</p>
                        {doc.url.endsWith('.pdf') || doc.url.startsWith('data:application/pdf') ? (
                          <iframe src={doc.url} className="w-full h-48" title={`Preview: ${doc.type}`} />
                        ) : (
                          <img src={doc.url} alt={`Preview: ${doc.type}`} className="w-full max-h-48 object-contain p-2" />
                        )}
                      </div>
                    )}
                    {errors[`doc_${index}`] && (
                      <p className="mt-2 text-sm text-red-600">{errors[`doc_${index}`]}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Review & Pay */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">Your Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-neutral-600">Full Name:</span>
                      <span className="font-medium text-right truncate">{formData.fullName}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-neutral-600">Mobile:</span>
                      <span className="font-medium text-right whitespace-nowrap">{formData.mobile}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-neutral-600">Email:</span>
                      <span className="font-medium text-right truncate">{formData.email}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-neutral-600">DOB:</span>
                      <span className="font-medium text-right">{formData.dateOfBirth}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-neutral-600">Gender:</span>
                      <span className="font-medium text-right">{formData.gender}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">Documents</h3>
                  <div className="space-y-2">
                    {formData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-neutral-600">{doc.type}</span>
                        <span className={doc.url ? 'text-green-600' : 'text-red-600'}>
                          {doc.url ? 'Uploaded' : 'Not uploaded'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-3">
                  <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">What happens next?</p>
                    <p>After payment, our team will fill the official form on the official portal using your details and documents. You will receive updates on your application status.</p>
                  </div>
                </div>

                <div className="border-t border-neutral-200 pt-4">
                  <h3 className="text-lg font-semibold text-primary-900 mb-4">Payment Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between gap-2">
                      <span className="text-neutral-600">Official Fee:</span>
                      <span className="font-medium whitespace-nowrap">₹{exam.officialFee / 100}</span>
                    </div>
                    <div className="flex justify-between gap-2">
                      <span className="text-neutral-600">Service Fee:</span>
                      <span className="font-medium whitespace-nowrap">₹{exam.serviceFee / 100}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between gap-2 text-green-600">
                        <span>Discount:</span>
                        <span className="font-medium whitespace-nowrap">-₹{discount / 100}</span>
                      </div>
                    )}
                    <div className="flex justify-between gap-2 text-lg font-semibold text-primary-900 border-t border-neutral-200 pt-2">
                      <span>Total:</span>
                      <span className="whitespace-nowrap">₹{totalFee / 100}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button variant="outline" onClick={handleApplyCoupon} className="sm:w-auto">
                      Apply
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-8">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="w-full sm:w-auto"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex flex-col items-center gap-1">
                  <Button
                    variant="ghost"
                    onClick={() => { saveDraft(); setLastSaved(new Date()); }}
                    disabled={isSaving}
                    className="w-full sm:w-auto"
                  >
                    {isSaving ? 'Saving...' : 'Save Draft'}
                  </Button>
                  {lastSaved && (
                    <span className="text-[10px] text-neutral-400">
                      Auto-saved {lastSaved.toLocaleTimeString()}
                    </span>
                  )}
                </div>
                {currentStep === STEPS.length ? (
                  <Button
                    variant="primary"
                    onClick={handleSubmit}
                    isLoading={isLoading}
                    className="w-full sm:w-auto"
                  >
                    Submit & Pay
                  </Button>
                ) : (
                  <Button variant="primary" onClick={handleNext} className="w-full sm:w-auto">
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
