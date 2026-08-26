import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { writeFile } from 'fs/promises';
import path from 'path';
import { existsSync, mkdirSync } from 'fs';
import { notifyUserReceiptUploaded } from '@/lib/user-notifications';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id: applicationId } = await context.params;

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type — only PDFs for receipts
    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are allowed for receipts' }, { status: 400 });
    }

    // Validate file size (5MB max for receipts)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File size exceeds 5MB limit' }, { status: 400 });
    }

    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `receipt-${applicationId.slice(-8)}-${timestamp}-${safeName}`;
    const filepath = path.join(uploadsDir, filename);

    await writeFile(filepath, buffer);

    const fileUrl = `/uploads/receipts/${filename}`;

    // Save document record
    const doc = await prisma.document.create({
      data: {
        applicationId,
        docType: 'FILLED_FORM_RECEIPT',
        fileUrl,
      },
    });

    // Send notification to user
    notifyUserReceiptUploaded(
      application.userId,
      application.examId ? '' : applicationId,
      fileUrl
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        docType: doc.docType,
        fileUrl: doc.fileUrl,
        uploadedAt: doc.uploadedAt,
      },
    });

  } catch (error) {
    console.error('Receipt upload error:', error);
    return NextResponse.json({ error: 'Failed to upload receipt' }, { status: 500 });
  }
}

// GET — fetch all receipts for an application
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id: applicationId } = await context.params;

    const receipts = await prisma.document.findMany({
      where: {
        applicationId,
        docType: 'FILLED_FORM_RECEIPT',
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({ receipts });

  } catch (error) {
    console.error('Receipt fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
}
