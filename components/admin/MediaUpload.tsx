"use client";
import { useRef, useState } from "react";
import { browserClient } from "@/lib/supabase/browser";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const VIDEO_TYPES = ["video/mp4"];

export type UploadKind = "image" | "document" | "video";
const rules: Record<UploadKind, { types: string[]; max: number; accept: string; label: string }> = {
  image: { types: IMAGE_TYPES, max: 25 * 1024 * 1024, accept: IMAGE_TYPES.join(","), label: "JPG, PNG, WebP or GIF. Photos are resized and compressed automatically" },
  document: { types: DOC_TYPES, max: 10 * 1024 * 1024, accept: ".pdf,.doc,.docx", label: "PDF or Word up to 10 MB" },
  video: { types: VIDEO_TYPES, max: 10 * 1024 * 1024, accept: "video/mp4", label: "MP4 up to 10 MB. Use YouTube for longer videos." },
};

/**
 * Shrinks photos in the browser before upload (longest side 1920px, WebP), so a 6 MB phone
 * photo becomes roughly 200–400 KB. Keeps storage and bandwidth inside the free plans and
 * makes pages load faster on mobile data. GIFs are left alone so animations survive.
 */
async function compressImage(file: File): Promise<File> {
  if (file.type === "image/gif" || typeof createImageBitmap !== "function") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const MAX = 1920;
    const scale = Math.min(1, MAX / Math.max(bitmap.width, bitmap.height));
    const w = Math.round(bitmap.width * scale), h = Math.round(bitmap.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/webp", 0.82));
    if (!blob || blob.type !== "image/webp" || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + ".webp", { type: "image/webp" });
  } catch {
    return file;
  }
}

/** Uploads straight to the Supabase "media" bucket. Storage policies only allow newsroom staff. */
export async function uploadFile(original: File, kind: UploadKind): Promise<{ url: string } | { error: string }> {
  const r = rules[kind];
  if (!r.types.includes(original.type)) return { error: `That file type isn't allowed. ${r.label}.` };
  if (original.size > r.max) return { error: `That file is too large. ${r.label}.` };
  const file = kind === "image" ? await compressImage(original) : original;
  if (file.size > 10 * 1024 * 1024) return { error: "That file is still over 10 MB after compression. Try a smaller file." };
  const ext = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
  const base = file.name.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "file";
  const d = new Date();
  const path = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, "0")}/${crypto.randomUUID().slice(0, 8)}-${base}.${ext}`;
  const supabase = browserClient();
  const { error } = await supabase.storage.from("media").upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) return { error: error.message.includes("row-level") ? "You don't have permission to upload." : `Upload failed: ${error.message}` };
  return { url: supabase.storage.from("media").getPublicUrl(path).data.publicUrl };
}

export function UploadButton({ kind, onUploaded, label, multiple = false }: { kind: UploadKind; onUploaded: (url: string, file: File) => void; label: string; multiple?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <input ref={ref} type="file" hidden accept={rules[kind].accept} multiple={multiple}
        onChange={async (e) => {
          const files = Array.from(e.target.files ?? []);
          if (!files.length) return;
          setBusy(true); setError(null);
          for (const f of files) {
            const res = await uploadFile(f, kind);
            if ("error" in res) { setError(res.error); break; }
            onUploaded(res.url, f);
          }
          setBusy(false);
          e.target.value = "";
        }} />
      <button type="button" className="btn btn-ghost py-2 text-sm" disabled={busy} onClick={() => ref.current?.click()}>{busy ? "Uploading…" : label}</button>
      <p className="mt-1 text-xs text-muted">{rules[kind].label}</p>
      {error && <p role="alert" className="mt-1 text-sm text-live">{error}</p>}
    </div>
  );
}
