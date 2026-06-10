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
      <p className="text-sm font-semibold text-[#37352f]">{label}</p>
      <div
        className={`group relative overflow-hidden rounded-xl border border-dashed border-[#d8dee8] bg-white transition hover:border-[#e08550] ${ASPECT_CLASSES[aspect]}`}
      >
        {value ? (
          // Plain img keeps remotePatterns config out of scope until the
          // upload host is finalised (R2 public bucket vs custom domain).
          // eslint-disable-next-line @next/next/no-img-element
          <img alt={label} className="h-full w-full object-cover" src={value} />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 px-3 text-center text-[#787774]">
            <ImagePlus className="h-7 w-7 text-[#9b9a97]" />
            <span className="text-xs font-semibold text-[#37352f]">Click to upload</span>
          </div>
        )}

        <button
          aria-label={`Upload ${label.toLowerCase()}`}
          className="absolute inset-0 flex items-center justify-center bg-transparent transition group-hover:bg-black/30"
          disabled={isWorking}
          onClick={() => inputRef.current?.click()}
          type="button"
        >
          <span className="rounded-full bg-[#37352f] px-4 py-2 text-xs font-bold tracking-wide text-white opacity-0 transition group-hover:opacity-100">
            {value ? "Replace" : "Upload"}
          </span>
        </button>

        {isWorking && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/85 text-sm font-semibold text-[#37352f]">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {progress === "presign" ? "Preparing…" : "Uploading…"}
          </div>
        )}
      </div>

      <input accept="image/*" className="hidden" onChange={handleFile} ref={inputRef} type="file" />

      <div className="flex items-center justify-between text-xs">
        <span className="text-[#787774]">{hint}</span>
        {value && !isWorking && (
          <button
            className="inline-flex items-center gap-1 text-[#787774] transition hover:text-[#e08550]"
            onClick={clear}
            type="button"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </button>
        )}
      </div>

      {error && <p className="text-xs text-[#e08550]">{error}</p>}
    </div>
  );
}
