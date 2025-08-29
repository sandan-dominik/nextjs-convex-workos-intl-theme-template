import { withAuth } from "@workos-inc/authkit-nextjs";
import SignOutButton from "@/components/sign-out-button";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getOrganization } from "@/app/actions/auth";

export default async function DashboardPage() {
  const { user, sessionId, organizationId } = await withAuth({ensureSignedIn: true});
  const t = await getTranslations("DashboardPage");
  
  // Fetch organization data using server action
  const organizationResult = organizationId ? await getOrganization(organizationId) : null;
  const organization = organizationResult?.success ? organizationResult.organization : null;

  return (
    <div className="flex flex-col justify-center items-center gap-6 p-6 md:p-10 min-h-svh">
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <h1 className="font-bold text-2xl">{t("title")}</h1>
        {user && (
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {user.emailVerified ? "✅ Verified" : "❌ Not Verified"}</p>
            <p><strong>Session ID:</strong> {sessionId}</p>
            <p><strong>Organization ID:</strong> {organizationId}</p>
            <div className="flex items-center gap-2">
              <strong>Organization:</strong>
              {organizationId ? (
                organization ? (
                  organization.name
                ) : (
                  "Failed to load organization"
                )
              ) : (
                "No organization"
              )}
            </div>
            </div>
        )}
        <SignOutButton />
        {!organizationId && (
          <Link href="/onboarding" className="underline">{t("startOnboarding")}</Link>
        )}
      </div>
    </div>
  );
}