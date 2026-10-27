import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// 1) "Tezliklə" rejimi: yalnız COMING_SOON=true yazılanda aktivdir (bütün ictimai səhifələr /coming-soon-a gedir).
//    Defolt: sayt hamıya açıqdır.
//    Sahib saytı görmək üçün: /?preview=<COMING_SOON_KEY> açır (7 günlük cookie qoyulur).
//    /admin həmişə açıqdır, ona görə giriş edib məhsul əlavə etmək olur.
// 2) Admin sessiyasını yeniləyir və giriş etməyənləri /admin/login-ə göndərir.
//    Əsl yoxlama requireAdmin()-dədir; bu yalnız sürətli yönləndirmədir.
const COOKIE = "cs_preview";

function comingSoon() {
  // Sayt açıqdır. "Tezliklə" rejimini yenidən yandırmaq üçün Vercel-də COMING_SOON=true yazın
  return process.env.COMING_SOON === "true";
}

export async function proxy(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  if (!pathname.startsWith("/admin")) {
    if (!comingSoon() || pathname === "/coming-soon") return NextResponse.next();

    const key = process.env.COMING_SOON_KEY;
    if (key && searchParams.get("preview") === key) {
      const clean = request.nextUrl.clone();
      clean.searchParams.delete("preview");
      const res = NextResponse.redirect(clean);
      res.cookies.set(COOKIE, key, { httpOnly: true, sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 7, path: "/" });
      return res;
    }
    if (key && request.cookies.get(COOKIE)?.value === key) return NextResponse.next();
    return NextResponse.rewrite(new URL("/coming-soon", request.url));
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return NextResponse.next();

  let response = NextResponse.next({ request });
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

  // getClaims sessiyanı yeniləyir və JWT-ni yerində yoxlayır (hər klikdə Auth serverinə getmir)
  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims?.sub;
  const isLogin = request.nextUrl.pathname === "/admin/login";

  if (!signedIn && !isLogin) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
  if (signedIn && isLogin) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }
  return response;
}

// Faylları (şəkil, video, _next) keçirir; yalnız səhifə yollarına işləyir
export const config = { matcher: ["/((?!_next/|api/|.*\\..*).*)"] };
