"use client";
import { AutumnProvider } from "autumn-js/react";
import { api } from "../../../../convex/_generated/api";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { ReactNode } from "react";
import { useConvexAuth, useConvex } from "convex/react";
import { useOrganizationId } from "@/hooks/use-app-store";
import { CustomerSync } from "@/components/customer-sync";

/**
 * Renders children if the client is authenticated.
 *
 * @public
 */
export function Authenticated({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  if (isLoading || !isAuthenticated) {
    return null;
  }
  return <>{children}</>;
}

/**
 * Renders children if the client is using authentication but is not authenticated.
 *
 * @public
 */
export function Unauthenticated({ children }: { children: ReactNode }) {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const [retryCount, setRetryCount] = useState(0);
  const [shouldRetry, setShouldRetry] = useState(false);

  useEffect(() => {
    // If we're not loading and not authenticated, but we should be authenticated
    // (because middleware would have redirected us), then we might be stuck
    if (!isLoading && !isAuthenticated && retryCount < 3) {
      console.log('🔄 Convex appears stuck in unauthenticated state, retrying...', { retryCount });
      
      // Set a flag to retry
      setShouldRetry(true);
      
      // Retry after a short delay
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setShouldRetry(false);
        // Force a page reload to reset Convex state
        window.location.reload();
      }, 1000 * (retryCount + 1)); // Increasing delay: 1s, 2s, 3s

      return () => clearTimeout(timer);
    }
  }, [isLoading, isAuthenticated, retryCount]);

  if (isLoading || isAuthenticated) {
    return null;
  }

  // Show retry message if we're attempting to recover
  if (shouldRetry) {
    return (
      <div className="flex flex-col justify-center items-center p-4 w-full h-screen min-h-[300px] text-center">
        <Loader2 className="mb-2 w-4 h-4 animate-spin" />
        <p className="text-muted-foreground text-sm">
          Reconnecting... ({retryCount + 1}/3)
        </p>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Renders children if the client isn't using authentication or is in the process
 * of authenticating.
 *
 * @public
 */
export function AuthLoading({ children }: { children: ReactNode }) {
  const { isLoading } = useConvexAuth();
  if (!isLoading) {
    return null;
  }
  return <>{children}</>;
}

export function AutumnWrapper({ 
  children, 
  loadingVariant = 'default', 
  loaderSize = "w-8 h-8 animate-spin",
  loadingComponent 
}: { 
  children: React.ReactNode, 
  loadingVariant?: "default" | "text" | "custom" | 'none', 
  loaderSize?: string,
  loadingComponent?: React.ReactNode
}) {
  const convex = useConvex();
  const organizationId = useOrganizationId();

  // Only initialize Autumn if user has an organization
  const shouldInitializeAutumn = !!organizationId;

  return (
    <div>
      <Authenticated>
        {shouldInitializeAutumn ? (
          <AutumnProvider convex={convex} convexApi={api.autumn}>
            <CustomerSync />
            {children}
          </AutumnProvider>
        ) : (
          // Render children without Autumn provider if no organization
          children
        )}
      </Authenticated>
      <Unauthenticated>
        <div className="flex justify-center items-center w-full h-screen min-h-[300px]">
          <div className="text-center">
            <p className="mb-2 font-medium text-lg">Authentication Error</p>
            <p className="mb-4 text-muted-foreground text-sm">
              There seems to be an issue with your session.
            </p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-primary hover:bg-primary/90 px-4 py-2 rounded-md text-primary-foreground transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </Unauthenticated>
      <AuthLoading>
        {(() => {
          switch (loadingVariant) {
            case "text":
              return (
                <div className="flex justify-center items-center w-full h-screen min-h-[300px]">
                  <p className="text-muted-foreground">Loading...</p>
                </div>
              );
            case "custom":
              return loadingComponent;
            case "none":
              return null;
            default:
              return (
                <div className="flex justify-center items-center w-full h-screen min-h-[300px]">
                  <Loader2 className={loaderSize} />
                </div>
              );
          }
        })()}
      </AuthLoading>
    </div>
  );
}