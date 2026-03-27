
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { ratelimiter } from "./app/lib/rate-limiter";
import { ipAddress } from "@vercel/functions";
import { v4 as uuidv4 } from "uuid";

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";

  // ================================================================
  // 1. BYPASS LOGIC (CRITICAL FIX FOR LOOPS)
  // ================================================================
  // 🔥 Ab hum saari /api requests ko bypass kar rahe hain taake background
  // pulse/API calls ki wajah se session reset na ho!
  if (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // ================================================================
  // 2. IDENTITY & SOURCE DETECTION
  // ================================================================

  // ✅ TS FIX: Explicitly typed as string with a fallback ""
  let visitorId: string = req.cookies.get("pv_visitor_id")?.value || "";
  if (!visitorId) {
    visitorId = uuidv4();
  }

  const urlSource = searchParams.get("utm_source");
  const cookieSource = req.cookies.get("utm_source")?.value;

  // ✅ TS FIX: Explicitly typed as string with a fallback ""
  let sessionId: string = req.cookies.get("pv_session_id")?.value || "";

  /**
   * 🛡️ THE TRIPLE-GUARD RESET LOGIC:
   */
  let shouldResetSession = false;

  if (!sessionId) {
    shouldResetSession = true;
  } else if (urlSource && urlSource !== cookieSource) {
    shouldResetSession = true; // User clicked a DIFFERENT marketing link
  } else if (!urlSource && cookieSource && cookieSource !== "Direct") {
    shouldResetSession = true; // User came back Direct after an Ad
  }

  if (shouldResetSession) {
    sessionId = uuidv4(); // Generate fresh session
  }

  // ================================================================
  // 3. HEADER CLONING
  // ================================================================
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pv-visitor-id", visitorId);
  requestHeaders.set("x-pv-session-id", sessionId);

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  // ================================================================
  // 4. COOKIE MANAGEMENT
  // ================================================================
  const cookieConfig = { httpOnly: true, path: "/", sameSite: "lax" as const };

  // ✅ TS FIX: sessionId and visitorId are now strictly strings
  res.cookies.set("pv_visitor_id", visitorId, {
    ...cookieConfig,
    maxAge: 60 * 60 * 24 * 30,
  });
  res.cookies.set("pv_session_id", sessionId, {
    ...cookieConfig,
    maxAge: 60 * 60 * 24,
  });

  if (urlSource) {
    res.cookies.set("utm_source", urlSource, {
      ...cookieConfig,
      maxAge: 60 * 60 * 24,
    });
    res.cookies.set(
      "utm_medium",
      searchParams.get("utm_medium") || "none",
      cookieConfig,
    );
    res.cookies.set(
      "utm_campaign",
      searchParams.get("utm_campaign") || "none",
      cookieConfig,
    );
  } else if (shouldResetSession || !cookieSource) {
    res.cookies.set("utm_source", "Direct", cookieConfig);
    res.cookies.set("utm_medium", "None", cookieConfig);
    res.cookies.set("utm_campaign", "None", cookieConfig);
  }

  // ================================================================
  // 5. SECURITY & AUTH GUARD
  // ================================================================
  const isProduction = process.env.NODE_ENV === "production";
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName: isProduction
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token",
  });

  const protectedRoutes = ["/account", "/wishlist", "/checkout"];
  if (protectedRoutes.some((route) => pathname.startsWith(route)) && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const sensitivePostRoutes = [
    "/api/auth/register",
    "/api/auth/callback/credentials",
  ];
  if (
    req.method === "POST" &&
    sensitivePostRoutes.some((route) => pathname.startsWith(route))
  ) {
    const ip = ipAddress(req) || "127.0.0.1";
    try {
      const { success } = await ratelimiter.limit(ip);
      if (!success)
        return NextResponse.json(
          { error: "Too Many Requests" },
          { status: 429 },
        );
    } catch (e) {
      console.error("Rate limit failed");
    }
  }

  res.headers.set("x-pv-is-converted", !!token ? "true" : "false");
  res.headers.set("x-pv-user-agent", userAgent);

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
