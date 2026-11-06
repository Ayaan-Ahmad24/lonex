import type { ReactNode } from "react";

/**
 * GET-based list toolbar. Search and filters live in the URL so the list is
 * shareable, refresh-safe and never depends on client state.
 */
export function ListToolbar({
  action,
  children,
  submitLabel = "Apply",
}: {
  action: string;
  children: ReactNode;
  submitLabel?: string;
}) {
  return (
    <form
      action={action}
      method="get"
      className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-end"
      role="search"
    >
      {children}
      <button
        type="submit"
        className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 hover:bg-slate-50"
      >
        {submitLabel}
      </button>
    </form>
  );
}

export function SearchInput({
  name = "q",
  defaultValue = "",
  label = "Search",
  placeholder = "Search...",
}: {
  name?: string;
  defaultValue?: string;
  label?: string;
  placeholder?: string;
}) {
  return (
    <label className="flex flex-1 flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      <input
        type="search"
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={200}
        className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
      />
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
    <label className="flex flex-col gap-1 text-xs font-medium text-slate-600">
      {label}
      <select
        name={name}
        defaultValue={value}
        className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
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
