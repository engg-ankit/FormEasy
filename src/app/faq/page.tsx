import type { Metadata } from 'next';
import { FaqContent } from '@/components/faq-content';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about FormEasy form filling service.',
  openGraph: {
    title: 'FAQ | FormEasy',
    description: 'Frequently asked questions about FormEasy form filling service.',
  },
};

export default function FAQPage() {
  return <FaqContent />;
}
