/**
 * Brand ticker. The repeated group is decorative, so the whole band is
 * hidden from assistive technology.
 */
export function Marquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  const group = (
    <div className="marquee-track">
      {[...items, ...items].map((item, index) => (
        <span key={`${item}-${index}`} className="flex items-center">
          <span className="type-eyebrow px-6 text-white/70 sm:px-8">{item}</span>
          <span
            aria-hidden="true"
            className="size-1.5 rotate-45 bg-[var(--site-red,var(--lonex-red))]"
          />
        </span>
      ))}
    </div>
  );

  return (
    <div className={`overflow-hidden ${className}`} aria-hidden="true">
      <div className="marquee py-4">
        {group}
        {group}
      </div>
    </div>
  );
}
