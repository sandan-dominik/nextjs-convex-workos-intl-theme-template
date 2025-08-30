"use client";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { useTranslations } from "next-intl";
import { useActionState, startTransition, useEffect } from "react";
import { verifyEmail } from "@/app/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function OTPForm() {
  const t = useTranslations("OTPPage"); 
  const [state, formAction, isPending] = useActionState(verifyEmail, null);
  const searchParams = useSearchParams();
  const token = searchParams.get('token');  
  const router = useRouter();

  // Handle successful verification
  useEffect(() => {
    if (state?.success && state?.redirect) {
      setTimeout(() => {
        router.push(state.redirect as string);
      }, 3000);
    }
  }, [state, router]);

  const handleComplete = (value: string) => {
    if (!token) {
      router.push('/sign-in');
      return;
    }

    const formData = new FormData();
    formData.append('code', value);
    formData.append('token', token);
    
    startTransition(() => {
      formAction(formData);
    });
  };

  // If no token is provided, redirect to sign-in
  if (!token) {
    router.push('/sign-in');
    return null;
  }

  return (
    <Card className="w-full md:w-[350px]">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {state && state.success && (
          <p className="bg-green-500 mt-1 p-2 rounded-md text-white text-sm">
            {state.message}
          </p>
        )}
        {state && !state.success && (
          <p className="bg-red-500 mt-1 p-2 rounded-md text-white text-sm">
            {state.message}
          </p>
        )}
        
        <div className="space-y-4">
          <InputOTP
            maxLength={6}
            pattern={REGEXP_ONLY_DIGITS}
            onComplete={handleComplete}
            disabled={isPending}>
            <InputOTPGroup className="space-x-4 *:border! *:rounded-lg!">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
          
          {isPending && (
            <div className="flex justify-center items-center space-x-2">
              <Loader2 className="animate-spin" />
              <span className="text-muted-foreground text-sm">
                {t("verifying")}
              </span>
            </div>
          )}
        </div>
        
        <p className="text-muted-foreground text-sm">
          {t("description")}
        </p>
      </CardContent>
    </Card>
  );
}