import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const PUBLIC_ROUTES = ["/", "/login"]
const IGNORED_PREFIXES = ["/_next", "/api", "/static"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (
    IGNORED_PREFIXES.some((prefix) => pathname.startsWith(prefix)) ||
    pathname.includes(".") ||
    PUBLIC_ROUTES.includes(pathname)
  ) {
    return NextResponse.next()
  }

  const session = request.cookies.get("session")

  if (!session || !session.value) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("redirect", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next|api|static).*)"],
}
