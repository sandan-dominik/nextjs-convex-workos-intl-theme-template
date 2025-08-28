"use server";

import { getWorkOS, saveSession, signOut, withAuth } from '@workos-inc/authkit-nextjs';
import { signUpSchema, signInSchema } from '@/schemas/zod/auth';
import util from 'util';

type ActionResponse = {
  success: boolean;
  message?: string;
  redirect?: string;
  zodErrors?: Record<string, string[]>;
  inputs?: Record<string, unknown>;
  error?: unknown;
};

export async function signUp(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
    const workos = getWorkOS();
    const rawData = {
        firstname: formData.get('firstname'),
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
    };

    const validatedData = signUpSchema.safeParse(rawData);

    if (!validatedData.success) {
        return {
            success: false,
            message: "Please fix the errors below",
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
            message: "User created successfully! Please check your email for verification.",
            redirect: '/sign-in'
        };
    } catch (error: unknown) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Something went wrong. Please try again.",
            error: null
        };
    }
}

export async function signIn(prevState: ActionResponse | null, formData: FormData): Promise<ActionResponse> {
    const workos = getWorkOS();
    const rawData = {
        email: formData.get('email'),
        password: formData.get('password'),
    };

    const validatedData = signInSchema.safeParse(rawData);

    if (!validatedData.success) {

        return {
            success: false,
            message: "Please fix the errors below",
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
            message: "Signed in successfully!",
            redirect: '/dashboard'
        };
    } catch (error: unknown) {
        console.log('Sign in error:', util.inspect(error, { depth: null }));

        if(error instanceof Error && 'rawData' in error){
            switch((error.rawData as { code: string }).code) {
                case 'invalid_credentials':
                    return {
                        success: false,
                        message: "Invalid email or password",
                    }
                case 'email_verification_required':
                    return {
                        success: false,
                        message: "Email verification required",
                        redirect: '/verify?token=' + (error.rawData as { pending_authentication_token: string }).pending_authentication_token
                    }
                default:
                    return {
                        success: false,
                        message: "Invalid email or password",
                    }
            }
        }

        return { 
            success: false,
            message: "Invalid email or password",
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
            message: "Email verified successfully!",
            redirect: '/dashboard'
        };
    } catch (error: unknown) {
        return {
            success: false,
            message: error instanceof Error ? error.message : "Invalid verification code. Please try again.",
            error: null
        };
    }
}


export async function generateOAuthUrl(provider: 'GoogleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth' | 'AppleOAuth' | 'SlackOAuth'): Promise<{ success: boolean; url?: string; error?: string }> {
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
            error: error instanceof Error ? error.message : `Failed to generate ${provider} OAuth URL` 
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

