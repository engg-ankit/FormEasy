'use client';
import { PageHead } from '@/components/page-head';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Clock, FileText, IndianRupee, CheckCircle, LayoutDashboard } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';

interface Exam {
  id: string;
  title: string;
  category: string;
  officialFee: number;
  serviceFee: number;
  lastDate: string;
  description: string;
  requiredDocuments: string;
}

export default function ExamDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [examId, setExamId] = useState<string>('');

  useEffect(() => {
    params.then(({ id }) => {
      setExamId(id);
      fetchExam(id);
    });
  }, [params]);

  const fetchExam = async (id: string) => {
    try {
      const response = await fetch(`/api/exams/${id}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to fetch exam');
        return;
      }

      setExam(data.exam);
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!session) {
      router.push(`/login?redirect=/apply/${examId}`);
      return;
    }
    router.push(`/apply/${examId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading form details...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-red-600 text-center">{error || 'Exam not found'}</p>
            <Link href="/exams" className="block mt-4">
              <Button variant="outline" className="w-full">
                Back to Forms
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const requiredDocs = JSON.parse(exam.requiredDocuments);
  const totalFee = exam.officialFee + exam.serviceFee;

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}      <nav className="bg-white shadow-sm border-b border-neutral-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center min-h-[72px]">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-4">
              {session ? (
                <Link href="/dashboard">
                  <Button variant="ghost">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    My Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/exams">
                  <Button variant="ghost">Back to Forms</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-block bg-accent-100 text-accent-700 text-xs font-semibold px-2 py-1 rounded">
                    {exam.category}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-primary-900 break-words">{exam.title}</h1>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-neutral-600 mb-6">
                  <Clock className="h-5 w-5" />
                  <span className="font-medium">Last Date: {new Date(exam.lastDate).toLocaleDateString()}</span>
                </div>
                
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-primary-900 mb-3">About this Form</h2>
                  <p className="text-neutral-600 leading-relaxed">{exam.description}</p>
                </div>

                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-primary-900 mb-3">Required Documents</h2>
                  <ul className="space-y-2">
                    {requiredDocs.map((doc: string, index: number) => (
                      <li key={index} className="flex items-center gap-2 text-neutral-600">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <h2 className="text-xl font-semibold text-primary-900">Fee Breakdown</h2>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-neutral-600">
                    <span>Official Fee</span>
                    <span className="font-medium whitespace-nowrap">₹{exam.officialFee / 100}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Service Fee</span>
                    <span className="font-medium whitespace-nowrap">₹{exam.serviceFee / 100}</span>
                  </div>
                  <div className="border-t border-neutral-200 pt-3 flex justify-between text-primary-900 font-semibold text-lg">
                    <span>Total</span>
                    <span className="whitespace-nowrap">₹{totalFee / 100}</span>
                  </div>
                </div>

                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => handleApply()}
                >
                  Apply Now
                </Button>

                <div className="mt-4 text-sm text-neutral-600 text-center">
                  <p>Secure payment powered by Razorpay</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <h2 className="text-lg font-semibold text-primary-900">Need Help?</h2>
              </CardHeader>
              <CardContent>
                <p className="text-neutral-600 text-sm mb-4">
                  Our team is available to help you with any questions about this form application.
                </p>
                <Link href="/contact">
                  <Button variant="outline" className="w-full" size="sm">
                    Contact Support
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}