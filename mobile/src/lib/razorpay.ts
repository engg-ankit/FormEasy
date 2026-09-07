/**
 * Razorpay checkout for React Native.
 *
 * react-native-razorpay is a native module — it does NOT work in Expo Go.
 * Run the app with a development build (`npx expo run:android`) or EAS Build.
 */
export interface RazorpayOptions {
  key: string;
  amount: number; // in paise
  currency?: string;
  name?: string;
  description?: string;
  order_id?: string;
  prefill?: { contact?: string; email?: string; name?: string };
  theme?: { color?: string };
}

export interface RazorpaySuccess {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

export async function openRazorpayCheckout(
  options: RazorpayOptions
): Promise<RazorpaySuccess> {
  // Lazy import so screens render fine even when the native module is missing
  const { default: RazorpayCheckout } = await import('react-native-razorpay');
  const result = await RazorpayCheckout.open(options);
  return result as RazorpaySuccess;
}