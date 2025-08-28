"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { generateOAuthUrl } from "@/app/actions/auth";
import { Loader2 } from "lucide-react";

interface OAuthButtonProps {
    provider: 'GoogleOAuth' | 'GitHubOAuth' | 'MicrosoftOAuth' | 'AppleOAuth';
    children: React.ReactNode;
    className?: string;
    variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

const providerConfig = {
    GoogleOAuth: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                    d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                    fill="currentColor"
                />
            </svg>
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
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23">
                <path
                    d="M11 11H0V0h11v11zm0 11H0V11h11v11zm1-11v11h11V11H12zm11-1H12V0h11v10z"
                    fill="currentColor"
                />
            </svg>
        )
    },
    AppleOAuth: {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path
                    d="M14.94 5.19A4.38 4.38 0 0 0 16 2a4.38 4.38 0 0 0-3 1.52 4.09 4.09 0 0 0-1 3.09 3.64 3.64 0 0 0 2.94-1.42zm2.52 7.44a4.51 4.51 0 0 1 2.16-3.81 4.66 4.66 0 0 0-3.66-2c-1.56-.16-3 .91-3.83.91-.83 0-2.12-.89-3.48-.86a4.92 4.92 0 0 0-4.14 2.53C2.37 12.13 3.88 17.86 6 20.85c1 1.45 2.24 3.07 3.84 3 1.54-.06 2.13-1 4-1s2.39 1 4 1 2.68-1.48 3.68-2.93a13 13 0 0 0 1.67-3.42 4.4 4.4 0 0 1-2.73-4.08z"
                    fill="currentColor"
                />
            </svg>
        )
    }
};

export default function OAuthButton({ provider, children, className = "w-full", variant = "outline" }: OAuthButtonProps) {
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
                {providerConfig[provider].icon}
                {children}
            </a>
        </Button>
    );
}