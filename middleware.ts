/**
 * Next.js Middleware
 * Handles route protection and authentication checks
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes that require authentication
const protectedRoutes = ['/dashboard'];

// Public routes that should redirect to dashboard if authenticated
const publicRoutes = ['/auth/signin', '/auth/signup'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get tokens from cookies (if using cookies) or check if it's a protected route
  // For now, we'll let the client-side handle the redirect since we're using localStorage
  // This middleware can be extended to check cookies if you migrate to httpOnly cookies

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Check if it's a public auth route
  const isPublicAuthRoute = publicRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // For protected routes, we'll let the client-side handle the redirect
  // since we're using localStorage for tokens
  // In production, consider migrating to httpOnly cookies for better security

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|icon).*)',
  ],
};

