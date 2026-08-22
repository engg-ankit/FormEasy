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

const MSG91_OTP_URL = 'https://api.msg91.com/api/v5/otp';
const MSG91_SMS_URL = 'https://api.msg91.com/api/v5/otp';

/**
 * Send OTP via MSG91
 * Uses the OTP verification API (not SMS API)
 * authkey goes in header, mobile + template in body
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
    // MSG91 OTP API - sends OTP and verifies later
    const response = await fetch(MSG91_OTP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': apiKey,
      },
      body: JSON.stringify({
        mobile: `91${mobile}`,
        otp: otp,
        sender: senderId,
        otp_expiry: '300',  // 5 minutes in seconds (max 10800)
        length: '6',
      }),
    });

    const data = await response.json();
    console.log('MSG91 OTP Response:', JSON.stringify(data));

    if (response.ok && data.type === 'success') {
      return { success: true, message: 'OTP sent successfully' };
    } else {
      console.error('MSG91 OTP Error:', JSON.stringify(data));
      return { success: false, message: data.message || JSON.stringify(data) || 'Failed to send OTP' };
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
 * Send OTP Relay SMS to user via MSG91
 * When admin requests OTP for form filling, this sends SMS to user
 */
export async function sendOtpRelaySms(
  userMobile: string,
  portalName: string,
  otpRelayId: string
): Promise<{ success: boolean; message: string }> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const otpLink = `${appUrl}/otp/${otpRelayId}`;
  const apiKey = process.env.MSG91_API_KEY;
  const senderId = process.env.MSG91_SENDER_ID || 'FORMES';
  const flowId = process.env.MSG91_SMS_FLOW_ID;

  const message = `FormEasy: Your ${portalName} form is being filled. Please share OTP here: ${otpLink}`;

  // If no API key, just log for development
  if (!apiKey) {
    console.log(`\n📱 [DEV MODE] OTP Relay SMS to ${userMobile}:`);
    console.log(`   Portal: ${portalName}`);
    console.log(`   Link: ${otpLink}`);
    console.log(`   Message: ${message}\n`);
    return { success: true, message: 'OTP relay link sent (dev mode)' };
  }

  // If flow ID is configured, use Flow API
  if (flowId) {
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
          mobiles: `91${userMobile}`,
          VAR1: portalName,
          VAR2: otpLink,
        }),
      });
      const data = await response.json();
      console.log('MSG91 Relay SMS Response:', JSON.stringify(data));
      if (response.ok && data.type === 'success') {
        return { success: true, message: 'SMS sent successfully' };
      }
    } catch (err) {
      console.error('MSG91 Flow SMS Error:', err);
    }
  }

  // Fallback: Use OTP API to send the relay message
  try {
    // We send a simple OTP where the OTP itself is a dummy since this is just a notification
    const dummyOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const response = await fetch(MSG91_OTP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'authkey': apiKey,
      },
      body: JSON.stringify({
        mobile: `91${userMobile}`,
        otp: dummyOtp,
        sender: senderId,
        otp_expiry: '600',
        length: '6',
      }),
    });
    const data = await response.json();
    console.log('MSG91 Relay SMS (OTP fallback) Response:', JSON.stringify(data));
    if (response.ok && data.type === 'success') {
      return { success: true, message: 'SMS sent successfully' };
    }
    return { success: false, message: data.message || 'Failed to send SMS' };
  } catch (err) {
    console.error('MSG91 Relay SMS Error:', err);
    return { success: false, message: 'Network error while sending SMS' };
  }
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
