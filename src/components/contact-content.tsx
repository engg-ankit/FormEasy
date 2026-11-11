'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SiteNav } from '@/components/site-nav';
import { Phone, Mail, MessageCircle, Send, CheckCircle, Loader2, Clock, AlertCircle } from 'lucide-react';
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  MAILTO_URL,
  WHATSAPP_URL,
} from '@/lib/site';

const emptyForm = { name: '', email: '', phone: '', subject: '', message: '' };

export function ContactContent() {
  const [formData, setFormData] = useState(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          // The message table has no phone column — keep it with the message body.
          message: formData.phone ? `${formData.message}\n\nPhone: ${formData.phone}` : formData.message,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || 'Could not send your message. Please try again.');
      }

      setSubmitted(true);
      setFormData(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not send your message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const infoCards = [
    {
      href: `tel:${CONTACT_PHONE_TEL}`,
      external: false,
      iconClass: 'bg-primary-100',
      Icon: Phone,
      iconColor: 'text-primary-600',
      title: 'Call Us',
      value: CONTACT_PHONE,
      note: 'Mon-Sat, 9AM - 8PM',
      label: 'Call ClickNsit',
    },
    {
      href: WHATSAPP_URL,
      external: true,
      iconClass: 'bg-green-100',
      Icon: MessageCircle,
      iconColor: 'text-green-600',
      title: 'WhatsApp',
      value: CONTACT_PHONE,
      note: 'Quick response within 30 mins',
      label: 'Chat on WhatsApp',
    },
    {
      href: MAILTO_URL,
      external: false,
      iconClass: 'bg-blue-100',
      Icon: Mail,
      iconColor: 'text-blue-600',
      title: 'Email',
      value: CONTACT_EMAIL,
      note: 'We reply within 24 hours',
      label: `Email ${CONTACT_EMAIL}`,
    },
  ];

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
            {infoCards.map(({ href, external, iconClass, Icon, iconColor, title, value, note, label }) => (
              <a
                key={title}
                href={href}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                aria-label={label}
                className="block rounded-xl transition-shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <Card>
                  <CardContent className="p-5 flex items-center gap-4 min-h-[48px]">
                    <div className={`${iconClass} rounded-xl p-3`}>
                      <Icon className={`h-6 w-6 ${iconColor}`} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-primary-900">{title}</h3>
                      <p className="text-sm text-neutral-600 break-all">{value}</p>
                      <p className="text-xs text-neutral-500">{note}</p>
                    </div>
                  </CardContent>
                </Card>
              </a>
            ))}

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
                    {error && (
                      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-start break-words">
                        <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                        <span>
                          {error} You can also email us at{' '}
                          <a href={MAILTO_URL} className="underline font-medium">{CONTACT_EMAIL}</a>.
                        </span>
                      </div>
                    )}
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
