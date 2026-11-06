import type { ReactNode } from "react";

/**
 * Editorial section heading used across the public site: an index, a red
 * rule, a large title, supporting copy and an optional action.
 */
export function SectionHeading({
  index,
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
        {index || eyebrow ? (
          <p className="type-eyebrow flex items-center gap-3 text-black/55">
            <span aria-hidden="true" className="h-px w-8 bg-[#CF0A0A]" />
            {index ? <span className="text-[#CF0A0A]">{index}</span> : null}
            {eyebrow ? (
              <span className={tone === "light" ? "text-white/55" : "text-black/55"}>
                {eyebrow}
              </span>
            ) : null}
          </p>
        ) : null}
        <h2 className={`type-section ${titleColor}`}>{title}</h2>
        {description ? (
          <p className={`type-lead max-w-2xl ${muted}`}>{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
