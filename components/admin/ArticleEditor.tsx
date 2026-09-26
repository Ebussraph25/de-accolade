"use client";
/* eslint-disable @next/next/no-img-element -- previews of freshly uploaded files */
import Link from "next/link";
import { startTransition, useActionState, useRef, useState, useTransition } from "react";
import { deleteArticle, previewMarkdown, saveArticle, type ActionResult } from "@/app/admin/actions";
import { articleTypes, languages, sections } from "@/lib/taxonomy";
import { slugify } from "@/lib/format";
import type { Article, Attachment, GalleryItem, Role } from "@/lib/types";
import { UploadButton, uploadFile } from "./MediaUpload";
import { Notice, StatusPill } from "./ui";

type Original = { id: string; title: string };
type ToolAction = "bold" | "italic" | "h2" | "h3" | "quote" | "ul" | "ol" | "link";
const TOOLS: { l: string; t: string; a: ToolAction; c?: string }[] = [
  { l: "B", t: "Bold", a: "bold", c: "font-bold" },
  { l: "I", t: "Italic", a: "italic", c: "italic" },
  { l: "H2", t: "Heading", a: "h2" },
  { l: "H3", t: "Subheading", a: "h3" },
  { l: "“ ”", t: "Quote", a: "quote" },
  { l: "• List", t: "Bulleted list", a: "ul" },
  { l: "1. List", t: "Numbered list", a: "ol" },
  { l: "Link", t: "Link", a: "link" },
];

