import "server-only";
import { cookies } from "next/headers";
import { isLang, type LangCode } from "./taxonomy";

export const LANG_COOKIE = "da_lang";

export async function getLang(): Promise<LangCode> {
  const v = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(v) ? v : "en";
}
