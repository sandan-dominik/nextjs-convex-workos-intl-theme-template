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
    // Move the environment check inside the server action
    console.log('Environment variables in signUp:', {
        WORKOS_API_KEY: process.env.WORKOS_API_KEY ? 'SET' : 'NOT SET',
        WORKOS_CLIENT_ID: process.env.WORKOS_CLIENT_ID ? 'SET' : 'NOT SET'
    });

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

export async function signout(): Promise<ActionResponse> {
    try {
        // Verify user is authenticated
        await withAuth();
        // Sign out the user
        await signOut();
        // Return redirect information instead of using redirect directly
        return {
            success: true,
            redirect: "/"
        };
    } catch (error: unknown) {
        console.log('Sign out error:', error);
        // If there's any error (user not authenticated, etc.), return redirect info
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
        // Authenticate with the WorkOS API directly
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
            '/auth/callback',
        );

        console.log(authResponse);

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