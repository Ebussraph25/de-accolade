"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addLiveUpdate, deleteLiveUpdate } from "@/app/admin/actions";
import { formatTime, timeAgo } from "@/lib/format";
import type { LiveUpdate } from "@/lib/types";
import { UploadButton } from "./MediaUpload";

export function LiveUpdatesPanel({ articleId, updates }: { articleId: string; updates: LiveUpdate[] }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <section className="mt-8 border border-live/40 bg-bg p-5">
      <h2 className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 animate-pulse rounded-full bg-live" /> Live timeline</h2>
      <p className="mt-1 text-sm text-muted">Updates appear at the top of the live story within a minute. Readers&apos; pages refresh automatically.</p>
      <div className="mt-4 grid gap-3">
        <label htmlFor="live-body" className="sr-only">New update</label>
        <textarea id="live-body" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="What just happened?" className="field" maxLength={5000} />
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <UploadButton kind="image" label={img ? "Replace photo" : "Add photo"} onUploaded={(u) => setImg(u)} />
            {img && <button type="button" onClick={() => setImg("")} className="text-sm text-live">Remove photo</button>}
          </div>
          <button type="button" className="btn btn-primary" disabled={pending || text.trim().length < 2}
            onClick={() => start(async () => {
              const r = await addLiveUpdate(articleId, text, img || undefined);
              setMsg(r.message ?? null);
              if (r.ok) { setText(""); setImg(""); router.refresh(); }
            })}>{pending ? "Posting…" : "Post update"}</button>
        </div>
        {msg && <p role="status" className="text-sm text-muted">{msg}</p>}
      </div>
      {updates.length > 0 && (
        <ol className="mt-6 divide-y divide-rule border-t border-rule">
          {updates.map((u) => (
            <li key={u.id} className="flex gap-4 py-3">
              <time className="w-20 shrink-0 text-sm font-semibold" dateTime={u.created_at} title={timeAgo(u.created_at)}>{formatTime(u.created_at)}</time>
              <p className="flex-1 text-sm">{u.body}{u.image_url && <span className="ml-2 text-xs text-muted">(photo)</span>}</p>
              <button type="button" className="text-sm text-live hover:underline" onClick={() => { if (confirm("Delete this update?")) start(async () => { await deleteLiveUpdate(u.id); router.refresh(); }); }}>Delete</button>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
