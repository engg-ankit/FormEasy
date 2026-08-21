import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json();

    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
    }

    // For now, we'll just log the contact message
    // In production, you might want to:
    // 1. Save to database
    // 2. Send email
    // 3. Store in a separate contact messages table
    
    console.log('Contact form submission:', {
      name,
      email,
      subject,
      message,
      timestamp: new Date().toISOString(),
    });

    // If you want to save to database, you could create a ContactMessage model
    // For now, we'll just return success
    
    return NextResponse.json({ 
      success: true,
      message: 'Contact form submitted successfully'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json({ error: 'Failed to submit contact form' }, { status: 500 });
  }
}