"use client";
import { AutumnProvider } from "autumn-js/react";
import { api } from "../../../../convex/_generated/api";
import { useConvex } from "convex/react";
import { useConvexAuth } from "convex/react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useMemo, useState, useEffect } from "react";

export function AutumnWrapper({ children }: { children: React.ReactNode }) {
  const convex = useConvex();
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { organizationId } = useAuth();
  const [autumnReady, setAutumnReady] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  // Debug logging
  useEffect(() => {
    console.log('🔍 AutumnWrapper Debug:', {
      convexLoading: isLoading,
      isAuthenticated,
      organizationId,
      autumnReady,
      forceUpdate,
      timestamp: new Date().toISOString()
    });
  }, [isLoading, isAuthenticated, organizationId, autumnReady, forceUpdate]);

  // Memoize the auth state
  const isReady = useMemo(() => {
    const ready = !isLoading && isAuthenticated && !!organizationId;
    console.log('🔍 Auth ready check:', { isLoading, isAuthenticated, organizationId, ready });
    return ready;
  }, [isLoading, isAuthenticated, organizationId]);

  // Wait for Autumn to be ready
  useEffect(() => {
    if (isReady) {
      console.log('🔍 Auth ready, starting Autumn timer...');
      const timer = setTimeout(() => {
        console.log('🔍 Autumn timer completed, setting ready');
        setAutumnReady(true);
      }, 5000);
      
      return () => {
        console.log('🔍 Clearing Autumn timer');
        clearTimeout(timer);
      };
    } else {
      console.log('🔍 Auth not ready, resetting Autumn ready state');
      setAutumnReady(false);
    }
  }, [isReady]);

  // Log when children are about to render
  const shouldRenderChildren = isReady && autumnReady;
  console.log('🔍 Render decision:', { 
    isReady, 
    autumnReady, 
    shouldRenderChildren,
    willShowChildren: shouldRenderChildren ? 'YES' : 'NO'
  });

  // Always render AutumnProvider
  return (
    <AutumnProvider convex={convex} convexApi={api.autumn}>
      {!shouldRenderChildren ? (
        <div className="flex justify-center items-center w-full h-screen min-h-[300px]">
          <div className="text-center">
            <p className="text-muted-foreground">
              <Loader2 className="mx-auto mb-2 w-6 h-6 animate-spin" />
              {!isReady ? 'Setting up authentication...' : 'Setting up billing...'}
            </p>
            {/* Debug info */}
            <div className="mt-2 text-muted-foreground text-xs">
              <div>Convex: {isLoading ? 'Loading' : 'Ready'}</div>
              <div>Auth: {isAuthenticated ? 'Yes' : 'No'}</div>
              <div>Org: {organizationId ? 'Yes' : 'No'}</div>
              <div>Autumn: {autumnReady ? 'Ready' : 'Loading'}</div>
              <div>Children: {shouldRenderChildren ? 'Will Render' : 'Will NOT Render'}</div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {children}
        </div>
      )}
    </AutumnProvider>
  );
}