// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_ROUTES = ["/", "/login"];
const IGNORED_PREFIXES = ["/_next", "/api", "/static", "/favicon.ico"];

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Skip public or ignored routes
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.includes(".") // skip files (e.g., .png, .js, etc.)
  ) {
    return NextResponse.next();
  }

  // Check session cookie
  const session = request.cookies.get("session");

  if (!session?.value) {
    // Build login URL with redirect param
    const loginUrl = new URL("/login", request.url);
    const redirectPath = `${pathname}${search || ""}`; // preserve query string
    loginUrl.searchParams.set("redirect", redirectPath || "/");

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|static|.*\\..*).*)"], // apply only to non-public, non-static routes
};
