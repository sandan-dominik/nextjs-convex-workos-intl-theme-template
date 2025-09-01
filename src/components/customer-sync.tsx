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
    setCustomer(transformedCustomer);
  }, [customer, setCustomer]);

  useEffect(() => {
    setCustomerError(customerError);
  }, [customerError, setCustomerError]);

  return null; // This component doesn't render anything
}
