import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const publicPaths = ["/", "/login"]
  
  // Skip middleware for these paths
  if (
    path.startsWith("/_next") ||
    path.startsWith("/api") ||
    path.startsWith("/static") ||
    path.includes(".") ||
    path === "/" ||
    path === "/login" ||
    path === "/privacy" ||
    path === "/terms" ||
    path === "/"
    path.includes(".")
  ) {
    return NextResponse.next()
  }

  // Allow public paths
  if (publicPaths.includes(path)) {
    return NextResponse.next()
  }

  // Check authentication via backend API
  try {
    const response = await fetch("http://localhost:8000/api/v1/github/profile", {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    })

  // If the user is not logged in and trying to access a protected route
  if (!hasSession && path !== "/" && path !== "/login" && path !== "/privacy" && path !== "/terms" && path !== "/") {
    if (!response.ok) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return NextResponse.next()
  } catch (error) {
    return NextResponse.redirect(new URL("/login", request.url))
  }
}