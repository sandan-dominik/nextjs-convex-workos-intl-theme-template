"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { createOrganization } from "@/app/actions/auth";
import { useActionState, useEffect, startTransition } from "react";
import { createOrganizationSchema } from "@/schemas/zod/auth";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingForm() {  
  const t = useTranslations("OnboardingPage");
  const tValidation = useTranslations("validation");
  const [state, formAction, isPending] = useActionState(createOrganization, null);
  const router = useRouter();
  
  // Create schema with translated error messages
  const organizationSchema = createOrganizationSchema(tValidation);
  type OrganizationFormData = z.infer<typeof organizationSchema>;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<OrganizationFormData>({
    mode: "onChange",
    resolver: zodResolver(organizationSchema),
  });

  // Handle server-side validation errors
  useEffect(() => {
    if (state?.zodErrors && typeof state.zodErrors === 'object') {
      // Set server validation errors on the form
      Object.entries(state.zodErrors).forEach(([field, messages]) => {
        if (Array.isArray(messages) && messages.length > 0) {
          setError(field as keyof OrganizationFormData, {
            type: 'server',
            message: messages[0]
          });
        }
      });
    }
    
    // Handle successful organization creation
    if (state?.success && state?.redirect) {
      router.push(state.redirect);
    }
  }, [state, setError, router]);  

  const onSubmit = async (data: OrganizationFormData) => {
    // Create FormData for server action
    const formData = new FormData();
    formData.append('name', data.name);
    
    // Call the server action within startTransition
    startTransition(() => {
      formAction(formData);
    });
  };

  return (
    <Card className="w-full md:w-[400px]">
      <CardHeader className="text-center">
        <CardTitle className="font-bold text-2xl">{t("title")}</CardTitle>
        <p className="mt-2 text-muted-foreground">{t("description")}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {state && state.success && (
          <p className="bg-green-500 mt-1 p-2 rounded-md text-white text-sm">{state.message}</p>
        )}
        {state && !state.success && (
          <p className="bg-red-500 mt-1 p-2 rounded-md text-white text-sm">{state.message}</p>
        )}
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("organizationName.label")}</Label>
            <Input
              id="name"
              type="text"
              placeholder={t("organizationName.placeholder")}
              {...register("name")}
              aria-invalid={errors.name ? "true" : "false"}
              className="text-lg"
            />
            {errors.name && (
              <p className="mt-1 text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full cursor-pointer" disabled={(isPending || isSubmitting)}>
            {(isPending || isSubmitting) ? (
              <>
                <Loader2 className="mr-2 animate-spin" />
                {t("creating")}
              </>
            ) : (
              t("createOrganization")
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
