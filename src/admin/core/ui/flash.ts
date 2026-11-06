/**
 * Build a URL that carries a one-shot flash message to an admin list page.
 *
 * Delete actions redirect on success (the record's detail page no longer
 * exists), so the toast cannot be triggered from the form that submitted it.
 * The destination page mounts `FlashToast`, which shows the message and then
 * removes the query parameters from the address bar.
 */
export function flashPath(
  path: string,
  title: string,
  message?: string,
): string {
  const params = new URLSearchParams({ flash: title });

  if (message) {
    params.set("flashMessage", message);
  }

  return `${path}?${params.toString()}`;
}
