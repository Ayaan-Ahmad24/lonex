"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeAction } from "@/admin/core/guards";
import { flashPath } from "@/admin/core/ui/flash";
import { failure, success, type ActionState } from "@/admin/core/crud/types";
import { permissionGranted } from "@/admin/core/registry/navigation";
import { parseProductForm } from "./schema";
import { createProduct, deleteProduct, updateProduct } from "./service";

function denied(status: 401 | 403): ActionState {
  return failure(
    status === 401
      ? "Your session expired. Sign in again."
      : "You do not have permission to change products.",
  );
}

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
    return denied(access.status);
  }

  const parsed = parseProductForm(formData);

  if (!parsed.ok) {
    return failure(
      Object.values(parsed.errors)[0] ?? "Check the highlighted fields.",
      parsed.errors,
    );
  }

  const canPublish = permissionGranted(access.permissions, "content.publish");
  const input = canPublish
    ? parsed.data
    : { ...parsed.data, status: "draft" as const };

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
    return denied(access.status);
  }

  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return failure("Product not found.");
  }

  const parsed = parseProductForm(formData);

  if (!parsed.ok) {
    return failure(
      Object.values(parsed.errors)[0] ?? "Check the highlighted fields.",
      parsed.errors,
    );
  }

  const canPublish = permissionGranted(access.permissions, "content.publish");
  const input =
    canPublish || parsed.data.status !== "draft"
      ? parsed.data
      : { ...parsed.data, status: "draft" as const };

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
    return denied(access.status);
  }

  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
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
