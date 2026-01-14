/**
 * One-time script to link existing users to their groomer profiles by email match.
 *
 * Run with: npx tsx scripts/link-users-to-groomers.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Load env
import dotenv from "dotenv";
dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function linkUsersToGroomers() {
  console.log("Starting user-groomer linking...\n");

  // Get all users without a groomerId set
  const usersWithoutGroomer = await prisma.user.findMany({
    where: {
      groomerId: null,
    },
    select: {
      id: true,
      email: true,
      name: true,
      accountId: true,
    },
  });

  console.log(`Found ${usersWithoutGroomer.length} users without linked groomers\n`);

  let linked = 0;
  let notFound = 0;

  for (const user of usersWithoutGroomer) {
    // Try to find a groomer with matching email in the same account
    const groomer = await prisma.groomer.findFirst({
      where: {
        accountId: user.accountId,
        email: user.email,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (groomer) {
      // Link the user to this groomer
      await prisma.user.update({
        where: { id: user.id },
        data: { groomerId: groomer.id },
      });
      console.log(`✓ Linked user "${user.name || user.email}" -> groomer "${groomer.name}"`);
      linked++;
    } else {
      // No matching groomer found by email, try to find first groomer in account
      // (for solo accounts where the user might have a different email than the groomer)
      const firstGroomer = await prisma.groomer.findFirst({
        where: {
          accountId: user.accountId,
          isActive: true,
        },
        orderBy: {
          createdAt: "asc",
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      // Only auto-link if there's exactly one groomer in the account
      const groomerCount = await prisma.groomer.count({
        where: {
          accountId: user.accountId,
          isActive: true,
        },
      });

      if (firstGroomer && groomerCount === 1) {
        await prisma.user.update({
          where: { id: user.id },
          data: { groomerId: firstGroomer.id },
        });
        console.log(`✓ Linked user "${user.name || user.email}" -> solo groomer "${firstGroomer.name}" (single groomer account)`);
        linked++;
      } else if (groomerCount > 1) {
        console.log(`⚠ User "${user.name || user.email}" has ${groomerCount} groomers in account - manual linking required`);
        notFound++;
      } else {
        console.log(`✗ No groomer found for user "${user.name || user.email}"`);
        notFound++;
      }
    }
  }

  console.log(`\n========================================`);
  console.log(`Summary:`);
  console.log(`  Linked: ${linked}`);
  console.log(`  Not found / needs manual: ${notFound}`);
  console.log(`========================================\n`);
}

linkUsersToGroomers()
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
