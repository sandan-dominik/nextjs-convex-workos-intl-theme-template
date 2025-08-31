"use client";

import { useCustomer } from "autumn-js/react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useConvexAuth } from "convex/react";
import { useEffect } from "react";

interface SubscriptionBadgeProps {
    variant?: "default" | "text";
    className?: string;
}

function SubscriptionBadge({ variant = "default", className }: SubscriptionBadgeProps) {
    const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();  
    const { organizationId } = useAuth();
    const { customer, isLoading: customerLoading, error } = useCustomer();

    // Enhanced debug logging
    useEffect(() => {
        console.log('🔍 SubscriptionBadge Mount/Update:', {
            convexLoading,
            isAuthenticated,
            organizationId,
            customerLoading,
            customer: customer ? {
                exists: true,
                productsCount: customer.products?.length || 0,
                hasProducts: !!customer.products
            } : 'null',
            error: error ? 'exists' : 'none',
            timestamp: new Date().toISOString()
        });
    }, [convexLoading, isAuthenticated, organizationId, customerLoading, customer, error]);

    // Don't render anything until auth is fully ready
    if (convexLoading || !isAuthenticated || !organizationId) {
      console.log('🔍 SubscriptionBadge: Auth not ready - showing loading');
      return (
        <div className="inline-flex items-center bg-muted px-2 py-1 rounded-md font-medium text-muted-foreground text-xs">
          <div className="bg-muted-foreground mr-2 rounded-full w-2 h-2 animate-pulse" />
          Loading...
        </div>
      );
    }

    // Show loading state while customer is being fetched
    if (customerLoading) {
      console.log('⏳ SubscriptionBadge: Customer loading - showing spinner');
      return (
        <div className="inline-flex items-center bg-muted px-2 py-1 rounded-md font-medium text-muted-foreground text-xs">
          <div className="bg-muted-foreground mr-2 rounded-full w-2 h-2 animate-pulse" />
          <Loader2 className="w-2 h-2 animate-spin" />
        </div>
      );
    }

    // Handle errors gracefully
    if (error) {
      console.error('❌ SubscriptionBadge: Error occurred:', error);
      return (
        <div className="inline-flex items-center bg-destructive/10 px-2 py-1 rounded-md font-medium text-destructive text-xs">
          Billing error
        </div>
      );
    }

    // Check if customer exists and has products
    if (!customer || !customer.products) {
      console.log('🔍 SubscriptionBadge: No customer/products - showing Free. Customer:', customer);
      return (
        <>
          {variant === "text" ? (
            <span className="font-bold">Free</span>
          ) : (
            <Badge variant="outline" className={className}>
              Free
            </Badge>
          )}
        </>
      );
    }

    // Get the active product
    const activeProduct = customer.products.find(
        (product) => product.status === "active"
    );

    if (!activeProduct) {
        console.log('🔍 SubscriptionBadge: No active product - showing Free. Products:', customer.products);
        return (
            <>
                {variant === "text" ? (
                    <span className="font-bold">Free</span>
                ) : (
                    <Badge variant="outline" className={className}>
                        Free
                    </Badge>
                )}
            </>
        );
    }

    console.log('✅ SubscriptionBadge: Active product found:', activeProduct.name);
    return (
        <>
            {variant === "text" ? (
                <span className="font-bold">{activeProduct.name}</span>
            ) : (
                <Badge variant="default" className={className}>
                    {activeProduct.name}
                </Badge>
            )}
        </>
    );
}

export { SubscriptionBadge };