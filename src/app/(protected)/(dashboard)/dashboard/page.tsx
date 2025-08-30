import { withAuth } from "@workos-inc/authkit-nextjs";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getOrganization } from "@/app/actions/auth";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default async function DashboardPage() {
  const { user, sessionId, organizationId } = await withAuth({ ensureSignedIn: true });
  const t = await getTranslations("DashboardPage");

  // Fetch organization data using server action
  const organizationResult = organizationId ? await getOrganization(organizationId) : null;
  const organization = organizationResult?.success ? organizationResult.organization : null;

  return (
    <>
      <div className="flex flex-col flex-1 gap-6 p-6">
        <div className="space-y-4">
          <h1 className="font-bold text-3xl">{t("title")}</h1>

          {user && (
            <div className="flex flex-row gap-6">
              <div className="flex-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>User Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Email</span>
                      <span>{user.email}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Name</span>
                      <span>{user.firstName} {user.lastName}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">User ID</span>
                      <span className="font-mono text-xs">{user.id}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span>{user.emailVerified ? "✅ Verified" : "❌ Not Verified"}</span>
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="flex-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Organization Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Organization</span>
                      <span>
                        {organizationId ? (
                          organization ? organization.name : "Failed to load organization"
                        ) : "No organization"}
                      </span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Organization ID</span>
                      <span className="font-mono text-xs">{organizationId || "—"}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Session ID</span>
                      <span className="font-mono text-xs">{sessionId}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Created</span>
                      <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                    </p>
                    <p className="flex justify-between">
                      <span className="text-muted-foreground">Updated</span>
                      <span>{new Date(user.updatedAt).toLocaleDateString()}</span>
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            {!organizationId && (
              <Link
                href="/onboarding"
                className="text-primary hover:text-primary/80 underline"
              >
                {t("startOnboarding")}
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}