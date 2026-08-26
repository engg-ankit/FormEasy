'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Clock, LayoutDashboard, BookOpen, Phone } from 'lucide-react';
import { Logo } from '@/components/logo';
import { MobileMenu } from '@/components/mobile-menu';
import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';

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

export function ExamsContent() {
  const { data: session } = useSession();
  const [exams, setExams] = useState<Exam[]>([]);
  const [filteredExams, setFilteredExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);

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
      const examList = data.exams || [];
      setExams(examList);

      const uniqueCategories = Array.from(new Set(examList.map((exam: Exam) => exam.category))) as string[];
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
      <div className="min-h-screen bg-[#0a0f1a] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neon-400 mx-auto"></div>
          <p className="mt-4 text-neutral-400 font-mono text-sm">Loading forms...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Navigation */}
      <nav className="bg-[#0d1420] shadow-sm border-b border-neon-500/10 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[72px]">
            <Link href="/">
              <Logo size="md" />
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              <ThemeToggle className="text-neutral-500 hover:text-neon-400" />
              {session ? (
                <Link href="/dashboard">
                  <Button className="bg-neon-500 hover:bg-neon-600 text-white shadow-neon">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    My Applications
                  </Button>
                </Link>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="text-neutral-300 hover:text-neon-400">Login</Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="bg-neon-500 hover:bg-neon-600 text-white shadow-neon">Create Account</Button>
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
                themeToggle={<ThemeToggle className="text-neutral-400" />}
              />
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Page Header */}
        <div className="mb-8">
          <span className="text-neon-500 font-mono text-sm tracking-widest uppercase">// Catalog</span>
          <h1 className="text-3xl font-display font-bold text-white mt-1 mb-2">
            Browse Exam Forms
          </h1>
          <p className="text-neutral-400">Browse and apply for exams, college registrations, scholarships, and more</p>
        </div>

        {/* Search and Filter — Terminal Style */}
        <div className="cyber-card mb-8">
          <div className="cyber-card-header">
            <span className="cyber-card-dot cyber-card-dot-red" />
            <span className="cyber-card-dot cyber-card-dot-yellow" />
            <span className="cyber-card-dot cyber-card-dot-green" />
            <span className="ml-3 text-[10px] text-neutral-500 font-mono">search_terminal</span>
          </div>
          <div className="p-5">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neon-500/50 h-5 w-5" />
                <input
                  type="text"
                  placeholder="$ grep forms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full min-h-[44px] pl-10 pr-4 py-2.5 bg-[#0a0f1a] border border-neon-500/20 rounded-lg text-sm text-neon-300 placeholder:text-neutral-600 font-mono focus:outline-none focus:ring-2 focus:ring-neon-500/40 focus:border-neon-500/40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-neon-500/50" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="min-h-[44px] px-4 py-2.5 bg-[#0a0f1a] border border-neon-500/20 rounded-lg text-sm text-neutral-300 font-mono focus:outline-none focus:ring-2 focus:ring-neon-500/40"
                >
                  <option value="All">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center gap-2 mb-6">
          <span className="w-2 h-2 bg-neon-400 rounded-full animate-pulse" />
          <span className="text-neutral-500 font-mono text-xs">
            {filteredExams.length} form{filteredExams.length !== 1 ? 's' : ''} found
          </span>
        </div>

        {/* Exam Cards */}
        {filteredExams.length === 0 ? (
          <div className="cyber-card">
            <div className="cyber-card-header">
              <span className="cyber-card-dot cyber-card-dot-red" />
              <span className="cyber-card-dot cyber-card-dot-yellow" />
              <span className="cyber-card-dot cyber-card-dot-green" />
            </div>
            <div className="cyber-card-body text-center py-16">
              <p className="text-neutral-400 text-lg mb-4">No forms found matching your criteria.</p>
              <p className="text-neutral-600 text-sm font-mono mb-6">$ Try different search terms or clear filters</p>
              <Button
                variant="outline"
                className="border-neon-500/30 text-neon-400 hover:bg-neon-500/10"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExams.map((exam, index) => (
              <div key={exam.id} className="cyber-card hover:shadow-neon transition-all duration-300 group">
                <div className="cyber-card-header">
                  <span className="cyber-card-dot cyber-card-dot-red" />
                  <span className="cyber-card-dot cyber-card-dot-yellow" />
                  <span className="cyber-card-dot cyber-card-dot-green" />
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono truncate ml-2">{exam.category}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-neon-400 transition-colors truncate">{exam.title}</h3>
                  <p className="text-neutral-400 text-sm mb-4 line-clamp-2 leading-relaxed">{exam.description}</p>

                  <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                    <div className="flex items-center text-xs text-neutral-500 font-mono">
                      <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-cyber-400" />
                      <span className="truncate">Due: {new Date(exam.lastDate).toLocaleDateString()}</span>
                    </div>
                    <div className="text-lg font-bold text-neon-400 neon-text whitespace-nowrap">
                      ₹{(exam.officialFee + exam.serviceFee) / 100}
                    </div>
                  </div>

                  <Link href={`/exams/${exam.id}`}>
                    <Button className="w-full bg-neon-500 hover:bg-neon-600 text-white shadow-neon font-semibold">
                      Apply Now
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
