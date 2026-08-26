'use client';

import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PdfExportProps {
  applicationId: string;
  applicantName: string;
  examTitle: string;
  formData: Record<string, any>;
  status: string;
  documents?: Array<{ docType: string; fileUrl: string }>;
  payment?: {
    amount: number;
    status: string;
    razorpayPaymentId: string | null;
  };
}

export function PdfExport({
  applicationId,
  applicantName,
  examTitle,
  formData,
  status,
  documents,
  payment,
}: PdfExportProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async () => {
    setIsGenerating(true);
    try {
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      let y = 20;

      // Header
      doc.setFillColor(27, 37, 89);
      doc.rect(0, 0, pageWidth, 40, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('ClickNsit', margin, 20);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('ONLINE CYBER CAFE', margin, 28);
      doc.setFontSize(9);
      doc.text(`Application ID: ${applicationId}`, margin, 36);

      y = 55;

      // Title
      doc.setTextColor(27, 37, 89);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Application: ${examTitle}`, margin, y);
      y += 10;

      // Status badge
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text(`Status: ${status}`, margin, y);
      y += 12;

      // Divider
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 10;

      // Applicant Info section
      doc.setTextColor(27, 37, 89);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Applicant Information', margin, y);
      y += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);

      const infoFields = [
        { label: 'Full Name', value: formData.fullName || applicantName },
        { label: 'Father Name', value: formData.fatherName || '-' },
        { label: 'Mother Name', value: formData.motherName || '-' },
        { label: 'Date of Birth', value: formData.dateOfBirth || '-' },
        { label: 'Gender', value: formData.gender || '-' },
        { label: 'Category', value: formData.category || '-' },
        { label: 'Mobile', value: formData.mobile || '-' },
        { label: 'Email', value: formData.email || '-' },
        { label: 'Address', value: formData.address || '-' },
        { label: 'State', value: formData.state || '-' },
        { label: 'District', value: formData.district || '-' },
        { label: 'Pincode', value: formData.pincode || '-' },
      ];

      for (const field of infoFields) {
        if (field.value && field.value !== '-') {
          doc.setFont('helvetica', 'bold');
          doc.text(`${field.label}:`, margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(String(field.value), margin + 50, y);
          y += 7;
        }
      }

      y += 5;

      // Education section
      const eduFields = [
        { label: 'Education Level', value: formData.educationLevel },
        { label: 'Board/University', value: formData.boardOrUniversity },
        { label: 'Year of Passing', value: formData.yearOfPassing },
        { label: 'Percentage/CGPA', value: formData.percentage },
        { label: 'Roll Number', value: formData.rollNumber },
      ].filter(f => f.value);

      if (eduFields.length > 0) {
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setTextColor(27, 37, 89);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Education Details', margin, y);
        y += 8;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        for (const field of eduFields) {
          doc.setFont('helvetica', 'bold');
          doc.text(`${field.label}:`, margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(String(field.value), margin + 55, y);
          y += 7;
        }
      }

      y += 5;

      // Documents section
      if (documents && documents.length > 0) {
        if (y > 240) { doc.addPage(); y = 20; }

        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setTextColor(27, 37, 89);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Documents Uploaded', margin, y);
        y += 8;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);

        for (const doc2 of documents) {
          doc.setFont('helvetica', 'normal');
          doc.text(`• ${doc2.docType}`, margin, y);
          y += 6;
        }
      }

      // Payment section
      if (payment) {
        if (y > 240) { doc.addPage(); y = 20; }

        y += 5;
        doc.setDrawColor(200, 200, 200);
        doc.line(margin, y, pageWidth - margin, y);
        y += 8;

        doc.setTextColor(27, 37, 89);
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Payment Information', margin, y);
        y += 8;

        doc.setFontSize(10);
        doc.setTextColor(60, 60, 60);
        doc.setFont('helvetica', 'bold');
        doc.text('Amount:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`₹${(payment.amount / 100).toFixed(2)}`, margin + 30, y);
        y += 7;

        doc.setFont('helvetica', 'bold');
        doc.text('Status:', margin, y);
        doc.setFont('helvetica', 'normal');
        doc.text(payment.status, margin + 30, y);
        y += 7;

        if (payment.razorpayPaymentId) {
          doc.setFont('helvetica', 'bold');
          doc.text('Payment ID:', margin, y);
          doc.setFont('helvetica', 'normal');
          doc.text(payment.razorpayPaymentId, margin + 30, y);
        }
      }

      // Footer
      const footerY = doc.internal.pageSize.getHeight() - 15;
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Generated by ClickNsit on ${new Date().toLocaleDateString('en-IN')} | This is a computer-generated document`,
        margin,
        footerY
      );

      doc.save(`ClickNsit-${examTitle.replace(/\s+/g, '-')}-${applicantName.replace(/\s+/g, '-')}.pdf`);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Failed to generate PDF. Please try again.');
    }
    setIsGenerating(false);
  };

  return (
    <Button
      onClick={generatePdf}
      disabled={isGenerating}
      className="min-h-[44px] px-6"
      variant="outline"
    >
      {isGenerating ? (
        <>
          <FileText className="h-4 w-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </>
      )}
    </Button>
  );
}
