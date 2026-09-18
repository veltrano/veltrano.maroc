"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { HeroVideo } from "@/components/hero-video";
import { CutComparison } from "@/components/cut-comparison";
import { buttonVariants } from "@/components/ui/button";
import { CLIENT_VIDEOS, featuredProducts, mad } from "@/data/catalog";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";
import type { MessageKey } from "@/lib/i18n/messages";

const VIDEO_KEYS = [
  "home.video.baggy",
  "home.video.urban",
  "home.video.summer",
  "home.video.house",
] as const satisfies readonly MessageKey[];

export default function HomePage() {
  const { t } = useI18n();
  const featured = featuredProducts();

  return (
    <div className="bg-white">
      <div className="border-b border-border bg-neutral-50">
        <p className="mx-auto max-w-6xl px-4 py-2 text-center text-sm sm:px-6">
          {t('home.freeShipStrip')}
        </p>
      </div>

      <HeroVideo>
        <p className="text-xs uppercase tracking-[0.28em] text-white/85">Veltrano</p>
        <h1 className="font-heading mt-4 max-w-2xl text-4xl leading-tight text-white sm:text-6xl">
          {t("home.heroTitle")}
        </h1>
        <p className="mt-5 max-w-lg text-base text-white/90 sm:text-lg">
          {t("home.heroLead", { unit: mad(250), duo: mad(400) })}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/boutique"
            className={cn(
              buttonVariants({ size: "lg" }),
              "inline-flex h-12 min-h-12 bg-white text-foreground hover:bg-white/90"
            )}
          >
            {t('home.heroCta')}
          </Link>
          <Link
            href="/#coupes"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "inline-flex h-12 min-h-12 border-white bg-transparent text-white hover:bg-white/10"
            )}
          >
            {t('home.findCut')}
          </Link>
        </div>
      </HeroVideo>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 text-sm sm:grid-cols-3">
          <div>
            <h2 className="font-medium">{t("home.serviceShipTitle")}</h2>
            <p className="mt-1 text-muted-foreground">{t("home.serviceShipBody")}</p>
          </div>
          <div>
            <h2 className="font-medium">{t("home.servicePackTitle")}</h2>
            <p className="mt-1 text-muted-foreground">
              {t("home.servicePackBody", { unit: mad(250), duo: mad(400) })}
            </p>
          </div>
          <div>
            <h2 className="font-medium">{t("home.serviceExTitle")}</h2>
            <p className="mt-1 text-muted-foreground">
              <Link href="/aide/livraison-retours" className="underline underline-offset-2">
                {t("home.serviceExBody")}
              </Link>
            </p>
          </div>
        </div>
      </section>

      <CutComparison />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              {t("home.collectionKicker")}
            </p>
            <h2 className="font-heading mt-2 text-3xl">{t("home.newTitle")}</h2>
          </div>
          <Link href="/boutique" className="hidden text-sm underline sm:inline">
            {t('home.seeShop')}
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/boutique" className={cn(buttonVariants({ size: "lg" }), "inline-flex h-12")}>
            {t("home.heroCta")}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl">{t("home.denimDaily")}</h2>
        <p className="mt-2 text-muted-foreground">{t("home.denimDailyLead")}</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {CLIENT_VIDEOS.map((v, i) => (
            <figure key={v.src} className="overflow-hidden rounded-xl bg-black">
              <video
                className="aspect-[9/16] h-auto w-full object-cover"
                src={v.src}
                muted
                playsInline
                loop
                controls
                preload="metadata"
              />
              <figcaption className="px-3 py-2 text-xs text-muted-foreground">
                {t(VIDEO_KEYS[i] ?? "home.video.house")}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-white">
        <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <h2 className="font-heading text-3xl">{t("home.brandTitle")}</h2>
          <p className="mt-4 text-muted-foreground">{t("home.brandBody")}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/homme" className={cn(buttonVariants({ size: "lg" }), "inline-flex h-12")}>
              {t('home.menCta')}
            </Link>
            <Link
              href="/femme"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "inline-flex h-12")}
            >
              {t('home.womenSoon')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
