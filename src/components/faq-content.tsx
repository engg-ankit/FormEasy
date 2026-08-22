'use client';

import { useState } from 'react';
import { SiteNav } from '@/components/site-nav';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

const FAQ_DATA = [
  { q: 'What is FormEasy?', a: 'FormEasy is an online form filling service. We help students fill and submit their exam application forms, college admissions, scholarships, and other government forms — all from the comfort of their home.' },
  { q: 'How does FormEasy work?', a: 'Simply browse available forms, select the one you need, fill in your details through our easy 5-step wizard, upload required documents, and pay the fee. Our team processes your form on the official portal within 24-48 hours.' },
  { q: 'What are the charges?', a: 'We charge a small service fee (₹50-200) on top of the official form fee. The exact amount depends on the form type. You can see the complete fee breakdown before payment — no hidden charges.' },
  { q: 'How long does it take?', a: "Most forms are processed within 24-48 hours. You can track the status in real-time from your dashboard. You'll also receive email updates at every step." },
  { q: 'Is my data safe?', a: 'Absolutely! We use bank-level encryption (SSL) to protect your data. We never share your personal information with third parties. Your documents are stored securely and deleted after form submission.' },
  { q: 'What documents do I need?', a: 'Common documents include: Passport-size photo, Signature scan, Aadhaar card, 10th/12th marksheet, Category certificate (if applicable). Exact requirements vary by form and are shown during the application process.' },
  { q: 'Can I track my application?', a: 'Yes! Log in to your dashboard at formeasy.com/dashboard to see real-time status updates — from submission to completion.' },
  { q: "What if my form is rejected?", a: "In the rare case of rejection, we'll notify you immediately with the reason. We'll help you fix the issue and resubmit. If the payment was for a rejected form, we offer a full refund." },
  { q: 'Can I get a refund?', a: 'Yes, if your form is rejected due to our error, you get a full refund. If you cancel before we process the form, you get a 100% refund of the service fee. Official portal fees are non-refundable once submitted.' },
  { q: 'Do you fill all types of forms?', a: "We cover government exams (SSC, Railway, IBPS, UPSC), college admissions, university registrations, scholarships, passport applications, and more. If you need a form that's not listed, you can request it through our Request Form feature." },
  { q: 'Can I fill forms for someone else?', a: 'Yes! You can fill forms for your family members or friends. Just use their details during the application process. Each application needs a unique email and mobile number.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major payment methods through Razorpay — UPI, debit cards, credit cards, net banking, and popular wallets like PhonePe, Google Pay, and Paytm.' },
];

export function FaqContent() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const filtered = FAQ_DATA.filter(f =>
    f.q.toLowerCase().includes(search.toLowerCase()) ||
    f.a.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteNav />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-display font-bold text-primary-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-lg text-neutral-600">Everything you need to know about FormEasy</p>
        </div>

        {/* Search */}
        <div className="relative mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
          />
        </div>

        {/* FAQ Items */}
        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <div key={i} className="bg-white rounded-xl border border-neutral-200 overflow-hidden">
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-neutral-50 transition-colors min-h-[56px]"
              >
                <span className="font-semibold text-primary-900 pr-4">{faq.q}</span>
                {openIndex === i ? (
                  <ChevronUp className="h-5 w-5 text-primary-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-neutral-400 flex-shrink-0" />
                )}
              </button>
              {openIndex === i && (
                <div className="px-6 pb-4 text-neutral-600 leading-relaxed border-t border-neutral-100 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-8">
            <p className="text-neutral-500">No matching questions found. Try a different search.</p>
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-neutral-600 mb-4">Still have questions?</p>
          <a href="/contact" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors">
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
}
