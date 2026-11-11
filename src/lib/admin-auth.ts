import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { ADMIN_COOKIE, verifyAdminSessionToken } from '@/lib/admin-session';

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;

  if (!token) return null;

  // Signature + expiry are checked before the id is trusted at all.
  const adminId = verifyAdminSessionToken(token);
  if (!adminId) return null;

  try {
    return await prisma.admin.findUnique({ where: { id: adminId } });
  } catch {
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
