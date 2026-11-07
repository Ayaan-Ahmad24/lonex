import type { ReactNode } from "react";

/**
 * Editorial section heading: a large title, supporting copy and an optional
 * action. No eyebrow — a label above a heading that names what comes next is
 * the tell (gate 54). Open the section another way (craft.md § 7).
 */
export function SectionHeading({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  index,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  eyebrow,
  title,
  description,
  action,
  tone = "dark",
}: {
  index?: string;
  eyebrow?: string;
  title: string;
  description?: string | null;
  action?: ReactNode;
  tone?: "dark" | "light";
}) {
  const muted = tone === "light" ? "text-white/60" : "text-black/60";
  const titleColor = tone === "light" ? "text-white" : "text-black";

  return (
    <div
      className={`reveal flex flex-col gap-7 border-b pb-8 sm:flex-row sm:items-end sm:justify-between ${
        tone === "light" ? "border-white/15" : "border-black/10"
      }`}
    >
      <div className="max-w-3xl space-y-4">
        <h2 className={`type-section ${titleColor}`}>{title}</h2>
        {description ? (
          <p className={`type-lead max-w-2xl ${muted}`}>{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
