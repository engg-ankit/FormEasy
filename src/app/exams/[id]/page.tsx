'use client';
import { PageHead } from '@/components/page-head';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Clock, FileText, IndianRupee, CheckCircle, LayoutDashboard, ArrowLeft, Shield, Zap } from 'lucide-react';
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
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-400 mx-auto"></div>
          <p className="mt-4 text-neutral-400 font-mono text-sm">Loading form details...</p>
        </div>
      </div>
    );
  }

  if (error || !exam) {
    return (
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center p-4">
        <div className="cyber-card max-w-md w-full">
          <div className="cyber-card-header">
            <span className="cyber-card-dot cyber-card-dot-red" />
            <span className="cyber-card-dot cyber-card-dot-yellow" />
            <span className="cyber-card-dot cyber-card-dot-green" />
            <span className="ml-3 text-[10px] text-neutral-500 font-mono">error</span>
          </div>
          <div className="cyber-card-body text-center py-12">
            <p className="text-red-400 mb-2">{error || 'Exam not found'}</p>
            <p className="text-neutral-600 text-sm font-mono mb-6">$ Exit status 1</p>
            <Link href="/exams">
              <Button variant="outline" className="border-neon-500/30 text-neon-400 hover:bg-neon-500/10">
                ← Back to Forms
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const requiredDocs = JSON.parse(exam.requiredDocuments);
  const totalFee = exam.officialFee + exam.serviceFee;

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <PageHead title={exam.title} description={exam.description} />

      {/* Navigation */}
      <nav className="bg-[#0d1420] shadow-sm border-b border-neon-500/10 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[72px]">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <div className="flex items-center gap-4">
              {session ? (
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-neutral-300 hover:text-neon-400">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    My Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/exams">
                  <Button variant="ghost" className="text-neutral-300 hover:text-neon-400">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Forms
                  </Button>
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
            {/* Title Card */}
            <div className="cyber-card mb-6">
              <div className="cyber-card-header">
                <span className="cyber-card-dot cyber-card-dot-red" />
                <span className="cyber-card-dot cyber-card-dot-yellow" />
                <span className="cyber-card-dot cyber-card-dot-green" />
                <span className="ml-3 text-[10px] text-neutral-500 font-mono">{exam.category.toLowerCase().replace(/\s+/g, '_')}</span>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-block bg-cyber-500/10 border border-cyber-500/20 text-cyber-400 text-xs font-mono px-2.5 py-1 rounded">
                    {exam.category}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-display font-bold text-white break-words mb-4">{exam.title}</h1>
                <div className="flex items-center gap-2 text-neutral-400 font-mono text-sm">
                  <Clock className="h-4 w-4 text-cyber-400" />
                  <span>Last Date: {new Date(exam.lastDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="cyber-card mb-6">
              <div className="cyber-card-header">
                <span className="cyber-card-dot cyber-card-dot-red" />
                <span className="cyber-card-dot cyber-card-dot-yellow" />
                <span className="cyber-card-dot cyber-card-dot-green" />
                <span className="ml-3 text-[10px] text-neutral-500 font-mono">about.txt</span>
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-neon-400" />
                  About this Form
                </h2>
                <p className="text-neutral-400 leading-relaxed">{exam.description}</p>
              </div>
            </div>

            {/* Required Documents Card */}
            <div className="cyber-card">
              <div className="cyber-card-header">
                <span className="cyber-card-dot cyber-card-dot-red" />
                <span className="cyber-card-dot cyber-card-dot-yellow" />
                <span className="cyber-card-dot cyber-card-dot-green" />
                <span className="ml-3 text-[10px] text-neutral-500 font-mono">documents.list</span>
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-neon-400" />
                  Required Documents
                </h2>
                <div className="space-y-3">
                  {requiredDocs.map((doc: string, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-neon-500/5 border border-neon-500/10 rounded-lg">
                      <div className="w-6 h-6 bg-neon-500/10 border border-neon-500/20 rounded flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="h-3.5 w-3.5 text-neon-400" />
                      </div>
                      <span className="text-neutral-300 text-sm">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Fee Breakdown Card */}
            <div className="cyber-card sticky top-4 mb-6">
              <div className="cyber-card-header">
                <span className="cyber-card-dot cyber-card-dot-red" />
                <span className="cyber-card-dot cyber-card-dot-yellow" />
                <span className="cyber-card-dot cyber-card-dot-green" />
                <span className="ml-3 text-[10px] text-neutral-500 font-mono">payment.exe</span>
              </div>
              <div className="p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <IndianRupee className="h-5 w-5 text-neon-400" />
                  Fee Breakdown
                </h2>
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-neutral-400 text-sm">
                    <span>Official Fee</span>
                    <span className="font-mono text-neutral-300">₹{exam.officialFee / 100}</span>
                  </div>
                  <div className="flex justify-between text-neutral-400 text-sm">
                    <span>Service Fee</span>
                    <span className="font-mono text-neutral-300">₹{exam.serviceFee / 100}</span>
                  </div>
                  <div className="border-t border-neon-500/10 pt-3 flex justify-between items-center">
                    <span className="font-semibold text-white">Total</span>
                    <span className="font-mono text-xl font-bold text-neon-400 neon-text">₹{totalFee / 100}</span>
                  </div>
                </div>

                <Button
                  className="w-full bg-neon-500 hover:bg-neon-600 text-white shadow-neon font-semibold min-h-[48px] text-lg"
                  onClick={() => handleApply()}
                >
                  Apply Now
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-500">
                  <Shield className="h-3.5 w-3.5 text-cyber-400" />
                  <span>Secure payment powered by Razorpay</span>
                </div>
              </div>
            </div>

            {/* Help Card */}
            <div className="cyber-card">
              <div className="cyber-card-header">
                <span className="cyber-card-dot cyber-card-dot-red" />
                <span className="cyber-card-dot cyber-card-dot-yellow" />
                <span className="cyber-card-dot cyber-card-dot-green" />
              </div>
              <div className="p-6 text-center">
                <div className="w-10 h-10 bg-cyber-500/10 border border-cyber-500/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Zap className="h-5 w-5 text-cyber-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">Need Help?</h3>
                <p className="text-neutral-500 text-xs mb-4 leading-relaxed">
                  Our team is available to help with any questions about this form.
                </p>
                <Link href="/contact">
                  <Button variant="outline" className="w-full border-neon-500/20 text-neutral-400 hover:text-neon-400 hover:bg-neon-500/5 text-sm" size="sm">
                    Contact Support
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
