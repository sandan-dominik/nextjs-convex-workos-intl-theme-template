"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogInIcon } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { signIn } from "@/app/actions/auth";
import { useActionState, useEffect, startTransition } from "react";
import { Loader2 } from "lucide-react";
import { createSignInSchema } from "@/schemas/zod/auth";
import OAuthButton from "@/components/oauth-button";

export default function SignInForm() {
  const t = useTranslations("SignInPage");
  const tAuth = useTranslations("Authentication");
  const tValidation = useTranslations("validation");
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, formAction, isPending] = useActionState(signIn, null);

  // Get error from URL query parameters (from auth callback redirects)
  const urlError = searchParams.get('error');

  // Create schema with translated error messages
  const signInSchema = createSignInSchema(tValidation);
  type LoginFormData = z.infer<typeof signInSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<LoginFormData>({
    mode: "onChange",
    resolver: zodResolver(signInSchema)
  });

  // Handle server-side validation errors
  useEffect(() => {
    if (state?.zodErrors && typeof state.zodErrors === 'object') {
      // Set server validation errors on the form
      Object.entries(state.zodErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          setError(field as keyof LoginFormData, {
            type: 'server',
            message: messages[0]
          });
        }
      });
    }

    // Handle successful signin
    if (state?.redirect && typeof state.redirect === 'string') {
      console.log('Redirecting to:', state.redirect);
      setTimeout(() => {
        router.push(state.redirect as string);
      }, 3000);
    }
  }, [state, setError, router]);

  const onSubmit = async (data: LoginFormData) => {
    // Create FormData for server action
    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('password', data.password);

    // Call the server action within startTransition
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <div className="flex flex-col gap-6 md:w-[350px]">
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-xl">{t("title")}</CardTitle>
          <CardDescription>{t("enterCredentials")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {urlError && (
            <p className="bg-red-500 mt-1 p-2 rounded-md text-white text-sm">
              {urlError === 'auth_failed' && t("oauthAuthenticationFailed")}
              {urlError === 'user_not_found' && t("userNotFound")}
              {urlError === 'unknown' && t("unknownError")}
            </p>
          )}
          {state && state.success && <p className="bg-green-500 mt-1 p-2 rounded-md text-white text-sm">{state.message}</p>}
          {state && !state.success && <p className="bg-red-500 mt-1 p-2 rounded-md text-white text-sm">{state.message}</p>}
          <div className="gap-4 grid grid-cols-4">
            <OAuthButton provider="GoogleOAuth" className="w-full" iconsOnly={true}>
              Google
            </OAuthButton>
            <OAuthButton provider="GitHubOAuth" className="w-full" iconsOnly={true}>
              GitHub
            </OAuthButton>
            <OAuthButton provider="MicrosoftOAuth" className="w-full" iconsOnly={true}>
              Microsoft
            </OAuthButton>
            <OAuthButton provider="AppleOAuth" className="w-full" iconsOnly={true}>
              Apple
            </OAuthButton>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="border-t w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{tAuth("orContinueWith")}</span>
            </div>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{tAuth("email.label")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={tAuth("email.placeholder")}
                {...register("email")}
                aria-invalid={errors.email ? "true" : "false"}
              />
              {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">{tAuth("password.label")}</Label>
                <Link href="/reset-password" className="text-sm hover:underline">
                  {tAuth("forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder={tAuth("password.placeholder")}
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.password && (
                <p className="mt-1 text-red-500 text-sm">{errors.password.message}</p>
              )}
            </div>
            <Button type="submit" className="w-full cursor-pointer" disabled={(isPending || isSubmitting)}>
              {(isPending || isSubmitting) ? (
                <>
                  <Loader2 className="mr-2 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  {tAuth("signIn")}
                  <LogInIcon className="ml-2 w-4 h-4" />
                </>
              )}
            </Button>
            <div className="text-sm text-center">
              {tAuth("dontHaveAccount")} {" "}
              <Link href="/sign-up" className="underline underline-offset-4">
                {tAuth("signUp")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-xs text-center *:[a]:underline *:[a]:underline-offset-4 text-balance">
        {t("termsAndPrivacy")}
      </div>
    </div>
  );
}