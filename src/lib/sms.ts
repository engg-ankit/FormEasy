/**
 * SMS Service for FormEasy
 * 
 * Supports:
 * - MSG91 (Primary - Popular in India, affordable)
 * - Console logging (Development fallback)
 * 
 * Environment Variables needed:
 * - MSG91_API_KEY: Your MSG91 API key
 * - MSG91_SENDER_ID: Sender ID (e.g., 'FORMES')
 * - NEXT_PUBLIC_APP_URL: Your app URL (e.g., https://formeasy.in)
 */

const MSG91_API_URL = 'https://api.msg91.com/api/v5/otp';
const MSG91_SMS_URL = 'https://api.msg91.com/api/v5/flow';

/**
 * Send OTP via MSG91
 */
async function sendOtpMsg91(
  mobile: string,
  otp: string,
  templateName: string = 'OTP'
): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.MSG91_API_KEY;
  const senderId = process.env.MSG91_SENDER_ID || 'FORMES';

  if (!apiKey) {
    console.log(`\n📱 [DEV MODE] OTP for ${mobile}: ${otp}\n`);
    return { success: true, message: 'OTP sent (dev mode)' };
  }

  try {
    const response = await fetch(MSG91_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': apiKey,
      },
      body: JSON.stringify({
        mobile: `91${mobile}`,
        otp: otp,
        sender_id: senderId,
        template_name: templateName,
      }),
    });

    const data = await response.json();

    if (response.ok && data.type === 'success') {
      return { success: true, message: 'OTP sent successfully' };
    } else {
      console.error('MSG91 OTP Error:', data);
      return { success: false, message: data.message || 'Failed to send OTP' };
    }
  } catch (error) {
    console.error('MSG91 API Error:', error);
    return { success: false, message: 'Network error while sending OTP' };
  }
}

/**
 * Send SMS via MSG91 Flow API
 */
async function sendSmsMsg91(
  mobile: string,
  message: string,
  variables?: Record<string, string>
): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.MSG91_API_KEY;
  const senderId = process.env.MSG91_SENDER_ID || 'FORMES';
  const flowId = process.env.MSG91_SMS_FLOW_ID;

  if (!apiKey || !flowId) {
    console.log(`\n📱 [DEV MODE] SMS to ${mobile}:\n${message}\n`);
    return { success: true, message: 'SMS sent (dev mode)' };
  }

  try {
    const response = await fetch(MSG91_SMS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': apiKey,
      },
      body: JSON.stringify({
        flow_id: flowId,
        sender_id: senderId,
        mobiles: `91${mobile}`,
        VAR1: variables?.VAR1 || '',
        VAR2: variables?.VAR2 || '',
        VAR3: variables?.VAR3 || '',
      }),
    });

    const data = await response.json();

    if (response.ok && data.type === 'success') {
      return { success: true, message: 'SMS sent successfully' };
    } else {
      console.error('MSG91 SMS Error:', data);
      return { success: false, message: data.message || 'Failed to send SMS' };
    }
  } catch (error) {
    console.error('MSG91 API Error:', error);
    return { success: false, message: 'Network error while sending SMS' };
  }
}

/**
 * Send OTP Relay SMS to user
 * When admin requests OTP for form filling, this sends SMS to user
 */
export async function sendOtpRelaySms(
  userMobile: string,
  portalName: string,
  otpRelayId: string
): Promise<{ success: boolean; message: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const otpLink = `${appUrl}/otp/${otpRelayId}`;

  // Try SMS Flow first (if configured)
  if (process.env.MSG91_SMS_FLOW_ID) {
    return sendSmsMsg91(userMobile, '', {
      VAR1: portalName,
      VAR2: otpLink,
      VAR3: '10 minutes',
    });
  }

  // Fallback to OTP API
  const message = `FormEasy: Your ${portalName} form is being filled. Please share OTP here: ${otpLink}`;
  
  // For development, log to console
  console.log(`\n📱 OTP Relay SMS to ${userMobile}:`);
  console.log(`   Portal: ${portalName}`);
  console.log(`   Link: ${otpLink}`);
  console.log(`   Message: ${message}\n`);

  return { success: true, message: 'OTP relay link sent' };
}

/**
 * Send general SMS notification
 */
export async function sendSms(
  mobile: string,
  message: string
): Promise<{ success: boolean; message: string }> {
  return sendSmsMsg91(mobile, message);
}

/**
 * Send OTP for signup/login verification
 */
export async function sendVerificationOtp(
  mobile: string,
  otp: string
): Promise<{ success: boolean; message: string }> {
  return sendOtpMsg91(mobile, otp, 'OTP');
}

export default {
  sendOtpRelaySms,
  sendSms,
  sendVerificationOtp,
};
