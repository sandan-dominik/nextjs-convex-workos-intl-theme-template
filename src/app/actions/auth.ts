"use server";

import { getWorkOS, saveSession, signOut, withAuth, switchToOrganization } from '@workos-inc/authkit-nextjs';
import { createSignInSchema, createSignUpSchema, createOrganizationSchema } from '@/schemas/zod/auth';
import util from 'util';
import { getTranslations } from 'next-intl/server';

type ActionResponse = {
    success: boolean;
    message?: string;
    redirect?: string;
    zodErrors?: Record<string, string[]>;
    inputs?: Record<string, unknown>;
    error?: unknown;
};

export async function signUp(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
    const t = await getTranslations("actions.auth");
    const tValidation = await getTranslations("validation");
    const workos = getWorkOS();
    const rawData = {
        firstname: formData.get('firstname'),
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    };

    const validatedData = createSignUpSchema(tValidation).safeParse(rawData);

    if (!validatedData.success) {
        return {
            success: false,
            message: t("fixErrorsBelow"),
            zodErrors: validatedData.error?.flatten().fieldErrors,
            inputs: rawData
        };
    }

    try {
        const user = await workos.userManagement.createUser({
            email: validatedData.data.email,
            password: validatedData.data.password,
            firstName: validatedData.data.firstname,
            lastName: validatedData.data.name,
            emailVerified: false,
        });

        console.log(user);
        return {
            success: true,
            message: t("userCreatedSuccessfully"),
            redirect: '/sign-in'
        };
    } catch (error: unknown) {
        return {
            success: false,
            message: error instanceof Error ? error.message : t("somethingWentWrong"),
            error: null
        };
    }
}

export async function signIn(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
    const t = await getTranslations("actions.auth");
    const tValidation = await getTranslations("validation");
    const workos = getWorkOS();
    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
    };

    const validatedData = createSignInSchema(tValidation).safeParse(rawData);

    if (!validatedData.success) {

        return {
            success: false,
            message: t("fixErrorsBelow"),
            zodErrors: validatedData.error?.flatten().fieldErrors,
            inputs: rawData
        };
    }

    try {
        const authResponse = await workos.userManagement.authenticateWithPassword({
            clientId: process.env.WORKOS_CLIENT_ID || '',
            email: validatedData.data.email,
            password: validatedData.data.password,
        });

        await saveSession(
            {
                accessToken: authResponse.accessToken,
                refreshToken: authResponse.refreshToken,
                user: authResponse.user,
                impersonator: authResponse.impersonator,
            },
            '/auth/callback',
        );

        return {
            success: true,
            message: t("signedInSuccessfully"),
            redirect: '/onboarding'
        };
    } catch (error: unknown) {
        console.log('Sign in error:', util.inspect(error, { depth: null }));

        if (error instanceof Error && 'rawData' in error) {
            switch ((error.rawData as { code: string }).code) {
                case 'invalid_credentials':
                    return {
                        success: false,
                        message: t("invalidEmailOrPassword"),
                    }
                case 'email_verification_required':
                    return {
                        success: true,
                        message: t("emailVerificationRequired"),
                        redirect: '/verify?token=' + (error.rawData as { pending_authentication_token: string }).pending_authentication_token
                    }
                case 'organization_selection_required':
                    return {
                        success: true,
                        message: t("organizationSelectionRequired"),
                        redirect: '/select-organization'
                    }
                default:
                    return {
                        success: false,
                        message: t("invalidEmailOrPassword"),
                    }
            }
        }

        return {
            success: false,
            message: t("invalidEmailOrPassword"),
            error: JSON.parse(JSON.stringify(error))
        };
    }
}

export async function signout(): Promise<ActionResponse | undefined> {
    try {
        await withAuth();
        await signOut();
    } catch (error: unknown) {
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }

        console.log('Sign out error:', error);
        return {
            success: true,
            redirect: "/sign-in"
        };
    }
}

