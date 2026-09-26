"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect, unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { ActionError, logActivity, requireAction } from "@/lib/auth";
import { CONTENT_TAG, readingMinutes } from "@/lib/data";
import { renderMarkdown } from "@/lib/markdown";
import { randomBytes } from "node:crypto";
import { serverClient } from "@/lib/supabase/server";
import { allCategories } from "@/lib/taxonomy";
import { slugify } from "@/lib/format";
import { site } from "@/lib/site";

export type ActionResult = { ok: boolean; message?: string; errors?: Record<string, string>; id?: string };

function refreshPublic(paths: string[] = []) {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
  paths.forEach((p) => revalidatePath(p));
}

async function guard<T>(fn: () => Promise<T>): Promise<T | ActionResult> {
  try {
    return await fn();
  } catch (e) {
    unstable_rethrow(e); // let Next.js redirects/notFound propagate
    if (e instanceof ActionError) return { ok: false, message: e.message };
    console.error(e);
    return { ok: false, message: "Something went wrong. Your changes were not saved." };
  }
}

// ---------------------------------------------------------------------------
// Articles
// ---------------------------------------------------------------------------
const httpsUrl = z.string().trim().url().refine((u) => u.startsWith("https://"), "Use an https:// link").optional().or(z.literal(""));
const jsonList = <T extends z.ZodTypeAny>(item: T) =>
  z.string().default("[]").transform((s, ctx) => {
    try { return z.array(item).max(60).parse(JSON.parse(s)); }
    catch { ctx.addIssue({ code: "custom", message: "Invalid list" }); return z.NEVER; }
  });

const articleSchema = z.object({
  id: z.string().uuid().optional().or(z.literal("")),
  title: z.string().trim().min(3, "Add a headline").max(200),
  slug: z.string().trim().max(100).optional().or(z.literal("")),
  subtitle: z.string().trim().max(300).optional(),
  excerpt: z.string().trim().max(400, "Keep the summary under 400 characters").optional(),
  body: z.string().max(100_000),
  category: z.string().refine((c) => allCategories.some((x) => x.slug === c), "Choose a category"),
  type: z.enum(["article", "video", "gallery", "live"]),
  language: z.enum(["en", "ig", "yo", "ha"]),
  translation_of: z.string().uuid().optional().or(z.literal("")),
  tags: z.string().max(500).optional(),
  status: z.enum(["draft", "pending", "published", "archived"]),
  featured: z.string().optional(),
  breaking: z.string().optional(),
  featured_image: httpsUrl,
  featured_image_alt: z.string().trim().max(300).optional(),
  image_credit: z.string().trim().max(150).optional(),
  youtube_url: httpsUrl,
  video_url: httpsUrl,
  gallery: jsonList(z.object({ url: z.string().url(), caption: z.string().max(300).optional(), credit: z.string().max(150).optional() })),
  attachments: jsonList(z.object({ url: z.string().url(), name: z.string().min(1).max(200) })),
  byline: z.string().trim().max(120).optional(),
  seo_title: z.string().trim().max(70, "SEO titles over 70 characters get cut off").optional(),
  seo_description: z.string().trim().max(170, "Keep the meta description under 170 characters").optional(),
  keywords: z.string().trim().max(300).optional(),
  published_at: z.string().optional(),
});

export async function saveArticle(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  const res = await guard(async () => {
    const { staff, supabase } = await requireAction("reporter");
    const parsed = articleSchema.safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      parsed.error.issues.forEach((i) => (errors[String(i.path[0])] ??= i.message));
      return { ok: false, message: "Check the highlighted fields.", errors } satisfies ActionResult;
    }
    const v = parsed.data;
    const isEditor = staff.role !== "reporter";
    if (!isEditor && !["draft", "pending"].includes(v.status))
      return { ok: false, message: "Reporters can save drafts or submit for review. An editor will publish." };

    const slug = slugify(v.slug || v.title);
    if (!slug) return { ok: false, errors: { slug: "Add a URL slug using letters and numbers" }, message: "Check the highlighted fields." };

    // Explicit allow-list: nothing from the form reaches the database unless named here.
    const row = {
      title: v.title,
      slug,
      subtitle: v.subtitle || null,
      excerpt: v.excerpt || null,
      body: v.body,
      category: v.category,
      type: v.type,
      language: v.language,
      translation_of: v.translation_of && v.translation_of !== v.id ? v.translation_of : null,
      tags: (v.tags ?? "").split(",").map((t) => slugify(t)).filter(Boolean).slice(0, 12),
      status: v.status,
      featured: isEditor ? v.featured === "on" : undefined,
      breaking: isEditor ? v.breaking === "on" : undefined,
      featured_image: v.featured_image || null,
      featured_image_alt: v.featured_image_alt || null,
      image_credit: v.image_credit || null,
      youtube_url: v.youtube_url || null,
      video_url: v.video_url || null,
      gallery: v.gallery,
      attachments: v.attachments,
      byline: v.byline || null,
      seo_title: v.seo_title || null,
      seo_description: v.seo_description || null,
      keywords: v.keywords || null,
      reading_minutes: readingMinutes(v.body),
      published_at: isEditor && v.published_at ? new Date(v.published_at).toISOString() : undefined,
    };
    const clean = Object.fromEntries(Object.entries(row).filter(([, x]) => x !== undefined));

    let id = v.id || undefined;
    if (id) {
      const { error } = await supabase.from("articles").update(clean).eq("id", id);
      if (error) return dbError(error);
    } else {
      const { data, error } = await supabase.from("articles").insert({ ...clean, author_id: staff.id }).select("id").single();
      if (error) return dbError(error);
      id = data.id as string;
    }
    // Featured is exclusive: one lead story on the front page at a time.
    if (isEditor && v.featured === "on") await supabase.from("articles").update({ featured: false }).neq("id", id).eq("featured", true);

    await logActivity(v.id ? "article.update" : "article.create", "article", id, { title: v.title, status: v.status });
    refreshPublic([`/article/${slug}`]);
    return { ok: true, id, message: v.status === "published" ? "Published." : v.status === "pending" ? "Submitted for review." : "Saved." };
  });
  const out = res as ActionResult;
  if (out.ok && !form.get("id") && out.id) redirect(`/admin/articles/${out.id}?saved=1`);
  return out;
}

