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
import { parseBlogForm } from "./schema";
import { createBlogPost, deleteBlogPost, updateBlogPost } from "./service";

const FORBIDDEN_MESSAGE = "You do not have permission to change articles.";

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
    return deniedState(access.status, FORBIDDEN_MESSAGE);
  }

  const parsed = parseBlogForm(formData);

  if (!parsed.ok) {
    return failure(firstFieldError(parsed.errors), parsed.errors);
  }

  const input = gateNewStatus(access.permissions, parsed.data);

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
    return deniedState(access.status, FORBIDDEN_MESSAGE);
  }

  const id = readEntityId(formData);

  if (!id) {
    return failure("Article not found.");
  }

  const parsed = parseBlogForm(formData);

  if (!parsed.ok) {
    return failure(firstFieldError(parsed.errors), parsed.errors);
  }

  const input = gateUpdatedStatus(access.permissions, parsed.data);

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
    return deniedState(access.status, FORBIDDEN_MESSAGE);
  }

  const id = readEntityId(formData);

  if (!id) {
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
