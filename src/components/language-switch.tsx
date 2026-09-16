"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";
import type { Locale } from "@/lib/i18n/locale";

export function LanguageSwitch() {
  const { locale, setLocale, t } = useI18n();

  function pick(next: Locale) {
    if (next === locale) return;
    setLocale(next, { explicit: true });
  }

  return (
    <div
      role="group"
      aria-label={t("lang.switch")}
      className="flex shrink-0 items-center rounded-full border border-foreground/25 bg-white p-0.5 text-xs font-semibold tracking-wide"
    >
      <button
        type="button"
        onClick={() => pick("fr")}
        aria-pressed={locale === "fr"}
        aria-label={t("lang.toFr")}
        className={cn(
          "rounded-full px-2.5 py-1.5 transition",
          locale === "fr"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        FR
      </button>
      <button
        type="button"
        onClick={() => pick("ar")}
        aria-pressed={locale === "ar"}
        aria-label={t("lang.toAr")}
        className={cn(
          "rounded-full px-2.5 py-1.5 transition",
          locale === "ar"
            ? "bg-foreground text-background"
            : "text-muted-foreground hover:text-foreground"
        )}
      >
        عربي
      </button>
    </div>
  );
}
