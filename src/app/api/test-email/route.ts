import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function GET() {
  const gmailUser = process.env.GMAIL_USER;
  const gmailPass = process.env.GMAIL_APP_PASSWORD;

  if (!gmailUser || !gmailPass) {
    return NextResponse.json({ 
      error: 'Gmail env variables not set',
      hasUser: !!gmailUser,
      hasPass: !!gmailPass 
    }, { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: gmailUser,
      pass: gmailPass,
    },
  });

  try {
    // Verify connection first
    await transporter.verify();
    
    // Send test email
    const result = await transporter.sendMail({
      from: `"FormEasy" <${gmailUser}>`,
      to: gmailUser, // Send to same email for testing
      subject: '🎉 Welcome to FormEasy - Test Email!',
      html: `
        <div style="max-width:600px;margin:0 auto;padding:20px;font-family:sans-serif;">
          <div style="background:#1B2559;border-radius:12px 12px 0 0;padding:30px;text-align:center;">
            <h1 style="color:#fff;margin:0;font-size:24px;">Form<span style="color:#2DD4BF;">Easy</span></h1>
          </div>
          <div style="background:#fff;padding:30px;border-radius:0 0 12px 12px;">
            <h2 style="color:#1B2559;">Email Notifications Working! ✅</h2>
            <p style="color:#374151;">Agar ye email aa gayi hai toh sab kuch sahi hai!</p>
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
      messageId: result.messageId,
      from: gmailUser,
      message: 'Email sent successfully!'
    });
  } catch (error: any) {
    console.error('Email test failed:', error);
    return NextResponse.json({ 
      error: 'Email send failed',
      details: error.message,
      code: error.code,
      command: error.command
    }, { status: 500 });
  }
}
