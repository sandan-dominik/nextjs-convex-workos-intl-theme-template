// app/api/auth/complete-oauth/route.ts
import { getWorkOS, saveSession } from '@workos-inc/authkit-nextjs';
import { getTranslations } from 'next-intl/server';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const t = await getTranslations("actions.auth");
    const { pendingToken, organizationId } = await request.json();

    if (!pendingToken || !organizationId) {
      return NextResponse.json(
        { 
          success: false, 
          message: t("tokenAndOrganizationIdRequired") 
        },
        { status: 400 }
      );
    }

    const workos = getWorkOS();

    // Complete the OAuth authentication with the selected organization
    const authResponse = await workos.userManagement.authenticateWithOrganizationSelection({
      clientId: process.env.WORKOS_CLIENT_ID || '',
      pendingAuthenticationToken: pendingToken,
      organizationId: organizationId,
    });

    // Save the session
    await saveSession(
      {
        accessToken: authResponse.accessToken,
        refreshToken: authResponse.refreshToken,
        user: authResponse.user,
        impersonator: authResponse.impersonator,
      },
      '/auth/callback',
    );

    return NextResponse.json({
      success: true,
      message: t("oauthCompletedSuccessfully"),
    });
  } catch (error: unknown) {
    console.error('Error completing OAuth with organization:', error);
    const t = await getTranslations("actions.auth");

    // Handle NEXT_REDIRECT specially as it's not an actual error
    if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
      // For API routes, we can't throw redirects, so we return a success response
      // The client should handle the redirect
      return NextResponse.json({
        success: true,
        message: t("oauthCompletedSuccessfully"),
        shouldRedirect: true,
        redirectUrl: '/dashboard' // or wherever you want to redirect
      });
    }

    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : t("failedToCompleteOAuth"),
      },
      { status: 500 }
    );
  }
}