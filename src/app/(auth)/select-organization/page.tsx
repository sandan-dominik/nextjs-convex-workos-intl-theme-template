import { getTranslations } from "next-intl/server";
import OrganizationSelector from "@/app/(auth)/_components/organization-selector";

interface SelectOrganizationPageProps {
  searchParams: Promise<{ token?: string; organizations?: string }>;
}

export default async function SelectOrganizationPage({ searchParams }: SelectOrganizationPageProps) {
  const t = await getTranslations("SelectOrganizationPage");
  const { token, organizations } = await searchParams;

  if (!token) {
    return (
      <div className="mx-auto py-12 max-w-md container">
        <div className="text-center">
          <h1 className="mb-4 font-bold text-2xl">{t("error")}</h1>
          <p className="text-muted-foreground">{t("invalidToken")}</p>
        </div>
      </div>
    );
  }

  // Parse organizations from URL parameter
  let availableOrganizations: Array<{
    id: string;
    name: string;
    object: string;
    createdAt: string;
    updatedAt: string;
    domains: Array<{
      object: string;
      id: string;
      domain: string;
      organizationId: string;
      state: string;
      verificationStrategy: string;
      createdAt: string;
      updatedAt: string;
    }>;
    metadata: Record<string, string>;
  }> = [];
  
  if (organizations) {
    try {
      const decoded = decodeURIComponent(organizations);
      const parsed = JSON.parse(decoded);
      // Ensure we have the required properties
      if (Array.isArray(parsed)) {
        availableOrganizations = parsed.map(org => ({
          id: org.id || '',
          name: org.name || '',
          object: org.object || 'organization',
          createdAt: org.createdAt || new Date().toISOString(),
          updatedAt: org.updatedAt || new Date().toISOString(),
          domains: org.domains || [],
          metadata: org.metadata || {}
        }));
      }
    } catch (error) {
      console.error("Failed to parse organizations:", error);
    }
  }

  return (
    <div className="flex flex-col justify-center items-center gap-6 p-6 md:p-10 min-h-svh">
      <OrganizationSelector 
        pendingToken={token} 
        availableOrganizations={availableOrganizations}
      />
    </div>
  );
}
