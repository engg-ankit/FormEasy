import type { Metadata } from 'next';
import { FaqContent } from '@/components/faq-content';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about CyberSeva — online cyber cafe form filling service.',
  openGraph: {
    title: 'FAQ | CyberSeva',
    description: 'Frequently asked questions about CyberSeva — online cyber cafe form filling service.',
  },
};

export default function FAQPage() {
  return <FaqContent />;
}
