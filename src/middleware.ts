import { authkit } from "@workos-inc/authkit-nextjs";
import { NextRequest, NextResponse } from "next/server";

/**
 * Options for the middleware
 * Whether to require an organization to access the dashboard, wheter to use the create organization flow after registration or not
 * 
 * @property {boolean} requireOrganization
 */
const options = {
  requireOrganization: false,
}


export default async function middleware(request: NextRequest) {
  const protectedRoutes = ['/dashboard', '/onboarding'];
  const signInRoutes = ['/sign-in', '/sign-up', "/verify-email", "/reset-password", "/new-password", "/select-organization"];
  
  // Perform logic before or after AuthKit

  // Auth object contains the session, response headers and an authorization URL in the case that the session isn't valid
  // This method will automatically handle setting the cookie and refreshing the session
  const { session, headers} = await authkit(request, {
    debug: true,
    onSessionRefreshError: (error) => {
      console.error('Session refresh error:', error);
    },
    onSessionRefreshSuccess(data) {
      console.log('Session refresh success:', data);
    },
  });

  const pathname = new URL(request.url).pathname;
  
  // Skip middleware logic for auth callback and form submissions
  if (pathname === '/api/auth/callback' || request.method === 'POST') {
    return NextResponse.next({
      headers: headers,
    });
  }
  
  if(session.user && signInRoutes.includes(pathname)) {
    console.log('Session user and sign in route', session.organizationId);
    if(options.requireOrganization && !session.organizationId) {
      // Only redirect to onboarding if requireOrganization is true AND user has no organization
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/onboarding`);
    } else {
      // Otherwise, redirect to dashboard (user has organization OR organization not required)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    }
  }

  if(session.user && pathname === '/dashboard' && options.requireOrganization && !session.organizationId) {
    console.log('Session user on dashboard but no organization when required', session.organizationId);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/onboarding`);
  }

  if(session.user && pathname === '/onboarding' && session.organizationId) {
    // Only redirect away from onboarding if user already has an organization
    console.log('Session user on onboarding but already has organization', session.organizationId);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  }

  // Control of what to do when there's no session on a protected route is left to the developer
  if (protectedRoutes.includes(pathname) && !session.user) {
    console.log('No session on protected path');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/sign-in`);
  }

  // Headers from the authkit response need to be included in every non-redirect response to ensure that `withAuth` works as expected
  return NextResponse.next({
    headers: headers,
  });
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};