"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { sendPasswordReset } from "@/app/actions/auth";
import { useActionState, useEffect, startTransition } from "react";
import { Loader2, CheckCircle2Icon } from "lucide-react";
import Link from "next/link";

type PasswordResetFormData = {
  email: string;
};

export default function PasswordResetForm() {
  const t = useTranslations("PasswordResetPage");
  const tAuth = useTranslations("Authentication");
  const tValidation = useTranslations("validation");
  const [state, formAction, isPending] = useActionState(sendPasswordReset, null);

  // Create schema with translated error messages
  const schema = z.object({
    email: z.string().min(1, tValidation("required")).email(tValidation("invalidEmail")),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<PasswordResetFormData>({
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  // Handle server-side validation errors
  useEffect(() => {
    if (state?.zodErrors && typeof state.zodErrors === 'object') {
      Object.entries(state.zodErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          setError(field as keyof PasswordResetFormData, {
            type: 'server',
            message: messages[0]
          });
        }
      });
    }
  }, [state, setError]);

  const onSubmit = async (data: PasswordResetFormData) => {
    const formData = new FormData();
    formData.append('email', data.email);
    
    startTransition(() => {
      formAction(formData);
    });
  };

  if (state?.success) {
    return (
      <Card className="w-full md:w-[400px]">
        <CardHeader>
          <CardTitle className="flex justify-center items-center gap-2 text-xl"><CheckCircle2Icon className="size-5" />{t("emailSent")}</CardTitle>
          <CardDescription className="text-sm text-center">{t("checkEmail")}</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <Link href="/sign-in" className="items-center gap-2 text-sminline-flex underline hover:underline">
            {t("backToSignIn")}
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full md:w-[400px]">
      <CardHeader>
        <CardTitle className="text-xl">{t("title")}</CardTitle>
        <CardDescription>{t("description")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {state && !state?.success && (
          <p className="bg-red-500 mt-1 p-2 rounded-md text-white text-sm">{state?.message}</p>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{tAuth("email.label")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={tAuth("email.placeholder")}
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
              className="text-lg"
            />
            {errors.email && (
              <p className="mt-1 text-red-500 text-sm">{errors.email?.message}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full cursor-pointer" disabled={(isPending || isSubmitting)}>
            {(isPending || isSubmitting) ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                {t("sending")}
              </>
            ) : (
              t("sendResetLink")
            )}
          </Button>
        </form>

        <div className="text-sm text-center">
          <Link href="/sign-in" className="underline hover:underline">
            {t("backToSignIn")}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
