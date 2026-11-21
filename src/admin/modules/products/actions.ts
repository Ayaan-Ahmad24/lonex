"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeAction } from "@/admin/core/guards";
import { flashPath } from "@/admin/core/ui/flash";
import {
  deniedState,
  firstFieldError,
  gateNewStatus,
  gateUpdatedStatus,
  readEntityId,
} from "@/admin/core/crud/action-helpers";
import { failure, success, type ActionState } from "@/admin/core/crud/types";
import { parseProductForm } from "./schema";
import { createProduct, deleteProduct, updateProduct } from "./service";

const FORBIDDEN_MESSAGE = "You do not have permission to change products.";

function revalidateStorefront() {
  revalidatePath("/admin");
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
}

export async function createProductAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return deniedState(access.status, FORBIDDEN_MESSAGE);
  }

  const parsed = parseProductForm(formData);

  if (!parsed.ok) {
    return failure(firstFieldError(parsed.errors), parsed.errors);
  }

  const input = gateNewStatus(access.permissions, parsed.data);

  const result = await createProduct(access.user.id, input);

  if (!result.ok) {
    return failure(result.message);
  }

  revalidateStorefront();
  redirect(`/admin/products/${result.id}`);
}

export async function updateProductAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return deniedState(access.status, FORBIDDEN_MESSAGE);
  }

  const id = readEntityId(formData);

  if (!id) {
    return failure("Product not found.");
  }

  const parsed = parseProductForm(formData);

  if (!parsed.ok) {
    return failure(firstFieldError(parsed.errors), parsed.errors);
  }

  const input = gateUpdatedStatus(access.permissions, parsed.data);

  const result = await updateProduct(access.user.id, id, input);

  if (!result.ok) {
    return failure(result.message);
  }

  revalidatePath(`/admin/products/${id}`);
  revalidateStorefront();

  return success("Product saved and audited.");
}

export async function deleteProductAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return deniedState(access.status, FORBIDDEN_MESSAGE);
  }

  const id = readEntityId(formData);

  if (!id) {
    return failure("Product not found.");
  }

  const result = await deleteProduct(access.user.id, id);

  if (!result.ok) {
    return failure(result.message);
  }

  revalidateStorefront();
  redirect(
    flashPath(
      "/admin/products",
      "Product deleted",
      "The product and its public page were removed.",
    ),
  );
}
