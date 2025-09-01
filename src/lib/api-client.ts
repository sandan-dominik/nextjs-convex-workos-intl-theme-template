// lib/api-client.ts
type OAuthProvider = 'GoogleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth' | 'AppleOAuth' | 'SlackOAuth';

// OAuth URL generation functions
export async function generateOAuthUrl(provider: OAuthProvider): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const response = await fetch('/api/auth/oauth-url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ provider }),
    });

    return await response.json();
  } catch (error) {
    console.error(`Error generating ${provider} OAuth URL:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate OAuth URL'
    };
  }
}

// Convenience functions for specific providers
export async function generateGoogleOAuthUrl() {
  return generateOAuthUrl('GoogleOAuth');
}

export async function generateGitHubOAuthUrl() {
  return generateOAuthUrl('GitHubOAuth');
}

export async function generateMicrosoftOAuthUrl() {
  return generateOAuthUrl('MicrosoftOAuth');
}

export async function generateAppleOAuthUrl() {
  return generateOAuthUrl('AppleOAuth');
}

export async function generateSlackOAuthUrl() {
  return generateOAuthUrl('SlackOAuth');
}

// Get organization
export async function getOrganization(organizationId: string) {
  try {
    const response = await fetch(`/api/organizations/${organizationId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Error fetching organization:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch organization',
      organization: null
    };
  }
}

// Get user organizations
export async function getUserOrganizations() {
  try {
    const response = await fetch('/api/user/organizations', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return await response.json();
  } catch (error) {
    console.error('Error fetching user organizations:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to fetch user organizations',
      organizations: undefined
    };
  }
}

// Complete OAuth with organization
export async function completeOAuthWithOrganization(pendingToken: string, organizationId: string) {
  try {
    const response = await fetch('/api/auth/complete-oauth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pendingToken, organizationId }),
    });

    const result = await response.json();
    
    // Handle redirect response
    if (result.success && result.shouldRedirect) {
      window.location.href = result.redirectUrl || '/dashboard';
    }
    
    return result;
  } catch (error) {
    console.error('Error completing OAuth with organization:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Failed to complete OAuth'
    };
  }
}