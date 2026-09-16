import { DEFAULT_LOCALE, localeFromAcceptLanguage, parseLocale, type Locale } from "./locale";
import { messages, type MessageKey } from "./messages";

export type { MessageKey };

export function t(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
) {
  const table = messages[locale] ?? messages[DEFAULT_LOCALE];
  let s: string = table[key] ?? messages.fr[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replaceAll(`{${k}}`, String(v));
    }
  }
  return s;
}

export function couponMessage(
  locale: Locale,
  code: "empty" | "invalid" | "used"
): string {
  if (code === "empty") return t(locale, "coupon.empty");
  if (code === "used") return t(locale, "coupon.used");
  return t(locale, "coupon.invalid");
}

export function localeFromRequest(req: Request): Locale {
  const url = new URL(req.url);
  const q = parseLocale(url.searchParams.get("lang"));
  if (q) return q;
  const header = parseLocale(req.headers.get("x-veltrano-locale"));
  if (header) return header;
  const cookie = req.headers.get("cookie") ?? "";
  const match = cookie.match(/(?:^|;\s*)veltrano-locale=(fr|ar)(?:;|$)/);
  if (match) return match[1] as Locale;
  return localeFromAcceptLanguage(req.headers.get("accept-language"));
}
