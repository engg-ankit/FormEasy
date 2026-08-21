export function loadRazorpayScript(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    document.body.appendChild(script);
  });
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name: string;
    email: string;
    contact: string;
  };
  theme: {
    color: string;
  };
}

export function createRazorpayCheckout(options: RazorpayOptions): any {
  if (typeof window !== 'undefined' && (window as any).Razorpay) {
    return new (window as any).Razorpay(options);
  }
  return null;
}