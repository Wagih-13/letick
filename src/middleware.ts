import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { siteConfig } from "@/config/site";
import { auth } from "@/auth";

/**
 * Middleware configuration
 */
export const config = {
  matcher: [
    "/api/:path*",
    "/dashboard/:path*",
  ],
};

/**
 * Lightweight middleware: Only CORS handling for API routes.
 * Route protection is handled in server components/layouts using `auth()`.
 */
export default async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  // 1) API: CORS preflight/headers
  if (nextUrl.pathname.startsWith("/api")) {
    const response = NextResponse.next();
    response.headers.set("Access-Control-Allow-Origin", process.env.ALLOWED_ORIGIN || "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    response.headers.set("Access-Control-Max-Age", "86400");

    if (req.method === "OPTIONS") {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }

    return response;
  }

  // 2) Optional admin subdomain support: admin.yourdomain.com -> /dashboard
  const host = req.headers.get("host") || "";
  const adminSub = siteConfig.adminSubdomain;
  const isAdminSubdomain = host.startsWith(`${adminSub}.`);
  if (isAdminSubdomain) {
    // Ensure all admin-subdomain requests resolve under /dashboard
    if (!nextUrl.pathname.startsWith("/dashboard")) {
      const url = new URL(`/dashboard${nextUrl.pathname}`, nextUrl);
      url.search = nextUrl.search;
      return NextResponse.rewrite(url);
    }
  }

  // 3) Protect admin routes (/dashboard) – role-based check via NextAuth session
  if (nextUrl.pathname.startsWith("/dashboard")) {
    const session = await auth();
    const login = siteConfig.routes?.login || "/login-v2";

    if (!session?.user) {
      const redirectUrl = new URL(login, nextUrl);
      redirectUrl.searchParams.set("callbackUrl", nextUrl.toString());
      return NextResponse.redirect(redirectUrl);
    }

    const roles = ((session.user as any)?.roles as string[] | undefined) ?? [];
    const isAdmin = roles.includes("admin") || roles.includes("super_admin");
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
  }

  return NextResponse.next();
}
