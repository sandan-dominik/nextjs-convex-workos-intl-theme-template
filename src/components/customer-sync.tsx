"use client";

import { useEffect } from 'react';
import { useCustomer } from 'autumn-js/react';
import { 
  useSetCustomer, 
  useSetCustomerLoading, 
  useSetCustomerError 
} from '@/hooks/use-app-store';

// Transform Autumn customer to match app store's Customer type
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function transformAutumnCustomer(autumnCustomer: any) {
  if (!autumnCustomer) return null;
  
  return {
    id: autumnCustomer.id || '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    products: autumnCustomer.products?.map((product: any) => ({
      id: product.id || '',
      name: product.name || '',
      status: product.status || '',
    })) || [],
  };
}

export function CustomerSync() {
  const { customer, isLoading: customerLoading, error: customerError } = useCustomer();
  
  const setCustomer = useSetCustomer();
  const setCustomerLoading = useSetCustomerLoading();
  const setCustomerError = useSetCustomerError();

  // Sync customer data
  useEffect(() => {
    setCustomerLoading(customerLoading);
  }, [customerLoading, setCustomerLoading]);

  useEffect(() => {
    const transformedCustomer = transformAutumnCustomer(customer);
    
    // Only update customer if we have valid data from Autumn
    // This prevents overwriting existing customer data with null during loading
    if (transformedCustomer && transformedCustomer.products && transformedCustomer.products.length > 0) {
      setCustomer(transformedCustomer);
    } else if (customerLoading === false && customer === null) {
      // Only clear customer data if we're not loading and Autumn explicitly returns null
      // This handles the case where user truly has no subscription
      setCustomer(null);
    }
    // Important: We don't call setCustomer(null) during loading states
  }, [customer, setCustomer, customerLoading]);

  useEffect(() => {
    setCustomerError(customerError);
  }, [customerError, setCustomerError]);

  return null; // This component doesn't render anything
}
