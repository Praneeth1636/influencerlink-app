"use client";

import { useRef, useState, type ChangeEvent } from "react";
import { ImagePlus, Loader2, Trash2 } from "lucide-react";
import { trpc } from "@/lib/trpc/client";

type UploadKind = "avatar" | "cover" | "post-media" | "message-attachment";

type Aspect = "square" | "wide" | "auto";

type ImageUploadProps = {
  kind: UploadKind;
  value: string | null;
  onChange: (url: string | null) => void;
  label: string;
  hint?: string;
  aspect?: Aspect;
};

const ASPECT_CLASSES: Record<Aspect, string> = {
  square: "aspect-square",
  wide: "aspect-[3/1]",
  auto: ""
};

export function ImageUpload({ kind, value, onChange, label, hint, aspect = "square" }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<"idle" | "presign" | "uploading">("idle");
  const requestUpload = trpc.storage.requestUpload.useMutation();

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = ""; // allow re-selecting the same file
    if (!file) return;
    setError(null);
    setProgress("presign");

    try {
      const grant = await requestUpload.mutateAsync({
        kind,
        contentType: file.type,
        contentLength: file.size
      });

      setProgress("uploading");
      const uploadResponse = await fetch(grant.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file
      });
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed (${uploadResponse.status})`);
      }
      onChange(grant.publicUrl);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upload failed";
      setError(message);
    } finally {
      setProgress("idle");
    }
  }

  function clear() {
    onChange(null);
    setError(null);
  }

  const isWorking = progress !== "idle";

  return (
    <div className="grid gap-2">
      <p className="text-sm font-semibold text-white/80">{label}</p>
      <div
        className={`relative overflow-hidden rounded-xl border border-dashed border-white/15 bg-white/[0.03] ${ASPECT_CLASSES[aspect]}`}
      >
        {value ? (
          // Plain img keeps remotePatterns config out of scope until the
          // upload host is finalised (R2 public bucket vs custom domain).
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={label} className="h-full w-full object-cover" src={value} />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-white/40">
            <ImagePlus className="h-8 w-8" />
          </div>
        )}

        <button
          aria-label={`Upload ${label.toLowerCase()}`}
          className="absolute inset-0 flex items-center justify-center bg-black/0 transition hover:bg-black/40"
          disabled={isWorking}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <span className="rounded-full bg-black/65 px-4 py-2 text-xs font-bold tracking-wide text-white opacity-0 transition group-hover:opacity-100 hover:opacity-100">
            {value ? "Replace" : "Upload"}
          </span>
        </button>

        {isWorking && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/55 text-sm font-semibold text-white">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {progress === "presign" ? "Preparing…" : "Uploading…"}
          </div>
        )}
      </div>

      <input accept="image/*" className="hidden" onChange={handleFile} ref={inputRef} type="file" />

      <div className="flex items-center justify-between text-xs">
        <span className="text-white/40">{hint}</span>
        {value && !isWorking && (
          <button
            className="inline-flex items-center gap-1 text-white/50 hover:text-rose-300"
            onClick={clear}
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        )}
      </div>

      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}
