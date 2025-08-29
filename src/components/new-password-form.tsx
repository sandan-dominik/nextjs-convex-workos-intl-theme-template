"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { resetPassword } from "@/app/actions/auth";
import { useActionState, useEffect, startTransition } from "react";
import { Loader2, Eye, EyeOff, CheckCircle2Icon } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

type NewPasswordFormData = {
  password: string;
  confirmPassword: string;
};

interface NewPasswordFormProps {
  token: string;
}

export default function NewPasswordForm({ token }: NewPasswordFormProps) {
  const t = useTranslations("NewPasswordPage");
  const tAuth = useTranslations("Authentication");
  const tValidation = useTranslations("validation");
  const [state, formAction, isPending] = useActionState(resetPassword, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timer, setTimer] = useState(0);
  const router = useRouter();

  // Create schema with translated error messages
  const schema = z.object({
    password: z.string().min(8, tValidation("tooSmall")),
    confirmPassword: z.string().min(8, tValidation("tooSmall")),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t("passwordsMustMatch"),
    path: ["confirmPassword"],
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<NewPasswordFormData>({
    mode: "onChange",
    resolver: zodResolver(schema),
  });

  // Handle server-side validation errors
  useEffect(() => {
    if (state?.zodErrors && typeof state.zodErrors === 'object') {
      Object.entries(state.zodErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          setError(field as keyof NewPasswordFormData, {
            type: 'server',
            message: messages[0]
          });
        }
      });
    }

    // Handle successful password reset
    if (state?.success && state?.redirect) {
      setTimer(3000);
      setTimeout(() => {
        router.push(state.redirect || '/sign-in');
      }, timer);
    }
  }, [state, setError, router, timer]);

  const onSubmit = async (data: NewPasswordFormData) => {
    const formData = new FormData();
    formData.append('token', token);
    formData.append('password', data.password);
    
    startTransition(() => {
      formAction(formData);
    });
  };

  if (state?.success) {
    return (
      <Card className="w-full md:w-[400px]">
        <CardHeader>
          <CardTitle className="flex justify-center items-center gap-2 text-xl"><CheckCircle2Icon className="size-5" />{t("passwordResetSuccess")}</CardTitle>
          <CardDescription className="text-sm text-center">{t("redirectingToSignIn")} {timer/1000}s</CardDescription>
        </CardHeader>
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
            <Label htmlFor="password">{t("newPassword")}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={tAuth("password.placeholder")}
                {...register("password")}
                aria-invalid={errors.password ? "true" : "false"}
                className="pr-10 text-lg"
              />
              <Button
                type="button"
                variant="link"
                size="icon"
                className="top-0 right-0 absolute hover:bg-transparent px-3 py-2 h-full cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.password && (
              <p className="mt-1 text-red-500 text-sm">{errors.password?.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder={tAuth("password.placeholder")}
                {...register("confirmPassword")}
                aria-invalid={errors.confirmPassword ? "true" : "false"}
                className="pr-10 text-lg"
              />
              <Button
                type="button"
                variant="link"
                size="icon"
                className="top-0 right-0 absolute hover:bg-transparent px-3 py-2 h-full cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </Button>
            </div>
            {errors.confirmPassword && (
              <p className="mt-1 text-red-500 text-sm">{errors.confirmPassword?.message}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full cursor-pointer" disabled={(isPending || isSubmitting)}>
            {(isPending || isSubmitting) ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                {t("resetting")}
              </>
            ) : (
              t("resetPassword")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
