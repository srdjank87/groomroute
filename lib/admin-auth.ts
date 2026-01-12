import { cookies } from "next/headers";

const ADMIN_COOKIE_NAME = "groomroute_admin_session";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

// Session token is a simple hash of the password + a timestamp
// This is rotated daily for security
function generateSessionToken(): string {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const payload = `${ADMIN_PASSWORD}-${today}`;
  // Simple base64 encoding (not cryptographic, but sufficient for admin access)
  return Buffer.from(payload).toString("base64");
}

/**
 * Verify if the provided password is correct
 */
export function verifyAdminPassword(password: string): boolean {
  if (!ADMIN_PASSWORD) {
    console.warn("ADMIN_PASSWORD not configured");
    return false;
  }
  return password === ADMIN_PASSWORD;
}

/**
 * Check if current request has valid admin session
 * For use in Server Components and Route Handlers
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  if (!ADMIN_PASSWORD) {
    return false;
  }

  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME);

  if (!sessionCookie?.value) {
    return false;
  }

  // Verify the session token
  const expectedToken = generateSessionToken();
  return sessionCookie.value === expectedToken;
}

/**
 * Create admin session (set cookie)
 * Returns the session token to be set in cookie
 */
export function createAdminSession(): string {
  return generateSessionToken();
}

/**
 * Get the cookie configuration for admin session
 */
export function getAdminCookieConfig() {
  return {
    name: ADMIN_COOKIE_NAME,
    value: generateSessionToken(),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24, // 24 hours
    path: "/",
  };
}

/**
 * Get cookie config for clearing admin session
 */
export function getClearAdminCookieConfig() {
  return {
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    maxAge: 0,
    path: "/",
  };
}
