'use client';
import { useTranslation } from '@/lib/i18n';
import { PageHead } from '@/components/page-head';
import { SiteNav } from '@/components/site-nav';

export default function TermsPage() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen bg-neutral-50">
      <PageHead title="Terms & Conditions | FormEasy" description="Terms and conditions for using FormEasy form filling service." />
      <SiteNav />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-display font-bold text-primary-900 mb-8">Terms & Conditions</h1>
        <p className="text-sm text-neutral-500 mb-8">Last updated: August 2024</p>

        <div className="prose prose-neutral max-w-none space-y-8">
          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">1. Acceptance of Terms</h2>
            <p className="text-neutral-600 leading-relaxed">By accessing or using FormEasy ("the Platform"), you agree to be bound by these Terms & Conditions. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">2. Service Description</h2>
            <p className="text-neutral-600 leading-relaxed">FormEasy provides an online form filling assistance service. We help users fill and submit application forms for government exams, college admissions, scholarships, and other official portals on their behalf. We act as a facilitator and are not affiliated with any government body or examination authority.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">3. User Responsibilities</h2>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>You must provide accurate and truthful information</li>
              <li>You are responsible for the accuracy of all data submitted</li>
              <li>You must upload genuine and valid documents</li>
              <li>You must ensure timely payment for services availed</li>
              <li>You must not use the service for any fraudulent purpose</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">4. Fees & Payments</h2>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li>Service fees are clearly displayed before payment</li>
              <li>Official portal fees are passed through without markup</li>
              <li>Payments are processed securely through Razorpay</li>
              <li>All fees are inclusive of applicable taxes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">5. Refund Policy</h2>
            <ul className="list-disc list-inside text-neutral-600 space-y-2">
              <li><strong>Full refund:</strong> If form is rejected due to our error</li>
              <li><strong>Full refund:</strong> If you cancel before we process the form</li>
              <li><strong>No refund:</strong> Official portal fees once submitted to the portal</li>
              <li><strong>No refund:</strong> If form is rejected due to user providing incorrect information</li>
              <li>Refunds are processed within 5-7 business days</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">6. Limitation of Liability</h2>
            <p className="text-neutral-600 leading-relaxed">FormEasy shall not be liable for: rejection of forms due to eligibility criteria not met by the user, changes in official portal policies, delays caused by government authorities, or technical issues on third-party portals.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">7. Intellectual Property</h2>
            <p className="text-neutral-600 leading-relaxed">All content on FormEasy, including logos, text, and graphics, is the property of FormEasy and protected under applicable intellectual property laws.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-primary-900 mb-3">8. Changes to Terms</h2>
            <p className="text-neutral-600 leading-relaxed">We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Continued use of the platform constitutes acceptance of modified terms.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
