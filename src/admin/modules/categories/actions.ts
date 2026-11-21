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
import { parseCategoryForm } from "./schema";
import {
  createCategory,
  deleteCategory,
  updateCategory,
} from "./service";

const FORBIDDEN_MESSAGE = "You do not have permission to change categories.";

export async function createCategoryAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return deniedState(access.status, FORBIDDEN_MESSAGE);
  }

  const parsed = parseCategoryForm(formData);

  if (!parsed.ok) {
    return failure(firstFieldError(parsed.errors), parsed.errors);
  }

  const input = gateNewStatus(access.permissions, parsed.data);

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
    return deniedState(access.status, FORBIDDEN_MESSAGE);
  }

  const id = readEntityId(formData);

  if (!id) {
    return failure("Category not found.");
  }

  const parsed = parseCategoryForm(formData);

  if (!parsed.ok) {
    return failure(firstFieldError(parsed.errors), parsed.errors);
  }

  const input = gateUpdatedStatus(access.permissions, parsed.data);

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
    return deniedState(access.status, FORBIDDEN_MESSAGE);
  }

  const id = readEntityId(formData);

  if (!id) {
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
