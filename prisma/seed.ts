import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.admin.upsert({
    where: { email: 'admin@formeasy.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@formeasy.com',
      passwordHash: adminPassword,
    },
  });

  // Create staff users
  const staffPassword = await bcrypt.hash('staff123', 10);
  const staff1 = await prisma.staff.upsert({
    where: { mobile: '9876543210' },
    update: {},
    create: {
      name: 'Raj Kumar',
      email: 'raj@formeasy.com',
      mobile: '9876543210',
      role: 'FORM_FILLER',
      passwordHash: staffPassword,
    },
  });

  const staff2 = await prisma.staff.upsert({
    where: { mobile: '9876543211' },
    update: {},
    create: {
      name: 'Priya Singh',
      email: 'priya@formeasy.com',
      mobile: '9876543211',
      role: 'VERIFIER',
      passwordHash: staffPassword,
    },
  });

  // Create sample exams
  const exam1 = await prisma.exam.create({
    data: {
      title: 'SSC CGL 2024',
      category: 'Government',
      officialFee: 10000, // ₹100 in paise
      serviceFee: 5000, // ₹50 in paise
      lastDate: new Date('2024-12-31'),
      requiredDocuments: '["Aadhar Card", "10th Marksheet", "12th Marksheet", "Passport Size Photo"]',
      description: 'Staff Selection Commission Combined Graduate Level Examination for recruitment to various Group B and Group C posts in government departments.',
      isActive: true,
    },
  });

  const exam2 = await prisma.exam.create({
    data: {
      title: 'Railway Group D 2024',
      category: 'Government',
      officialFee: 50000, // ₹500 in paise
      serviceFee: 10000, // ₹100 in paise
      lastDate: new Date('2024-11-30'),
      requiredDocuments: '["Aadhar Card", "10th Marksheet", "Caste Certificate", "Passport Size Photo"]',
      description: 'Railway Recruitment Board Group D examination for recruitment to various posts in Indian Railways.',
      isActive: true,
    },
  });

  const exam3 = await prisma.exam.create({
    data: {
      title: 'Bank PO 2024',
      category: 'Banking',
      officialFee: 85000, // ₹850 in paise
      serviceFee: 15000, // ₹150 in paise
      lastDate: new Date('2024-10-31'),
      requiredDocuments: '["Aadhar Card", "Graduation Certificate", "Passport Size Photo", "Signature"]',
      description: 'Probationary Officer examination for recruitment in public sector banks conducted by IBPS.',
      isActive: true,
    },
  });

  const exam4 = await prisma.exam.create({
    data: {
      title: 'JEE Main 2025',
      category: 'College',
      officialFee: 100000, // ₹1000 in paise
      serviceFee: 20000, // ₹200 in paise
      lastDate: new Date('2025-01-31'),
      requiredDocuments: '["Aadhar Card", "10th Marksheet", "12th Marksheet", "Passport Size Photo", "Signature"]',
      description: 'Joint Entrance Examination Main for admission to undergraduate engineering programs in NITs, IIITs, and other engineering colleges.',
      isActive: true,
    },
  });

  // Create sample coupons
  const coupon1 = await prisma.coupon.create({
    data: {
      code: 'FIRST10',
      discountType: 'PERCENT',
      discountValue: 10,
      expiryDate: new Date('2025-12-31'),
      usageLimit: 100,
      usedCount: 0,
      isActive: true,
    },
  });

  const coupon2 = await prisma.coupon.create({
    data: {
      code: 'FLAT50',
      discountType: 'FLAT',
      discountValue: 5000, // ₹50 in paise
      expiryDate: new Date('2025-06-30'),
      usageLimit: 50,
      usedCount: 0,
      isActive: true,
    },
  });

  console.log('Database seeded successfully!');
  console.log('Admin: admin@formeasy.com / admin123');
  console.log('Staff: 9876543210, 9876543211');
  console.log('Coupons: FIRST10, FLAT50');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });