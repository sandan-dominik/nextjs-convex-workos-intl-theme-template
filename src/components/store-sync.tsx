"use client";

import { useEffect } from 'react';
import { useConvexAuth } from 'convex/react';
import { useAuth } from '@workos-inc/authkit-nextjs/components';
import { getUserOrganizations } from '@/lib/api-client';
import { 
  useSetUser, 
  useSetOrganizationId, 
  useSetOrganizations,
  useSetLoading
} from '@/hooks/use-app-store';

export function StoreSync() {
  const { isAuthenticated, isLoading } = useConvexAuth();
  const { user, organizationId } = useAuth();
  
  // Use individual action hooks
  const setUser = useSetUser();
  const setOrganizationId = useSetOrganizationId();
  const setOrganizations = useSetOrganizations();
  const setLoading = useSetLoading();

  // Sync authentication state
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading, setLoading]);

  useEffect(() => {
    if (isAuthenticated && user) {
      setUser(user);
    } else {
      setUser(null);
    }
  }, [isAuthenticated, user, setUser]);

  useEffect(() => {
    setOrganizationId(organizationId || null);
  }, [organizationId, setOrganizationId]);

  // Fetch organizations when authenticated - with retry logic
  useEffect(() => {
    if (isAuthenticated) {
      const fetchOrganizations = async () => {
        try {
          console.log('🔄 Fetching organizations...');
          const result = await getUserOrganizations();
          console.log('📋 Organizations result:', result);
          
          if (result.success && result.organizations) {
            console.log('✅ Setting organizations in store:', result.organizations);
            setOrganizations(result.organizations);
            
            // If we have organizations but no current organizationId, set the first one
            if (result.organizations.length > 0 && !organizationId) {
              console.log('🎯 Setting first organization as current:', result.organizations[0].id);
              setOrganizationId(result.organizations[0].id);
            }
          }
        } catch (error) {
          console.error('❌ Failed to fetch organizations:', error);
        }
      };

      fetchOrganizations();
      
      // Retry after a short delay to catch any race conditions
      const retryTimer = setTimeout(() => {
        console.log('🔄 Retrying organization fetch...');
        fetchOrganizations();
      }, 1000);
      return () => clearTimeout(retryTimer);
    } else {
      setOrganizations([]);
    }
  }, [isAuthenticated, setOrganizations, organizationId, setOrganizationId]);

  return null; // This component doesn't render anything
}