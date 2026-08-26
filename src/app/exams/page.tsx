import type { Metadata } from 'next';
import { ExamsContent } from '@/components/exams-content';

export const metadata: Metadata = {
  title: 'Browse Exam Forms',
  description: 'Browse and apply for exam forms, college registrations, scholarships, and more on ClickNsit.',
  openGraph: {
    title: 'Browse Exam Forms | ClickNsit',
    description: 'Browse and apply for exam forms, college registrations, scholarships, and more on ClickNsit.',
  },
};

export default function ExamsPage() {
  return <ExamsContent />;
}
