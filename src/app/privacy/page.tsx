import type { Metadata } from 'next';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How ClickNsit collects, uses, and protects your personal data.',
  openGraph: {
    title: 'Privacy Policy | ClickNsit',
    description: 'How ClickNsit collects, uses, and protects your personal data.',
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-neutral-50">
      <SiteNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-display font-bold text-primary-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-neutral-500 mb-8">Last updated: August 2024</p>

        <div className="prose prose-neutral max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">1. Information We Collect</h2>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li><strong>Personal Information:</strong> Name, email, phone number, date of birth, address</li>
              <li><strong>Identity Documents:</strong> Aadhaar, PAN, photos, signatures (uploaded for form filling)</li>
              <li><strong>Educational Data:</strong> Qualification, marks, roll numbers</li>
              <li><strong>Payment Information:</strong> Transaction details (processed securely via Razorpay — we never store card numbers)</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent, browser type</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>To fill and submit your application forms on official portals</li>
              <li>To communicate application status updates</li>
              <li>To process payments and refunds</li>
              <li>To improve our services and user experience</li>
              <li>To send important notifications about deadlines and updates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">3. Data Security</h2>
            <p className="text-neutral-600 leading-relaxed">We implement industry-standard security measures including SSL encryption, secure server infrastructure, and access controls. Your documents are encrypted at rest and in transit. However, no method of transmission is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">4. Data Sharing</h2>
            <p className="text-neutral-600 leading-relaxed">We do NOT sell or rent your personal data to third parties. We only share your information with:</p>
            <ul className="list-disc list-inside text-neutral-600 space-y-2 mt-2">
              <li>Official exam portals (for form submission purposes only)</li>
              <li>Payment gateway (Razorpay) for transaction processing</li>
              <li>Government authorities when legally required</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">5. Data Retention</h2>
            <p className="text-neutral-600 leading-relaxed">We retain your personal data for as long as your account is active or as needed to provide services. Documents uploaded for form filling are deleted within 30 days after form submission. You can request permanent data deletion anytime.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">6. Your Rights</h2>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li><strong>Access:</strong> View all data we have about you</li>
              <li><strong>Correction:</strong> Update incorrect information</li>
              <li><strong>Deletion:</strong> Request permanent deletion of your data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from non-essential notifications</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">7. Cookies</h2>
            <p className="text-neutral-600 leading-relaxed">We use essential cookies for authentication and session management. We do not use tracking cookies or share cookie data with advertisers.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">8. Contact Us</h2>
            <p className="text-neutral-600 leading-relaxed">For any privacy-related concerns, contact us at <strong>privacy@clickandsit.in</strong> or call <strong>+91 9650X XXX95</strong>.</p>
          </section>
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}