function dbError(error: { code?: string; message: string }): ActionResult {
  if (error.code === "23505") return { ok: false, message: "Another story already uses this URL slug.", errors: { slug: "Choose a different slug" } };
  if (error.code === "42501" || /row-level security/i.test(error.message)) return { ok: false, message: "You don't have permission to make that change." };
  if (/Only editors/.test(error.message)) return { ok: false, message: "Only editors can publish or archive stories." };
  console.error(error);
  return { ok: false, message: "The database rejected this change. Try again." };
}

export async function deleteArticle(id: string): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAction("editor");
    const { data } = await supabase.from("articles").select("title,slug").eq("id", id).maybeSingle();
    const { error } = await supabase.from("articles").delete().eq("id", id);
    if (error) return dbError(error);
    await logActivity("article.delete", "article", id, { title: data?.title });
    refreshPublic(data?.slug ? [`/article/${data.slug}`] : []);
    redirect("/admin/articles?deleted=1");
  })) as ActionResult;
}

export async function previewMarkdown(md: string) {
  await requireAction("reporter");
  return renderMarkdown(md.slice(0, 100_000));
}

// ---------------------------------------------------------------------------
// Live coverage
// ---------------------------------------------------------------------------
export async function addLiveUpdate(articleId: string, body: string, imageUrl?: string): Promise<ActionResult> {
  return (await guard(async () => {
    const { staff, supabase } = await requireAction("editor");
    const text = body.trim();
    if (text.length < 2 || text.length > 5000) return { ok: false, message: "Updates must be between 2 and 5,000 characters." };
    const { error } = await supabase.from("live_updates").insert({ article_id: articleId, body: text, image_url: imageUrl?.startsWith("https://") ? imageUrl : null, created_by: staff.id });
    if (error) return dbError(error);
    await supabase.from("articles").update({ updated_at: new Date().toISOString() }).eq("id", articleId);
    refreshPublic();
    return { ok: true, message: "Update posted." };
  })) as ActionResult;
}

export async function deleteLiveUpdate(id: string): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAction("editor");
    const { error } = await supabase.from("live_updates").delete().eq("id", id);
    if (error) return dbError(error);
    refreshPublic();
    return { ok: true };
  })) as ActionResult;
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------
export async function moderateComment(id: string, status: "approved" | "rejected" | "spam" | "delete"): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAction("editor");
    const { error } = status === "delete"
      ? await supabase.from("comments").delete().eq("id", id)
      : await supabase.from("comments").update({ status }).eq("id", id);
    if (error) return dbError(error);
    await logActivity(`comment.${status}`, "comment", id);
    refreshPublic();
    revalidatePath("/admin/comments");
    return { ok: true };
  })) as ActionResult;
}

// ---------------------------------------------------------------------------
// Breaking news ticker
// ---------------------------------------------------------------------------
export async function addBreaking(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return (await guard(async () => {
    const { staff, supabase } = await requireAction("editor");
    const parsed = z.object({
      headline: z.string().trim().min(5, "Write a headline").max(200),
      link: z.string().trim().max(300).refine((l) => !l || l.startsWith("/") || l.startsWith("https://"), "Use a site path like /article/… or an https:// link").optional(),
    }).safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
    const { error } = await supabase.from("breaking_news").insert({ headline: parsed.data.headline, link: parsed.data.link || null, created_by: staff.id });
    if (error) return dbError(error);
    await logActivity("breaking.create", "breaking_news", undefined, { headline: parsed.data.headline });
    refreshPublic();
    revalidatePath("/admin/breaking");
    return { ok: true, message: "Added to the ticker." };
  })) as ActionResult;
}

