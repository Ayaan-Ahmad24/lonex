"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { FormField, TextInput } from "@/admin/core/ui/form-fields";
import { Card, CardBody, CardHeader } from "@/admin/core/ui/card";
import { buttonClassName } from "@/admin/core/ui/button";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type UploadResponse = {
  status?: string;
  message?: string;
};

/**
 * Media upload form.
 *
 * Files are posted to the authenticated `/api/admin/media/upload` route with
 * XMLHttpRequest so the UI can show real progress. The route streams the body
 * with a size ceiling; it does not go through the 1 MB Server Action transport.
 */
export function MediaUploadForm({ maxBytes }: { maxBytes: number }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);

  const maxLabel = `${Math.round(maxBytes / 1024 / 1024)} MB`;

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    return () => {
      xhrRef.current?.abort();
      xhrRef.current = null;
    };
  }, []);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    setMessage("");

    if (status === "error") {
      setStatus("idle");
    }

    setPreview(null);

    if (!file) {
      return;
    }

    if (file.size > maxBytes) {
      setStatus("error");
      setMessage(`File is larger than ${maxLabel}.`);
      event.currentTarget.value = "";
      return;
    }

    if (file.type.startsWith("image/")) {
      setPreview(URL.createObjectURL(file));
    }
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (status === "uploading") {
      return;
    }

    const form = event.currentTarget;
    const file = fileInputRef.current?.files?.[0];

    if (!file) {
      setStatus("error");
      setMessage("Choose a JPEG, PNG, WebP, GIF or PDF file.");
      return;
    }

    if (file.size > maxBytes) {
      setStatus("error");
      setMessage(`File is larger than ${maxLabel}.`);
      return;
    }

    const altInput = form.elements.namedItem("altText");
    const formData = new FormData();
    formData.append("file", file);
    formData.append(
      "altText",
      altInput instanceof HTMLInputElement ? altInput.value : "",
    );

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("POST", "/api/admin/media/upload");
    xhr.setRequestHeader("Accept", "application/json");

    xhr.upload.onprogress = (progressEvent) => {
      if (progressEvent.lengthComputable && progressEvent.total > 0) {
        setProgress(
          Math.min(
            99,
            Math.round((progressEvent.loaded / progressEvent.total) * 100),
          ),
        );
      }
    };

    xhr.onload = () => {
      xhrRef.current = null;

      let payload: UploadResponse = {};

      try {
        payload = JSON.parse(xhr.responseText) as UploadResponse;
      } catch {
        payload = {};
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload.status === "ok") {
        setStatus("success");
        setMessage(payload.message ?? "File uploaded to private storage.");
        setProgress(100);
        setPreview(null);
        form.reset();
        router.refresh();
        return;
      }

      setStatus("error");
      setProgress(0);
      setMessage(
        payload.message ??
          (xhr.status === 413
            ? `File is larger than ${maxLabel}.`
            : `Upload failed (HTTP ${xhr.status}). Try again.`),
      );
    };

    xhr.onerror = () => {
      xhrRef.current = null;
      setStatus("error");
      setProgress(0);
      setMessage("The upload failed. Check your connection and try again.");
    };

    xhr.onabort = () => {
      xhrRef.current = null;
    };

    setStatus("uploading");
    setMessage("");
    setProgress(0);
    xhr.send(formData);
  }

  const uploading = status === "uploading";

  return (
    <Card>
      <CardHeader
        title="Upload media"
        description={`JPEG, PNG, WebP, GIF or PDF up to ${maxLabel}. The server checks file signatures; browser MIME types are not trusted. SVG and HTML are rejected.`}
      />
      <CardBody>
        <form onSubmit={onSubmit} className="space-y-3" noValidate>
          <FormField label="Choose media file" htmlFor="media-file" required>
            <input
              ref={fileInputRef}
              id="media-file"
              type="file"
              name="file"
              accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
              onChange={onFileChange}
              disabled={uploading}
              className="block w-full cursor-pointer rounded-lg border border-slate-300 bg-white text-sm text-slate-600 file:mr-3 file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-slate-700 hover:file:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </FormField>

          {preview ? (
            // Object URL preview only; the server never trusts the browser type.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Selected file preview"
              className="h-32 w-auto rounded-lg border border-slate-200 object-cover"
            />
          ) : null}

          <FormField
            label="Alt text"
            htmlFor="media-alt"
            hint="Describe the image for accessibility. Recommended for images."
          >
            <TextInput
              id="media-alt"
              name="altText"
              maxLength={500}
              disabled={uploading}
              placeholder="e.g. Rooftop solar installation"
            />
          </FormField>

          {uploading ? (
            <div
              className="space-y-1"
              role="progressbar"
              aria-label="Upload progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progress}
            >
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500">
                Uploading… {progress}%
              </p>
            </div>
          ) : null}

          {status === "error" && message ? (
            <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <p className="font-medium">Could not save</p>
              <p className="mt-1">{message}</p>
            </div>
          ) : null}

          {status === "success" && message ? (
            <p role="status" className="text-xs text-emerald-700">
              {message}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={uploading}
            className={buttonClassName("primary", "md")}
          >
            {uploading ? "Uploading..." : "Upload file"}
          </button>
        </form>
      </CardBody>
    </Card>
  );
}
