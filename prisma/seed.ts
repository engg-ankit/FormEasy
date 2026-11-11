/**
 * CLI entry point for seeding.
 *
 * The seed data lives in `src/lib/seed.ts` so the same logic powers both this
 * script (`npm run seed`) and the authenticated `POST /api/admin/seed` route.
 */
import { seedDatabase } from '../src/lib/seed';

async function main() {
  const result = await seedDatabase();

  if (!result.success) {
    console.error('Seed failed:', result.error);
    process.exit(1);
  }

  console.log(result.message);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