export async function setBreakingActive(id: string, active: boolean | "delete"): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAction("editor");
    const { error } = active === "delete"
      ? await supabase.from("breaking_news").delete().eq("id", id)
      : await supabase.from("breaking_news").update({ active }).eq("id", id);
    if (error) return dbError(error);
    refreshPublic();
    revalidatePath("/admin/breaking");
    return { ok: true };
  })) as ActionResult;
}

// ---------------------------------------------------------------------------
// Inbox
// ---------------------------------------------------------------------------
export async function setMessageHandled(id: string, handled: boolean): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAction("editor");
    const { error } = await supabase.from("contact_messages").update({ handled }).eq("id", id);
    if (error) return dbError(error);
    revalidatePath("/admin/inbox");
    return { ok: true };
  })) as ActionResult;
}

export async function setBookingStatus(id: string, status: string): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAction("editor");
    if (!["new", "contacted", "confirmed", "closed"].includes(status)) return { ok: false, message: "Unknown status." };
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) return dbError(error);
    revalidatePath("/admin/inbox");
    return { ok: true };
  })) as ActionResult;
}

export async function deleteSubscriber(id: string): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAction("editor");
    const { error } = await supabase.from("subscribers").delete().eq("id", id);
    if (error) return dbError(error);
    revalidatePath("/admin/inbox");
    return { ok: true };
  })) as ActionResult;
}

// ---------------------------------------------------------------------------
// Account
// ---------------------------------------------------------------------------
export async function updateProfile(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return (await guard(async () => {
    const { staff, supabase } = await requireAction("reporter");
    const parsed = z.object({
      full_name: z.string().trim().min(2, "Enter your name").max(100),
      bio: z.string().trim().max(600).optional(),
      avatar_url: httpsUrl,
    }).safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
    const { error } = await supabase.from("profiles").update({ full_name: parsed.data.full_name, bio: parsed.data.bio || null, avatar_url: parsed.data.avatar_url || null }).eq("id", staff.id);
    if (error) return dbError(error);
    // Author page slug is created by the database (profiles.slug is not user-writable).
    if (!staff.slug) await supabase.rpc("ensure_my_slug");
    refreshPublic();
    return { ok: true, message: "Profile saved." };
  })) as ActionResult;
}

export async function signOut() {
  const supabase = await serverClient();
  await supabase.auth.signOut();
  redirect("/admin/login?error=signedout");
}

// ---------------------------------------------------------------------------
// Team (super admin only). Accounts are created inside the database by
// security-definer functions that re-check the caller is a super admin, so no
// email service or service-role key is needed.
// ---------------------------------------------------------------------------
const roleSchema = z.enum(["super_admin", "editor", "reporter"]);

/** Readable temporary password, e.g. "Accolade-7kq2-Wm9x-p4Tz". */
function temporaryPassword() {
  const alphabet = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(12);
  const chars = Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
  return `Accolade-${chars.slice(0, 4)}-${chars.slice(4, 8)}-${chars.slice(8, 12)}`;
}

function rpcError(error: { code?: string; message: string }): ActionResult {
  if (["22023", "23505", "42501", "P0002"].includes(error.code ?? "")) return { ok: false, message: error.message };
  return dbError(error);
}

export async function createStaff(_prev: ActionResult, form: FormData): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAction("super_admin");
    const parsed = z.object({
      email: z.string().trim().toLowerCase().email("Enter a valid email"),
      full_name: z.string().trim().min(2, "Enter their name").max(100),
      role: roleSchema,
    }).safeParse(Object.fromEntries(form.entries()));
    if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
    const { email, full_name, role } = parsed.data;
    const password = temporaryPassword();
    const { data, error } = await supabase.rpc("create_staff_account", { p_email: email, p_full_name: full_name, p_role: role, p_password: password });
    if (error) return rpcError(error);
    await logActivity("team.invite", "profile", String(data), { email, role });
    revalidatePath("/admin/team");
    return {
      ok: true,
      message: `Account created for ${email}. Temporary password: ${password} — share it privately; they can change it under My account after signing in at ${site.url}/admin/login.`,
    };
  })) as ActionResult;
}

export async function setStaffRole(userId: string, role: string | null): Promise<ActionResult> {
  return (await guard(async () => {
    const { staff, supabase } = await requireAction("super_admin");
    if (userId === staff.id) return { ok: false, message: "You can't change your own role. Ask another super admin." };
    const r = role === null ? null : roleSchema.parse(role);
    const { error } = await supabase.rpc("set_staff_role", { p_user: userId, p_role: r });
    if (error) return rpcError(error);
    await logActivity(r ? "team.role" : "team.revoke", "profile", userId, { role: r });
    revalidatePath("/admin/team");
    return { ok: true };
  })) as ActionResult;
}

export async function resetStaffPassword(userId: string): Promise<ActionResult> {
  return (await guard(async () => {
    const { supabase } = await requireAction("super_admin");
    const password = temporaryPassword();
    const { error } = await supabase.rpc("reset_staff_password", { p_user: userId, p_password: password });
    if (error) return rpcError(error);
    await logActivity("team.password_reset", "profile", userId);
    return { ok: true, message: `New temporary password: ${password}` };
  })) as ActionResult;
}
