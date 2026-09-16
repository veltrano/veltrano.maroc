"use client";

import { CatalogGrid } from "@/components/catalog-grid";
import { useI18n } from "@/lib/i18n/provider";

export default function BoutiquePage() {
  const { t } = useI18n();
  return (
    <div className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("shop.kicker")}</p>
        <h1 className="font-heading mt-2 text-4xl">{t("shop.title")}</h1>
        <p className="mt-3 max-w-xl text-muted-foreground">{t("shop.lead")}</p>
        <div className="mt-10">
          <CatalogGrid />
        </div>
      </section>
    </div>
  );
}
