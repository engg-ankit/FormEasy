import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { notifyUserReceiptUploaded } from '@/lib/user-notifications';

// Max 3MB per file, max 5 files
const MAX_FILE_SIZE = 3 * 1024 * 1024;
const MAX_FILES = 5;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id: applicationId } = await context.params;

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const names = formData.getAll('names') as string[]; // Custom display names

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed` }, { status: 400 });
    }

    // Verify application exists
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: { user: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const uploadedDocs = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const customName = names[i] || file.name || `Document ${i + 1}`;

      // Validate file type — PDFs only
      if (file.type !== 'application/pdf') {
        return NextResponse.json(
          { error: `"${customName}" is not a PDF. Only PDF files are allowed.` },
          { status: 400 }
        );
      }

      // Validate file size
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `"${customName}" exceeds 3MB limit (${(file.size / 1024 / 1024).toFixed(1)}MB)` },
          { status: 400 }
        );
      }

      // Convert to base64
      const bytes = await file.arrayBuffer();
      const base64Data = Buffer.from(bytes).toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64Data}`;

      // Save to database
      const doc = await prisma.document.create({
        data: {
          applicationId,
          docType: 'FILLED_FORM_RECEIPT',
          fileName: customName.replace(/\.pdf$/i, ''), // Remove .pdf extension from display name
          fileUrl: dataUrl,
          fileData: base64Data,
        },
      });

      uploadedDocs.push({
        id: doc.id,
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        uploadedAt: doc.uploadedAt,
      });
    }

    // Send notification to user
    notifyUserReceiptUploaded(
      application.userId,
      applicationId,
      `${uploadedDocs.length} document(s)`
    ).catch(console.error);

    return NextResponse.json({
      success: true,
      count: uploadedDocs.length,
      documents: uploadedDocs,
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
      select: {
        id: true,
        docType: true,
        fileName: true,
        fileUrl: true,
        uploadedAt: true,
      },
    });

    return NextResponse.json({ receipts });

  } catch (error) {
    console.error('Receipt fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch receipts' }, { status: 500 });
  }
}

// DELETE — remove a receipt
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminAuth();
    const { id: applicationId } = await context.params;
    const { searchParams } = new URL(request.url);
    const docId = searchParams.get('docId');

    if (!docId) {
      return NextResponse.json({ error: 'Document ID required' }, { status: 400 });
    }

    await prisma.document.deleteMany({
      where: {
        id: docId,
        applicationId,
        docType: 'FILLED_FORM_RECEIPT',
      },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Receipt delete error:', error);
    return NextResponse.json({ error: 'Failed to delete receipt' }, { status: 500 });
  }
}
