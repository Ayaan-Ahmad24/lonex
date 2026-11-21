"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeAction } from "@/admin/core/guards";
import { flashPath } from "@/admin/core/ui/flash";
import {
  deniedState,
  firstFieldError,
  readEntityId,
} from "@/admin/core/crud/action-helpers";
import { failure, success, type ActionState } from "@/admin/core/crud/types";
import { parseSellerForm } from "./schema";
import { createSeller, deleteSeller, updateSeller } from "./service";

const FORBIDDEN_MESSAGE = "You do not have permission to change sellers.";

export async function createSellerAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return deniedState(access.status, FORBIDDEN_MESSAGE);
  }

  const parsed = parseSellerForm(formData);

  if (!parsed.ok) {
    return failure(firstFieldError(parsed.errors), parsed.errors);
  }

  const result = await createSeller(access.user.id, parsed.data);

  if (!result.ok) {
    return failure(result.message);
  }

  revalidatePath("/admin/sellers");
  revalidatePath("/admin");
  revalidatePath("/authorized-sellers");
  redirect(`/admin/sellers/${result.id}`);
}

export async function updateSellerAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return deniedState(access.status, FORBIDDEN_MESSAGE);
  }

  const id = readEntityId(formData);

  if (!id) {
    return failure("Seller not found.");
  }

  const parsed = parseSellerForm(formData);

  if (!parsed.ok) {
    return failure(firstFieldError(parsed.errors), parsed.errors);
  }

  const result = await updateSeller(access.user.id, id, parsed.data);

  if (!result.ok) {
    return failure(result.message);
  }

  revalidatePath("/admin/sellers");
  revalidatePath(`/admin/sellers/${id}`);
  revalidatePath("/admin");
  revalidatePath("/authorized-sellers");

  return success("Seller saved and audited.");
}

export async function deleteSellerAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return deniedState(access.status, FORBIDDEN_MESSAGE);
  }

  const id = readEntityId(formData);

  if (!id) {
    return failure("Seller not found.");
  }

  const result = await deleteSeller(access.user.id, id);

  if (!result.ok) {
    return failure(result.message);
  }

  revalidatePath("/admin/sellers");
  revalidatePath("/admin");
  revalidatePath("/authorized-sellers");
  redirect(
    flashPath(
      "/admin/sellers",
      "Seller deleted",
      "The authorised seller was removed.",
    ),
  );
}
