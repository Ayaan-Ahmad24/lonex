import { eq } from "drizzle-orm";
import { db } from "@/db";
import { authorizedSellers } from "@/db/schema";
import { recordAudit } from "@/lib/audit";
import type { SellerInput } from "./schema";

export type SellerMutation =
  | { ok: true; id: number }
  | { ok: false; message: string };

export async function createSeller(
  actorUserId: string,
  input: SellerInput,
): Promise<SellerMutation> {
  return db.transaction(async (tx) => {
    const [inserted] = await tx
      .insert(authorizedSellers)
      .values({
        name: input.name,
        city: input.city,
        address: input.address,
        phone: input.phone,
        whatsapp: input.whatsapp || null,
        googleMapsUrl: input.googleMapsUrl || null,
        imageMediaId: input.imageMediaId ?? null,
        sortOrder: input.sortOrder,
        status: input.status,
      })
      .$returningId();

    await recordAudit(tx, {
      actorUserId,
      action: "seller.create",
      targetType: "seller",
      targetId: String(inserted.id),
      metadata: { city: input.city, status: input.status },
    });

    return { ok: true as const, id: inserted.id };
  });
}

export async function updateSeller(
  actorUserId: string,
  id: number,
  input: SellerInput,
): Promise<SellerMutation> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: authorizedSellers.id })
      .from(authorizedSellers)
      .where(eq(authorizedSellers.id, id))
      .limit(1);

    if (!existing) {
      return { ok: false as const, message: "Seller not found." };
    }

    await tx
      .update(authorizedSellers)
      .set({
        name: input.name,
        city: input.city,
        address: input.address,
        phone: input.phone,
        whatsapp: input.whatsapp || null,
        googleMapsUrl: input.googleMapsUrl || null,
        imageMediaId: input.imageMediaId ?? null,
        sortOrder: input.sortOrder,
        status: input.status,
      })
      .where(eq(authorizedSellers.id, id));

    await recordAudit(tx, {
      actorUserId,
      action: "seller.update",
      targetType: "seller",
      targetId: String(id),
      metadata: { city: input.city, status: input.status },
    });

    return { ok: true as const, id };
  });
}

export async function deleteSeller(
  actorUserId: string,
  id: number,
): Promise<SellerMutation> {
  return db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: authorizedSellers.id, name: authorizedSellers.name })
      .from(authorizedSellers)
      .where(eq(authorizedSellers.id, id))
      .limit(1);

    if (!existing) {
      return { ok: false as const, message: "Seller not found." };
    }

    await tx.delete(authorizedSellers).where(eq(authorizedSellers.id, id));

    await recordAudit(tx, {
      actorUserId,
      action: "seller.delete",
      targetType: "seller",
      targetId: String(id),
      metadata: { name: existing.name },
    });

    return { ok: true as const, id };
  });
}
