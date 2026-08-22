'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Plus, Edit, Trash2 } from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';
import Link from 'next/link';

interface Exam {
  id: string;
  title: string;
  category: string;
  officialFee: number;
  serviceFee: number;
  lastDate: string;
  isActive: boolean;
}

export default function AdminExamsPage() {
  const router = useRouter();
  const [exams, setExams] = useState<Exam[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/admin/exams', { credentials: 'include' });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to load exams');
        setIsLoading(false);
        return;
      }

      setExams(data.exams);
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      const response = await fetch(`/api/admin/exams/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setExams(exams.filter(exam => exam.id !== id));
      }
    } catch (error) {
      console.error('Error deleting exam:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600 dark:text-neutral-300">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Admin Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 dark:border-neutral-700 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[72px] gap-2">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0">
              <Link href="/admin" className="flex items-center text-primary-600 hover:text-primary-700 flex-shrink-0">
                <ArrowLeft className="h-5 w-5" />
                <span className="ml-2 hidden sm:inline">Back to Dashboard</span>
              </Link>
              <LogoIcon size={48} />
              <h1 className="text-lg sm:text-xl font-display font-bold text-primary-900 truncate">Form Management</h1>
            </div>
            <Button variant="primary" onClick={() => router.push('/admin/exams/new')} className="flex-shrink-0">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Add Form</span>
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>              <h2 className="text-xl font-display font-bold text-primary-900">
              All Forms ({exams.length})
            </h2>
          </CardHeader>
          <CardContent>
            {exams.length === 0 ? (
              <p className="text-neutral-600 dark:text-neutral-300 text-center py-8">No forms found</p>
            ) : (
              <div className="space-y-4">
                {exams.map((exam) => (
                  <div key={exam.id} className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="mb-2">
                          <p className="font-semibold text-primary-900 truncate">{exam.title}</p>
                          <p className="text-sm text-neutral-600 dark:text-neutral-300">{exam.category}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-neutral-600 dark:text-neutral-300">
                          <span>Fee: ₹{(exam.officialFee + exam.serviceFee) / 100}</span>
                          <span>Last Date: {new Date(exam.lastDate).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                            exam.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {exam.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Link href={`/admin/exams/${exam.id}`}>
                          <Button variant="outline" size="sm" className="min-h-[44px] min-w-[44px]">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDelete(exam.id)}
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