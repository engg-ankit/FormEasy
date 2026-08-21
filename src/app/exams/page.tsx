'use client';
import { PageHead } from '@/components/page-head';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Filter, Clock, LayoutDashboard, BookOpen, Phone, FileText } from 'lucide-react';
import { Logo } from '@/components/logo';
import { MobileMenu } from '@/components/mobile-menu';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageToggle } from '@/components/language-toggle';

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

export default function ExamsPage() {
  const { data: session } = useSession();
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const { t } = useTranslation();

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [searchTerm, selectedCategory, exams]);

  const fetchExams = async () => {
    try {
      const response = await fetch('/api/exams');
      const data = await response.json();
      setExams(data.exams);
      
      // Extract unique categories
      const uniqueCategories = Array.from(new Set(data.exams.map((exam: Exam) => exam.category))) as string[];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterExams = () => {
    let filtered = exams;

    if (searchTerm) {
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(exam => exam.category === selectedCategory);
    }

    setFilteredExams(filtered);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (      <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900">
      {/* Navigation */}      <nav className="bg-white dark:bg-neutral-900 shadow-sm border-b border-neutral-200 dark:border-neutral-700 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center min-h-[72px]">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              <LanguageToggle className="text-neutral-500 hover:text-primary-600" />
              <ThemeToggle className="text-neutral-500 hover:text-primary-600" />
              {session ? (
                <Link href="/dashboard">
                  <Button variant="primary">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    {t('dash.myApps')}
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost">{t('auth.login')}</Button>
                  </Link>
                  <Link href="/signup">
                    <Button variant="primary">{t('auth.signup')}</Button>
                  </Link>
                </>
              )}
            </div>
            <div className="sm:hidden">
              <MobileMenu
                items={session ? [
                  { label: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
                  { label: 'Browse Forms', href: '/exams', icon: <Search className="h-5 w-5" /> },
                  { label: 'Contact Support', href: '/contact', icon: <Phone className="h-5 w-5" /> },
                ] : [
                  { label: 'Browse Forms', href: '/exams', icon: <Search className="h-5 w-5" /> },
                  { label: 'How It Works', href: '/#how-it-works', icon: <BookOpen className="h-5 w-5" /> },
                  { label: 'Contact', href: '/contact', icon: <Phone className="h-5 w-5" /> },
                ]}
                cta={session ? undefined : { label: 'Sign Up Free', href: '/signup' }}
                themeToggle={<ThemeToggle className="text-neutral-600 dark:text-neutral-400" />}
                langToggle={<LanguageToggle className="text-neutral-600 dark:text-neutral-400" />}
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-900 dark:text-white mb-2">
            {t('hero.cta')}
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">Browse and apply for exams, college registrations, scholarships, and more</p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-neutral-800 rounded-lg shadow-soft p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 h-5 w-5" />
              <Input
                type="text"
                placeholder="Search forms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-neutral-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="min-h-[44px] px-4 py-2.5 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              >
                <option value="All">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results */}
        {filteredExams.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-neutral-600 text-lg">No forms found matching your criteria.</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-medium transition-shadow dark:bg-neutral-800 dark:border-neutral-700">
                <CardHeader>
                  <div className="flex justify-between items-start min-w-0">
                    <div className="min-w-0">
                      <span className="inline-block bg-accent-100 text-accent-700 text-xs font-semibold px-2 py-1 rounded mb-2 max-w-full truncate">
                        {exam.category}
                      </span>
                      <h3 className="text-lg sm:text-xl font-semibold text-primary-900 dark:text-white truncate">{exam.title}</h3>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">{exam.description}</p>
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                    <div className="flex items-center text-sm text-neutral-600">
                      <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">Last Date: {new Date(exam.lastDate).toLocaleDateString()}</span>
                    </div>
                    <div className="text-lg font-semibold text-primary-900 whitespace-nowrap">
                      ₹{(exam.officialFee + exam.serviceFee) / 100}
                    </div>
                  </div>
                  <Link href={`/exams/${exam.id}`}>
                    <Button variant="primary" className="w-full">
                      {t('exam.apply')}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}