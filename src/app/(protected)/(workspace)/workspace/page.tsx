import { withAuth } from "@workos-inc/authkit-nextjs";
import SignOutButton from "@/components/sign-out-button";

export default async function WorkspacePage() {
  const { user } = await withAuth({ensureSignedIn: true});
  
  return (
    <div className="flex flex-col justify-center items-center gap-6 p-6 md:p-10 min-h-svh">
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <h1 className="font-bold text-2xl">Workspace</h1>
        {user && (
          <div className="space-y-2">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>User ID:</strong> {user.id}</p>
            <p><strong>Created:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
            <p><strong>Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> {user.emailVerified ? "✅ Verified" : "❌ Not Verified"}</p>
          </div>
        )}
        <SignOutButton />
      </div>
    </div>
  );
}