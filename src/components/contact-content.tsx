'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteNav } from '@/components/site-nav';
import { Phone, Mail, MessageCircle, Send, CheckCircle, Loader2, Clock } from 'lucide-react';

export function ContactContent() {
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(r => setTimeout(r, 1500));
    setSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteNav />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-display font-bold text-primary-900 mb-4">Contact Us</h1>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Have a question? Need help with your application? We&apos;re here for you!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Info */}
          <div className="space-y-4">
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="bg-primary-100 rounded-xl p-3"><Phone className="h-6 w-6 text-primary-600" /></div>
                <div>
                  <h3 className="font-bold text-primary-900">Call Us</h3>
                  <p className="text-sm text-neutral-600">+91 9650X XXX95</p>
                  <p className="text-xs text-neutral-500">Mon-Sat, 9AM - 8PM</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="bg-green-100 rounded-xl p-3"><MessageCircle className="h-6 w-6 text-green-600" /></div>
                <div>
                  <h3 className="font-bold text-primary-900">WhatsApp</h3>
                  <p className="text-sm text-neutral-600">+91 9650X XXX95</p>
                  <p className="text-xs text-neutral-500">Quick response within 30 mins</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="bg-blue-100 rounded-xl p-3"><Mail className="h-6 w-6 text-blue-600" /></div>
                <div>
                  <h3 className="font-bold text-primary-900">Email</h3>
                  <p className="text-sm text-neutral-600">support@clickandsit.in</p>
                  <p className="text-xs text-neutral-500">We reply within 24 hours</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="bg-accent-100 rounded-xl p-3"><Clock className="h-6 w-6 text-accent-600" /></div>
                <div>
                  <h3 className="font-bold text-primary-900">Working Hours</h3>
                  <p className="text-sm text-neutral-600">Mon - Saturday</p>
                  <p className="text-xs text-neutral-500">9:00 AM - 8:00 PM IST</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-xl font-display font-bold text-primary-900">Send us a Message</h2>
              </CardHeader>
              <CardContent>
                {submitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-primary-900 mb-2">Message Sent!</h3>
                    <p className="text-neutral-600 mb-4">We&apos;ll get back to you within 24 hours.</p>
                    <Button onClick={() => setSubmitted(false)} variant="outline">Send Another Message</Button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input label="Your Name" placeholder="Full name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                      <Input label="Phone Number" type="tel" placeholder="Your phone" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required maxLength={10} />
                    </div>
                    <Input label="Email" type="email" placeholder="your@email.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} required />
                    <Input label="Subject" placeholder="How can we help?" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} required />
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Message</label>
                      <textarea placeholder="Tell us more..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} rows={5} required className="w-full px-3 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
                    </div>
                    <Button type="submit" variant="primary" className="w-full min-h-[48px]" disabled={isSubmitting}>
                      {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</> : <><Send className="h-4 w-4 mr-2" /> Send Message</>}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
