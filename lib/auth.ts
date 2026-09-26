import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { serverClient } from "./supabase/server";
import { hasSupabase } from "./supabase/env";
import type { Role } from "./types";

export type Staff = { id: string; email: string; full_name: string; role: Role; slug: string | null; bio: string | null; avatar_url: string | null };

const rank: Record<Role, number> = { reporter: 1, editor: 2, super_admin: 3 };
export const atLeast = (role: Role, min: Role) => rank[role] >= rank[min];
export const roleLabel: Record<Role, string> = { super_admin: "Super admin", editor: "Editor", reporter: "Reporter" };

/** The signed-in newsroom member, or null. Cached per request. */
export const getStaff = cache(async (): Promise<Staff | null> => {
  if (!hasSupabase) return null;
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from("profiles").select("full_name,role,slug,bio,avatar_url").eq("id", user.id).maybeSingle();
  if (!p?.role) return null;
  return { id: user.id, email: user.email ?? "", ...p } as Staff;
});

/** For pages: redirect away unless the user has at least `min` role. */
export async function requirePage(min: Role = "reporter") {
  const staff = await getStaff();
  if (!staff) redirect("/admin/login?error=access");
  if (!atLeast(staff.role, min)) redirect("/admin/dashboard?error=permission");
  return staff;
}

export class ActionError extends Error {}

/** For server actions: throw unless the user has at least `min` role. RLS enforces the same rules in the database. */
export async function requireAction(min: Role = "reporter") {
  const staff = await getStaff();
  if (!staff) throw new ActionError("Your session has expired. Sign in again.");
  if (!atLeast(staff.role, min)) throw new ActionError("You don't have permission to do that.");
  const supabase = await serverClient();
  return { staff, supabase };
}

export async function logActivity(action: string, entity?: string, entityId?: string, meta?: Record<string, unknown>) {
  try {
    const supabase = await serverClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from("activity_log").insert({ actor_id: user.id, action, entity, entity_id: entityId, meta });
  } catch {
    /* logging must never break the action */
  }
}
