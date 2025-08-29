"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { signUp } from "@/app/actions/auth";
import { useActionState, useEffect, startTransition } from "react";
import { createSignUpSchema } from "@/schemas/zod/auth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import OAuthButton from "@/components/oauth-button";

export default function SignUpForm() {  
  const t = useTranslations("SignUpPage");
  const tAuth = useTranslations("Authentication");
  const tValidation = useTranslations("validation");
  const [state, formAction, isPending] = useActionState(signUp, null);
  const router = useRouter();
  
  // Create schema with translated error messages
  const signUpSchema = createSignUpSchema(tValidation);
  type SignUpFormData = z.infer<typeof signUpSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<SignUpFormData>({
    mode: "onChange",
    resolver: zodResolver(signUpSchema),
  });

  // Handle server-side validation errors
  useEffect(() => {
    if (state?.zodErrors && typeof state.zodErrors === 'object') {
      // Set server validation errors on the form
      Object.entries(state.zodErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          setError(field as keyof SignUpFormData, {
            type: 'server',
            message: messages[0]
          });
        }
      });
    }
    
    // Handle successful signup
    if (state?.success && state?.redirect) {
      router.push(state.redirect);
    }
  }, [state, setError, router]);  

  const onSubmit = async (data: SignUpFormData) => {
    // Create FormData for server action
    const formData = new FormData();
    formData.append('firstname', data.firstname);
    formData.append('name', data.name);
    formData.append('email', data.email);
    formData.append('password', data.password);
    
    // Call the server action within startTransition
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className="w-full md:w-[350px]">
      <CardHeader>
        <CardTitle className="text-xl">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {state && state.success && <p className="bg-green-500 mt-1 p-2 rounded-md text-white text-sm">{state.message}</p>}
        {state && !state.success && <p className="bg-red-500 mt-1 p-2 rounded-md text-white text-sm">{state.message}</p>}
        <div className="gap-4 grid">
          <OAuthButton provider="GoogleOAuth" className="w-full">
            Google
          </OAuthButton>
          <OAuthButton provider="GitHubOAuth" className="w-full">
            GitHub
          </OAuthButton>
          <OAuthButton provider="MicrosoftOAuth" className="w-full">
            Microsoft
          </OAuthButton>
          <OAuthButton provider="AppleOAuth" className="w-full">
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
          <div className="gap-4 grid grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstname">{tAuth("firstname.label")}</Label>
              <Input
                id="firstname"
                type="name"
                placeholder={tAuth("firstname.placeholder")}
                {...register("firstname")}
                aria-invalid={errors.firstname ? "true" : "false"}
              />
              {errors.firstname && <p className="mt-1 text-red-500 text-sm">{tAuth("error.required")}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="name">{tAuth("lastname.label")}</Label>
              <Input
                id="name"
                type="name"
                placeholder={tAuth("lastname.placeholder")}
                {...register("name")}
                aria-invalid={errors.name ? "true" : "false"}
              />
              {errors.name && <p className="mt-1 text-red-500 text-sm">{tAuth("error.required")}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">{tAuth("email.label")}</Label>
            <Input
              id="email"
              type="email"
              placeholder={tAuth("email.placeholder")}
              {...register("email")}
              aria-invalid={errors.email ? "true" : "false"}
            />
            {errors.email && <p className="mt-1 text-red-500 text-sm">{tAuth("error.email")}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{tAuth("password.label")}</Label>
            <Input
              id="password"
              type="password"
              placeholder={tAuth("password.placeholder")}
              {...register("password")}
              aria-invalid={errors.password ? "true" : "false"}
            />
            {errors.password && (
              <p className="mt-1 text-red-500 text-sm">{tAuth("error.password")}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={(isPending || isSubmitting)}>
            {(isPending || isSubmitting) ? <Loader2 className="animate-spin" /> : tAuth("signUp")}
          </Button>
          <div className="text-sm text-center">
            {tAuth("alreadyHaveAccount")} {" "}
            <Link href="/sign-in" className="underline underline-offset-4">
              {tAuth("signIn")}
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}