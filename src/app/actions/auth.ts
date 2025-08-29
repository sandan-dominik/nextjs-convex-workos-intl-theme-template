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

        await switchToOrganization(organization.id);
        
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

