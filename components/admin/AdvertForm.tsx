"use client";
import { useActionState, useEffect, useRef, useState } from "react";
import type { ActionResult } from "@/app/admin/actions";
import { adPlacements, type AdPlacement } from "@/lib/ads";
import { UploadButton } from "./MediaUpload";

export function AdvertForm({ action }: { action: (prev: ActionResult, fd: FormData) => Promise<ActionResult> }) {
  const [state, formAction, pending] = useActionState(action, { ok: true });
  const [image, setImage] = useState("");
  const [placement, setPlacement] = useState<AdPlacement>("leaderboard");
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.ok && state.message) {
      ref.current?.reset();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- clear the uploaded image once the advert is saved
      setImage("");
    }
  }, [state]);
  const p = adPlacements[placement];
  return (
    <form ref={ref} action={formAction} className="grid gap-4" aria-busy={pending}>
      <fieldset disabled={pending} className="contents">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="advertiser" className="label">Advertiser</label><input id="advertiser" name="advertiser" required maxLength={120} className="field" placeholder="e.g. Uche-Tex Fabrics" /></div>
          <div>
            <label htmlFor="placement" className="label">Where it shows</label>
            <select id="placement" name="placement" className="field" value={placement} onChange={(e) => setPlacement(e.target.value as AdPlacement)}>
              {(Object.keys(adPlacements) as AdPlacement[]).map((k) => <option key={k} value={k}>{adPlacements[k].label}</option>)}
            </select>
            <p className="mt-1 text-xs text-muted">{p.where}. Best image size: <strong>{p.size}</strong>.</p>
          </div>
        </div>

        <div>
          <span className="label">Advert image</span>
          <input type="hidden" name="image_url" value={image} />
          {image ? (
            <div className="grid gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="Advert preview" className="max-h-64 w-auto max-w-full border border-rule" />
              <button type="button" className="w-fit text-sm text-live underline" onClick={() => setImage("")}>Remove and choose another</button>
            </div>
          ) : (
            <UploadButton kind="image" label="Upload advert image" onUploaded={(url) => setImage(url)} />
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="link" className="label">Link when clicked <span className="font-normal text-muted">(optional)</span></label><input id="link" name="link" className="field" placeholder="https://advertiser-website.com" /></div>
          <div><label htmlFor="alt_text" className="label">Short description <span className="font-normal text-muted">(optional)</span></label><input id="alt_text" name="alt_text" maxLength={200} className="field" placeholder="e.g. Uche-Tex Christmas sale, 20% off" /></div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div><label htmlFor="start_date" className="label">Start date <span className="font-normal text-muted">(optional)</span></label><input id="start_date" name="start_date" type="date" className="field" /><p className="mt-1 text-xs text-muted">Leave empty to start today.</p></div>
          <div><label htmlFor="end_date" className="label">End date <span className="font-normal text-muted">(optional)</span></label><input id="end_date" name="end_date" type="date" className="field" /><p className="mt-1 text-xs text-muted">It stops showing after this day. Leave empty to run until you pause it.</p></div>
        </div>

        <div><button className="btn btn-primary" disabled={!image || pending}>{pending ? "Saving…" : "Put advert on the site"}</button></div>
      </fieldset>
      {state.message && <p role={state.ok ? "status" : "alert"} className={`text-sm ${state.ok ? "text-accent" : "text-live"}`}>{state.message}</p>}
    </form>
  );
}
