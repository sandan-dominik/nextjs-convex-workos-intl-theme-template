import { authkit } from "@workos-inc/authkit-nextjs";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
  const signInRoutes = ['/sign-in', '/sign-up', "/verify-email", "/reset-password", "/new-password", "/select-organization"];
  
  console.log('🔍 Middleware - URL:', request.url);
  console.log('🔍 Middleware - Method:', request.method);

  // Perform logic before or after AuthKit
  const { session, headers} = await authkit(request, {
    debug: true,
    onSessionRefreshError: (error) => {
      console.error('❌ Session refresh error:', error);
    },
    onSessionRefreshSuccess(data) {
      console.log('✅ Session refresh success:', data);
      console.log('✅ Session user:', data.user);
      console.log('✅ Session organizationId:', data.organizationId);
    },
  });

  console.log('🔍 Middleware - Session user:', session.user ? 'exists' : 'null');
  console.log('🔍 Middleware - Session organizationId:', session.organizationId);

  const pathname = new URL(request.url).pathname;
  
  // Skip middleware logic for auth callback and form submissions
  if (pathname === '/api/auth/callback' || request.method === 'POST') {
    console.log('🔍 Middleware - Skipping logic for:', pathname);
    return NextResponse.next({
      headers: headers,
    });
  }
  
  if(session.user && signInRoutes.includes(pathname)) {
    console.log('🔍 Middleware - Redirecting authenticated user from sign-in route');
    if(!session.organizationId) {
      // Redirect to onboarding if user has no organization
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/onboarding`);
    } else {
      // Otherwise, redirect to dashboard
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
    }
  }

  if(session.user && pathname === '/dashboard' && !session.organizationId) {
    console.log('🔍 Middleware - Redirecting to onboarding (no org)');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/onboarding`);
  }

  if(session.user && pathname === '/onboarding' && session.organizationId) {
    console.log('🔍 Middleware - Redirecting to dashboard (has org)');
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  }

  console.log('🔍 Middleware - Proceeding with request');
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