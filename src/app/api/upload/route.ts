import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const docType = formData.get('docType') as string;
    const applicationId = formData.get('applicationId') as string;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only JPEG, PNG, and PDF are allowed.' }, { status: 400 });
    }

    // Validate file size (3MB max for base64)
    const maxSize = 3 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 3MB limit' }, { status: 400 });
    }

    // Convert to base64 data URL for storage
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // If applicationId provided, save directly to Document table
    if (applicationId && docType) {
      await prisma.document.create({
        data: {
          applicationId,
          docType,
          fileUrl: dataUrl,
          fileData: base64,
        },
      });
    }

    return NextResponse.json({ 
      success: true,
      fileUrl: dataUrl,
      filename: file.name,
      size: file.size,
      type: file.type
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}
