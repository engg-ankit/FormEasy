import type { Metadata } from 'next';
import { ContactContent } from '@/components/contact-content';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: "Get in touch with CyberSeva — we're here to help with your form filling needs.",
  openGraph: {
    title: 'Contact Us | CyberSeva',
    description: "Get in touch with CyberSeva — we're here to help with your form filling needs.",
  },
};

export default function ContactPage() {
  return <ContactContent />;
}
