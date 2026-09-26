"use client";
import { useEffect } from "react";
/** Keeps <html lang> in sync with the reader's chosen language (accessibility + SEO hint). */
export function HtmlLang({ lang }: { lang: string }) {
  useEffect(() => { document.documentElement.lang = lang; }, [lang]);
  return null;
}
