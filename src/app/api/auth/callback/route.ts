import { handleAuth } from '@workos-inc/authkit-nextjs';

export const GET = handleAuth({
    baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    returnPathname: '/onboarding',
    // Handle successful authentication
    onSuccess: (data) => {
        // If user has multiple organizations, redirect to organization selection
        // This will be handled by the middleware, but we can add logic here if needed
        console.log('Auth success:', data);
    },
    onError: (error) => {
        console.log('AuthKit error:', error);

        // Type guard to check if error has the expected structure
        if (error && typeof error === 'object' && 'error' in error) {
            const errorObj = error as { error: { rawData?: unknown } };
            const rawData = errorObj.error?.rawData;
            
            // Type guard to check if rawData has a code property
            if (rawData && typeof rawData === 'object' && rawData !== null && 'code' in rawData) {
                const errorData = rawData as { code: string; pending_authentication_token?: string; available_organizations?: unknown[] };
                const errorCode = errorData.code;

                console.log('errorCode:', errorCode);
                
                switch(errorCode) {
                    case 'organization_selection_required': {
                        // Redirect to organization selection page with token and organizations
                        const orgToken = errorData.pending_authentication_token || '';
                        const organizations = errorData.available_organizations || [];
                        
                        console.log('Organization selection error details:', {
                            token: orgToken,
                            organizations: organizations,
                            organizationsLength: organizations?.length,
                            rawData: rawData
                        });
                        
                        // Only pass organizations if they exist and are not empty
                        if (organizations && organizations.length > 0) {
                            const orgsParam = encodeURIComponent(JSON.stringify(organizations));
                            return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/select-organization?token=${orgToken}&organizations=${orgsParam}`);
                        } else {
                            // If no organizations provided, just pass the token
                            console.log('No organizations provided, falling back to API fetch');
                            return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/select-organization?token=${orgToken}`);
                        }
                    }
                    
                    case 'invalid_credentials':
                    case 'authentication_failed':
                        // Redirect to sign-in page for authentication errors
                        return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in?error=auth_failed`);
                    
                    case 'email_verification_required': {
                        // Redirect to email verification page
                        const token = errorData.pending_authentication_token || '';
                        return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/verify?token=${token}`);
                    }
                    
                    case 'user_not_found':
                        // Redirect to sign-up page if user doesn't exist
                        return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-up?error=user_not_found`);
                    
                    case 'organization_not_found':
                        // Redirect to onboarding if organization doesn't exist
                        return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/onboarding`);
                    
                    default:
                        // For any other errors, redirect to sign-in with generic error
                        return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in?error=unknown`);
                }
            }
        }
        
        // If error doesn't have a code, redirect to sign-in with generic error
        return Response.redirect(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/sign-in?error=unknown`);
    }
});
