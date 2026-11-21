"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardBody, CardHeader } from "@/admin/core/ui/card";
import { MediaThumb } from "@/admin/modules/media/media-thumb";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type SellerImageUploaderProps = {
  imageMediaId: number | null;
  imageUrl: string | null;
  imageAlt: string | null;
  onImageMediaIdChange: (imageMediaId: number | null) => void;
  onUploadingChange?: (isUploading: boolean) => void;
  accept?: string;
  maxBytes?: number;
};

/**
 * Seller logo / business image uploader.
 *
 * Uploads to the existing authenticated `/api/admin/media/upload` route with
 * XMLHttpRequest so real progress can be shown. The selected media ID is
 * reported back through `onImageMediaIdChange` and rendered as a hidden input
 * by the parent form so it submits with the seller create/update action.
 *
 * The server never trusts the browser MIME type or extension: it inspects the
 * file signature, enforces the byte ceiling, and stores under a safe unique
 * key. Replacing or removing an image only changes the seller's reference;
 * the media asset itself is retained (and protected from deletion while
 * referenced) by the existing media service.
 *
 * Upload lifecycle guarantees:
 * - The XHR is sent before any state update, so the request is definitely in
 *   flight before React re-renders.
 * - `xhrRef.current` is only cleared by the XHR that created it, preventing
 *   a completed earlier upload from clobbering a later in-flight reference.
 * - State updates after unmount are ignored via a mounted flag.
 * - Removing an image during an in-flight upload aborts the XHR and prevents
 *   the completed response from resurrecting the removed image.
 * - `onUploadingChange` notifies the parent when upload state changes so the
 *   form can disable submission while an upload is in flight.
 */
