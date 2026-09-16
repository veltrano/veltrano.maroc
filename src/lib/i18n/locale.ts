export const LOCALES = ["fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";
export const COOKIE_LOCALE = "veltrano-locale";
export const COOKIE_CHOICE = "veltrano-locale-choice";
export const STORAGE_LOCALE = "veltrano-locale";
export const STORAGE_CHOICE = "veltrano-locale-choice";
export const LOCALE_HEADER = "x-veltrano-locale";

export function parseLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  if (v === "ar" || v.startsWith("ar-")) return "ar";
  if (v === "fr" || v.startsWith("fr-")) return "fr";
  return null;
}

export function isArabicTag(tag: string) {
  const t = tag.trim().toLowerCase();
  return t === "ar" || t.startsWith("ar-") || t.startsWith("ar_");
}

/** First matching language: Arabic locales (`ar*`) → ar, otherwise French. */
export function localeFromLanguageList(list: readonly string[]): Locale {
  for (const raw of list) {
    const tag = raw.split(";")[0]?.trim() ?? "";
    if (isArabicTag(tag)) return "ar";
  }
  return DEFAULT_LOCALE;
}

export function localeFromAcceptLanguage(header: string | null | undefined): Locale {
  if (!header) return DEFAULT_LOCALE;
  const parts = header.split(",").map((p) => p.trim()).filter(Boolean);
  return localeFromLanguageList(parts);
}

export function localeFromNavigator(): Locale {
  if (typeof navigator === "undefined") return DEFAULT_LOCALE;
  const list = [
    navigator.language,
    ...(navigator.languages ?? []),
  ].filter(Boolean);
  return localeFromLanguageList(list);
}

export function dirFor(locale: Locale): "rtl" | "ltr" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function persistLocaleCookies(locale: Locale, explicit: boolean) {
  localStorage.setItem(STORAGE_LOCALE, locale);
  if (explicit) {
    const maxAge = 60 * 60 * 24 * 365;
    const base = `Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    document.cookie = `${COOKIE_LOCALE}=${locale}; ${base}`;
    document.cookie = `${COOKIE_CHOICE}=1; ${base}`;
    localStorage.setItem(STORAGE_CHOICE, "1");
    return;
  }
  document.cookie = `${COOKIE_LOCALE}=${locale}; Path=/; SameSite=Lax`;
}

export function readStoredChoice(): { locale: Locale; explicit: boolean } | null {
  if (typeof window === "undefined") return null;
  const explicit = localStorage.getItem(STORAGE_CHOICE) === "1";
  const locale = parseLocale(localStorage.getItem(STORAGE_LOCALE));
  if (explicit && locale) return { locale, explicit: true };
  return null;
}
