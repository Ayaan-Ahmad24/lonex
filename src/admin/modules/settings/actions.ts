"use server";

import { revalidatePath } from "next/cache";
import { authorizeAction } from "@/admin/core/guards";
import type { ActionState } from "@/admin/core/crud/types";
import { failure, success } from "@/admin/core/crud/types";
import { parseSettingsForm } from "@/admin/core/settings/schema";
import { saveSiteSettings } from "@/admin/core/settings/service";
import { settingsDefaults } from "./defaults";

export async function saveSettingsAction(
  _previous: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const access = await authorizeAction("settings.manage");

  if (!access.ok) {
    return failure(
      access.status === 401
        ? "Your session expired. Sign in again."
        : "You do not have permission to change site settings.",
    );
  }

  const parsed = parseSettingsForm(formData);

  if (!parsed.ok) {
    return failure(
      Object.values(parsed.errors)[0] ?? "Check the highlighted fields.",
      parsed.errors,
    );
  }

  const result = await saveSiteSettings(
    access.user.id,
    settingsDefaults,
    parsed.data,
  );

  if (!result.ok) {
    return failure(result.message);
  }

  revalidatePath("/admin/settings");
  revalidatePath("/admin");

  if (result.changedKeys.length === 0) {
    return success("No changes to save.");
  }

  return success(
    `Settings saved. ${result.changedKeys.length} field(s) updated and audited.`,
  );
}