export async function verifyEmail(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
    const t = await getTranslations("actions.auth");
    const workos = getWorkOS();

    const rawData = {
        code: formData.get('code'),
        token: formData.get('token'),
    };

    try {
        const authResponse = await workos.userManagement.authenticateWithEmailVerification({
            clientId: process.env.WORKOS_CLIENT_ID || '',
            code: String(rawData.code),
            pendingAuthenticationToken: String(rawData.token),
        });

        await saveSession(
            {
                accessToken: authResponse.accessToken,
                refreshToken: authResponse.refreshToken,
                user: authResponse.user,
                impersonator: authResponse.impersonator,
            },
            '/api/auth/callback',
        );

        return {
            success: true,
            message: t("emailVerifiedSuccessfully"),
            redirect: '/onboarding'
        };
    } catch (error: unknown) {
        return {
            success: false,
            message: error instanceof Error ? error.message : t("invalidVerificationCode"),
            error: null
        };
    }
}

export async function createOrganization(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
    const t = await getTranslations("actions.auth");
    const tValidation = await getTranslations("validation");
    const workos = getWorkOS();
    
    try {
        const { user } = await withAuth({ ensureSignedIn: true });
        
        const rawData = {
            name: formData.get('name')
        };

        const validatedData = createOrganizationSchema(tValidation).safeParse(rawData);

        if (!validatedData.success) {
            return {
                success: false,
                message: t("fixErrorsBelow"),
                zodErrors: validatedData.error?.flatten().fieldErrors,
                inputs: rawData
            };
        }
        
        // 1. Create the organization
        const organization = await workos.organizations.createOrganization({
            name: validatedData.data.name,
        });

        // 2. Add the user to the organization as an admin
        await workos.userManagement.createOrganizationMembership({
            organizationId: organization.id,
            userId: user.id,
            roleSlug: 'admin',
        });

        // 3. Generate the magic link to select the organization
        const clientId = process.env.WORKOS_CLIENT_ID;
        if (!clientId) {
            throw new Error('WORKOS_CLIENT_ID is not configured');
        }

        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!appUrl) {
            throw new Error('NEXT_PUBLIC_APP_URL is not configured');
        }

        if (!appUrl) {
            throw new Error('NEXT_PUBLIC_APP_URL is not configured');
        }

        await switchToOrganization(organization.id, {
            returnTo: `${appUrl}/api/auth/callback`, 
        });
        
        // If we reach here, the switch was successful
        return {
            success: true,
            message: t("organizationCreatedSuccessfully"),
            redirect: '/dashboard'
        };
    } catch (error: unknown) {
        console.log('Create organization error:', error);
        
        // Handle NEXT_REDIRECT error (this is expected behavior)
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            // This is a successful redirect, not an error
            throw error; // Re-throw to let Next.js handle the redirect
        }
        
        return {
            success: false,
            message: error instanceof Error ? error.message : t("somethingWentWrong"),
            error: null
        };
    }
}

