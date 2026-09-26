"use client";
import { useRef, useState } from "react";
import { browserClient } from "@/lib/supabase/browser";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const DOC_TYPES = ["application/pdf", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const VIDEO_TYPES = ["video/mp4"];

export type UploadKind = "image" | "document" | "video";
const rules: Record<UploadKind, { types: string[]; max: number; accept: string; label: string }> = {
  image: { types: IMAGE_TYPES, max: 8 * 1024 * 1024, accept: IMAGE_TYPES.join(","), label: "JPG, PNG, WebP or GIF up to 8 MB" },
  document: { types: DOC_TYPES, max: 10 * 1024 * 1024, accept: ".pdf,.doc,.docx", label: "PDF or Word up to 10 MB" },
  video: { types: VIDEO_TYPES, max: 10 * 1024 * 1024, accept: "video/mp4", label: "MP4 up to 10 MB. Use YouTube for longer videos." },
};

/** Uploads straight to the Supabase "media" bucket. Storage policies only allow newsroom staff. */
export async function uploadFile(file: File, kind: UploadKind): Promise<{ url: string } | { error: string }> {
  const r = rules[kind];
  if (!r.types.includes(file.type)) return { error: `That file type isn't allowed. ${r.label}.` };
  if (file.size > r.max) return { error: `That file is too large. ${r.label}.` };
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
