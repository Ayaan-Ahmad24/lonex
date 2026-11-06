"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authorizeAction } from "@/admin/core/guards";
import { flashPath } from "@/admin/core/ui/flash";
import { failure, success, type ActionState } from "@/admin/core/crud/types";
import { permissionGranted } from "@/admin/core/registry/navigation";
import { parseBlogForm } from "./schema";
import { createBlogPost, deleteBlogPost, updateBlogPost } from "./service";

function denied(status: 401 | 403): ActionState {
  return failure(
    status === 401
      ? "Your session expired. Sign in again."
      : "You do not have permission to change articles.",
  );
}

function revalidateBlog() {
  revalidatePath("/admin");
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  revalidatePath("/", "layout");
}

export async function createBlogPostAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return denied(access.status);
  }

  const parsed = parseBlogForm(formData);

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

  const result = await createBlogPost(access.user.id, input);

  if (!result.ok) {
    return failure(result.message);
  }

  revalidateBlog();
  redirect(`/admin/blog/${result.id}`);
}

export async function updateBlogPostAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return denied(access.status);
  }

  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return failure("Article not found.");
  }

  const parsed = parseBlogForm(formData);

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

  const result = await updateBlogPost(access.user.id, id, input);

  if (!result.ok) {
    return failure(result.message);
  }

  revalidatePath(`/admin/blog/${id}`);
  revalidateBlog();

  return success(
    input.status === "published"
      ? "Article saved and published."
      : "Draft saved and audited.",
  );
}

export async function deleteBlogPostAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("content.edit");

  if (!access.ok) {
    return denied(access.status);
  }

  const id = Number(formData.get("id"));

  if (!Number.isInteger(id) || id <= 0) {
    return failure("Article not found.");
  }

  const result = await deleteBlogPost(access.user.id, id);

  if (!result.ok) {
    return failure(result.message);
  }

  revalidateBlog();
  redirect(
    flashPath(
      "/admin/blog",
      "Article deleted",
      "The article was removed from the dashboard.",
    ),
  );
}
