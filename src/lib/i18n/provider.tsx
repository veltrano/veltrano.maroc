"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  dirFor,
  localeFromNavigator,
  parseLocale,
  persistLocaleCookies,
  readStoredChoice,
  type Locale,
} from "@/lib/i18n/locale";
import { t, type MessageKey } from "@/lib/i18n/translate";

type LocaleContextValue = {
  locale: Locale;
  dir: "rtl" | "ltr";
  t: (key: MessageKey, vars?: Record<string, string | number>) => string;
  setLocale: (next: Locale, opts?: { explicit?: boolean }) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function applyDom(locale: Locale) {
  document.documentElement.lang = locale;
  document.documentElement.dir = dirFor(locale);
}

export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);

  const setLocale = useCallback(
    (next: Locale, opts?: { explicit?: boolean }) => {
      const explicit = opts?.explicit !== false;
      setLocaleState(next);
      if (typeof document !== "undefined") applyDom(next);
      persistLocaleCookies(next, explicit);
      router.refresh();
    },
    [router]
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = parseLocale(params.get("lang"));
    const stored = readStoredChoice();
    if (fromQuery) {
      if (fromQuery !== locale) {
        setLocaleState(fromQuery);
        applyDom(fromQuery);
        persistLocaleCookies(fromQuery, true);
        router.refresh();
      } else {
        applyDom(fromQuery);
      }
      return;
    }
    if (stored) {
      if (stored.locale !== locale) {
        setLocaleState(stored.locale);
        applyDom(stored.locale);
        persistLocaleCookies(stored.locale, true);
        router.refresh();
      } else {
        applyDom(stored.locale);
      }
      return;
    }
    const detected = localeFromNavigator();
    applyDom(detected);
    if (detected !== locale) {
      setLocaleState(detected);
      persistLocaleCookies(detected, false);
      router.refresh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      dir: dirFor(locale),
      t: (key, vars) => t(locale, key, vars),
      setLocale: (next, opts) => setLocale(next, { explicit: opts?.explicit ?? true }),
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    throw new Error("useI18n must be used within LocaleProvider");
  }
  return ctx;
}
