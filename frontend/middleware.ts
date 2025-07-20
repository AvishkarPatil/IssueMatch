import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Skip middleware for these paths
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/static") ||
    path.includes(".") ||
    path === "/" ||
    path === "/login" ||
    path === "/"
  ) {
    return NextResponse.next()
  }

  // Check if the user has a session cookie
  const hasSession = request.cookies.has("session")

  // If the user is not logged in and trying to access a protected route
  if (!hasSession && path !== "/" && path !== "/login" && path !== "/") {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}