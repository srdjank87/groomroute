import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { trackServerEvent } from "@/lib/posthog-server";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user?.accountId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accountId = session.user.accountId;

    // Check if already recorded
    const account = await prisma.account.findUnique({
      where: { id: accountId },
      select: { pwaInstalledAt: true },
    });

    if (account?.pwaInstalledAt) {
      // Already recorded, just return success
      return NextResponse.json({ success: true, alreadyRecorded: true });
    }

    // Record the installation
    await prisma.account.update({
      where: { id: accountId },
      data: { pwaInstalledAt: new Date() },
    });

    // Track in PostHog
    trackServerEvent(session.user.id, "pwa_installed", { accountId });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking PWA install:", error);
    return NextResponse.json(
      { error: "Failed to track installation" },
      { status: 500 }
    );
  }
}
