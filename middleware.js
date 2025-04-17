import { NextResponse } from "next/server"

export function middleware(request) {
  // Get the path
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const isPublicPath =
    path === "/auth/login" || path === "/auth/register" || path === "/debug" || path.startsWith("/api/")

  // Check if user has a session cookie
  const hasSessionCookie = request.cookies.has("appwrite_session")

  // Redirect logic
  if (!isPublicPath && !hasSessionCookie) {
    // Redirect to login if trying to access protected route without session
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  if (isPublicPath && hasSessionCookie && (path === "/auth/login" || path === "/auth/register")) {
    // Redirect to dashboard if trying to access auth pages with session
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure which paths should trigger this middleware
export const config = {
  matcher: [
    // Apply to all paths except static files, api routes, and _next
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)",
  ],
}
