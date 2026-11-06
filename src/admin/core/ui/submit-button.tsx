"use client";

import { useFormStatus } from "react-dom";
import { buttonClassName } from "./button";

export function SubmitButton({
  label,
  pendingLabel,
  variant = "primary",
  size = "md",
  className,
}: {
  label: string;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={buttonClassName(variant, size, className)}
    >
      {pending ? (pendingLabel ?? "Saving...") : label}
    </button>
  );
}
