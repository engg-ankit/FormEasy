'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Edit, Upload, CheckCircle, Clock, Shield, Users, TrendingUp } from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';
import { HomepageHeader } from '@/components/homepage-header';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n';
import { useState, useEffect } from 'react';

interface Exam {
  id: string;
  title: string;
  category: string;
  description: string;
  lastDate: string;
  officialFee: number;
  serviceFee: number;
}

export default function Home() {
  const { t } = useTranslation();
  const [featuredExams, setFeaturedExams] = useState<Exam[]>([]);

  useEffect(() => {
    fetch('/api/exams')
      .then(r => r.json())
      .then(data => setFeaturedExams((data.exams || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900">
      {/* Navigation */}
      <HomepageHeader />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold text-primary-900 dark:text-white mb-6">
              {t('hero.title')}
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-3xl mx-auto">
              {t('hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/exams">
                <Button variant="primary" size="lg" className="text-lg">
                  {t('hero.cta')}
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="outline" size="lg" className="text-lg">
                  {t('hero.learn')}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white text-center mb-12">
            {t('steps.title')}
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Search, title: t('step1.title'), description: t('step1.desc') },
              { icon: Edit, title: t('step2.title'), description: t('step2.desc') },
              { icon: Upload, title: t('step3.title'), description: t('step3.desc') },
              { icon: CheckCircle, title: t('step4.title'), description: t('step4.desc') },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 dark:bg-primary-800 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <step.icon className="h-8 w-8 text-primary-600 dark:text-primary-300" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-primary-900 dark:text-white mb-2">{step.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Exams */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 dark:bg-primary-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white">
              {t('dash.recentApps')}
            </h2>
            <Link href="/exams">
              <Button variant="outline">{t('dash.viewAll')}</Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredExams.map((exam) => (
              <Card key={exam.id} className="hover:shadow-medium transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start min-w-0">
                    <div className="min-w-0">
                      <span className="inline-block bg-accent-100 dark:bg-accent-900 text-accent-700 dark:text-accent-300 text-xs font-semibold px-2 py-1 rounded mb-2 truncate max-w-full">
                        {exam.category}
                      </span>
                      <h3 className="text-lg sm:text-base sm:text-xl font-semibold text-primary-900 dark:text-white truncate">{exam.title}</h3>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">{exam.description}</p>
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                    <div className="flex items-center text-sm text-neutral-600">
                      <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
                      <span className="truncate">Last Date: {exam.lastDate}</span>
                    </div>
                    <div className="text-lg font-semibold text-primary-900 dark:text-white whitespace-nowrap">
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
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white text-center mb-12">
            Why Choose FormEasy?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Secure & Reliable', description: 'Your data is encrypted and handled with utmost security' },
              { icon: Users, title: 'Expert Team', description: 'Experienced professionals ensure accurate form submission' },
              { icon: TrendingUp, title: 'Fast Processing', description: 'Quick turnaround with real-time status updates' },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="bg-primary-100 dark:bg-primary-800 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                  <feature.icon className="h-8 w-8 text-primary-600 dark:text-primary-300" />
                </div>
                <h3 className="text-base sm:text-xl font-semibold text-primary-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-900 dark:bg-primary-950 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '5000+', label: 'Forms Filled' },
              { value: '98%', label: 'Success Rate' },
              { value: '24/7', label: 'Support' },
              { value: '50+', label: 'Form Categories' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-2xl sm:text-4xl font-display font-bold mb-2">{stat.value}</div>
                <div className="text-primary-200">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white mb-4">What Our Students Say</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">Trusted by 2000+ students across India</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Priya Sharma', exam: 'SSC CGL 2024', text: 'I was struggling with the SSC form portal. FormEasy filled it in 30 minutes! Saved me a trip to the cyber cafe. Amazing service! ⭐⭐⭐⭐⭐', city: 'Meerut' },
              { name: 'Rahul Verma', exam: 'Bank PO 2024', text: 'The whole process was so smooth. I just filled my details, uploaded documents, and boom — form submitted! The dashboard tracking is very helpful. ⭐⭐⭐⭐⭐', city: 'Lucknow' },
              { name: 'Sneha Gupta', exam: 'JEE Main 2025', text: 'I missed my college admission deadline last year. This year, FormEasy reminded me and filled the form on time. Got my admission! Thank you FormEasy! ⭐⭐⭐⭐⭐', city: 'Delhi' },
            ].map((testimonial, i) => (
              <div key={i} className="bg-neutral-50 dark:bg-neutral-700 rounded-xl p-6 border border-neutral-200 dark:border-neutral-600">
                <div className="flex items-center gap-1 mb-3">
                  {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400">★</span>)}
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 mb-4 leading-relaxed">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="bg-primary-100 dark:bg-primary-800 rounded-full w-10 h-10 flex items-center justify-center">
                    <span className="font-bold text-primary-600 dark:text-primary-300">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-primary-900 dark:text-white text-sm">{testimonial.name}</p>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400">{testimonial.exam} \u2022 {testimonial.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-accent-500">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-3xl font-display font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white mb-8">
            Join thousands of students who have successfully submitted their forms through FormEasy
          </p>
          <Link href="/exams">
            <Button variant="secondary" size="lg" className="text-lg">
              {t('hero.cta')}
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <LogoIcon size={56} white />
              </div>
              <p className="text-primary-200 text-sm">
                Professional form filling service for students across India.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-primary-200">
                <li><Link href="/exams" className="hover:text-white">Browse Forms</Link></li>
                <li><Link href="/request-form" className="hover:text-white">Request Form</Link></li>
                <li><Link href="/about" className="hover:text-white">About Us</Link></li>
                <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-primary-200">
                <li><Link href="/terms" className="hover:text-white">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/refund" className="hover:text-white">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-primary-200">
                <li>support@formeasy.com</li>
                <li>+91 9650X XXX95</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-800 mt-8 pt-8 text-center text-sm text-primary-200">
            © {new Date().getFullYear()} FormEasy. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}