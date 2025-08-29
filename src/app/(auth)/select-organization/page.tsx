import OrganizationSelector from "@/components/organization-selector";

interface SelectOrganizationPageProps {
  searchParams: Promise<{ token?: string; organizations?: string }>;
}

export default async function SelectOrganizationPage({ searchParams }: SelectOrganizationPageProps) {
  const { token, organizations } = await searchParams;
  
  let parsedOrganizations;
  try {
    if (organizations) {
      parsedOrganizations = JSON.parse(decodeURIComponent(organizations));
      // Only use if it's actually an array with data
      if (!Array.isArray(parsedOrganizations) || parsedOrganizations.length === 0) {
        parsedOrganizations = undefined;
      }
    }
  } catch (error) {
    console.error('Failed to parse organizations from URL:', error);
    parsedOrganizations = undefined;
  }
  
  return (
    <div className="flex flex-col justify-center items-center gap-6 p-6 md:p-10 min-h-svh">
      <OrganizationSelector 
        pendingToken={token} 
        availableOrganizations={parsedOrganizations}
      />
    </div>
  );
}
