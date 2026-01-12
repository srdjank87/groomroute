import { NextRequest, NextResponse } from "next/server";
import { verifyAdminPassword, getAdminCookieConfig, getClearAdminCookieConfig } from "@/lib/admin-auth";

/**
 * POST /api/admin/login
 * Authenticate admin user with password
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json(
        { error: "Invalid password" },
        { status: 401 }
      );
    }

    // Create response with success
    const response = NextResponse.json({ success: true });

    // Set the admin session cookie
    const cookieConfig = getAdminCookieConfig();
    response.cookies.set(
      cookieConfig.name,
      cookieConfig.value,
      {
        httpOnly: cookieConfig.httpOnly,
        secure: cookieConfig.secure,
        sameSite: cookieConfig.sameSite,
        maxAge: cookieConfig.maxAge,
        path: cookieConfig.path,
      }
    );

    return response;
  } catch (error) {
    console.error("Admin login error:", error);
    return NextResponse.json(
      { error: "Login failed" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/login
 * Logout admin user
 */
export async function DELETE() {
  const response = NextResponse.json({ success: true });

  // Clear the admin session cookie
  const cookieConfig = getClearAdminCookieConfig();
  response.cookies.set(
    cookieConfig.name,
    cookieConfig.value,
    {
      httpOnly: cookieConfig.httpOnly,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite,
      maxAge: cookieConfig.maxAge,
      path: cookieConfig.path,
    }
  );

  return response;
}
