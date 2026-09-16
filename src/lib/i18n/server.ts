import { cookies, headers } from "next/headers";
import {
  COOKIE_LOCALE,
  DEFAULT_LOCALE,
  LOCALE_HEADER,
  localeFromAcceptLanguage,
  parseLocale,
  type Locale,
} from "./locale";
import { t, type MessageKey } from "./translate";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  const hdrs = await headers();
  const cookieLocale = parseLocale(cookieStore.get(COOKIE_LOCALE)?.value);
  if (cookieLocale) return cookieLocale;
  const fromMw = parseLocale(hdrs.get(LOCALE_HEADER));
  if (fromMw) return fromMw;
  return localeFromAcceptLanguage(hdrs.get("accept-language")) ?? DEFAULT_LOCALE;
}

export async function getT() {
  const locale = await getLocale();
  return {
    locale,
    t: (key: MessageKey, vars?: Record<string, string | number>) => t(locale, key, vars),
  };
}

export { t };
