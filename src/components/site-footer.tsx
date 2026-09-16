"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n/provider";
import { mad } from "@/data/catalog";

export function SiteFooter() {
  const { t } = useI18n();
  return (
    <footer className="mt-16 border-t border-border bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-heading text-lg text-foreground">Veltrano</p>
          <p className="mt-2 text-muted-foreground">
            {t("footer.blurb", { unit: mad(250), duo: mad(400) })}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Link href="/" className="hover:text-foreground">
            {t("nav.home")}
          </Link>
          <Link href="/boutique" className="hover:text-foreground">
            {t("nav.shop")}
          </Link>
          <Link href="/homme" className="hover:text-foreground">
            {t("nav.men")}
          </Link>
          <Link href="/femme" className="hover:text-foreground">
            {t("nav.women")}
          </Link>
        </div>
        <div className="text-muted-foreground">
          <p>{t("footer.delivery")}</p>
          <p>{t("footer.exchanges")}</p>
          <p>{t("footer.news")}</p>
        </div>
      </div>
    </footer>
  );
}