export function SellerImageUploader({
  imageMediaId,
  imageUrl,
  imageAlt,
  onImageMediaIdChange,
  onUploadingChange,
  accept = "image/jpeg,image/png,image/webp",
  maxBytes = 5 * 1024 * 1024,
}: SellerImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const mountedRef = useRef(true);
  const cancelledRef = useRef(false);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [message, setMessage] = useState("");
  const [progress, setProgress] = useState(0);
  const [preview, setPreview] = useState<string | null>(null);
  const [localMediaId, setLocalMediaId] = useState<number | null>(imageMediaId);

  const maxLabel = `${Math.round(maxBytes / 1024 / 1024)} MB`;
  const uploading = status === "uploading";

  // Revoke the object URL when the preview changes.
  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  // Track mount state so state updates after unmount are ignored.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      xhrRef.current?.abort();
      xhrRef.current = null;
    };
  }, []);

  // Abort an in-flight upload only on unmount, never on preview changes.
  // Aborting here (when preview changes) would kill the XHR just after it was
  // sent, so onload never fires and the component stays stuck uploading.
  useEffect(() => {
    return () => {
      xhrRef.current?.abort();
    };
  }, []);

  // Notify the parent when upload state changes.
  useEffect(() => {
    if (!mountedRef.current) return;
    onUploadingChange?.(uploading);
  }, [uploading, onUploadingChange]);

  function onRemove() {
    // Mark the current upload (if any) as cancelled so its completion
    // callback does not resurrect the removed image.
    cancelledRef.current = true;
    xhrRef.current?.abort();
    xhrRef.current = null;

    if (!mountedRef.current) return;
    setStatus("idle");
    setMessage("");
    setLocalMediaId(null);
    onImageMediaIdChange(null);
  }

  function handleFileSelect(file: File) {
    if (!mountedRef.current) return;

    setMessage("");

    if (file.size > maxBytes) {
      setStatus("error");
      setMessage(`File is larger than ${maxLabel}.`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setStatus("error");
      setMessage("Please select a JPEG, PNG or WebP image.");
      return;
    }

    // Abort any in-flight upload when selecting a new file.
    cancelledRef.current = true;
    xhrRef.current?.abort();
    xhrRef.current = null;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("altText", "");

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;
    cancelledRef.current = false;
    xhr.open("POST", "/api/admin/media/upload");
    xhr.setRequestHeader("Accept", "application/json");

    xhr.upload.onprogress = (progressEvent) => {
      if (!mountedRef.current) return;
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
      // Only the XHR that created this reference may clear it, preventing a
      // completed earlier upload from clobbering a later in-flight reference.
      if (xhrRef.current !== xhr) return;
      if (!mountedRef.current) return;
      if (cancelledRef.current) return;

      xhrRef.current = null;

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
        setLocalMediaId(payload.id);
        onImageMediaIdChange(payload.id);
      } else {
        setStatus("error");
        setMessage(payload.message ?? `Upload failed (HTTP ${xhr.status}).`);
      }
    };

    xhr.onerror = () => {
      if (xhrRef.current !== xhr) return;
      if (!mountedRef.current) return;
      if (cancelledRef.current) return;

      xhrRef.current = null;
      setStatus("error");
      setMessage("The upload failed. Check your connection and try again.");
    };

    setStatus("uploading");
    setMessage("");
    setProgress(0);
    // Send the XHR before touching state so the request is definitely in flight
    // before React re-renders from the preview update.
    xhr.send(formData);
    setPreview(URL.createObjectURL(file));
  }

  function onFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    event.currentTarget.value = "";
    handleFileSelect(file);
  }

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  }

  function handleDragOver(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
  }

  const hasImage = Boolean(localMediaId);

  return (
    <Card className="space-y-4">
      <CardHeader
        title="Seller logo / business image"
        description="Upload your company logo or business photograph."
      />
      <CardBody className="space-y-4">
        {/* Upload / preview area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`relative aspect-[4/3] rounded-xl border-2 dashed transition-colors ${uploading
            ? "border-lonex-line-soft bg-lonex-line-soft cursor-not-allowed opacity-60"
            : hasImage
              ? "border-lonex-line bg-lonex-paper"
              : "border-lonex-line hover:border-lonex-red hover:bg-lonex-red-soft/5 cursor-pointer"}
          `}
        >
          <input
            ref={fileInputRef}
            id="seller-image-file"
            type="file"
            accept={accept}
            onChange={onFileChange}
            disabled={uploading}
            className="sr-only"
            aria-label="Select seller image"
          />
          <label
            htmlFor="seller-image-file"
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none"
          >
            {hasImage ? (
              <>
                <span className="text-xs font-medium text-lonex-ink-soft">
                  Change image
                </span>
                <span className="text-xs text-lonex-muted">
                  (JPG, PNG, WebP up to {maxLabel})
                </span>
              </>
            ) : (
              <>
                <span className="text-xs font-medium text-lonex-ink-soft">
                  Upload image
                </span>
                <span className="text-xs text-lonex-muted">
                  Drag and drop or click to browse
                </span>
                <span className="text-xs text-lonex-muted">
                  (JPG, PNG, WebP up to {maxLabel})
                </span>
              </>
            )}
          </label>

          {preview && !uploading ? (
            // Client-side preview only; the server validates the real file.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={preview}
              alt="Image preview"
              className="absolute inset-0 w-full h-full object-contain rounded-xl border border-lonex-line bg-lonex-paper"
            />
          ) : null}

          {imageUrl && !preview ? (
            <MediaThumb
              src={imageUrl}
              alt={imageAlt ?? "Seller image"}
              className="absolute inset-0 w-full h-full object-contain rounded-xl border border-lonex-line bg-lonex-paper"
            />
          ) : null}

          {uploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/20 backdrop-blur-sm rounded-xl">
              <span className="text-xs text-white font-medium">Uploading…</span>
              <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-[width]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {hasImage && !uploading && (
            <button
              type="button"
              onClick={onRemove}
              className="absolute -top-3 -right-3 rounded-full border border-lonex-red bg-white text-lonex-red text-xs font-semibold px-2 py-1 hover:bg-lonex-red hover:text-white transition-colors"
              aria-label="Remove image"
            >
              Remove
            </button>
          )}
        </div>

        {status === "error" && message && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            <p className="font-medium">Could not upload image</p>
            <p className="mt-1">{message}</p>
          </div>
        )}

        {status === "success" && message && (
          <p role="status" className="text-xs text-emerald-700">{message}</p>
        )}

        {/* Hidden field submitted with the parent seller form. */}
        <input
          type="hidden"
          name="imageMediaId"
          value={localMediaId ?? ""}
        />
      </CardBody>
    </Card>
  );
}
