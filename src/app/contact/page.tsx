import type { Metadata } from 'next';
import { ContactContent } from '@/components/contact-content';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: "Get in touch with ClickNsit — we're here to help with your form filling needs.",
  openGraph: {
    title: 'Contact Us | ClickNsit',
    description: "Get in touch with ClickNsit — we're here to help with your form filling needs.",
  },
};

export default function ContactPage() {
  return (
    <>
      <ContactContent />
      <SiteFooter />
    </>
  );
}
