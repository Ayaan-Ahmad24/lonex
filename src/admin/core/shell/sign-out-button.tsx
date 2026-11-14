"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/admin/core/ui/toast";

export function SignOutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const { toast } = useToast();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (pending) {
      return;
    }

    setPending(true);

    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: "{}",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error(`Sign out returned ${response.status}.`);
      }

      toast({
        title: "Signed out",
        description: "Your admin session has ended.",
        variant: "success",
      });

      router.replace("/admin/login");
      router.refresh();
    } catch {
      toast({
        title: "Could not sign out",
        description: "Check your connection and try again.",
        variant: "destructive",
      });
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-busy={pending}
      className={
        compact
          ? "flex w-full items-center justify-start rounded-lg px-3 py-2 text-left text-[13px] font-medium text-lonex-ink-soft transition-colors hover:bg-lonex-line-soft hover:text-lonex-ink disabled:opacity-50"
          : "inline-flex h-9 items-center rounded-[10px] border border-lonex-line bg-lonex-paper px-3 text-[13px] font-medium text-lonex-ink-soft transition-colors hover:bg-lonex-stone hover:text-lonex-ink disabled:opacity-50"
      }
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
