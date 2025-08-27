"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { GithubIcon, LogInIcon } from "lucide-react";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";

export default function SignInForm() {
  const t = useTranslations("SignInPage");
  const tAuth = useTranslations("Authentication");

  const loginSchema = z.object({
    email: z.string().email(tAuth("error.email")),
    password: z.string().min(8, tAuth("error.password"))
  });
  
  type LoginFormData = z.infer<typeof loginSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    mode: "onChange",
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log("form data -->", data);
  };

  return (
    <Card className="w-full md:w-[350px]">
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>{t("enterCredentials")}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="gap-4 grid">
          <Button variant="outline" className="w-full">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path
                d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                fill="currentColor"
              />
            </svg>
            Google
          </Button>
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
              <Link href="/forgot-password" className="text-sm hover:underline">
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
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : tAuth("signIn")}
            <LogInIcon
              className="w-4 h-4"
            />
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
  );
}
