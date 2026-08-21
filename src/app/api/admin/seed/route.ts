import { NextResponse } from 'next/server';
import { seedDatabase } from '@/lib/seed';
import { getAdminSession } from '@/lib/admin-auth';

// POST /api/admin/seed — seed the production database
export async function POST() {
  try {
    const admin = await getAdminSession();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await seedDatabase();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Seed API error:', error);
    return NextResponse.json({ error: 'Seed failed' }, { status: 500 });
  }
}
