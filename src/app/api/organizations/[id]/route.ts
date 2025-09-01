// app/api/organizations/[id]/route.ts
import { getWorkOS, withAuth } from '@workos-inc/authkit-nextjs';
import { getTranslations } from 'next-intl/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const t = await getTranslations("actions.auth");
    const { id: organizationId } = await params;

    if (!organizationId) {
      return NextResponse.json(
        { 
          success: false, 
          message: t("organizationIdRequired"),
          organization: null 
        },
        { status: 400 }
      );
    }

    const workos = getWorkOS();
    // Ensure user is authenticated
    await withAuth({ ensureSignedIn: true });

    /* Check if user is a member of the organization TODO
    const isMember = await workos.userManagement.listOrganizationMemberships({
      userId: user.id,
      organizationId: organizationId,
    });*/

    const organization = await workos.organizations.getOrganization(organizationId);

    return NextResponse.json({
      success: true,
      organization: {
        id: organization.id,
        name: organization.name,
        object: organization.object,
        createdAt: organization.createdAt,
        updatedAt: organization.updatedAt,
        domains: organization.domains,
        metadata: organization.metadata
      }
    });
  } catch (error: unknown) {
    console.error('Error fetching organization:', error);
    const t = await getTranslations("actions.auth");
    
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : t("failedToFetchOrganization"),
        organization: null,
      },
      { status: 500 }
    );
  }
}