const toLocalInput = (iso: string | null | undefined) => {
  if (!iso) return "";
  const d = new Date(iso);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export function ArticleEditor({ article, role, originals, siteUrl, saved }: { article?: Article; role: Role; originals: Original[]; siteUrl: string; saved?: boolean }) {
  const isEditor = role !== "reporter";
  const savedMessage = !article ? "Saved." : article.status === "published"
    ? (article.published_at && new Date(article.published_at) > new Date() ? "Scheduled. It will go live at the time you chose." : "Published. It's now live on the site.")
    : article.status === "pending" ? "Submitted for review." : "Saved as a draft. It's not visible on the site yet.";
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveArticle, saved ? { ok: true, message: savedMessage } : { ok: true });
  const e = state.errors ?? {};

  const [title, setTitle] = useState(article?.title ?? "");
  const [slug, setSlug] = useState(article?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(article));
  const [body, setBody] = useState(article?.body ?? "");
  const [excerpt, setExcerpt] = useState(article?.excerpt ?? "");
  const [seoTitle, setSeoTitle] = useState(article?.seo_title ?? "");
  const [seoDesc, setSeoDesc] = useState(article?.seo_description ?? "");
  const [type, setType] = useState(article?.type ?? "article");
  const [status, setStatus] = useState(article?.status ?? "draft");
  const [publishAt, setPublishAt] = useState(toLocalInput(article?.published_at));
  const isLive = article?.status === "published" && !!article.published_at && new Date(article.published_at) <= new Date();
  const isScheduled = article?.status === "published" && !!article.published_at && new Date(article.published_at) > new Date();
  const [image, setImage] = useState(article?.featured_image ?? "");
  const [gallery, setGallery] = useState<GalleryItem[]>(article?.gallery ?? []);
  const [attachments, setAttachments] = useState<Attachment[]>(article?.attachments ?? []);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewing, startPreview] = useTransition();
  const [deleting, startDelete] = useTransition();
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const effectiveSlug = slugTouched ? slug : slugify(title);
  const words = body.trim() ? body.trim().split(/\s+/).length : 0;

  function wrap(before: string, after = "", placeholder = "") {
    const el = bodyRef.current;
    if (!el) return;
    const { selectionStart: s, selectionEnd: en, value } = el;
    const sel = value.slice(s, en) || placeholder;
    const next = value.slice(0, s) + before + sel + after + value.slice(en);
    setBody(next);
    requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + sel.length); });
  }
  const linePrefix = (prefix: string) => {
    const el = bodyRef.current; if (!el) return;
    const s = el.value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    setBody(el.value.slice(0, s) + prefix + el.value.slice(s));
    requestAnimationFrame(() => el.focus());
  };

  function runTool(action: ToolAction) {
    switch (action) {
      case "bold": return wrap("**", "**", "bold text");
      case "italic": return wrap("_", "_", "italic text");
      case "h2": return linePrefix("## ");
      case "h3": return linePrefix("### ");
      case "quote": return linePrefix("> ");
      case "ul": return linePrefix("- ");
      case "ol": return linePrefix("1. ");
      case "link": { const url = prompt("Link address (https://…)"); if (url) wrap("[", `](${url})`, "link text"); }
    }
  }

  const actionBar = (
    <div className="flex flex-wrap items-center justify-between gap-3 border border-rule bg-bg px-5 py-4">
      <p className="text-sm">
        {isLive ? <><span className="font-semibold text-emerald-700 dark:text-emerald-400">Live on the site.</span> Changes appear after you click Update.</>
          : isScheduled ? <><span className="font-semibold text-accent">Scheduled.</span> Goes live {new Date(article!.published_at!).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}.</>
          : article?.status === "pending" ? <><span className="font-semibold">In review.</span> Not visible on the site yet.</>
          : <><span className="font-semibold">Draft.</span> Not visible on the site yet.</>}
      </p>
      <div className="flex flex-wrap gap-2">
        {isEditor ? (
          isLive ? (
            <>
              <button type="submit" data-intent="update" className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Update story"}</button>
              <button type="submit" data-intent="draft" className="btn btn-ghost" disabled={pending} onClick={(e) => { if (!confirm("Take this story off the site and move it back to drafts?")) e.preventDefault(); }}>Unpublish</button>
            </>
          ) : (
            <>
              <button type="submit" data-intent="publish-now" className="btn btn-gold" disabled={pending}>{pending ? "Publishing…" : "Publish now"}</button>
              <button type="submit" data-intent="draft" className="btn btn-ghost" disabled={pending}>Save draft</button>
            </>
          )
        ) : (
          <>
            <button type="submit" data-intent="review" className="btn btn-primary" disabled={pending}>{pending ? "Sending…" : "Submit for review"}</button>
            <button type="submit" data-intent="draft" className="btn btn-ghost" disabled={pending}>Save draft</button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <form
      // Submit manually so React doesn't reset the form (and the editor's fields) after saving.
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        const intent = ((ev.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.dataset.intent;
        if (intent === "publish-now") { fd.set("status", "published"); fd.set("published_at", ""); setStatus("published"); setPublishAt(""); }
        else if (intent === "update") { fd.set("status", "published"); setStatus("published"); }
        else if (intent === "draft") { fd.set("status", "draft"); setStatus("draft"); }
        else if (intent === "review") { fd.set("status", "pending"); setStatus("pending"); }
        // Send the schedule time with the browser's timezone (Lagos), not as bare local time.
        const when = fd.get("published_at");
        if (typeof when === "string" && when) fd.set("published_at", new Date(when).toISOString());
        startTransition(() => action(fd));
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]"
    >
      <input type="hidden" name="id" value={article?.id ?? ""} />
      <input type="hidden" name="slug" value={effectiveSlug} />
      <input type="hidden" name="body" value={body} />
      <input type="hidden" name="featured_image" value={image} />
      <input type="hidden" name="gallery" value={JSON.stringify(gallery)} />
      <input type="hidden" name="attachments" value={JSON.stringify(attachments)} />

      {/* ------------------------------------------------ main column */}
      <div className="grid min-w-0 grid-cols-1 content-start gap-6">
        {state.message && <Notice tone={state.ok ? "info" : "error"}>{state.message}{state.ok && isLive && <> <Link className="font-semibold underline" href={`/article/${article!.slug}`} target="_blank">View it on the site</Link></>}</Notice>}
        {actionBar}

        <div className="border border-rule bg-bg p-5">
          <label htmlFor="title" className="label">Headline</label>
          <textarea id="title" name="title" rows={2} required value={title} onChange={(ev) => setTitle(ev.target.value)} maxLength={200}
            className="field resize-none font-serif text-2xl font-semibold" aria-invalid={!!e.title || undefined} />
          {e.title && <p className="mt-1 text-sm text-live">{e.title}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-1 text-xs text-muted">
            <span>{siteUrl}/article/</span>
            <input aria-label="URL slug" value={effectiveSlug} onChange={(ev) => { setSlugTouched(true); setSlug(slugify(ev.target.value)); }} className="min-w-40 flex-1 border-b border-dashed border-rule bg-transparent py-0.5 text-fg outline-none focus:border-gold-500" />
          </div>
          {e.slug && <p className="mt-1 text-sm text-live">{e.slug}</p>}

          <label htmlFor="subtitle" className="label mt-5">Subtitle <span className="font-normal text-muted">(optional)</span></label>
          <input id="subtitle" name="subtitle" defaultValue={article?.subtitle ?? ""} maxLength={300} className="field" />

          <label htmlFor="excerpt" className="label mt-5">Summary <span className="font-normal text-muted">(shown on story cards)</span></label>
          <textarea id="excerpt" name="excerpt" rows={2} value={excerpt} onChange={(ev) => setExcerpt(ev.target.value)} maxLength={400} className="field" />
          <p className="mt-1 text-right text-xs text-muted">{excerpt.length}/400</p>
        </div>

        {/* Body */}
        <div className="border border-rule bg-bg">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-rule px-3 py-2">
            <div role="tablist" className="flex gap-1">
              {(["write", "preview"] as const).map((t) => (
                <button key={t} type="button" role="tab" aria-selected={tab === t}
                  onClick={() => { setTab(t); if (t === "preview") startPreview(async () => setPreviewHtml(await previewMarkdown(body))); }}
                  className={`px-3 py-1.5 text-sm font-semibold capitalize ${tab === t ? "bg-surface" : "text-muted hover:text-fg"}`}>{t}</button>
              ))}
            </div>
            {tab === "write" && (
              <div className="flex flex-wrap items-center gap-0.5" role="toolbar" aria-label="Formatting">
                {TOOLS.map((t) => <button key={t.t} type="button" title={t.t} aria-label={t.t} onClick={() => runTool(t.a)} className={`min-w-8 px-2 py-1 text-sm hover:bg-surface ${t.c ?? ""}`}>{t.l}</button>)}
                <label className="cursor-pointer px-2 py-1 text-sm hover:bg-surface" title="Insert image">
                  Image
                  <input type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" onChange={async (ev) => {
                    const f = ev.target.files?.[0]; if (!f) return;
                    const r = await uploadFile(f, "image");
                    if ("error" in r) alert(r.error); else wrap(`\n![`, `](${r.url})\n`, "Describe the image");
                    ev.target.value = "";
                  }} />
                </label>
              </div>
            )}
          </div>
          {tab === "write" ? (
            <textarea ref={bodyRef} aria-label="Story body" value={body} onChange={(ev) => setBody(ev.target.value)} rows={22}
              placeholder={"Write the story here.\n\nUse ## for section headings, > for quotes and - for lists. Leave a blank line between paragraphs."}
              className="block w-full resize-y bg-bg p-5 font-serif text-[1.1rem] leading-relaxed outline-none" />
          ) : (
            <div className="min-h-[24rem] p-6">{previewing ? <p className="text-muted">Rendering preview…</p> : <div className="article-body" dangerouslySetInnerHTML={{ __html: previewHtml || "<p><em>Nothing to preview yet.</em></p>" }} />}</div>
          )}
          <p className="border-t border-rule px-4 py-2 text-xs text-muted">{words.toLocaleString()} words · about {Math.max(1, Math.round(words / 220))} min read</p>
        </div>

        {/* Media */}
        <div className="border border-rule bg-bg p-5">
          <h2 className="font-semibold">Featured image</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-[14rem_1fr]">
            <div className="aspect-[16/10] overflow-hidden bg-surface">
              {image ? <img src={image} alt="" className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-sm text-muted">No image</div>}
            </div>
            <div className="grid content-start gap-3">
              <div className="flex flex-wrap items-start gap-3">
                <UploadButton kind="image" label={image ? "Replace image" : "Upload image"} onUploaded={(url) => setImage(url)} />
                {image && <button type="button" className="text-sm text-live hover:underline" onClick={() => setImage("")}>Remove</button>}
              </div>
              <div><label htmlFor="alt" className="label">Caption / alt text</label><input id="alt" name="featured_image_alt" defaultValue={article?.featured_image_alt ?? ""} className="field" placeholder="Describe what the photo shows" /></div>
              <div><label htmlFor="credit" className="label">Photo credit</label><input id="credit" name="image_credit" defaultValue={article?.image_credit ?? ""} className="field" /></div>
            </div>
          </div>
        </div>

        <div className="border border-rule bg-bg p-5">
          <h2 className="font-semibold">Video</h2>
          <div className="mt-3 grid gap-4 md:grid-cols-2">
            <div><label htmlFor="yt" className="label">YouTube link</label><input id="yt" name="youtube_url" type="url" defaultValue={article?.youtube_url ?? ""} placeholder="https://www.youtube.com/watch?v=…" className="field" />{e.youtube_url && <p className="mt-1 text-sm text-live">{e.youtube_url}</p>}</div>
            <VideoField initial={article?.video_url ?? ""} />
          </div>
          <p className="mt-2 text-xs text-muted">Set the story type to Video to show the player at the top of the page.</p>
        </div>

        <div className="border border-rule bg-bg p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Photo gallery <span className="font-normal text-muted">({gallery.length})</span></h2>
            <UploadButton kind="image" multiple label="Add photos" onUploaded={(url) => setGallery((g) => [...g, { url, caption: "", credit: "" }])} />
          </div>
          {gallery.length > 0 && (
            <ul className="mt-4 grid gap-4">
              {gallery.map((g, i) => (
                <li key={g.url} className="grid gap-3 border-t border-rule pt-4 sm:grid-cols-[8rem_1fr_auto]">
                  <img src={g.url} alt="" className="aspect-[3/2] w-full object-cover" />
                  <div className="grid gap-2">
                    <input aria-label={`Caption for photo ${i + 1}`} placeholder="Caption" value={g.caption ?? ""} onChange={(ev) => setGallery((all) => all.map((x, j) => (j === i ? { ...x, caption: ev.target.value } : x)))} className="field py-1.5" />
                    <input aria-label={`Credit for photo ${i + 1}`} placeholder="Photo credit" value={g.credit ?? ""} onChange={(ev) => setGallery((all) => all.map((x, j) => (j === i ? { ...x, credit: ev.target.value } : x)))} className="field py-1.5" />
                  </div>
                  <div className="flex gap-2 sm:flex-col">
                    <button type="button" className="text-sm hover:underline disabled:opacity-40" disabled={i === 0} onClick={() => setGallery((all) => { const c = [...all]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; return c; })}>Move up</button>
                    <button type="button" className="text-sm text-live hover:underline" onClick={() => setGallery((all) => all.filter((_, j) => j !== i))}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-rule bg-bg p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-semibold">Documents <span className="font-normal text-muted">({attachments.length})</span></h2>
            <UploadButton kind="document" label="Attach file" onUploaded={(url, f) => setAttachments((a) => [...a, { url, name: f.name }])} />
          </div>
          {attachments.length > 0 && (
            <ul className="mt-3 divide-y divide-rule">
              {attachments.map((f, i) => (
                <li key={f.url} className="flex items-center gap-3 py-2">
                  <input aria-label="Document title" value={f.name} onChange={(ev) => setAttachments((all) => all.map((x, j) => (j === i ? { ...x, name: ev.target.value } : x)))} className="field flex-1 py-1.5" />
                  <button type="button" className="text-sm text-live hover:underline" onClick={() => setAttachments((all) => all.filter((_, j) => j !== i))}>Remove</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* SEO */}
        <div className="border border-rule bg-bg p-5">
          <h2 className="font-semibold">Search &amp; social</h2>
          <div className="mt-3 border border-rule p-4">
            <p className="text-xs text-muted">Google preview</p>
            <p className="mt-1 truncate text-[1.15rem] text-[#1a0dab] dark:text-[#8ab4f8]">{seoTitle || title || "Headline"} | De Accolade</p>
            <p className="truncate text-sm text-emerald-800 dark:text-emerald-300">{siteUrl}/article/{effectiveSlug}</p>
            <p className="line-clamp-2 text-sm text-muted">{seoDesc || excerpt || "Add a summary to control how this story appears in search results."}</p>
          </div>
          <div className="mt-4 grid gap-4">
            <div><label htmlFor="seo_title" className="label">SEO title <span className="font-normal text-muted">(defaults to headline)</span></label><input id="seo_title" name="seo_title" value={seoTitle} onChange={(ev) => setSeoTitle(ev.target.value)} maxLength={70} className="field" /><p className="mt-1 text-right text-xs text-muted">{seoTitle.length}/70</p></div>
            <div><label htmlFor="seo_desc" className="label">Meta description <span className="font-normal text-muted">(defaults to summary)</span></label><textarea id="seo_desc" name="seo_description" value={seoDesc} onChange={(ev) => setSeoDesc(ev.target.value)} maxLength={170} rows={2} className="field" /><p className="mt-1 text-right text-xs text-muted">{seoDesc.length}/170</p></div>
            <div><label htmlFor="keywords" className="label">Keywords</label><input id="keywords" name="keywords" defaultValue={article?.keywords ?? ""} className="field" placeholder="anambra, youth, empowerment" /></div>
          </div>
        </div>
        {actionBar}
      </div>

      {/* ------------------------------------------------ side column */}
      <aside className="grid min-w-0 grid-cols-1 content-start gap-6 xl:sticky xl:top-6 xl:self-start">
        <div className="border border-rule bg-bg p-5">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Publishing</h2>{article && <StatusPill status={article.status} />}</div>
          <label htmlFor="status" className="label mt-4">Status</label>
          <select id="status" name="status" value={status} onChange={(ev) => setStatus(ev.target.value as typeof status)} className="field">
            <option value="draft">Draft</option>
            <option value="pending">{isEditor ? "In review" : "Submit for review"}</option>
            {isEditor && <option value="published">Published</option>}
            {isEditor && <option value="archived">Archived (hidden)</option>}
          </select>
          {isEditor && (
            <>
              <label htmlFor="published_at" className="label mt-4">Schedule for later <span className="font-normal text-muted">(optional)</span></label>
              <div className="flex gap-2">
                <input id="published_at" name="published_at" type="datetime-local" value={publishAt} onChange={(e) => setPublishAt(e.target.value)} className="field" />
                {publishAt && <button type="button" onClick={() => setPublishAt("")} className="shrink-0 text-sm text-live hover:underline">Clear</button>}
              </div>
              <p className="mt-1 text-xs text-muted">
                {publishAt && new Date(publishAt) > new Date()
                  ? <span className="font-semibold text-accent">With Status set to Published, the story stays hidden until this time.</span>
                  : "Leave empty. \"Publish now\" makes the story live immediately."}
              </p>
              <div className="mt-4 grid gap-2 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" name="featured" defaultChecked={article?.featured} className="h-4 w-4 accent-[var(--navy-900)]" /> Front-page lead story</label>
                <label className="flex items-center gap-2"><input type="checkbox" name="breaking" defaultChecked={article?.breaking} className="h-4 w-4 accent-[var(--live)]" /> Breaking news</label>
              </div>
            </>
          )}
          <button className="btn btn-primary mt-5 w-full" disabled={pending}>
            {pending ? "Saving…" : status === "published" ? (article?.status === "published" ? "Update story" : "Publish") : status === "pending" && !isEditor ? "Submit for review" : "Save"}
          </button>
          {article?.status === "published" && <Link href={`/article/${article.slug}`} target="_blank" className="mt-2 block text-center text-sm text-accent hover:underline">View live story</Link>}
        </div>

        <div className="grid gap-4 border border-rule bg-bg p-5">
          <div>
            <label htmlFor="category" className="label">Category</label>
            <select id="category" name="category" defaultValue={article?.category ?? ""} required className="field" aria-invalid={!!e.category || undefined}>
              <option value="" disabled>Choose a category</option>
              {sections.map((s) => <optgroup key={s.slug} label={s.name}>{s.categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}</optgroup>)}
            </select>
            {e.category && <p className="mt-1 text-sm text-live">{e.category}</p>}
          </div>
          <div>
            <label htmlFor="type" className="label">Story type</label>
            <select id="type" name="type" value={type} onChange={(ev) => setType(ev.target.value as typeof type)} className="field">
              {articleTypes.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            {type === "live" && <p className="mt-1 text-xs text-muted">Save the story, then post timeline updates below the editor.</p>}
          </div>
          <div><label htmlFor="tags" className="label">Tags</label><input id="tags" name="tags" defaultValue={article?.tags.join(", ") ?? ""} placeholder="Comma separated" className="field" /></div>
          <div><label htmlFor="byline" className="label">Byline <span className="font-normal text-muted">(optional)</span></label><input id="byline" name="byline" defaultValue={article?.byline ?? ""} placeholder="Defaults to your name" className="field" /></div>
        </div>

        <div className="grid gap-4 border border-rule bg-bg p-5">
          <h2 className="font-semibold">Language</h2>
          <div>
            <label htmlFor="language" className="label">Written in</label>
            <select id="language" name="language" defaultValue={article?.language ?? "en"} className="field">
              {languages.map((l) => <option key={l.code} value={l.code}>{l.native}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="translation_of" className="label">Translation of</label>
            <select id="translation_of" name="translation_of" defaultValue={article?.translation_of ?? ""} className="field">
              <option value="">Not a translation (original story)</option>
              {originals.filter((o) => o.id !== article?.id).map((o) => <option key={o.id} value={o.id}>{o.title.slice(0, 70)}</option>)}
            </select>
            <p className="mt-1 text-xs text-muted">Linked translations replace the English story for readers who choose that language.</p>
          </div>
        </div>

        {isEditor && article && (
          <div className="border border-live/40 bg-bg p-5">
            <h2 className="font-semibold">Delete story</h2>
            <p className="mt-1 text-sm text-muted">Removes the story, its comments and live updates permanently. To hide it instead, set status to Archived.</p>
            <button type="button" className="btn mt-3 border border-live text-live hover:bg-live hover:text-white" disabled={deleting}
              onClick={() => { if (confirm(`Delete “${article.title}”? This cannot be undone.`)) startDelete(async () => { const r = await deleteArticle(article.id); if (r && !r.ok) alert(r.message); }); }}>
              {deleting ? "Deleting…" : "Delete story"}
            </button>
          </div>
        )}
      </aside>
    </form>
  );
}

function VideoField({ initial }: { initial: string }) {
  const [url, setUrl] = useState(initial);
  return (
    <div>
      <label htmlFor="video_url" className="label">Or upload a short video</label>
      <input id="video_url" name="video_url" type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" className="field mb-2" />
      <UploadButton kind="video" label="Upload MP4" onUploaded={(u) => setUrl(u)} />
    </div>
  );
}
