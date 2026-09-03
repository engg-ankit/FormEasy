import type { Metadata } from 'next';
import { FaqContent } from '@/components/faq-content';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about ClickNsit — online cyber cafe form filling service.',
  openGraph: {
    title: 'FAQ | ClickNsit',
    description: 'Frequently asked questions about ClickNsit — online cyber cafe form filling service.',
  },
};

export default function FAQPage() {
  return (
    <>
      <FaqContent />
      <SiteFooter />
    </>
  );
}
