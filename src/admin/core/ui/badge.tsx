import type { ReactNode } from "react";

type Tone = "neutral" | "success" | "warning" | "danger" | "info";

const TONES: Record<Tone, string> = {
  neutral:
    "bg-lonex-line-soft text-lonex-ink-soft ring-lonex-line/80 ring-inset",
  success:
    "bg-lonex-success-soft text-lonex-success ring-lonex-success/15 ring-inset",
  warning:
    "bg-lonex-warning-soft text-lonex-warning ring-lonex-warning/20 ring-inset",
  danger: "bg-lonex-red-soft text-lonex-red ring-lonex-red/15 ring-inset",
  info: "bg-lonex-info-soft text-lonex-info ring-lonex-info/15 ring-inset",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone: Tone =
    normalized === "published" ||
    normalized === "active" ||
    normalized === "ok" ||
    normalized === "approved"
      ? "success"
      : normalized === "draft" ||
        normalized === "pending" ||
        normalized === "in review"
      ? "warning"
      : normalized === "inactive" ||
        normalized === "disabled" ||
        normalized === "rejected" ||
        normalized === "blocked"
      ? "danger"
      : "neutral";

  return (
    <Badge tone={tone}>
      <span className="capitalize">{status.replace(/_/g, " ")}</span>
    </Badge>
  );
}
