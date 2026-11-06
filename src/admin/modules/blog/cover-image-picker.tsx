"use client";

import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { Card, CardBody, CardHeader } from "@/admin/core/ui/card";

type MediaOption = {
  id: number;
  label: string;
  mimeType: string;
};

type PickerMode = "library" | "upload";

/**
 * Blog cover image picker.
 *
 * Provides two ways to set the cover image:
 * 1. Select from the existing Media Library (thumbnail grid)
 * 2. Upload from device (authenticated multipart upload with progress)
 *
 * The selected media ID is stored in a hidden form field named `coverMediaId`
 * that is rendered inside this component, so it submits with the parent form.
 */
export function BlogCoverImagePicker({
  selectedMediaId,
  onSelect,
  mediaOptions,
}: {
  selectedMediaId: number | null;
  onSelect: (mediaId: number | null) => void;
  mediaOptions: MediaOption[];
}) {
  const [mode, setMode] = useState<PickerMode>("library");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [internalValue, setInternalValue] = useState(selectedMediaId ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  useEffect(() => {
    return () => {
      xhrRef.current?.abort();
    };
  }, []);

  function handleFileSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    const maxBytes = 5 * 1024 * 1024;

    if (file.size > maxBytes) {
      setStatus("error");
      setMessage(`File is larger than 5 MB.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Please select a JPEG, PNG, WebP or GIF image.");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("altText", "");

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    xhr.open("POST", "/api/admin/media/upload");
    xhr.setRequestHeader("Accept", "application/json");

    xhr.upload.onprogress = (progressEvent) => {
      if (progressEvent.lengthComputable && progressEvent.total > 0) {
        setProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100));
      }
    };

    xhr.onload = () => {
      xhrRef.current = null;
      setUploading(false);

      let payload: { status?: string; id?: number; message?: string } = {};

      try {
        payload = JSON.parse(xhr.responseText);
      } catch {
        payload = {};
      }

      if (xhr.status >= 200 && xhr.status < 300 && payload.status === "ok" && payload.id) {
        setStatus("success");
        setMessage("Image uploaded successfully.");
        setProgress(100);
        setInternalValue(payload.id);
        setMode("library");
        onSelect(payload.id);
      } else {
        setStatus("error");
        setMessage(payload.message ?? `Upload failed (HTTP ${xhr.status}).`);
      }
    };

    xhr.onerror = () => {
      xhrRef.current = null;
      setUploading(false);
      setStatus("error");
      setMessage("The upload failed. Check your connection and try again.");
    };

    setStatus("uploading");
    setMessage("");
    setProgress(0);
    xhr.send(formData);
  }

  function selectMedia(mediaId: number | null) {
    setInternalValue(mediaId);
    onSelect(mediaId);
  }

  return (
    <>
      <input
        type="hidden"
        name="coverMediaId"
        value={internalValue ?? ""}
      />
      <Card className="space-y-4">
        <CardHeader
          title="Cover image"
          description="Choose an existing image from the Media Library or upload a new one."
        />
        <CardBody className="space-y-4">
          {/* Mode selector */}
          <div className="flex gap-2 rounded-lg border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => {
                setMode("library");
                setMessage("");
                setStatus("idle");
              }}
              className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                mode === "library"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Media Library
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("upload");
                setMessage("");
                setStatus("idle");
              }}
              className={`flex-1 px-3 py-1.5 text-xs rounded-md transition-colors ${
                mode === "upload"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Upload from Device
            </button>
          </div>

          {/* Media Library mode */}
          {mode === "library" ? (
            <>
              {mediaOptions.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No images in the Media Library. Upload one to use as a cover.
                </p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-64 overflow-y-auto">
                  {mediaOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => selectMedia(option.id)}
                      aria-pressed={internalValue === option.id}
                      className={`relative aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                        internalValue === option.id
                          ? "border-[#CF0A0A] bg-[#F5EDED]/30"
                          : "border-transparent hover:border-slate-200"
                      }`}
                    >
                      <img
                        src={`/admin/media/${option.id}/file`}
                        alt={option.label}
                        className="h-full w-full object-cover"
                      />
                      {internalValue === option.id && (
                        <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs font-semibold">
                          Selected
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {internalValue !== null && (
                <button
                  type="button"
                  onClick={() => selectMedia(null)}
                  className="text-xs text-red-600 hover:text-red-800 underline"
                >
                  Remove cover image
                </button>
              )}
            </>
          ) : null}

          {/* Upload mode */}
          {mode === "upload" ? (
            <>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  id="blog-cover-file"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileSelect}
                  className="sr-only"
                />
                <label
                  htmlFor="blog-cover-file"
                  className={`flex-1 rounded-lg border py-4 text-center transition-colors ${
                    uploading
                      ? "border-slate-300 bg-slate-50 cursor-not-allowed opacity-60"
                      : "border-slate-300 hover:border-slate-900 hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  {uploading ? (
                    <>
                      <span className="text-xs text-slate-600">Uploading…</span>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2">
                        <div
                          className="bg-slate-900 h-1.5 rounded-full"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-medium text-slate-600">
                        Choose image
                      </span>
                      <span className="text-xs text-slate-400">
                        (JPG, PNG, WebP, GIF up to 5 MB)
                      </span>
                    </>
                  )}
                </label>
              </div>
              {status === "error" && message && (
                <p role="alert" className="text-xs text-red-600">
                  {message}
                </p>
              )}
              {status === "success" && message && (
                <p role="status" className="text-xs text-emerald-700">
                  {message}
                </p>
              )}
            </>
          ) : null}
        </CardBody>
      </Card>
    </>
  );
}
