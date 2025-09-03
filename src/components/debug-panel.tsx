"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { useAuth } from "@workos-inc/authkit-nextjs/components";
import { useConvexAuth } from "convex/react";
import { useAppStore } from "@/stores/app-store";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import ReactJsonView from '@microlink/react-json-view'

export function DebugPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, organizationId, refreshAuth } = useAuth();
  const workOsData = useAuth()
  const { isAuthenticated, isLoading: convexLoading } = useConvexAuth();
  const { organizationId: storeOrgId, organizations } = useAppStore();
  const store = useAppStore();
  // Get Convex user identity for debugging
  const userIdentity = useQuery(api.autumn.debugUserIdentity);

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="right-4 bottom-4 z-50 fixed"
      >
        Debug
      </Button>
    );
  }

  return (
    <div className="z-50 fixed inset-0 flex justify-center items-center bg-black/50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row justify-between items-center space-y-0 pb-2">
          <CardTitle className="font-semibold text-lg">Debug Panel</CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </CardHeader>
        <CardContent className="max-h-[calc(90vh-80px)] overflow-y-auto">
          <Tabs defaultValue="auth" className="w-full">
            <TabsList className="grid grid-cols-5 w-full">
              <TabsTrigger value="auth">Auth</TabsTrigger>
              <TabsTrigger value="convex">Convex</TabsTrigger>
              <TabsTrigger value="store">Store</TabsTrigger>
              <TabsTrigger value="raw">Raw Data</TabsTrigger>
            </TabsList>

            {/* Auth Tab */}
            <TabsContent value="auth" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium text-lg">WorkOS Authentication</h3>
                <div className="gap-4 grid grid-cols-2 text-sm">
                  <div>
                    <span className="font-medium">User ID:</span>
                    <div className="text-muted-foreground break-all">
                      {user?.id || "Not available"}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Email:</span>
                    <div className="text-muted-foreground">
                      {user?.email || "Not available"}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Organization ID:</span>
                    <div className="text-muted-foreground break-all">
                      {organizationId || "Not available"}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">First Name:</span>
                    <div className="text-muted-foreground">
                      {user?.firstName || "Not available"}
                    </div>
                  </div>
                </div>
                <div className="bg-muted mt-1 p-2 rounded">
                  <ReactJsonView 
                    src={workOsData} 
                    theme="monokai"
                    displayDataTypes={false}
                    displayObjectSize={false}
                    enableClipboard={false}
                    name={null}
                  />
                </div>
                <Button onClick={() => refreshAuth()}>Refresh Auth</Button>
              </div>
            </TabsContent>

            {/* Convex Tab */}
            <TabsContent value="convex" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium text-lg">Convex Authentication</h3>
                <div className="gap-4 grid grid-cols-2 text-sm">
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge variant={isAuthenticated ? "default" : "secondary"}>
                      {isAuthenticated ? "Authenticated" : "Not Authenticated"}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Loading:</span>
                    <Badge variant={convexLoading ? "default" : "secondary"}>
                      {convexLoading ? "Loading" : "Ready"}
                    </Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <span className="font-medium">User Identity Debug:</span>
                  {userIdentity ? (
                    <div className="bg-muted mt-2 p-3 rounded-md text-xs">
                      <div className="gap-2 grid grid-cols-2">
                        <div>
                          <span className="font-medium">Has User:</span>
                          <Badge variant={userIdentity.hasUser ? "default" : "secondary"} className="ml-2">
                            {userIdentity.hasUser ? "Yes" : "No"}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">User Keys:</span>
                          <div className="mt-1 text-muted-foreground">
                            {userIdentity.userKeys?.join(", ") || "None"}
                          </div>
                        </div>
                      </div>
                      {userIdentity.user && (
                        <div className="mt-2">
                          <span className="font-medium">User Data:</span>
                          <div className="bg-background mt-1 p-2 rounded">
                            <ReactJsonView 
                              src={userIdentity.user} 
                              theme="monokai"
                              displayDataTypes={false}
                              displayObjectSize={false}
                              enableClipboard={false}
                              name={null}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 text-muted-foreground text-sm">
                      Loading user identity...
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Store Tab */}
            <TabsContent value="store" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium text-lg">App Store State</h3>
                <div className="gap-4 grid grid-cols-2 text-sm">
                  <div>
                    <span className="font-medium">Store Organization ID:</span>
                    <div className="text-muted-foreground break-all">
                      {storeOrgId || "Not set"}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">Organizations Count:</span>
                    <div className="text-muted-foreground">
                      {organizations?.length || 0}
                    </div>
                  </div>
                </div>

                {organizations && organizations.length > 0 && (
                  <div>
                    <span className="font-medium">Organizations:</span>
                    <div className="space-y-2 mt-2">
                      {organizations.map((org, index) => (
                        <div key={index} className="bg-muted p-2 rounded text-xs">
                          <div className="font-medium">{org.name}</div>
                          <div className="text-muted-foreground break-all">{org.id}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Raw Data Tab */}
            <TabsContent value="raw" className="space-y-4">
              <div className="space-y-3">
                <h3 className="font-medium text-lg">Raw Data</h3>
                <div className="space-y-4">
                  <div>
                    <span className="font-medium">WorkOS User:</span>
                    <div className="bg-muted mt-1 p-2 rounded">
                      <ReactJsonView 
                        src={user || {}} 
                        theme="monokai"
                        displayDataTypes={false}
                        displayObjectSize={false}
                        enableClipboard={false}
                        name={null}
                      />
                    </div>
                  </div>
                  <div>
                    <span className="font-medium">App Store:</span>
                    <div className="bg-muted mt-1 p-2 rounded">
                      <ReactJsonView 
                        src={{ store }} 
                        theme="monokai"
                        displayDataTypes={false}
                        displayObjectSize={false}
                        enableClipboard={false}
                        name={null}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}