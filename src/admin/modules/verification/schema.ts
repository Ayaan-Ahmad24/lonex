import { z } from "zod";
import {
  collectFieldErrors,
  formOptionalId,
  parseForm,
  type ParsedForm,
} from "@/lib/validation/form";
import { validateModelCode } from "@/lib/verification/code";

export const verificationProductSchema = z.object({
  productId: z.number().int().positive("Choose a product."),
});

export type VerificationProductInput = z.infer<
  typeof verificationProductSchema
>;

export const verificationCodeSchema = z.object({
  productId: z.number().int().positive("Choose a product."),
  code: z
    .string()
    .min(1, "Verification code is required.")
    .max(50, "Code is too long."),
  confirmCode: z
    .string()
    .min(1, "Please confirm the verification code."),
});

export type VerificationCodeInput = z.infer<
  typeof verificationCodeSchema
>;

export function parseVerificationForm(
  formData: FormData,
): ParsedForm<VerificationProductInput> {
  return parseForm(verificationProductSchema, {
    productId: formOptionalId(formData.get("productId")) ?? 0,
  });
}

export function parseVerificationCodeForm(
  formData: FormData,
): ParsedForm<VerificationCodeInput> {
  const parsed = verificationCodeSchema.safeParse({
    productId: formOptionalId(formData.get("productId")) ?? 0,
    code: typeof formData.get("code") === "string"
      ? formData.get("code")
      : "",
    confirmCode: typeof formData.get("confirmCode") === "string"
      ? formData.get("confirmCode")
      : "",
  });

  if (!parsed.success) {
    return { ok: false, errors: collectFieldErrors(parsed.error) };
  }

  const { code, confirmCode } = parsed.data;

  if (code !== confirmCode) {
    return {
      ok: false,
      errors: {
        confirmCode: "Confirmation code does not match.",
      },
    };
  }

  const validation = validateModelCode(code);

  if (!validation.ok) {
    return {
      ok: false,
      errors: {
        code: validation.reason,
      },
    };
  }

  return {
    ok: true,
    data: {
      ...parsed.data,
      code: validation.normalized,
    },
  };
}
