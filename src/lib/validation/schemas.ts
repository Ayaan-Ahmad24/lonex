import { z } from "zod";

export const userIdSchema = z.uuid();

export const deactivateUserParamsSchema = z.object({
  id: userIdSchema,
});

export const signInSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(1).max(128),
});

export type SignInInput = z.infer<typeof signInSchema>;
