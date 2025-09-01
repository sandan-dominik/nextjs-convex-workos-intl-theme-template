// app/api/auth/oauth-url/route.ts
import { getWorkOS } from '@workos-inc/authkit-nextjs';
import { getTranslations } from 'next-intl/server';
import { NextRequest, NextResponse } from 'next/server';

type OAuthProvider = 'GoogleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth' | 'AppleOAuth' | 'SlackOAuth';

export async function POST(request: NextRequest) {
  try {
    const { provider }: { provider: OAuthProvider } = await request.json();

    if (!provider) {
      return NextResponse.json(
        { success: false, error: 'Provider is required' },
        { status: 400 }
      );
    }

    // Validate provider
    const validProviders: OAuthProvider[] = ['GoogleOAuth', 'GitHubOAuth', 'MicrosoftOAuth', 'AppleOAuth', 'SlackOAuth'];
    if (!validProviders.includes(provider)) {
      return NextResponse.json(
        { success: false, error: 'Invalid provider' },
        { status: 400 }
      );
    }

    const workos = getWorkOS();

    // Validate that we have the required environment variables
    const clientId = process.env.WORKOS_CLIENT_ID;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL;

    if (!clientId) {
      return NextResponse.json(
        { success: false, error: 'WORKOS_CLIENT_ID is not configured' },
        { status: 500 }
      );
    }

    if (!appUrl) {
      return NextResponse.json(
        { success: false, error: 'NEXT_PUBLIC_APP_URL is not configured' },
        { status: 500 }
      );
    }

    const oauthUrl = workos.userManagement.getAuthorizationUrl({
      clientId,
      provider,
      redirectUri: `${appUrl}/api/auth/callback`,
    });

    return NextResponse.json({ success: true, url: oauthUrl });
  } catch (error) {
    console.error(`Error generating OAuth URL:`, error);
    const t = await getTranslations("actions.auth");
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : t("failedToGenerateOAuthUrl", { provider: 'OAuth' })
      },
      { status: 500 }
    );
  }
}