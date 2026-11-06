"use server";

import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/admin/core/guards";
import { failure, success, type ActionState } from "@/admin/core/crud/types";
import { parseVerificationForm, parseVerificationCodeForm } from "./schema";
import {
  generateVerificationCode,
  setVerificationActive,
  setVerificationCode,
} from "./service";

function denied(status: 401 | 403): ActionState {
  return failure(
    status === 401
      ? "Your session expired. Sign in again."
      : "You do not have permission to manage model verification codes.",
  );
}

function invalid(formData: FormData): string | null {
  const parsed = parseVerificationForm(formData);

  return parsed.ok ? null : (Object.values(parsed.errors)[0] ?? "Invalid product.");
}

export async function generateVerificationAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("model_codes.manage");

  if (!access.ok) {
    return denied(access.status);
  }

  const error = invalid(formData);

  if (error) {
    return failure(error);
  }

  const parsed = parseVerificationForm(formData);

  if (!parsed.ok) {
    return failure("Invalid product.");
  }

  const result = await generateVerificationCode(
    access.user.id,
    parsed.data.productId,
  );

  if (!result.ok || !result.code) {
    return failure(result.ok ? "Code generation failed." : result.message);
  }

  revalidatePath("/admin/verification");
  revalidatePath("/admin");

  return success(
    `Verification code generated: ${result.code}. The raw code is kept only in this browser tab; only the HMAC digest is stored. It confirms the model is registered with LONEX, not the authenticity of an individual unit.`,
    result.code,
  );
}

export async function deactivateVerificationAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("model_codes.manage");

  if (!access.ok) {
    return denied(access.status);
  }

  const error = invalid(formData);

  if (error) {
    return failure(error);
  }

  const parsed = parseVerificationForm(formData);

  if (!parsed.ok) {
    return failure("Invalid product.");
  }

  const result = await setVerificationActive(
    access.user.id,
    parsed.data.productId,
    false,
  );

  if (!result.ok) {
    return failure(result.message);
  }

  revalidatePath("/admin/verification");
  revalidatePath("/admin");

  return success("Verification code deactivated. Public lookups will fail.");
}

export async function activateVerificationAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("model_codes.manage");

  if (!access.ok) {
    return denied(access.status);
  }

  const error = invalid(formData);

  if (error) {
    return failure(error);
  }

  const parsed = parseVerificationForm(formData);

  if (!parsed.ok) {
    return failure("Invalid product.");
  }

  const result = await setVerificationActive(
    access.user.id,
    parsed.data.productId,
    true,
  );

  if (!result.ok) {
    return failure(result.message);
  }

  revalidatePath("/admin/verification");
  revalidatePath("/admin");

  return success("Verification code reactivated.");
}

export async function setVerificationCodeAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("model_codes.manage");

  if (!access.ok) {
    return denied(access.status);
  }

  const parsed = parseVerificationCodeForm(formData);

  if (!parsed.ok) {
    return failure(
      Object.values(parsed.errors)[0] ?? "Invalid verification code.",
      parsed.errors,
    );
  }

  const result = await setVerificationCode(
    access.user.id,
    parsed.data.productId,
    parsed.data.code,
  );

  if (!result.ok) {
    return failure(result.message);
  }

  revalidatePath("/admin/verification");
  revalidatePath("/admin");

  return success(
    `Verification code assigned: ${parsed.data.code}. The raw code is kept only in this browser tab; only the HMAC digest is stored.`,
    parsed.data.code,
  );
}
