import { RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';

export default function RefundPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[72px]">
            <Link href="/" className="flex items-center">
              <Logo size="md" />
            </Link>
            <Link href="/">
              <button className="text-primary-600 hover:text-primary-700 font-medium">
                Back to Home
              </button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-display font-bold text-primary-900 flex items-center gap-2">
              <RefreshCw className="h-8 w-8" />
              Refund Policy
            </h1>
            <p className="text-neutral-600">Last updated: August 2024</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">1. Refund Eligibility</h2>
              <p className="text-neutral-600 leading-relaxed">
                Refunds are processed on a case-by-case basis. We understand that circumstances may change, and we 
                strive to be fair while maintaining the sustainability of our services.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-900 mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                2. Refundable Situations
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-3">
                You may be eligible for a refund in the following situations:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2">
                <li><strong>Service Not Rendered:</strong> If we fail to submit your application due to technical issues on our end</li>
                <li><strong>Exam Cancellation:</strong> If the exam authority cancels the exam before the application deadline</li>
                <li><strong>Double Payment:</strong> If you were accidentally charged twice for the same service</li>
                <li><strong>Technical Errors:</strong> If payment was processed but service was not initiated due to system errors</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-900 mb-3 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                3. Non-Refundable Situations
              </h2>
              <p className="text-neutral-600 leading-relaxed mb-3">
                Refunds are generally not available in the following situations:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2">
                <li><strong>Change of Mind:</strong> If you decide not to proceed after service has been initiated</li>
                <li><strong>Missed Deadlines:</strong> If application couldn't be submitted due to missed exam deadlines</li>
                <li><strong>Incorrect Information:</strong> If application was rejected due to incorrect information provided by you</li>
                <li><strong>Document Issues:</strong> If application was rejected due to invalid or missing documents</li>
                <li><strong>Service Fee:</strong> The service fee portion is non-refundable once work has begun</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">4. Refund Process</h2>
              <p className="text-neutral-600 leading-relaxed mb-3">
                To request a refund, please follow these steps:
              </p>
              <ol className="list-decimal list-inside text-neutral-600 space-y-2">
                <li>Contact our support team at support@formeasy.com</li>
                <li>Provide your application ID and reason for refund request</li>
                <li>Our team will review your request within 5-7 business days</li>
                <li>If approved, refund will be processed to your original payment method</li>
                <li>Refund processing time depends on your payment provider (typically 5-10 business days)</li>
              </ol>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">5. Refund Amount</h2>
              <p className="text-neutral-600 leading-relaxed">
                Approved refunds will be calculated as follows:
              </p>
              <ul className="list-disc list-inside text-neutral-600 space-y-2 mt-3">
                <li><strong>Full Refund:</strong> Official exam fee (if not paid to exam authority)</li>
                <li><strong>Partial Refund:</strong> Service fee may be deducted if work has been initiated</li>
                <li><strong>Processing Fee:</strong> A nominal processing fee of ₹50 may apply to all refunds</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">6. Cancellation Policy</h2>
              <p className="text-neutral-600 leading-relaxed">
                You may cancel your application request before we begin processing. Cancellations must be made 
                within 24 hours of payment. After processing begins, cancellation requests will be evaluated 
                based on the work completed and may be subject to partial or no refund.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">7. Dispute Resolution</h2>
              <p className="text-neutral-600 leading-relaxed">
                If you disagree with our refund decision, you may request a review by our management team. 
                Please provide additional details supporting your case. Management decisions are final and binding.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">8. Contact for Refunds</h2>
              <p className="text-neutral-600 leading-relaxed">
                For refund-related queries, please contact:
              </p>
              <ul className="list-none text-neutral-600 mt-3 space-y-1">
                <li>Email: refunds@formeasy.com</li>
                <li>Phone: +91 9650X XXX95</li>
                <li>Subject Line: Refund Request - [Your Application ID]</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-primary-900 mb-3">9. Policy Updates</h2>
              <p className="text-neutral-600 leading-relaxed">
                We reserve the right to modify this refund policy at any time. Changes will be effective 
                immediately upon posting on our website. Continued use of our services constitutes acceptance 
                of the updated policy.
              </p>
            </section>

            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-primary-900">
                <strong>Note:</strong> This refund policy is designed to be fair to both customers and our service. 
                We understand each situation is unique and encourage you to reach out to our support team 
                if you have specific circumstances you'd like us to consider.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}