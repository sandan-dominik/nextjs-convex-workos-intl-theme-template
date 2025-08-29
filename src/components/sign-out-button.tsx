"use client";

import { Button } from "@/components/ui/button";
import { signout } from "@/app/actions/auth";
import { useRouter } from "next/navigation";
import { useActionState, startTransition, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type SignOutButtonProps = {
  className?: string;
}

export default function SignOutButton({ className }: SignOutButtonProps) {
  const t = useTranslations("DashboardPage");
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(signout, null);

  // Handle sign out redirect
  useEffect(() => {
    if (state?.success && state?.redirect) {
      router.push(state.redirect);
    }
  }, [state, router]);

  const handleSignOut = () => {
    startTransition(() => {
      formAction();
    });
  };

  return (
    <Button 
      onClick={handleSignOut} 
      disabled={isPending}
      variant="destructive"
      className={cn("cursor-pointer", className)}
    >
      {isPending ? (
        <>
          <Loader2 className="mr-2 animate-spin" />
          {t("signingOut")}
        </>
      ) : (
        t("signOut")
      )}
    </Button>
  );
}