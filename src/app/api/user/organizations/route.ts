// app/api/user/organizations/route.ts
import { getWorkOS, withAuth } from '@workos-inc/authkit-nextjs';
import { getTranslations } from 'next-intl/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const workos = getWorkOS();

    // Ensure user is authenticated
    const { user } = await withAuth({ ensureSignedIn: true });

    // Get the current user's organizations
    const organizations = await workos.userManagement.listOrganizationMemberships({
      userId: user.id,
    });

    return NextResponse.json({
      success: true,
      organizations: organizations.data.map(org => ({
        id: org.organizationId,
        name: org.organizationName,
        object: org.object,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt,
        role: org.role,
      }))
    });
  } catch (error: unknown) {
    console.error('Error fetching user organizations:', error);
    const t = await getTranslations("actions.auth");
    
    // Handle authentication errors
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : t("failedToFetchUserOrganizations"),
        organizations: undefined,
      },
      { status: 500 }
    );
  }
}