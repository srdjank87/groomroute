/**
 * Client-side helper to capture Facebook browser data for CAPI
 * This improves Event Match Quality by providing fbc, fbp, and user agent
 */

// Get cookie value by name
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
}

// Get fbclid from URL (Facebook Click ID from ad clicks)
function getFbclidFromUrl(): string | null {
  if (typeof window === "undefined") return null;
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get("fbclid");
}

// Generate fbc cookie value if we have fbclid but no cookie
function generateFbc(fbclid: string): string {
  const timestamp = Math.floor(Date.now() / 1000);
  return `fb.1.${timestamp}.${fbclid}`;
}

export interface FBBrowserData {
  fbc: string | null; // Facebook Click ID cookie
  fbp: string | null; // Facebook Browser ID cookie
  userAgent: string | null;
}

/**
 * Capture Facebook browser data for CAPI event matching
 * Call this on the client side and pass to your API
 */
export function captureFBBrowserData(): FBBrowserData {
  // Get fbc cookie (set when user clicks FB ad)
  let fbc = getCookie("_fbc");

  // If no fbc cookie but we have fbclid in URL, generate fbc value
  if (!fbc) {
    const fbclid = getFbclidFromUrl();
    if (fbclid) {
      fbc = generateFbc(fbclid);
      // Optionally store it in a cookie for future use
      if (typeof document !== "undefined") {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 90); // 90 days
        document.cookie = `_fbc=${fbc}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
      }
    }
  }

  // Get fbp cookie (set by Facebook Pixel)
  const fbp = getCookie("_fbp");

  // Get user agent
  const userAgent = typeof navigator !== "undefined" ? navigator.userAgent : null;

  return {
    fbc,
    fbp,
    userAgent,
  };
}

/**
 * Store FB browser data in sessionStorage for later use
 * (e.g., to pass through Stripe checkout)
 */
export function storeFBBrowserData(): void {
  if (typeof sessionStorage === "undefined") return;
  const data = captureFBBrowserData();
  sessionStorage.setItem("fb_browser_data", JSON.stringify(data));
}

/**
 * Retrieve stored FB browser data from sessionStorage
 */
export function getStoredFBBrowserData(): FBBrowserData | null {
  if (typeof sessionStorage === "undefined") return null;
  const stored = sessionStorage.getItem("fb_browser_data");
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}
