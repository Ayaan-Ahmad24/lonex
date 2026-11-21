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

/** Optional `https://` URL field shared by site settings and seller records. */
export const optionalHttpsUrlSchema = z
  .string()
  .trim()
  .max(500)
  .refine(
    (value) => value === "" || /^https:\/\/[^\s]+$/i.test(value),
    "Use an https:// URL or leave this blank.",
  )
  .default("");

/**
 * Optional phone-style field. `minLength` lets a seller contact number stay
 * stricter than the site settings fields while sharing one pattern.
 */
export function optionalPhoneSchema(options: {
  message: string;
  minLength?: number;
}) {
  const { message, minLength = 3 } = options;

  return z
    .string()
    .trim()
    .max(50)
    .refine(
      (value) =>
        value === "" ||
        new RegExp(`^[0-9+()\\-.\\s]{${minLength},50}$`).test(value),
      message,
    )
    .default("");
}
