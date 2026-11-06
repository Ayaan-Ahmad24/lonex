"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { authorizeAction } from "@/admin/core/guards";
import type { ActionState } from "@/admin/core/crud/types";
import { failure, success } from "@/admin/core/crud/types";
import {
  deleteMedia,
  updateMediaAlt,
} from "@/admin/core/media/service";

const idSchema = z.coerce.number().int().positive();

function refresh() {
  revalidatePath("/admin/media");
  revalidatePath("/admin/pages");
  revalidatePath("/admin");
}

export async function updateMediaAltAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("media.manage");

  if (!access.ok) {
    return failure("You do not have permission to edit media.");
  }

  const parsed = idSchema.safeParse(formData.get("id"));

  if (!parsed.success) {
    return failure("Invalid media id.");
  }

  const result = await updateMediaAlt(
    access.user.id,
    parsed.data,
    String(formData.get("altText") ?? ""),
  );

  if (!result.ok) {
    return failure(result.message);
  }

  refresh();

  return success("Alt text updated.");
}

export async function deleteMediaAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("media.manage");

  if (!access.ok) {
    return failure("You do not have permission to delete media.");
  }

  const parsed = idSchema.safeParse(formData.get("id"));

  if (!parsed.success) {
    return failure("Invalid media id.");
  }

  const result = await deleteMedia(access.user.id, parsed.data);

  if (!result.ok) {
    return failure(result.message);
  }

  refresh();
  redirect("/admin/media");
}
