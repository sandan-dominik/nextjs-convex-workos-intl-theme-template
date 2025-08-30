"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { Loader2, Building2, Check } from "lucide-react";
import { getUserOrganizations, switchToSelectedOrganization, completeOAuthWithOrganization, signout } from "@/app/actions/auth";

interface Organization {
  id: string;
  name: string;
  object: string;
  createdAt: string;
  updatedAt: string;
  role?: unknown;
  domains?: Array<{
    object: string;
    id: string;
    domain: string;
    organizationId: string;
    state: string;
    verificationStrategy: string;
    createdAt: string;
    updatedAt: string;
  }>;
  metadata?: Record<string, string>;
}

interface OrganizationSelectorProps {
  pendingToken?: string;
  availableOrganizations?: Organization[];
}

export default function OrganizationSelector({ pendingToken, availableOrganizations }: OrganizationSelectorProps) {
  const t = useTranslations("SelectOrganizationPage");
  const tAuth = useTranslations("Authentication");
  const router = useRouter();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState<string>("");
  const [signOutState, signOutAction, isSigningOut] = useActionState(signout, null);

  useEffect(() => {
    console.log('OrganizationSelector useEffect:', {
      availableOrganizations,
      hasOrganizations: availableOrganizations && availableOrganizations.length > 0,
      organizationsLength: availableOrganizations?.length
    });
    
    if (availableOrganizations && availableOrganizations.length > 0) {
      // Use organizations passed from URL (from OAuth error)
      console.log('Using organizations from props:', availableOrganizations);
      setOrganizations(availableOrganizations);
      // Auto-select first organization if only one exists
      if (availableOrganizations.length === 1) {
        setSelectedOrgId(availableOrganizations[0].id);
      }
      setIsLoading(false);
    } else {
      // Fallback: fetch organizations if none provided
      console.log('No organizations from props, fetching from API');
      const fetchOrganizations = async () => {
        try {
          setIsLoading(true);
          setError("");
          
          const result = await getUserOrganizations();
          
          if (result.success && result.organizations) {
            setOrganizations(result.organizations);
            // Auto-select first organization if only one exists
            if (result.organizations.length === 1) {
              setSelectedOrgId(result.organizations[0].id);
            }
          } else {
            setError(result.message || t("failedToLoadOrganizations"));
          }
        } catch (error) {
          console.error("Failed to fetch organizations:", error);
          setError(t("failedToLoadOrganizations"));
        } finally {
          setIsLoading(false);
        }
      };

      fetchOrganizations();
    }
  }, [t, availableOrganizations]);

  const handleOrganizationSelect = async () => {
    if (!selectedOrgId) {
      setError(t("pleaseSelectOrganization"));
      return;
    }

    try {
      setIsSwitching(true);
      setError("");
      
      if (pendingToken) {
        // If we have a pending token from OAuth, use it to complete the authentication
        // This is more efficient than switching organizations
        const result = await completeOAuthWithOrganization(pendingToken, selectedOrgId);
        if (result.success) {
          router.push("/dashboard");
          return;
        }
      }
      
      // Fallback to regular organization switching
      const result = await switchToSelectedOrganization(selectedOrgId);
      
      if (result.success) {
        // Redirect to dashboard after successful organization switch
        router.push("/dashboard");
      } else {
        setError(result.message || t("failedToSwitchOrganization"));
      }
    } catch (error) {
      console.error("Failed to switch organization:", error);
      setError(t("failedToSwitchOrganization"));
    } finally {
      setIsSwitching(false);
    }
  };

  const handleSignOut = () => {
    startTransition(() => {
      signOutAction();
    });
  };

  // Handle sign out redirect
  useEffect(() => {
    if (signOutState?.success && signOutState?.redirect) {
      router.push(signOutState.redirect);
    }
  }, [signOutState, router]);

  if (isLoading) {
    return (
      <Card className="w-full md:w-[500px]">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">{t("loadingOrganizations")}</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <Loader2 className="mx-auto mb-4 w-8 h-8 animate-spin" />
          <p>{t("pleaseWait")}</p>
        </CardContent>
      </Card>
    );
  }

  if (error && organizations.length === 0) {
    return (
      <Card className="w-full md:w-[500px]">
        <CardHeader className="text-center">
          <CardTitle className="text-red-600 text-xl">{t("error")}</CardTitle>
        </CardHeader>
        <CardContent className="py-8 text-center">
          <p className="mb-4 text-red-600">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            {t("tryAgain")}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full md:w-[500px]">
      <CardHeader className="text-center">
        <CardTitle className="text-xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <p className="bg-red-500 p-3 rounded-md text-white text-sm">{error}</p>
        )}
        
        <div className="space-y-3">
          {organizations.map((org) => (
            <div
              key={org.id}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedOrgId === org.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setSelectedOrgId(org.id)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="flex justify-center items-center bg-primary/10 rounded-full w-10 h-10">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{org.name}</h3>
                  {org.domains && org.domains.length > 0 && (
                    <p className="text-muted-foreground text-xs truncate">
                      {org.domains[0].domain}
                    </p>
                  )}
                </div>
                
                {selectedOrgId === org.id && (
                  <Check className="flex-shrink-0 w-5 h-5 text-primary" />
                )}
              </div>
            </div>
          ))}
        </div>
        
        <Button
          onClick={handleOrganizationSelect}
          disabled={!selectedOrgId || isSwitching}
          className="w-full cursor-pointer"
        >
          {isSwitching ? (
            <>
              <Loader2 className="mr-2 w-4 h-4 animate-spin" />
              {t("switching")}
            </>
          ) : (
            t("continueToOrganization")
          )}
        </Button>
        
        <div className="text-center">
          <Button
            variant="link"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="text-muted-foreground text-sm underline cursor-pointer"
          >
            {isSigningOut ? (
              <>
                <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                {tAuth("pleaseWait")}
              </>
            ) : (
              t("signOut")
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
