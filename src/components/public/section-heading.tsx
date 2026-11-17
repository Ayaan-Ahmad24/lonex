import type { ReactNode } from "react";

/**
 * Editorial section heading: a large title, a short supporting line and an
 * optional action. No label above the heading; the title does that work.
 */
export function SectionHeading({
  // Accepted for older call sites; deliberately not rendered.
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
  return (
    <div className="site-section-head site-reveal">
      <div className="site-section-head__row">
        <h2 className="site-h2">{title}</h2>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
      {description ? (
        <p
          className={`site-lead ${tone === "light" ? "site-lead--light" : ""}`}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
