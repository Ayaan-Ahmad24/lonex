import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";

const CONTROL =
  "w-full rounded-[10px] border border-lonex-line bg-lonex-paper px-3 text-sm text-lonex-ink shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-colors placeholder:text-lonex-muted hover:border-lonex-muted/50 focus:border-lonex-red focus:outline-none disabled:cursor-not-allowed disabled:bg-lonex-line-soft disabled:text-lonex-muted";

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
  className = "",
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-[13px] font-medium leading-5 text-lonex-ink"
      >
        {label}
        {required ? (
          <span className="ml-0.5 text-lonex-red" aria-hidden="true">
            *
          </span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p className="text-xs leading-5 text-lonex-muted">{hint}</p>
      ) : null}
      {error ? (
        <p role="alert" className="text-xs leading-5 text-lonex-red">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function TextInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${CONTROL} h-10 ${className}`} />;
}

export function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`${CONTROL} min-h-[120px] py-2.5 leading-6 ${className}`}
    />
  );
}

export function Select({
  className = "",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select {...props} className={`${CONTROL} h-10 ${className}`}>
      {children}
    </select>
  );
}

export function Checkbox({
  label,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className="flex items-start gap-2.5 text-sm text-lonex-ink">
      <input
        type="checkbox"
        {...props}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-lonex-line text-lonex-red accent-lonex-red focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lonex-red/30"
      />
      <span className="leading-5">{label}</span>
    </label>
  );
}
