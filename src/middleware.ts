import { authkit } from "@workos-inc/authkit-nextjs";
import { NextRequest, NextResponse } from "next/server";

export default async function middleware(request: NextRequest) {
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

  if(session.user && (request.url.includes('/sign-in') || request.url.includes('/sign-up'))) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/dashboard`);
  }

  // Control of what to do when there's no session on a protected route is left to the developer
  if (request.url.includes('/dashboard') && !session.user) {
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