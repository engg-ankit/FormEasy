'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Edit, Upload, CheckCircle, Clock, Shield, Users, TrendingUp, Monitor, Wifi, Zap } from 'lucide-react';
import { LogoIcon } from '@/components/logo-icon';
import { HomepageHeader } from '@/components/homepage-header';
import Link from 'next/link';
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
  const [featuredExams, setFeaturedExams] = useState<Exam[]>([]);

  useEffect(() => {
    fetch('/api/exams')
      .then(r => r.json())
      .then(data => setFeaturedExams((data.exams || []).slice(0, 3)))
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-[#0a0f1a]">
      {/* Navigation */}
      <HomepageHeader />

      {/* ═══ Hero Section — Cyber Cafe Counter ═══ */}
      <section className="relative overflow-hidden cyber-counter py-24 sm:py-32 px-4 sm:px-6 lg:px-8">
        {/* Scanline overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(22,179,94,0.1) 2px, rgba(22,179,94,0.1) 4px)',
          }}
        />
        {/* Glow orb */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-500/5 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center">
            {/* Terminal-style label */}
            <div className="inline-flex items-center gap-2 bg-neon-500/10 border border-neon-500/20 rounded-full px-4 py-1.5 mb-8">
              <span className="w-2 h-2 bg-neon-400 rounded-full animate-pulse" />
              <span className="text-neon-400 text-xs font-mono tracking-wider uppercase">Online Cyber Cafe — Active</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-display font-bold text-white mb-6 leading-tight">
              Ghar Baithe{' '}
              <span className="text-neon-400 neon-text">Cyber Cafe</span>{' '}
              ☕
            </h1>
            <p className="text-lg sm:text-xl text-neutral-400 mb-10 max-w-3xl mx-auto leading-relaxed">
              Exam forms, college admissions, scholarships — sab apne phone se bharo.<br className="hidden sm:block" />
              <span className="text-cyber-400 font-medium">CyberSeva</span> hai na! 💻
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/exams">
                <Button size="lg" className="text-lg bg-neon-500 hover:bg-neon-600 text-white shadow-neon font-semibold px-8">
                  Browse Forms
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="outline" size="lg" className="text-lg border-neon-500/30 text-neon-400 hover:bg-neon-500/10">
                  How It Works
                </Button>
              </Link>
            </div>

            {/* Mini stats under hero */}
            <div className="flex flex-wrap justify-center gap-8 mt-14 pt-8 border-t border-white/5">
              {[
                { val: '5000+', label: 'Forms Filled' },
                { val: '98%', label: 'Success Rate' },
                { val: '24/7', label: 'Available' },
              ].map((s, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl font-display font-bold text-neon-400 neon-text">{s.val}</div>
                  <div className="text-xs text-neutral-500 mt-1 font-mono uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ How It Works — Terminal Cards ═══ */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0d1420]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-neon-500 font-mono text-sm tracking-widest uppercase">// Process</span>
            <h2 className="text-xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white mt-2">
              How It Works
            </h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '01', icon: Search, title: 'Browse & Choose', desc: 'Find the exam form you need from our curated list.', color: 'neon' },
              { step: '02', icon: Edit, title: 'Fill Your Details', desc: 'Fill in your info — we guide you through every field.', color: 'cyber' },
              { step: '03', icon: Upload, title: 'Upload Documents', desc: 'Photo, signature, ID proof — upload from your phone.', color: 'neon' },
              { step: '04', icon: CheckCircle, title: 'Pay & Relax', desc: 'Pay the fees and we submit your form. Done! ✅', color: 'cyber' },
            ].map((item, i) => (
              <div key={i} className="cyber-card group hover:shadow-neon transition-all duration-300">
                <div className="cyber-card-header">
                  <span className="cyber-card-dot cyber-card-dot-red" />
                  <span className="cyber-card-dot cyber-card-dot-yellow" />
                  <span className="cyber-card-dot cyber-card-dot-green" />
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono">step_{item.step}</span>
                </div>
                <div className="cyber-card-body text-center py-8">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                    item.color === 'neon' ? 'bg-neon-500/10 border border-neon-500/20' : 'bg-cyber-500/10 border border-cyber-500/20'
                  }`}>
                    <item.icon className={`h-7 w-7 ${item.color === 'neon' ? 'text-neon-400' : 'text-cyber-400'}`} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Featured Exams ═══ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50 dark:bg-[#0a0f1a]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-12">
            <div>
              <span className="text-neon-500 font-mono text-sm tracking-widest uppercase">// Available Forms</span>
              <h2 className="text-xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white mt-1">
                Recent Applications
              </h2>
            </div>
            <Link href="/exams">
              <Button variant="outline" className="border-neon-500/30 text-neon-500 hover:bg-neon-500/10">
                View All →
              </Button>
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredExams.map((exam) => (
              <div key={exam.id} className="cyber-card hover:shadow-neon transition-all duration-300 group">
                <div className="cyber-card-header">
                  <span className="cyber-card-dot cyber-card-dot-red" />
                  <span className="cyber-card-dot cyber-card-dot-yellow" />
                  <span className="cyber-card-dot cyber-card-dot-green" />
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono truncate ml-2">{exam.category}</span>
                </div>
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-neon-400 transition-colors truncate">{exam.title}</h3>
                  <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{exam.description}</p>
                  <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
                    <div className="flex items-center text-xs text-neutral-500 font-mono">
                      <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0 text-cyber-400" />
                      <span className="truncate">Due: {exam.lastDate}</span>
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
        </div>
      </section>

      {/* ═══ Why Choose CyberSeva ═══ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0d1420]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <span className="text-neon-500 font-mono text-sm tracking-widest uppercase">// Why Us</span>
            <h2 className="text-xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white mt-2">
              Why Choose CyberSeva?
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Shield, title: 'Secure & Reliable', desc: 'Your data is encrypted and handled with utmost security — bank-level protection.', accent: 'neon' },
              { icon: Zap, title: 'Lightning Fast', desc: 'Forms processed within 24-48 hours with real-time status tracking.', accent: 'cyber' },
              { icon: Users, title: 'Expert Team', desc: 'Experienced professionals ensure accurate form submission every time.', accent: 'neon' },
            ].map((feature, i) => (
              <div key={i} className="cyber-card hover:shadow-neon transition-all duration-300 group">
                <div className="cyber-card-header">
                  <span className="cyber-card-dot cyber-card-dot-red" />
                  <span className="cyber-card-dot cyber-card-dot-yellow" />
                  <span className="cyber-card-dot cyber-card-dot-green" />
                </div>
                <div className="cyber-card-body text-center py-8">
                  <div className={`w-14 h-14 mx-auto mb-4 rounded-lg flex items-center justify-center ${
                    feature.accent === 'neon' ? 'bg-neon-500/10 border border-neon-500/20' : 'bg-cyber-500/10 border border-cyber-500/20'
                  }`}>
                    <feature.icon className={`h-7 w-7 ${feature.accent === 'neon' ? 'text-neon-400' : 'text-cyber-400'}`} />
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-neutral-400 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Stats — Neon Terminal ═══ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-[#060b14] relative overflow-hidden">
        {/* Grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(22,179,94,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(22,179,94,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '5000+', label: 'Forms Filled', icon: '📄' },
              { value: '98%', label: 'Success Rate', icon: '✅' },
              { value: '24/7', label: 'Always Online', icon: '🌐' },
              { value: '50+', label: 'Form Categories', icon: '📋' },
            ].map((stat, index) => (
              <div key={index} className="group">
                <div className="text-3xl sm:text-4xl font-display font-bold text-neon-400 neon-text mb-2 group-hover:scale-110 transition-transform">
                  {stat.value}
                </div>
                <div className="text-neutral-500 font-mono text-xs uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ Testimonials ═══ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-[#0d1420]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-neon-500 font-mono text-sm tracking-widest uppercase">// Reviews</span>
            <h2 className="text-xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white mt-2 mb-2">
              What Our Students Say
            </h2>
            <p className="text-neutral-500">Trusted by 2000+ students across India</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Priya Sharma', exam: 'SSC CGL 2024', text: 'I was struggling with the SSC form portal. CyberSeva filled it in 30 minutes! Saved me a trip to the cyber cafe. Amazing service! ⭐⭐⭐⭐⭐', city: 'Meerut' },
              { name: 'Rahul Verma', exam: 'Bank PO 2024', text: 'The whole process was so smooth. I just filled my details, uploaded documents, and boom — form submitted! The dashboard tracking is very helpful. ⭐⭐⭐⭐⭐', city: 'Lucknow' },
              { name: 'Sneha Gupta', exam: 'JEE Main 2025', text: 'I missed my college admission deadline last year. This year, CyberSeva reminded me and filled the form on time. Got my admission! Thank you CyberSeva! ⭐⭐⭐⭐⭐', city: 'Delhi' },
            ].map((testimonial, i) => (
              <div key={i} className="cyber-card hover:shadow-neon transition-all duration-300">
                <div className="cyber-card-header">
                  <span className="cyber-card-dot cyber-card-dot-red" />
                  <span className="cyber-card-dot cyber-card-dot-yellow" />
                  <span className="cyber-card-dot cyber-card-dot-green" />
                  <span className="ml-auto text-[10px] text-neutral-500 font-mono">review_{String(i + 1).padStart(2, '0')}</span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1 mb-3">
                    {[1,2,3,4,5].map(s => <span key={s} className="text-yellow-400 text-sm">★</span>)}
                  </div>
                  <p className="text-neutral-300 mb-4 leading-relaxed text-sm">&ldquo;{testimonial.text}&rdquo;</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-white/5">
                    <div className="bg-neon-500/10 border border-neon-500/20 rounded-lg w-10 h-10 flex items-center justify-center">
                      <span className="font-bold text-neon-400 text-sm">{testimonial.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{testimonial.name}</p>
                      <p className="text-[11px] text-neutral-500 font-mono">{testimonial.exam} • {testimonial.city}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA Section ═══ */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-neon-600 to-cyber-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)',
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-xl sm:text-3xl font-display font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-white/80 mb-8">
            Join thousands of students who have successfully submitted their forms through CyberSeva
          </p>
          <Link href="/exams">
            <Button size="lg" className="text-lg bg-white text-neon-700 hover:bg-neutral-100 font-bold px-8 shadow-lg">
              Browse Forms →
            </Button>
          </Link>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="bg-[#060b14] text-white py-12 px-4 sm:px-6 lg:px-8 border-t border-neon-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="mb-4">
                <LogoIcon size={56} white />
              </div>
              <p className="text-neutral-500 text-sm">
                India&apos;s trusted online cyber cafe — form filling service for students across India.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-neon-400 font-mono text-sm">Quick Links</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link href="/exams" className="hover:text-neon-400 transition-colors">Browse Forms</Link></li>
                <li><Link href="/request-form" className="hover:text-neon-400 transition-colors">Request Form</Link></li>
                <li><Link href="/about" className="hover:text-neon-400 transition-colors">About Us</Link></li>
                <li><Link href="/faq" className="hover:text-neon-400 transition-colors">FAQ</Link></li>
                <li><Link href="/contact" className="hover:text-neon-400 transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-neon-400 font-mono text-sm">Legal</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li><Link href="/terms" className="hover:text-neon-400 transition-colors">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="hover:text-neon-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/refund" className="hover:text-neon-400 transition-colors">Refund Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-neon-400 font-mono text-sm">Contact</h4>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="font-mono text-xs">support@cyberseva.in</li>
                <li className="font-mono text-xs">+91 9650X XXX95</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/5 mt-8 pt-8 text-center text-xs text-neutral-600 font-mono">
            © {new Date().getFullYear()} CyberSeva — Online Cyber Cafe. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
