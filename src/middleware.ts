import { authkit } from "@workos-inc/authkit-nextjs";
import { NextRequest, NextResponse } from "next/server";

// Route configurations - centralized and easier to maintain
const ROUTE_CONFIG = {
  signIn: ['/sign-in', '/sign-up', '/verify-email', '/reset-password', '/new-password', '/select-organization'],
  protected: ['/dashboard', '/onboarding', '/onboarding/initialize', '/subscription', '/chat'], // Add chat route
  skipAuth: ['/api/auth/callback', '/api/auth/oauth-url'], // Add webhook routes that shouldn't be processed
  public: ['/'], // Public routes that don't need auth
};

// Helper functions for better readability
function isSignInRoute(pathname: string): boolean {
  return ROUTE_CONFIG.signIn.includes(pathname);
}

function isProtectedRoute(pathname: string): boolean {
  return ROUTE_CONFIG.protected.includes(pathname);
}

function shouldSkipAuthLogic(pathname: string): boolean {
  return ROUTE_CONFIG.skipAuth.includes(pathname) || pathname.startsWith('/api/auth/');
}

function createRedirectUrl(request: NextRequest, path: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  return `${baseUrl}${path}`;
}

function logMiddleware(message: string, data?: any) {// eslint-disable-line @typescript-eslint/no-explicit-any

  // Skip logging for well-known and devtools routes to reduce noise
  if (data?.pathname?.includes('.well-known') || data?.pathname?.includes('devtools')) {
    return;
  }
  // Only log in development or when explicitly enabled
  if (process.env.NODE_ENV === 'development' || process.env.MIDDLEWARE_DEBUG === 'true') {
    console.log(`🔍 Middleware - ${message}`, data || '');
  }
}

export default async function middleware(request: NextRequest) {
  const pathname = new URL(request.url).pathname;
  
  logMiddleware('Processing request', { 
    url: request.url, 
    method: request.method,
    pathname 
  });

  // Early return for routes that should skip auth logic
  if (shouldSkipAuthLogic(pathname)) {
    //logMiddleware('Skipping auth logic for:', pathname);
    return NextResponse.next();
  }

  try {
    // Perform AuthKit authentication
    const { session, headers } = await authkit(request, {
      debug: process.env.NODE_ENV === 'development',
      onSessionRefreshError: (error) => {
        console.error('❌ Session refresh error:', error);
      },
      onSessionRefreshSuccess(data) {
        logMiddleware('Session refresh success', { 
          hasUser: !!data.user,
          organizationId: data.organizationId 
        });
      },
    });

    const hasUser = !!session.user;
    const hasOrganization = !!session.organizationId;
    
    logMiddleware('Session state', { 
      hasUser, 
      hasOrganization,
      pathname 
    });

    // Redirect authenticated users away from sign-in routes
    if (hasUser && isSignInRoute(pathname)) {
      logMiddleware('Redirecting authenticated user from sign-in route');
      const redirectPath = hasOrganization ? '/dashboard' : '/onboarding';
      return NextResponse.redirect(createRedirectUrl(request, redirectPath));
    }

    // Redirect unauthenticated users away from protected routes
    if (!hasUser && isProtectedRoute(pathname)) {
      logMiddleware('Redirecting unauthenticated user to sign-in');
      // Preserve the intended destination
      const signInUrl = new URL('/sign-in', createRedirectUrl(request, ''));
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Handle organization-specific redirects for authenticated users
    if (hasUser) {
      // User without organization trying to access dashboard or other protected routes (except onboarding)
      if (!hasOrganization && pathname !== '/onboarding' && isProtectedRoute(pathname)) {
        logMiddleware('Redirecting to onboarding (no organization)');
        return NextResponse.redirect(createRedirectUrl(request, '/onboarding'));
      }

      // User with organization trying to access onboarding
      if (hasOrganization && pathname === '/onboarding') {
        logMiddleware('Redirecting to dashboard (has organization)');
        return NextResponse.redirect(createRedirectUrl(request, '/dashboard'));
      }
    }

    logMiddleware('Proceeding with request');
    return NextResponse.next({ headers });

  } catch (error) {
    console.error('❌ Middleware error:', error);
    
    // Graceful fallback - redirect to sign-in on auth errors
    if (isProtectedRoute(pathname)) {
      return NextResponse.redirect(createRedirectUrl(request, '/sign-in'));
    }
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};