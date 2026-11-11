/**
 * Set (or generate) an admin password from the terminal.
 *
 *   npm run admin:password -- admin@clickandsit.in
 *   npm run admin:password -- admin@clickandsit.in "my-new-strong-password"
 *
 * With no password argument a random one is generated and printed once.
 */
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { prisma } from '../src/lib/prisma';

const MIN_LENGTH = 10;

async function main() {
  const [email, provided] = process.argv.slice(2);

  if (!email) {
    console.error('Usage: npm run admin:password -- <admin-email> [new-password]');
    process.exit(1);
  }

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) {
    console.error(`No admin found with email ${email}`);
    process.exit(1);
  }

  if (provided && provided.length < MIN_LENGTH) {
    console.error(`Password must be at least ${MIN_LENGTH} characters`);
    process.exit(1);
  }

  const password = provided || crypto.randomBytes(12).toString('base64url');

  await prisma.admin.update({
    where: { id: admin.id },
    data: { passwordHash: await bcrypt.hash(password, 10) },
  });

  console.log(`Password updated for ${email}`);
  if (!provided) {
    console.log(`Generated password (shown once, save it now): ${password}`);
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
