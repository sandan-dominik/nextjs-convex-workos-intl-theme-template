"use client";

import { useState } from 'react';
import { 
  useUser, 
  useOrganizationId, 
  useOrganizations, 
  useCustomer, 
  useActiveProduct, 
  useIsLoading, 
  useCustomerLoading, 
  useError, 
  useCustomerError, 
  useIsAuthenticated, 
  useIsReady 
} from '@/hooks/use-app-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Bug } from 'lucide-react';
import ReactJsonView from '@microlink/react-json-view'

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  
  // Use individual hooks to avoid object recreation
  const user = useUser();
  const organizationId = useOrganizationId();
  const organizations = useOrganizations();
  const customer = useCustomer();
  const activeProduct = useActiveProduct();
  const isLoading = useIsLoading();
  const customerLoading = useCustomerLoading();
  const error = useError();
  const customerError = useCustomerError();
  const isAuthenticated = useIsAuthenticated();
  const isReady = useIsReady();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  // Ensure we're on the client side
  if (typeof window === 'undefined') {
    return null;
  }

  // Helper function to safely convert unknown to string
  const safeStringify = (value: unknown): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return value.toString();
    if (typeof value === 'boolean') return value.toString();
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="top-14 right-4 z-[9999] fixed shadow-lg rounded-full w-12 h-12"
        size="icon"
        variant="outline"
      >
        <Bug className="w-5 h-5" />
      </Button>

      {/* Debug Panel */}
      {isOpen && (
        <div className="top-14 right-16 z-50 fixed w-lg max-h-[80vh] overflow-y-auto">
          <Card className="shadow-xl border-2">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Bug className="w-4 h-4" />
                  App Store Debug
                </CardTitle>
                <Button
                  onClick={() => setIsOpen(false)}
                  size="sm"
                  variant="ghost"
                  className="p-0 w-6 h-6"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">

              <div>
                <h4 className="flex items-center gap-2 mb-2 font-semibold">
                  Authentication
                  <Badge variant={isAuthenticated ? "default" : "destructive"}>
                    {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                  </Badge>
                </h4>
                <div className="space-y-1 pl-2">
                  <div>User: {user?.email || "None"}</div>
                  <div>Org ID: {organizationId || "None"}</div>
                  <div>Ready: {isReady ? "Yes" : "No"}</div>
                </div>
              </div>


              <div>
                <h4 className="mb-2 font-semibold">Loading States</h4>
                <div className="space-y-1 pl-2">
                  <div>App Loading: {isLoading ? "Yes" : "No"}</div>
                  <div>Customer Loading: {customerLoading ? "Yes" : "No"}</div>
                </div>
              </div>


              <div>
                <h4 className="mb-2 font-semibold">
                  Organizations ({Array.isArray(organizations) ? organizations.length : 0})
                </h4>
                <div className="space-y-1 pl-2">
                  {Array.isArray(organizations) && organizations.map((org) => (
                    <div key={org.id} className="text-xs">
                      {org.name} ({org.id})
                    </div>
                  ))}
                </div>
              </div>


              <div>
                <h4 className="mb-2 font-semibold">Subscription</h4>
                <div className="space-y-1 pl-2">
                  <div>Customer: {customer ? "Yes" : "No"}</div>
                  <div>Active Product: {activeProduct?.name || "None"}</div>
                  <div>Product Status: {activeProduct?.status || "N/A"}</div>
                </div>
              </div>


              {Boolean(error || customerError) && (
                <div>
                  <h4 className="mb-2 font-semibold text-red-600">Errors</h4>
                  <div className="space-y-1 pl-2">
                    {Boolean(error) && <div className="text-red-600">{safeStringify(error)}</div>}
                    {Boolean(customerError) && (
                      <div className="text-red-600">
                        Customer Error: {safeStringify(customerError)}
                      </div>
                    )}
                  </div>
                </div>
              )}


              <details>
                <summary className="font-semibold cursor-pointer">Raw State</summary>
                <pre className="bg-muted mt-2 p-2 rounded w-full max-h-96 overflow-auto text-xs">
                  <ReactJsonView 
                    src={{
                      user,
                      organizationId,
                      organizations,
                      customer,
                      activeProduct,
                      isLoading,
                      customerLoading,
                      error: error || null,
                      customerError: customerError || null,
                      isAuthenticated,
                      isReady,
                    }} 
                    theme="monokai" 
                  />
                </pre>
              </details>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}