"use client";

import { Suspense } from "react";
import { CatalogGrid } from "@/components/catalog-grid";
import { useI18n } from "@/lib/i18n/provider";

export default function HommePage() {
  const { t } = useI18n();
  return (
    <div className="bg-white">
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("men.kicker")}</p>
        <h1 className="font-heading mt-2 text-4xl">{t("men.title")}</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("men.lead")}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          <a href="/aide/livraison-retours" className="underline underline-offset-2">
            Livraison gratuite au Maroc · Échange de taille gratuit sous 7 jours après réception
          </a>
        </p>
        <div className="mt-10">
          <Suspense fallback={<p className="text-sm text-muted-foreground">Chargement…</p>}>
            <CatalogGrid />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
