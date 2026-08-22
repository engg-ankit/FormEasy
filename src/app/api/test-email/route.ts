import { NextResponse } from 'next/server';
import { Resend } from 'resend';

export async function GET() {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ 
      error: 'RESEND_API_KEY not set' 
    }, { status: 500 });
  }

  const resend = new Resend(apiKey);

  try {
    const result = await resend.emails.send({
      from: 'FormEasy <onboarding@resend.dev>',
      to: ['delivered@resend.dev'], // Resend test email
      subject: '🎉 Welcome to FormEasy - Test Email!',
      html: `
        <div style="max-width:600px;margin:0 auto;padding:20px;font-family:sans-serif;">
          <div style="background:#1B2559;border-radius:12px 12px 0 0;padding:30px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Form<span style="color:#2DD4BF;">Easy</span></h1>
          </div>
          <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;">
            <h2 style="color:#1B2559;">Email Notifications Working! ✅</h2>
            <p style="color:#374151;">Agar ye email aayi hai toh sab kuch sahi hai!</p>
            <p style="color:#374151;">Ab har event pe email jayega:</p>
            <ul style="color:#374151;">
              <li>🎉 New Signup</li>
              <li>✅ Application Submit</li>
              <li>💳 Payment Done</li>
              <li>📝 Request Form</li>
              <li>📋 Status Change</li>
            </ul>
            <p style="color:#9CA3AF;font-size:12px;text-align:center;margin-top:20px;">© 2026 FormEasy</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json({ 
      success: true, 
      emailId: result.data?.id,
      message: 'Email sent via Resend HTTP API!'
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: 'Email failed',
      details: error.message
    }, { status: 500 });
  }
}
