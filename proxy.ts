import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const PUBLIC_ADMIN = ["/admin/login", "/admin/reset", "/admin/login/forgot"];

/**
 * Guards the newsroom: refreshes the Supabase session cookie, sends signed-out visitors to
 * /admin/login, and requires a second factor (TOTP) for any account that has enrolled one.
 */
export async function proxy(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const path = request.nextUrl.pathname;
  let response = NextResponse.next({ request });
  if (!url || !key) return response; // setup mode: admin pages explain how to connect the database

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (list) => {
        list.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        list.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const isPublic = PUBLIC_ADMIN.some((p) => path === p);
  const redirect = (to: string) => {
    const r = NextResponse.redirect(new URL(to, request.url));
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  };

  if (!user) {
    if (isPublic || path === "/admin/login/mfa") return path === "/admin/login/mfa" ? redirect("/admin/login") : response;
    return redirect(`/admin/login?next=${encodeURIComponent(path)}`);
  }

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  const needsChallenge = aal?.nextLevel === "aal2" && aal.currentLevel !== "aal2";
  if (needsChallenge && path !== "/admin/login/mfa") return redirect("/admin/login/mfa");
  if (!needsChallenge && (path === "/admin/login" || path === "/admin/login/mfa")) return redirect("/admin/dashboard");

  // Optional policy: every staff account must enrol 2FA before using the newsroom.
  if (process.env.REQUIRE_ADMIN_2FA === "true" && aal?.nextLevel === "aal1" && !path.startsWith("/admin/account") && !isPublic) {
    return redirect("/admin/account?setup2fa=1");
  }
  return response;
}

export const config = { matcher: ["/admin/:path*"] };
