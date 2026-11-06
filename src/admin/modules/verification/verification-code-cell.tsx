"use client";

import { Badge } from "@/admin/core/ui/badge";
import type { VerificationRow } from "./queries";
import { useVerificationCode } from "./verification-code-context";

/**
 * Client component that renders the verification code cell.
 * Shows the status badge and, when available, the raw code stored in session
 * context (displayed only during the current browser session, never persisted).
 */
export function VerificationCodeCell({ row }: { row: VerificationRow }) {
  const { getCode } = useVerificationCode();
  const code = getCode(row.productId);

  if (row.active === null) {
    return <Badge tone="neutral">Not registered</Badge>;
  }

  return (
    <div className="flex flex-col gap-1">
      <Badge tone={row.active ? "success" : "danger"}>
        {row.active ? "Active" : "Inactive"}
      </Badge>
      {code ? (
        <span
          className="font-mono text-xs text-slate-700 truncate"
          title={code}
        >
          {code}
        </span>
      ) : null}
    </div>
  );
}
