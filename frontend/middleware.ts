// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_ROUTES = ["/", "/login"]
const IGNORED_PREFIXES = ["/_next", "/api", "/static", "/favicon.ico"]

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  if (
    IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.includes(".") ||
    PUBLIC_ROUTES.includes(pathname)
  ) {
    return NextResponse.next()
  }

  const session = request.cookies.get("session")

  if (!session?.value) {
    const loginUrl = new URL("/login", request.url)
    const redirect = `${pathname}${search || ""}` // keep query string too
    loginUrl.searchParams.set("redirect", redirect || "/")
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  // ignore static/assets and api; also ignore any path with a dot (files)
  matcher: ["/((?!_next|api|static|.*\\..*).*)"],
}
