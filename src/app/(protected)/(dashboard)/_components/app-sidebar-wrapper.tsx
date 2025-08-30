import { withAuth } from '@workos-inc/authkit-nextjs';
import { getUserOrganizations } from '@/app/actions/auth';
import { AppSidebar } from './app-sidebar';

// Define the role structure based on WorkOS API
interface WorkOSRole {
  slug: string;
  [key: string]: unknown;
}

interface AppSidebarProps {
    variant?: "inset" | "sidebar" | "floating" 
}

export default async function AppSidebarWrapper({ variant }: AppSidebarProps) {
  // Get authenticated user
  const { user, organizationId } = await withAuth({ ensureSignedIn: true });
  
  // Fetch user's organizations
  const organizationsResult = await getUserOrganizations();
  const organizations = organizationsResult.success ? organizationsResult.organizations || [] : [];

  // Get the current active organization from the session or context
  // You might need to implement this based on your WorkOS setup
  const currentOrgId = organizationId || organizations[0]?.id;
  
  // Transform WorkOS data to match sidebar format
  const transformedUser = {
    name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email.split('@')[0],
    email: user.email,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.firstName || user.email)}&background=random`,
  };

  // Pass icon names as strings and mark the active one
  const transformedOrganizations = organizations.map((org, index) => ({
    id: org.id,
    name: org.name,
    iconName: ['Building2', 'GalleryVerticalEnd', 'AudioWaveform', 'Command'][index % 4],
    plan: (org.role as WorkOSRole)?.slug ? (org.role as WorkOSRole).slug.charAt(0).toUpperCase() + (org.role as WorkOSRole).slug.slice(1) : "FREE",
    active: org.id === currentOrgId,
  }));

  return (
    <AppSidebar 
      user={transformedUser}
      organizations={transformedOrganizations}
      variant={variant}
    />
  );
}