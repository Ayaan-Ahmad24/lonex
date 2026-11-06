"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeAction } from "@/admin/core/guards";
import { flashPath } from "@/admin/core/ui/flash";
import { failure, success, type ActionState } from "@/admin/core/crud/types";
import { permissionGranted } from "@/admin/core/registry/navigation";
import { parseCategoryForm } from "./schema";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "./service";

function denied(status: 401 | 403): ActionState {
  return failure(
    status === 401
      ? "Your session expired. Sign in again."
      : "You do not have permission to change categories.",
  );
}

export async function createCategoryAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return denied(access.status);
  }

  const parsed = parseCategoryForm(formData);

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

  const result = await createCategory(access.user.id, input);

  if (!result.ok) {
    return failure(result.message);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");

  redirect(`/admin/categories/${result.id}`);
}

export async function updateCategoryAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return denied(access.status);
  }

  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return failure("Category not found.");
  }

  const parsed = parseCategoryForm(formData);

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

  const result = await updateCategory(access.user.id, id, input);

  if (!result.ok) {
    return failure(result.message);
  }

  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${id}`);
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  revalidatePath(`/${input.slug}`);
  revalidatePath("/sitemap.xml");

  return success("Category saved and audited.");
}

export async function deleteCategoryAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return denied(access.status);
  }

  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return failure("Category not found.");
  }

  const result = await deleteCategory(access.user.id, id);

  if (!result.ok) {
    return failure(result.message);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/sitemap.xml");

  redirect(
    flashPath(
      "/admin/categories",
      "Category deleted",
      "The category and its unpublished links were removed.",
    ),
  );
}
