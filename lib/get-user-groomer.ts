import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

interface GroomerInfo {
  id: string;
  name: string;
}

/**
 * Get the groomer associated with the current user.
 *
 * Priority:
 * 1. User's linked groomerId (if set in session)
 * 2. Groomer with matching email
 * 3. First active groomer (fallback for admins/legacy accounts)
 *
 * Returns null if no groomer found.
 */
export async function getUserGroomer(): Promise<GroomerInfo | null> {
  const session = await auth();

  if (!session?.user?.accountId) {
    return null;
  }

  const accountId = session.user.accountId;
  const userEmail = session.user.email;
  const linkedGroomerId = session.user.groomerId;

  // 1. If user has a linked groomerId, use that
  if (linkedGroomerId) {
    const groomer = await prisma.groomer.findUnique({
      where: { id: linkedGroomerId },
      select: { id: true, name: true, isActive: true },
    });

    if (groomer?.isActive) {
      return { id: groomer.id, name: groomer.name };
    }
  }

  // 2. Try to find groomer by matching email
  if (userEmail) {
    const groomerByEmail = await prisma.groomer.findFirst({
      where: {
        accountId,
        email: userEmail,
        isActive: true,
      },
      select: { id: true, name: true },
    });

    if (groomerByEmail) {
      // Auto-link this groomer to the user for future requests
      await prisma.user.update({
        where: { id: session.user.id },
        data: { groomerId: groomerByEmail.id },
      });

      return groomerByEmail;
    }
  }

  // 3. Fallback: first active groomer (for admins or legacy accounts)
  // This maintains backwards compatibility
  const firstGroomer = await prisma.groomer.findFirst({
    where: { accountId, isActive: true },
    select: { id: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  return firstGroomer;
}

/**
 * Get just the groomer ID for the current user.
 * Useful when you only need the ID for filtering.
 */
export async function getUserGroomerId(): Promise<string | null> {
  const groomer = await getUserGroomer();
  return groomer?.id ?? null;
}
