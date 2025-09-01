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

  // Fetch organizations when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const fetchOrganizations = async () => {
        try {
          const result = await getUserOrganizations();
          if (result.success && result.organizations) {
            setOrganizations(result.organizations);
          }
        } catch (error) {
          console.error('Failed to fetch organizations:', error);
        }
      };

      fetchOrganizations();
    } else {
      setOrganizations([]);
    }
  }, [isAuthenticated, setOrganizations]);

  return null; // This component doesn't render anything
}