export async function generateOAuthUrl(provider: 'GoogleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth' | 'AppleOAuth' | 'SlackOAuth'): Promise<{ success: boolean; url?: string; error?: string }> {
    const t = await getTranslations("actions.auth");
    try {
        const workos = getWorkOS();

        // Validate that we have the required environment variables
        const clientId = process.env.WORKOS_CLIENT_ID;
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;

        if (!clientId) {
            throw new Error('WORKOS_CLIENT_ID is not configured');
        }

        if (!appUrl) {
            throw new Error('NEXT_PUBLIC_APP_URL is not configured');
        }

        const oauthUrl = workos.userManagement.getAuthorizationUrl({
            clientId,
            provider,
            redirectUri: `${appUrl}/api/auth/callback`,
        });

        return { success: true, url: oauthUrl };
    } catch (error) {
        console.error(`Error generating ${provider} OAuth URL:`, error);
        return {
            success: false,
            error: error instanceof Error ? error.message : t("failedToGenerateOAuthUrl", { provider })
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

export async function getOrganization(organizationId: string) {
    const t = await getTranslations("actions.auth");
    try {
        const workos = getWorkOS();
        
        if (!organizationId) {
            return {
                success: false,
                message: t("organizationIdRequired"),
                organization: null
            };
        }

        const organization = await workos.organizations.getOrganization(organizationId);
        
        return {
            success: true,
            organization: {
                id: organization.id,
                name: organization.name,
                object: organization.object,
                createdAt: organization.createdAt,
                updatedAt: organization.updatedAt,
                domains: organization.domains,
                metadata: organization.metadata
            }
        };
    } catch (error: unknown) {
        console.error('Error fetching organization:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : t("failedToFetchOrganization"),
            organization: null,
            error: null
        };
    }
}

export async function sendPasswordReset(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
    const t = await getTranslations("actions.auth");
    try {
        const workos = getWorkOS();
        
        const email = formData.get('email') as string;
        
        if (!email) {
            return {
                success: false,
                message: t("emailRequired"),
            };
        }

        await workos.userManagement.sendPasswordResetEmail({
            email: email,
            passwordResetUrl: `${process.env.NEXT_PUBLIC_APP_URL}/new-password`,
        });

        return {
            success: true,
            message: t("passwordResetEmailSent"),
        };
    } catch (error: unknown) {
        console.error('Error sending password reset:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : t("failedToSendPasswordReset"),
            error: null
        };
    }
}

export async function resetPassword(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
    const t = await getTranslations("actions.auth");
    try {
        const workos = getWorkOS();
        
        const token = formData.get('token') as string;
        const password = formData.get('password') as string;
        
        if (!token || !password) {
            return {
                success: false,
                message: t("tokenAndPasswordRequired"),
            };
        }

        await workos.userManagement.resetPassword({
            token: token,
            newPassword: password,
        });

        return {
            success: true,
            message: t("passwordResetSuccessfully"),
            redirect: '/sign-in'
        };
    } catch (error: unknown) {
        console.error('Error resetting password:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : t("failedToResetPassword"),
            error: null
        };
    }
}

export async function getUserOrganizations(): Promise<ActionResponse & { organizations?: Array<{ id: string; name: string; object: string; createdAt: string; updatedAt: string; domains: Array<{ object: string; id: string; domain: string; organizationId: string; state: string; verificationStrategy: string; createdAt: string; updatedAt: string }>; metadata: Record<string, string> }> }> {
    const t = await getTranslations("actions.auth");
    try {
        const workos = getWorkOS();
        
        // Get the current user's organizations
        const organizations = await workos.organizations.listOrganizations();
        
        return {
            success: true,
            organizations: organizations.data.map(org => ({
                id: org.id,
                name: org.name,
                object: org.object,
                createdAt: org.createdAt,
                updatedAt: org.updatedAt,
                domains: org.domains.map(domain => ({
                    object: domain.object,
                    id: domain.id,
                    domain: domain.domain,
                    organizationId: domain.organizationId,
                    state: domain.state,
                    verificationStrategy: domain.verificationStrategy,
                    createdAt: domain.createdAt,
                    updatedAt: domain.updatedAt
                })),
                metadata: org.metadata
            }))
        };
    } catch (error: unknown) {
        console.error('Error fetching user organizations:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : t("failedToFetchUserOrganizations"),
            organizations: undefined,
            error: null
        };
    }
}

export async function completeOAuthWithOrganization(pendingToken: string, organizationId: string): Promise<ActionResponse> {
    const t = await getTranslations("actions.auth");
    try {
        if (!pendingToken || !organizationId) {
            return {
                success: false,
                message: t("tokenAndOrganizationIdRequired"),
            };
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
        
        return {
            success: true,
            message: t("oauthCompletedSuccessfully"),
        };
    } catch (error: unknown) {
        console.error('Error completing OAuth with organization:', error);
        
        // Handle NEXT_REDIRECT specially as it's not an actual error
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        
        return {
            success: false,
            message: error instanceof Error ? error.message : t("failedToCompleteOAuth"),
            error: null
        };
    }
}

export async function switchToSelectedOrganization(organizationId: string): Promise<ActionResponse> {
    const t = await getTranslations("actions.auth");
    try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL;
        if (!appUrl) {
            throw new Error('NEXT_PUBLIC_APP_URL is not configured');
        }

        if (!organizationId) {
            return {
                success: false,
                message: t("organizationIdRequired"),
            };
        }

        // Use the existing switchToOrganization function from WorkOS
        await switchToOrganization(organizationId, {
            returnTo: `${appUrl}/api/auth/callback`, 
        });
        
        return {
            success: true,
            message: t("organizationSwitchedSuccessfully"),
        };
    } catch (error: unknown) {
        console.error('Error switching organization:', error);
        
        // Handle NEXT_REDIRECT specially as it's not an actual error
        if (error instanceof Error && error.message === 'NEXT_REDIRECT') {
            throw error;
        }
        
        return {
            success: false,
            message: error instanceof Error ? error.message : t("failedToSwitchOrganization"),
            error: null
        };
    }
}

