"use client";

import { useState } from "react";
import type { ChangeEvent } from "react";

export function ImageUpload({
  name = "file",
  accept = "image/jpeg,image/png,image/webp,image/gif,application/pdf",
  label = "Select file",
  maxBytes = 5 * 1024 * 1024,
}: {
  name?: string;
  accept?: string;
  label?: string;
  maxBytes?: number;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    setError(null);

    if (!file) {
      setPreview(null);
      return;
    }

    if (file.size > maxBytes) {
      setError(`File is larger than ${Math.round(maxBytes / 1024 / 1024)} MB.`);
      event.currentTarget.value = "";
      setPreview(null);
      return;
    }

    setPreview(
      file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    );
  }

  return (
    <div className="space-y-2">
      <input
        type="file"
        name={name}
        accept={accept}
        onChange={onChange}
        aria-label={label}
        className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200"
      />
      {preview ? (
        // Object URL preview only; the server never trusts the browser type.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="Selected file preview"
          className="h-32 w-auto rounded-lg border border-slate-200 object-cover"
        />
      ) : null}
      {error ? (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
