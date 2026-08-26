'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Search, Edit, Upload, CheckCircle, Clock, Shield, Users, TrendingUp } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white dark:from-primary-950 dark:to-neutral-900">
      {/* Navigation */}
      <HomepageHeader />

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl sm:text-4xl lg:text-5xl font-display font-bold text-primary-900 dark:text-white mb-6">
              Online Cyber Cafe 🖥️<br />
              <span className="text-primary-600">Click. Sit. Done.</span>
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 mb-8 max-w-3xl mx-auto">
              Jaise cyber cafe mein form bharte ho — waisa ab ghar baithe! 🏠<br />
              ClickNsit pe apni details bharo, documents upload karo — <strong className="text-primary-700">baaki hum sambhal lenge.</strong>
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/exams">
                <Button variant="primary" size="lg" className="text-lg">
                  Browse Exam Forms
                </Button>
              </Link>
              <Link href="/#how-it-works">
                <Button variant="outline" size="lg" className="text-lg">
                  How It Works
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
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: Search, title: 'Browse & Choose', description: 'Find the exam you want to apply for from our curated list.' },
              { icon: Edit, title: 'Fill Form', description: "Fill in your details — we'll guide you through every field." },
              { icon: Upload, title: 'Upload Docs', description: 'Upload required documents like photo, signature, ID proof.' },
              { icon: CheckCircle, title: 'Pay & Done', description: "Pay the fees and we'll submit your form to the official portal." },
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
              Recent Applications
            </h2>
            <Link href="/exams">
              <Button variant="outline">View All</Button>
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
                      Apply Now
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* What is ClickNsit — Cyber Cafe Explained */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary-50 dark:bg-primary-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white mb-4">
              🖥️ ClickNsit Kya Hai?
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              ClickNsit ek <strong className="text-primary-700">online cyber cafe</strong> hai — jahan aap apne phone ya computer se exam forms bharte ho, aur hum use official portal pe submit karte ho.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🏪', title: 'Cyber Cafe Jaisa', description: 'Jaise physical cyber cafe mein baith ke form bharte ho — waisa experience online. Bus apni details do, baaki kaam humara.' },
              { icon: '✍️', title: 'Hum Bharte Hain Form', description: 'Aap sirf details aur documents upload karo. Hamari team official portal pe jaake form fill karegi aur submit karegi.' },
              { icon: '📱', title: 'Ghar Baithe Kaam', description: 'Cyber cafe jaane ki zaroorat nahi. Phone uthao, form select karo, details bharo — form submit! Bas.' },
            ].map((feature, index) => (
              <div key={index} className="bg-white dark:bg-neutral-800 rounded-xl p-8 border border-neutral-200 dark:border-neutral-700 text-center hover:shadow-medium transition-shadow">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold text-primary-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-neutral-600 dark:text-neutral-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services — Cyber Cafe Style */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white mb-4">
              Hamari Sevayein 📋
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Cyber cafe ki tarah — har tarah ke forms bharte hain
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { emoji: '🏛️', title: 'Govt. Exam Forms', desc: 'SSC, Railway, UPSC, Banking — sabke forms' },
              { emoji: '🎓', title: 'College Admission', desc: 'University registration, admission forms' },
              { emoji: '💰', title: 'Scholarship Forms', desc: 'NSP, State scholarships, fee waivers' },
              { emoji: '📄', title: 'Certificates', desc: 'Income, Caste, Domicile certificates' },
            ].map((service, i) => (
              <div key={i} className="bg-primary-50 dark:bg-neutral-700 rounded-xl p-6 text-center border border-primary-100 dark:border-neutral-600">
                <div className="text-3xl mb-3">{service.emoji}</div>
                <h3 className="font-semibold text-primary-900 dark:text-white mb-1">{service.title}</h3>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">{service.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white text-center mb-12">
            Why Choose ClickNsit?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Shield, title: 'Bharosa & Security', description: 'Aapka data safe hai — bank-level encryption, koi data share nahi hota.' },
              { icon: Users, title: 'Expert Team', description: 'Hamari trained team har form accurately fill karti hai — zero mistakes.' },
              { icon: TrendingUp, title: 'Jaldi Kaam', description: '24-48 hours mein form submit. Real-time status tracking bhi milega.' },
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
          <h2 className="text-xl sm:text-2xl font-display font-bold text-center mb-12">
            📊 Hamara Scorecard
          </h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '5000+', label: 'Forms Bhare' },
              { value: '98%', label: 'Success Rate' },
              { value: '24/7', label: 'Online Hai' },
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
            <h2 className="text-xl sm:text-3xl font-display font-bold text-primary-900 dark:text-white mb-4"> hamare Users Kya Kehte Hain 💬</h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">2000+ students ne cyber cafe ki jagah ClickNsit use kiya</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: 'Priya Sharma', exam: 'SSC CGL 2024', text: 'I was struggling with the SSC form portal. ClickNsit filled it in 30 minutes! Saved me a trip to the cyber cafe. Amazing service! ⭐⭐⭐⭐⭐', city: 'Meerut' },
              { name: 'Rahul Verma', exam: 'Bank PO 2024', text: 'The whole process was so smooth. I just filled my details, uploaded documents, and boom — form submitted! The dashboard tracking is very helpful. ⭐⭐⭐⭐⭐', city: 'Lucknow' },
              { name: 'Sneha Gupta', exam: 'JEE Main 2025', text: 'I missed my college admission deadline last year. This year, ClickNsit reminded me and filled the form on time. Got my admission! Thank you ClickNsit! ⭐⭐⭐⭐⭐', city: 'Delhi' },
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
            Join thousands of students who have successfully submitted their forms through ClickNsit
          </p>
          <Link href="/exams">
            <Button variant="secondary" size="lg" className="text-lg">
              Browse Exam Forms
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
                Online cyber cafe — forms bharna humara kaam, padhai tumhari! 🖥️
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
                <li>support@clickandsit.in</li>
                <li>+91 9650X XXX95</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-primary-800 mt-8 pt-8 text-center text-sm text-primary-200">
            © {new Date().getFullYear()} ClickNsit. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}