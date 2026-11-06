"use client";

import { useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useToast } from "./toast";

/**
 * Shows a toast carried in the URL by a successful delete redirect.
 *
 * Server actions cannot display a toast after `redirect()`, and the deleted
 * record's detail page is gone by then. The action redirects to the list with
 * `?flash=<title>&flashMessage=<text>`; this component raises the toast once
 * and strips the parameters so a reload or back navigation does not repeat it.
 */
export function FlashToast() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const title = searchParams.get("flash");
  const message = searchParams.get("flashMessage");

  useEffect(() => {
    if (!title) {
      return;
    }

    toast({
      title,
      description: message ?? undefined,
      variant: "success",
    });

    const next = new URLSearchParams(window.location.search);
    next.delete("flash");
    next.delete("flashMessage");
    const query = next.toString();

    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }, [title, message, pathname, router, toast]);

  return null;
}
