import NewPasswordForm from "@/app/(auth)/_components/new-password-form";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

interface NewPasswordPageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function NewPasswordPage({ searchParams }: NewPasswordPageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/reset-password");
  }

  return (
    <div className="flex flex-col justify-center items-center gap-6 p-6 md:p-10 min-h-svh">
      <Link href="/" className="flex items-center self-center gap-2 font-medium">
          <div className="flex justify-center items-center bg-primary rounded-md size-6 text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </Link>
      <NewPasswordForm token={token} />
    </div>
  );
}
