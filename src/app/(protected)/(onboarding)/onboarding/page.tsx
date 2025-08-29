import { withAuth } from "@workos-inc/authkit-nextjs";
import OnboardingForm from "@/components/onboarding-form";
export default async function OnboardingPage() {
  await withAuth({ensureSignedIn: true});
  return (
    <div className="flex flex-col justify-center items-center gap-6 p-6 md:p-10 min-h-svh">
      <OnboardingForm />
    </div>
  );
}