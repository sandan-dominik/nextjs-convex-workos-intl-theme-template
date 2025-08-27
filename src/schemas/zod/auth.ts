import { z } from "zod";

export const signUpSchema = z.object({
    firstname: z.string().min(1).max(20),
    name: z.string().min(1).max(20),
    email: z.string().email().max(255),
    password: z.string().min(8).max(255)
});

export const signInSchema = z.object({
    email: z.string().email().max(255),
    password: z.string().min(8).max(255)
});
