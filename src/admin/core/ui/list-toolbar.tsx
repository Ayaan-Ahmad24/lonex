import type { ReactNode } from "react";

const FIELD_LABEL = "text-xs font-medium text-lonex-ink-soft";

/**
 * GET-based list toolbar. Search and filters live in the URL so the list is
 * shareable, refresh-safe and never depends on client state.
 */
export function ListToolbar({
  action,
  children,
  submitLabel = "Apply",
  resetHref,
}: {
  action: string;
  children: ReactNode;
  submitLabel?: string;
  resetHref?: string;
}) {
  return (
    <form
      action={action}
      method="get"
      className="flex flex-col gap-3 border-b border-lonex-line px-5 py-4 sm:flex-row sm:flex-wrap sm:items-end sm:px-6"
      role="search"
    >
      {children}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          className="inline-flex h-9 items-center justify-center rounded-[10px] bg-lonex-ink px-3.5 text-[13px] font-medium text-white transition-colors hover:bg-lonex-ink/90 focus-visible:outline-none"
        >
          {submitLabel}
        </button>
        {resetHref ? (
          <a
            href={resetHref}
            className="inline-flex h-9 items-center rounded-[10px] px-2.5 text-[13px] font-medium text-lonex-ink-soft no-underline transition-colors hover:bg-lonex-line-soft hover:text-lonex-ink"
          >
            Reset
          </a>
        ) : null}
      </div>
    </form>
  );
}

export function SearchInput({
  name = "q",
  defaultValue = "",
  label = "Search",
  placeholder = "Search…",
}: {
  name?: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex min-w-[220px] flex-1 flex-col gap-1.5">
      <span className={FIELD_LABEL}>{label}</span>
      <span className="relative block">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-lonex-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" />
        </svg>
        <input
          type="search"
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          maxLength={200}
          className="h-9 w-full rounded-[10px] border border-lonex-line bg-lonex-paper pl-9 pr-3 text-sm text-lonex-ink transition-colors placeholder:text-lonex-muted hover:border-lonex-muted/50 focus:border-lonex-red focus:outline-none"
        />
      </span>
    </label>
  );
}

export function FilterSelect({
  name,
  label,
  value = "",
  options,
}: {
  name: string;
  label: string;
  value?: string;
  options: readonly { value: string; label: string }[];
}) {
  return (
    <label className="flex flex-col gap-1.5 sm:w-[168px] sm:shrink-0">
      <span className={FIELD_LABEL}>{label}</span>
      <select
        name={name}
        defaultValue={value}
        className="h-9 w-full rounded-[10px] border border-lonex-line bg-lonex-paper px-2.5 text-sm text-lonex-ink transition-colors hover:border-lonex-muted/50 focus:border-lonex-red focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
