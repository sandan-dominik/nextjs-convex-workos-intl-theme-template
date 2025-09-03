"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useActiveProduct, useOrganizationId, useCustomer, useCustomerLoading } from '@/hooks/use-app-store';
import { Loader2 } from 'lucide-react';

interface SubscriptionGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function SubscriptionGuard({ 
  children, 
  fallback = <Loader2 className="w-4 h-4 animate-spin" />,
  redirectTo = '/subscription'
}: SubscriptionGuardProps) {
  const router = useRouter();
  const activeProduct = useActiveProduct();
  const organizationId = useOrganizationId();
  const customer = useCustomer();
  const customerLoading = useCustomerLoading();

  useEffect(() => {
    // Only check subscription if user has an organization, customer data is loaded, and not loading
    if (organizationId && !customerLoading && customer !== undefined && !activeProduct) {
      // User has organization but no active product, redirect to subscription
      router.push(redirectTo);
    }
  }, [organizationId, activeProduct, customer, customerLoading, router, redirectTo]);

  // Show loading state while customer data is being fetched
  if (organizationId && customerLoading) {
    return <div className="flex justify-center items-center min-h-[200px]">
      <div className="text-center">
        <Loader2 className="mx-auto mb-2 w-4 h-4 animate-spin" />
        <p className="text-muted-foreground text-sm">Loading subscription data...</p>
      </div>
    </div>;
  }

  // Show fallback while checking or redirecting
  if (organizationId && !customerLoading && customer !== undefined && !activeProduct) {
    return <div className="flex justify-center items-center min-h-[200px]">{fallback}</div>;
  }

  // If no organization, don't show subscription guard (let other guards handle it)
  if (!organizationId) {
    return <>{children}</>;
  }

  // User has organization and active product, show children
  return <>{children}</>;
}
