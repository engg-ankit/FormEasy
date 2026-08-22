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

  // Create sample exams
  const examsData = [
    { title: 'SSC CGL 2024', category: 'Government', officialFee: 10000, serviceFee: 5000, lastDate: new Date('2025-12-31'), requiredDocuments: JSON.stringify(['Aadhar Card', '10th Marksheet', '12th Marksheet', 'Passport Size Photo']), description: 'Staff Selection Commission Combined Graduate Level Examination for recruitment to various Group B and Group C posts in government departments.' },
    { title: 'Railway Group D 2024', category: 'Government', officialFee: 50000, serviceFee: 10000, lastDate: new Date('2025-11-30'), requiredDocuments: JSON.stringify(['Aadhar Card', '10th Marksheet', 'Caste Certificate', 'Passport Size Photo']), description: 'Railway Recruitment Board Group D examination for recruitment to various posts in Indian Railways.' },
    { title: 'Bank PO 2024', category: 'Banking', officialFee: 85000, serviceFee: 15000, lastDate: new Date('2025-10-31'), requiredDocuments: JSON.stringify(['Aadhar Card', 'Graduation Certificate', 'Passport Size Photo', 'Signature']), description: 'Probationary Officer examination for recruitment in public sector banks conducted by IBPS.' },
    { title: 'JEE Main 2025', category: 'College', officialFee: 100000, serviceFee: 20000, lastDate: new Date('2025-01-31'), requiredDocuments: JSON.stringify(['Aadhar Card', '10th Marksheet', '12th Marksheet', 'Passport Size Photo', 'Signature']), description: 'Joint Entrance Examination Main for admission to undergraduate engineering programs in NITs, IIITs, and other engineering colleges.' },
    { title: 'NEET 2025', category: 'College', officialFee: 160000, serviceFee: 25000, lastDate: new Date('2025-02-28'), requiredDocuments: JSON.stringify(['Aadhar Card', '12th Marksheet', 'Passport Size Photo', 'Signature']), description: 'National Eligibility cum Entrance Test for admission to MBBS/BDS courses in medical colleges across India.' },
    { title: 'UPSC CSE 2025', category: 'Government', officialFee: 10000, serviceFee: 5000, lastDate: new Date('2025-03-15'), requiredDocuments: JSON.stringify(['Aadhar Card', 'Graduation Certificate', 'Passport Size Photo', 'Signature']), description: 'Civil Services Examination for recruitment to IAS, IPS, IFS and other Central Services.' },
  ];

  for (const exam of examsData) {
    await prisma.exam.upsert({
      where: { id: exam.title },
      update: {},
      create: { ...exam, isActive: true },
    }).catch(async () => {
      // If upsert by title fails (since id is cuid, not title), try findFirst
      const existing = await prisma.exam.findFirst({ where: { title: exam.title } });
      if (!existing) {
        await prisma.exam.create({ data: { ...exam, isActive: true } });
      }
    });
  }

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