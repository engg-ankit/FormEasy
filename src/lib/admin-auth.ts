import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('admin_session')?.value;

  if (!sessionToken) {
    return null;
  }

  try {
    const decoded = Buffer.from(sessionToken, 'base64').toString('utf-8');
    const [adminId] = decoded.split(':');

    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });

    return admin;
  } catch (error) {
    return null;
  }
}

export async function requireAdminAuth() {
  const admin = await getAdminSession();
  if (!admin) {
    throw new Error('Unauthorized');
  }
  return admin;
}