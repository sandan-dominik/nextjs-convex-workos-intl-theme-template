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

export default function SignUpForm() {  
  const t = useTranslations("SignUpPage");
  const tAuth = useTranslations("Authentication");  

  const registerSchema = z.object({
    firstname: z.string().min(1, tAuth("error.required")),
    name: z.string().min(1, tAuth("error.required")),
    email: z.string().email(tAuth("error.email")),
    password: z.string().min(8, tAuth("error.password"))
  });
  
  type RegisterFormData = z.infer<typeof registerSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    mode: "onChange",
    resolver: zodResolver(registerSchema)
  });

  const onSubmit = async (data: RegisterFormData) => {
    console.log("form data -->", data);
  };

  return (
    <Card className="w-full md:w-[350px]">
      <CardHeader>
        <CardTitle className="text-xl">{t("title")}</CardTitle>
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
              {errors.firstname && <p className="mt-1 text-red-500 text-sm">{errors.firstname.message}</p>}
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
              {errors.name && <p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>}
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
            {errors.email && <p className="mt-1 text-red-500 text-sm">{errors.email.message}</p>}
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
              <p className="mt-1 text-red-500 text-sm">{errors.password.message}</p>
            )}
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : tAuth("signUp")}
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