import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { productVerificationCodes, products } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import {
  digestModelCode,
  generateModelCode,
  validateModelCode,
} from "@/lib/verification/code";

/**
 * Model verification administration.
 *
 * The raw code exists only in memory for the duration of one request and is
 * returned to the authorized administrator once. Only the HMAC digest is
 * stored, audited or logged.
 */

export type VerificationMutation =
  | { ok: true; code: string | null }
  | { ok: false; message: string };

async function productExists(productId: number): Promise<boolean> {
  const [row] = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1);

  return Boolean(row);
}

export async function generateVerificationCode(
  actorUserId: string,
  productId: number,
): Promise<VerificationMutation> {
  if (!(await productExists(productId))) {
    return { ok: false, message: "Product not found." };
  }

  const rawCode = generateModelCode();
  const digest = digestModelCode(rawCode);

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: productVerificationCodes.id })
      .from(productVerificationCodes)
      .where(eq(productVerificationCodes.productId, productId))
      .limit(1);

    if (existing) {
      await tx
        .update(productVerificationCodes)
        .set({ codeDigest: digest, active: true, registeredAt: new Date() })
        .where(eq(productVerificationCodes.productId, productId));
    } else {
      await tx.insert(productVerificationCodes).values({
        productId,
        codeDigest: digest,
        active: true,
      });
    }

    await recordAudit(tx, {
      actorUserId,
      action: existing ? "model_code.rotate" : "model_code.create",
      targetType: "product",
      targetId: String(productId),
      // Never store the raw code or its digest in audit metadata.
      metadata: { active: true },
    });

    return { ok: true as const, code: rawCode };
  });
}

export async function setVerificationActive(
  actorUserId: string,
  productId: number,
  active: boolean,
): Promise<VerificationMutation> {
  const [existing] = await db
    .select({ id: productVerificationCodes.id })
    .from(productVerificationCodes)
    .where(eq(productVerificationCodes.productId, productId))
    .limit(1);

  if (!existing) {
    return { ok: false, message: "This product has no verification code." };
  }

  await db.transaction(async (tx) => {
    await tx
      .update(productVerificationCodes)
      .set({ active })
      .where(eq(productVerificationCodes.productId, productId));

    await recordAudit(tx, {
      actorUserId,
      action: active ? "model_code.activate" : "model_code.deactivate",
      targetType: "product",
      targetId: String(productId),
      metadata: { active },
    });
  });

  return { ok: true, code: null };
}

/**
 * Set or replace a verification code with an administrator-entered value.
 *
 * The raw code is never stored, logged or audited. Only the HMAC digest is
 * persisted. The previous code (if any) is immediately invalidated.
 */
export async function setVerificationCode(
  actorUserId: string,
  productId: number,
  rawCode: string,
): Promise<VerificationMutation> {
  if (!(await productExists(productId))) {
    return { ok: false, message: "Product not found." };
  }

  const validation = validateModelCode(rawCode);

  if (!validation.ok) {
    return { ok: false, message: validation.reason };
  }

  const normalized = validation.normalized;
  const digest = digestModelCode(normalized);

  // Check uniqueness: no OTHER product may use this digest. Re-assigning the
  // same code to the same model must stay possible.
  const [conflict] = await db
    .select({ id: productVerificationCodes.id })
    .from(productVerificationCodes)
    .where(
      and(
        eq(productVerificationCodes.codeDigest, digest),
        ne(productVerificationCodes.productId, productId),
      ),
    )
    .limit(1);

  if (conflict) {
    return {
      ok: false,
      message: "This verification code is already in use by another model.",
    };
  }

  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: productVerificationCodes.id })
      .from(productVerificationCodes)
      .where(eq(productVerificationCodes.productId, productId))
      .limit(1);

    if (existing) {
      await tx
        .update(productVerificationCodes)
        .set({ codeDigest: digest, active: true, registeredAt: new Date() })
        .where(eq(productVerificationCodes.productId, productId));
    } else {
      await tx.insert(productVerificationCodes).values({
        productId,
        codeDigest: digest,
        active: true,
      });
    }

    await recordAudit(tx, {
      actorUserId,
      action: existing ? "model_code.rotate" : "model_code.create",
      targetType: "product",
      targetId: String(productId),
      // Never store the raw code or its digest in audit metadata.
      metadata: { active: true },
    });

    return { ok: true as const, code: null };
  });
}
