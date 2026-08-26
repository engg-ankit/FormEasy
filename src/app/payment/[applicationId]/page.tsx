'use client';
import { PageHead } from '@/components/page-head';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Logo } from '@/components/logo';
import Link from 'next/link';
import { loadRazorpayScript, createRazorpayCheckout, type RazorpayOptions } from '@/lib/razorpay';

export default function PaymentPage({ params }: { params: Promise<{ applicationId: string }> }) {
  const router = useRouter();
  const [applicationId, setApplicationId] = useState<string>('');
  const [amount, setAmount] = useState(0);
  const [orderId, setOrderId] = useState('');
  const [examTitle, setExamTitle] = useState('');
  const [officialFee, setOfficialFee] = useState(0);
  const [serviceFee, setServiceFee] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    params.then(({ applicationId: id }) => {
      setApplicationId(id);
      initiatePayment(id);
    });
  }, [params]);

  const initiatePayment = async (id: string) => {
    try {
      const response = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId: id }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to initiate payment');
        setIsLoading(false);
        return;
      }

      setAmount(data.order.amount);
      setOrderId(data.order.id);
      if (data.exam) {
        setExamTitle(data.exam.title);
        setOfficialFee(data.exam.officialFee);
        setServiceFee(data.exam.serviceFee);
      }
      setIsLoading(false);
    } catch (error) {
      setError('Failed to initiate payment');
      setIsLoading(false);
    }
  };

  const handlePayment = async () => {
    setIsProcessing(true);
    setError('');

    try {
      await loadRazorpayScript();

      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: amount,
        currency: 'INR',
        name: 'CyberSeva',
        description: 'Online Cyber Cafe — Form Filling Service',
        order_id: orderId,
        handler: async (response) => {
          await verifyPayment(response);
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#4f46e5',
        },
      };

      const rzp = createRazorpayCheckout(options);
      if (rzp) {
        rzp.open();
      }
    } catch (error) {
      setError('Failed to load payment gateway');
      setIsProcessing(false);
    }
  };

  const verifyPayment = async (response: any) => {
    try {
      const verifyResponse = await fetch('/api/payment/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
          applicationId,
        }),
      });

      const data = await verifyResponse.json();

      if (verifyResponse.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setError(data.error || 'Payment verification failed');
        setIsProcessing(false);
      }
    } catch (error) {
      setError('Failed to verify payment');
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary-600 mx-auto" />
          <p className="mt-4 text-neutral-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold text-primary-900 mb-2">
              Payment Successful!
            </h2>
            <p className="text-neutral-600 mb-4">
              Your application has been submitted successfully. Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-neutral-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center min-h-[72px]">
            <Logo size="md" />
            <Link href="/dashboard">
              <Button variant="ghost">My Dashboard</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <h1 className="text-3xl font-display font-bold text-primary-900">
              Complete Your Payment
            </h1>
            <p className="text-neutral-600">
              Secure payment powered by Razorpay
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                {error}
              </div>
            )}

            {/* Exam Info */}
            {examTitle && (
              <div className="mb-6">
                <p className="text-sm text-neutral-500 uppercase tracking-wider mb-1">Paying for</p>
                <p className="font-semibold text-primary-900 text-lg">{examTitle}</p>
              </div>
            )}

            {/* Fee Breakdown */}
            <div className="bg-primary-50 rounded-lg p-6 mb-6">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Official Form Fee</span>
                  <span className="font-medium text-primary-900">₹{officialFee / 100}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-neutral-600">Service Charge</span>
                  <span className="font-medium text-primary-900">₹{serviceFee / 100}</span>
                </div>
                <div className="border-t border-primary-200 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-primary-900">Total Amount</span>
                  <span className="text-3xl font-bold text-primary-900">₹{amount / 100}</span>
                </div>
              </div>
              <div className="text-sm text-neutral-500">
                <p className="truncate">Order ID: {orderId}</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={handlePayment}
                isLoading={isProcessing}
              >
                Pay ₹{amount / 100}
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>

            <div className="mt-6 text-sm text-neutral-600 text-center">
              <p>Your payment information is secure and encrypted</p>
              <p className="mt-2">
                By proceeding, you agree to our{' '}
                <a href="/terms" className="text-primary-600 hover:underline">
                  Terms & Conditions
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}