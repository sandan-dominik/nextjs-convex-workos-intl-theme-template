"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { generateOAuthUrl } from "@/lib/api-client";
import { Loader2 } from "lucide-react";

interface OAuthButtonProps {
    provider: 'GoogleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth' | 'AppleOAuth';
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
    iconsOnly?: boolean;
}

const providerConfig = {
    GoogleOAuth: {
        icon: (
            <svg viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="#currentColor"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="currentColor"></path><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="currentColor"></path><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="currentColor"></path><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="currentColor"></path></g></svg>
        )
    },
    GitHubOAuth: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                    d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                    fill="currentColor"
                />
            </svg>
        )
    },
    MicrosoftOAuth: {
        icon: (
            <svg viewBox="-0.5 0 257 257" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid" fill="currentColor"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M0 36.357L104.62 22.11l.045 100.914-104.57.595L0 36.358zm104.57 98.293l.08 101.002L.081 221.275l-.006-87.302 104.494.677zm12.682-114.405L255.968 0v121.74l-138.716 1.1V20.246zM256 135.6l-.033 121.191-138.716-19.578-.194-101.84L256 135.6z" fill="currentColor"></path></g></svg>
        )
    },
    AppleOAuth: {
        icon: (
            <svg fill="currentColor" viewBox="-52.01 0 560.035 560.035" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" strokeWidth="0"></g><g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g><g id="SVGRepo_iconCarrier"><path d="M380.844 297.529c.787 84.752 74.349 112.955 75.164 113.314-.622 1.988-11.754 40.191-38.756 79.652-23.343 34.117-47.568 68.107-85.731 68.811-37.499.691-49.557-22.236-92.429-22.236-42.859 0-56.256 21.533-91.753 22.928-36.837 1.395-64.889-36.891-88.424-70.883-48.093-69.53-84.846-196.475-35.496-282.165 24.516-42.554 68.328-69.501 115.882-70.192 36.173-.69 70.315 24.336 92.429 24.336 22.1 0 63.59-30.096 107.208-25.676 18.26.76 69.517 7.376 102.429 55.552-2.652 1.644-61.159 35.704-60.523 106.559M310.369 89.418C329.926 65.745 343.089 32.79 339.498 0 311.308 1.133 277.22 18.785 257 42.445c-18.121 20.952-33.991 54.487-29.709 86.628 31.421 2.431 63.52-15.967 83.078-39.655"></path></g></svg>
        )
    }
};

export default function OAuthButton({ provider, children, className = "w-full", variant = "outline", iconsOnly = false }: OAuthButtonProps) {
    const [oauthUrl, setOauthUrl] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const getOAuthUrl = async () => {
            try {
                setIsLoading(true);
                setError('');
                
                const result = await generateOAuthUrl(provider);
                
                if (result.success && result.url) {
                    setOauthUrl(result.url);
                } else {
                    throw new Error(result.error || `Failed to generate ${provider} OAuth URL`);
                }
            } catch (error) {
                console.error(`Failed to generate ${provider} OAuth URL:`, error);
                setError(error instanceof Error ? error.message : `Failed to generate ${provider} OAuth URL`);
            } finally {
                setIsLoading(false);
            }
        };

        getOAuthUrl();
    }, [provider]);

    if (isLoading) {
        return (
            <Button variant={variant} className={className} disabled>
                <div className="flex justify-center items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                </div>
            </Button>
        );
    }

    if (error) {
        return (
            <Button variant={variant} className={className} disabled>
                <div className="flex justify-center items-center gap-2">
                    {providerConfig[provider].icon}
                    Error: {error}
                </div>
            </Button>
        );
    }

    return (
        <Button variant={variant} className={className} asChild>
            <a href={oauthUrl} className="flex justify-center items-center gap-2">  
                {iconsOnly ? providerConfig[provider].icon : (
                    <>
                        {providerConfig[provider].icon}
                        {children}
                    </>
                )}
            </a>
        </Button>
    );
}