"use server";
import { cookies } from "next/headers";
import { isLang } from "@/lib/taxonomy";
import { LANG_COOKIE } from "@/lib/lang";

export async function setLanguage(lang: string) {
  if (!isLang(lang)) return;
  (await cookies()).set(LANG_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}
