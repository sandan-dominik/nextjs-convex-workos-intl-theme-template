import { z } from "zod";

// Helper function to create schemas with translated error messages
export function createSignUpSchema(t: (key: string) => string) {
  return z.object({
    firstname: z.string().min(1, t("required")).max(20, t("tooLong20")),
    name: z.string().min(1, t("required")).max(20, t("tooLong20")),
    email: z.string().min(1, t("required")).email(t("invalidEmail")).max(255, t("tooLong")),
    password: z.string().min(8, t("tooSmall")).max(255, t("tooLong"))
  });
}

export function createSignInSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().min(1, t("required")).email(t("invalidEmail")).max(255, t("tooLong")),
    password: z.string().min(8, t("tooSmall")).max(255, t("tooLong"))
  });
}

export function createOrganizationSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().min(1, t("required")).max(100, t("tooLong100"))
  });
}

// Default schemas for backward compatibility (will use English messages)
export const signUpSchema = z.object({
    firstname: z.string().min(1, "Required").max(20, "Too long: expected string to have <=20 characters"),
    name: z.string().min(1, "Required").max(20, "Too long: expected string to have <=20 characters"),
    email: z.string().min(1, "Required").email("Invalid email address").max(255, "Too long: expected string to have <=255 characters"),
    password: z.string().min(8, "Too small: expected string to have >=8 characters").max(255, "Too long: expected string to have <=255 characters")
});

export const signInSchema = z.object({
    email: z.string().min(1, "Required").email("Invalid email address").max(255, "Too long: expected string to have <=255 characters"),
    password: z.string().min(8, "Too small: expected string to have >=8 characters").max(255, "Too long: expected string to have <=255 characters")
});

export const organizationSchema = z.object({
    name: z.string().min(1, "Required").max(100, "Too long: expected string to have <=100 characters")
});
