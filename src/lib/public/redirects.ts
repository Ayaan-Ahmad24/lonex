import "server-only";

import { permanentRedirect } from "next/navigation";
import { findRedirectTarget, publishedPathExists } from "./queries";

/**
 * Permanent (308) redirect for a renamed category, product or article.
 *
 * A redirect target is followed only while it still resolves to published
 * content, so an unpublished item can never be reached through its history.
 */
export async function redirectMovedPath(path: string): Promise<void> {
  const target = await findRedirectTarget(path);

  if (!target) {
    return;
  }

  if (!(await publishedPathExists(target))) {
    return;
  }

  permanentRedirect(target);
}
