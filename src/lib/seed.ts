import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

/** All fees are in paise (₹1 = 100). */
interface ExamSeed {
  title: string;
  category: string;
  portalUrl: string;
  officialFee: number;
  serviceFee: number;
  lastDate: Date;
  requiredDocuments: string[];
  description: string;
}

const exam = (
  title: string,
  category: string,
  portalUrl: string,
  officialFee: number,
  serviceFee: number,
  lastDate: string,
  requiredDocuments: string[],
  description: string
): ExamSeed => ({
  title,
  category,
  portalUrl,
  officialFee,
  serviceFee,
  lastDate: new Date(lastDate),
  requiredDocuments,
  description,
});

/**
 * The form catalogue the site and the app show. Categories are derived from
 * these rows, so adding a category here is all that is needed for it to appear
 * in the web filter and the mobile chips.
 */
const examsData: ExamSeed[] = [
  // ── SSC & Central Government ──────────────────────────────
  exam('SSC CGL 2027', 'SSC & Central Govt', 'https://ssc.gov.in', 10000, 5000, '2027-01-20', ['Aadhar Card', 'Graduation Certificate', '10th Marksheet', 'Passport Size Photo', 'Signature'], 'Combined Graduate Level exam for Group B and C posts across central ministries.'),
  exam('SSC CHSL 2027', 'SSC & Central Govt', 'https://ssc.gov.in', 10000, 5000, '2027-02-10', ['Aadhar Card', '12th Marksheet', 'Passport Size Photo', 'Signature'], '10+2 level exam for LDC, DEO and postal assistant posts.'),
  exam('SSC MTS 2026', 'SSC & Central Govt', 'https://ssc.gov.in', 10000, 5000, '2026-12-15', ['Aadhar Card', '10th Marksheet', 'Passport Size Photo', 'Signature'], 'Multi-Tasking Staff recruitment for central government offices.'),

  // ── UPSC & State PSC ──────────────────────────────────────
  exam('UPSC Civil Services 2027', 'UPSC & State PSC', 'https://upsconline.nic.in', 10000, 5000, '2027-02-05', ['Aadhar Card', 'Graduation Certificate', 'Passport Size Photo', 'Signature'], 'IAS, IPS, IFS and other central services through Prelims, Mains and Interview.'),
  exam('UPPSC PCS 2027', 'UPSC & State PSC', 'https://uppsc.up.nic.in', 12500, 5000, '2027-01-15', ['Aadhar Card', 'Graduation Certificate', 'Passport Size Photo'], 'Uttar Pradesh Provincial Civil Services for SDM, DSP and allied posts.'),
  exam('BPSC 72nd Combined 2027', 'UPSC & State PSC', 'https://bpsc.bihar.gov.in', 6000, 4000, '2027-03-01', ['Aadhar Card', 'Graduation Certificate', 'Passport Size Photo', 'Signature'], 'Bihar Public Service Commission combined competitive examination.'),

  // ── Banking & Insurance ───────────────────────────────────
  exam('IBPS PO 2027', 'Banking & Insurance', 'https://ibps.in', 85000, 15000, '2027-01-30', ['Aadhar Card', 'Graduation Certificate', 'Passport Size Photo', 'Signature'], 'Probationary Officer recruitment across public sector banks.'),
  exam('SBI Clerk 2027', 'Banking & Insurance', 'https://sbi.co.in/careers', 75000, 15000, '2027-02-20', ['Aadhar Card', 'Graduation Certificate', 'Passport Size Photo'], 'Junior Associate (customer support and sales) in State Bank of India.'),
  exam('LIC AAO 2027', 'Banking & Insurance', 'https://licindia.in', 70000, 12000, '2027-03-10', ['Aadhar Card', 'Graduation Certificate', 'Passport Size Photo', 'Signature'], 'Assistant Administrative Officer recruitment in Life Insurance Corporation.'),

  // ── Railway ───────────────────────────────────────────────
  exam('RRB NTPC 2027', 'Railway', 'https://rrbcdg.gov.in', 50000, 10000, '2027-01-25', ['Aadhar Card', '12th Marksheet', 'Passport Size Photo', 'Signature'], 'Non-Technical Popular Categories posts such as clerk, goods guard and station master.'),
  exam('RRB Group D 2027', 'Railway', 'https://rrbcdg.gov.in', 50000, 10000, '2027-02-28', ['Aadhar Card', '10th Marksheet', 'Passport Size Photo', 'Signature'], 'Level 1 posts in Indian Railways including track maintainer and helper.'),
  exam('RRB ALP 2027', 'Railway', 'https://rrbcdg.gov.in', 50000, 10000, '2027-04-05', ['Aadhar Card', '10th Marksheet', 'ITI Certificate', 'Passport Size Photo'], 'Assistant Loco Pilot recruitment for railway loco sheds.'),

  // ── Police & Defence ──────────────────────────────────────
  exam('UP Police Constable 2027', 'Police & Defence', 'https://uppbpb.gov.in', 40000, 10000, '2027-01-18', ['Aadhar Card', '12th Marksheet', 'Domicile Certificate', 'Passport Size Photo'], 'Uttar Pradesh Police constable recruitment with physical and written tests.'),
  exam('SSC GD Constable 2027', 'Police & Defence', 'https://ssc.gov.in', 10000, 5000, '2027-02-12', ['Aadhar Card', '10th Marksheet', 'Passport Size Photo', 'Signature'], 'General Duty constable posts in central armed police forces.'),
  exam('NDA 2027', 'Police & Defence', 'https://upsconline.nic.in', 10000, 5000, '2027-01-10', ['Aadhar Card', '12th Marksheet', 'Passport Size Photo', 'Signature'], 'National Defence Academy entry for Army, Navy and Air Force cadets.'),

  // ── Teaching ──────────────────────────────────────────────
  exam('CTET 2027', 'Teaching', 'https://ctet.nic.in', 100000, 15000, '2027-03-05', ['Aadhar Card', 'Graduation Certificate', 'B.Ed Certificate', 'Passport Size Photo'], 'Central Teacher Eligibility Test for classes I to VIII.'),
  exam('UPTET 2027', 'Teaching', 'https://updeled.gov.in', 60000, 12000, '2027-02-15', ['Aadhar Card', 'Graduation Certificate', 'B.Ed Certificate', 'Passport Size Photo'], 'Uttar Pradesh Teacher Eligibility Test for primary and upper primary levels.'),
  exam('KVS TGT / PGT 2027', 'Teaching', 'https://kvsangathan.nic.in', 100000, 15000, '2027-04-10', ['Aadhar Card', 'Post Graduation Certificate', 'B.Ed Certificate', 'Passport Size Photo'], 'Kendriya Vidyalaya Sangathan teaching and non-teaching posts.'),

  // ── Engineering Entrance ──────────────────────────────────
  exam('JEE Main 2027', 'Engineering Entrance', 'https://jeemain.nta.nic.in', 100000, 20000, '2027-01-05', ['Aadhar Card', '10th Marksheet', '12th Marksheet', 'Passport Size Photo', 'Signature'], 'Entrance test for B.Tech admission to NITs, IIITs and other engineering colleges.'),
  exam('JEE Advanced 2027', 'Engineering Entrance', 'https://jeeadv.ac.in', 320000, 25000, '2027-05-05', ['Aadhar Card', '12th Marksheet', 'Passport Size Photo', 'Signature'], 'Gateway to the Indian Institutes of Technology.'),
  exam('GATE 2027', 'Engineering Entrance', 'https://gate.iitk.ac.in', 180000, 20000, '2027-04-20', ['Aadhar Card', 'Graduation Certificate', 'Passport Size Photo', 'Signature'], 'Graduate Aptitude Test in Engineering for PG admission and PSU jobs.'),

  // ── Medical Entrance ──────────────────────────────────────
  exam('NEET UG 2027', 'Medical Entrance', 'https://neet.nta.nic.in', 160000, 25000, '2027-03-15', ['Aadhar Card', '12th Marksheet', 'Passport Size Photo', 'Signature'], 'Single entrance test for MBBS, BDS, BAMS and allied medical courses.'),
  exam('NEET PG 2027', 'Medical Entrance', 'https://nbe.edu.in', 375000, 25000, '2027-04-25', ['Aadhar Card', 'MBBS Certificate', 'Internship Certificate', 'Passport Size Photo'], 'Postgraduate medical admission for MD, MS and diploma courses.'),
  exam('NEET MDS 2027', 'Medical Entrance', 'https://nbe.edu.in', 350000, 25000, '2027-02-18', ['Aadhar Card', 'BDS Certificate', 'Passport Size Photo'], 'Postgraduate dental admission for MDS courses.'),

  // ── University & Scholarship ──────────────────────────────
  exam('CCSU Examination Form 2027', 'University & Scholarship', 'https://ccsuniversity.ac.in', 120000, 15000, '2027-02-25', ['Aadhar Card', 'Last Semester Marksheet', 'Passport Size Photo', 'Signature'], 'Chaudhary Charan Singh University semester examination form for regular and private students.'),
  exam('DU Admission 2027', 'University & Scholarship', 'https://admission.uod.ac.in', 25000, 5000, '2027-06-15', ['Aadhar Card', '12th Marksheet', 'Passport Size Photo'], 'Delhi University undergraduate admission through CUET scores.'),
  exam('NSP Scholarship 2026-27', 'University & Scholarship', 'https://scholarships.gov.in', 0, 3000, '2026-12-31', ['Aadhar Card', 'Income Certificate', 'Bank Passbook', 'Passport Size Photo'], 'National Scholarship Portal schemes for SC, ST, OBC and minority students.'),

  // ── Certificates & Services ───────────────────────────────
  exam('Police Clearance Certificate (PCC)', 'Certificates & Services', 'https://passportindia.gov.in', 0, 5000, '2027-12-31', ['Aadhar Card', 'Passport', 'Passport Size Photo'], 'PCC application for visa, employment or immigration purposes.'),
  exam('Passport Application (Fresh)', 'Certificates & Services', 'https://passportindia.gov.in', 150000, 5000, '2027-12-31', ['Aadhar Card', '10th Marksheet', 'Birth Certificate', 'Passport Size Photo'], 'Fresh Indian passport application with police verification.'),
  exam('PAN Card Correction', 'Certificates & Services', 'https://www.onlineservices.nsdl.com', 10700, 3000, '2027-12-31', ['Aadhar Card', 'Existing PAN Copy', 'Passport Size Photo'], 'Correction or reprint request for an existing PAN card.'),
];

