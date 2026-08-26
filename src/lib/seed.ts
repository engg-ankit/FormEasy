import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function seedDatabase() {
  try {
    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.upsert({
      where: { email: 'admin@clickandsit.in' },
      update: {},
      create: { name: 'Admin User', email: 'admin@clickandsit.in', passwordHash: adminPassword },
    });

    // Create exams
    const examsData = [
      { title: 'SSC CGL 2024', category: 'Government', officialFee: 10000, serviceFee: 5000, lastDate: new Date('2025-12-31'), requiredDocuments: JSON.stringify(['Aadhar Card', '10th Marksheet', '12th Marksheet', 'Passport Size Photo']), description: 'Staff Selection Commission Combined Graduate Level Examination for recruitment to various Group B and Group C posts in government departments.' },
      { title: 'Railway Group D 2024', category: 'Government', officialFee: 50000, serviceFee: 10000, lastDate: new Date('2025-11-30'), requiredDocuments: JSON.stringify(['Aadhar Card', '10th Marksheet', 'Caste Certificate', 'Passport Size Photo']), description: 'Railway Recruitment Board Group D examination for recruitment to various posts in Indian Railways.' },
      { title: 'Bank PO 2024', category: 'Banking', officialFee: 85000, serviceFee: 15000, lastDate: new Date('2025-10-31'), requiredDocuments: JSON.stringify(['Aadhar Card', 'Graduation Certificate', 'Passport Size Photo', 'Signature']), description: 'Probationary Officer examination for recruitment in public sector banks conducted by IBPS.' },
      { title: 'JEE Main 2025', category: 'College', officialFee: 100000, serviceFee: 20000, lastDate: new Date('2025-01-31'), requiredDocuments: JSON.stringify(['Aadhar Card', '10th Marksheet', '12th Marksheet', 'Passport Size Photo', 'Signature']), description: 'Joint Entrance Examination Main for admission to undergraduate engineering programs in NITs, IIITs, and other engineering colleges.' },
      { title: 'NEET 2025', category: 'College', officialFee: 160000, serviceFee: 25000, lastDate: new Date('2025-02-28'), requiredDocuments: JSON.stringify(['Aadhar Card', '12th Marksheet', 'Passport Size Photo', 'Signature']), description: 'National Eligibility cum Entrance Test for admission to MBBS/BDS courses in medical colleges across India.' },
      { title: 'UPSC CSE 2025', category: 'Government', officialFee: 10000, serviceFee: 5000, lastDate: new Date('2025-03-15'), requiredDocuments: JSON.stringify(['Aadhar Card', 'Graduation Certificate', 'Passport Size Photo', 'Signature']), description: 'Civil Services Examination for recruitment to IAS, IPS, IFS and other Central Services.' },
    ];

    for (const exam of examsData) {
      const existing = await prisma.exam.findFirst({ where: { title: exam.title } });
      if (!existing) {
        await prisma.exam.create({ data: { ...exam, isActive: true } });
      }
    }

    // Create coupons
    const coupons = [
      { code: 'FIRST10', discountType: 'PERCENT', discountValue: 10, expiryDate: new Date('2025-12-31'), usageLimit: 100 },
      { code: 'FLAT50', discountType: 'FLAT', discountValue: 5000, expiryDate: new Date('2025-06-30'), usageLimit: 50 },
    ];
    for (const coupon of coupons) {
      const existing = await prisma.coupon.findFirst({ where: { code: coupon.code } });
      if (!existing) {
        await prisma.coupon.create({ data: { ...coupon, usedCount: 0, isActive: true } });
      }
    }

    return { success: true, message: 'Database seeded successfully' };
  } catch (error) {
    console.error('Seed error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
