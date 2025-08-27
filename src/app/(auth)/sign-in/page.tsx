import { GalleryVerticalEnd } from "lucide-react"

import SignInForm from "@/components/sign-in-form"
import Link from "next/link"
import { withAuth } from "@workos-inc/authkit-nextjs";
import { redirect } from "next/navigation";

export default async function SignInPage() {

  const { user } = await withAuth();
  if(user){
    redirect('/workspace');
  }

  return (
    <div className="flex flex-col justify-center items-center gap-6 p-6 md:p-10 min-h-svh">
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <Link href="/" className="flex items-center self-center gap-2 font-medium">
          <div className="flex justify-center items-center bg-primary rounded-md size-6 text-primary-foreground">
            <GalleryVerticalEnd className="size-4" />
          </div>
          Acme Inc.
        </Link>
        <SignInForm />
      </div>
    </div>
  )
}