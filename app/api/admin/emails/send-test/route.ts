import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { sendWelcomeEmail, sendTeamInviteEmail, sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    // Check admin authentication
    const isAuthenticated = await isAdminAuthenticated();
    if (!isAuthenticated) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { template, email } = body as { template: string; email: string };

    if (!email || !template) {
      return NextResponse.json(
        { error: "Email and template are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    let result;

    switch (template) {
      case "welcome":
        result = await sendWelcomeEmail(
          email,
          "John Smith", // Sample name
          "Growth",     // Sample plan
          14            // Sample trial days
        );
        break;

      case "team-invite":
        result = await sendTeamInviteEmail(
          email,
          "Jane Doe",           // Sample inviter
          "Pawsome Groomers",   // Sample business
          "GROOMER",            // Sample role
          "test-token-preview"  // Sample token (won't work for actual signup)
        );
        break;

      case "password-reset":
        result = await sendPasswordResetEmail(
          email,
          "John Smith",           // Sample name
          "test-reset-token-123"  // Sample token (won't work for actual reset)
        );
        break;

      default:
        return NextResponse.json(
          { error: "Unknown template" },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `Test email sent to ${email}`,
      });
    } else {
      return NextResponse.json(
        { error: "Failed to send email. Check server logs." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Send test email error:", error);
    return NextResponse.json(
      { error: "Failed to send test email" },
      { status: 500 }
    );
  }
}
