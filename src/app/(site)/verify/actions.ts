"use server";

import { headers } from "next/headers";
import {
  isVerificationThrottled,
  recordVerificationAttempt,
  resolveClientAddress,
} from "@/lib/security/verify-throttle";
import { normalizeModelCode } from "@/lib/verification/code";
import { verifyModelCode } from "@/lib/verification/lookup";
import type { VerifyState } from "./state";

/**
 * Public model verification action.
 *
 * Every response for an unknown, inactive or malformed code is identical. The
 * lookup is rate limited per client and globally so it cannot be used to
 * enumerate registered models.
 *
 * Only async functions may be exported from this file (Server Action rule).
 * The state shape lives in `./state`.
 */

const GENERIC_FAILURE =
  "This code could not be verified. Check the code and try again.";

export async function verifyCodeAction(
  _previous: VerifyState,
  formData: FormData,
): Promise<VerifyState> {
  const raw = formData.get("code");
  const code = typeof raw === "string" ? raw : "";

  let address = "untrusted";

  try {
    address = resolveClientAddress(await headers());
  } catch {
    address = "untrusted";
  }

  if (await isVerificationThrottled(address)) {
    return {
      status: "throttled",
      message: "Too many verification attempts. Please try again later.",
    };
  }

  await recordVerificationAttempt(address);

  if (!code.trim() || normalizeModelCode(code) === null) {
    return { status: "error", message: GENERIC_FAILURE };
  }

  const model = await verifyModelCode(code);

  if (!model) {
    return { status: "error", message: GENERIC_FAILURE };
  }

  return {
    status: "success",
    message: "Code match found. This model is registered with LONEX.",
    model: {
      productName: model.productName,
      productPath: model.productPath,
      categoryName: model.categoryName,
      registeredLabel: new Intl.DateTimeFormat("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(model.registeredAt),
    },
  };
}
