import { NextResponse, type NextRequest } from "next/server";
import { corsHeaders } from "@/lib/site";
import {
  COOKIE_LOCALE,
  LOCALE_HEADER,
  localeFromAcceptLanguage,
  parseLocale,
} from "@/lib/i18n/locale";

export function middleware(req: NextRequest) {
  const origin = req.headers.get("origin");
  const cors = corsHeaders(origin);

  if (req.method === "OPTIONS" && req.nextUrl.pathname.startsWith("/api")) {
    return new NextResponse(null, { status: 204, headers: cors });
  }

  const q = parseLocale(req.nextUrl.searchParams.get("lang"));
  const cookieLocale = parseLocale(req.cookies.get(COOKIE_LOCALE)?.value);
  const locale =
    q ?? cookieLocale ?? localeFromAcceptLanguage(req.headers.get("accept-language"));

  const res = NextResponse.next();
  res.headers.set(LOCALE_HEADER, locale);
  if (req.nextUrl.pathname.startsWith("/api")) {
    cors.forEach((value, key) => res.headers.set(key, value));
  }
  return res;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|ico|woff2?)$).*)",
  ],
};