export async function seedDatabase() {
  try {
    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    await prisma.admin.upsert({
      where: { email: 'admin@clickandsit.in' },
      update: {},
      create: { name: 'Admin User', email: 'admin@clickandsit.in', passwordHash: adminPassword },
    });

    // Create exams (idempotent by title)
    let created = 0;
    for (const entry of examsData) {
      const existing = await prisma.exam.findFirst({ where: { title: entry.title } });
      if (!existing) {
        await prisma.exam.create({
          data: {
            ...entry,
            requiredDocuments: JSON.stringify(entry.requiredDocuments),
            isActive: true,
          },
        });
        created++;
      }
    }

    // Hide forms whose deadline has passed so expired listings don't look open.
    const deactivated = await prisma.exam.updateMany({
      where: { lastDate: { lt: new Date() }, isActive: true },
      data: { isActive: false },
    });

    // Create coupons
    const coupons = [
      { code: 'FIRST10', discountType: 'PERCENT', discountValue: 10, expiryDate: new Date('2027-12-31'), usageLimit: 100 },
      { code: 'FLAT50', discountType: 'FLAT', discountValue: 5000, expiryDate: new Date('2027-12-31'), usageLimit: 50 },
    ];
    for (const coupon of coupons) {
      const existing = await prisma.coupon.findFirst({ where: { code: coupon.code } });
      if (!existing) {
        await prisma.coupon.create({ data: { ...coupon, usedCount: 0, isActive: true } });
      }
    }

    return {
      success: true,
      message: `Database seeded successfully — ${created} new forms, ${deactivated.count} expired forms hidden`,
    };
  } catch (error) {
    console.error('Seed error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
