"use client";

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
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
      <section className="relative min-h-[78vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lifestyle/hassan-ii-jeans.png"
          alt={t("home.heroAlt")}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 sm:px-6 sm:pb-24">
          <p className="text-xs uppercase tracking-[0.28em] text-white/80">Veltrano</p>
          <h1 className="font-heading mt-4 max-w-2xl text-4xl leading-tight text-white sm:text-6xl">
            {t("home.heroTitle")}
          </h1>
          <p className="mt-5 max-w-lg text-base text-white/90 sm:text-lg">
            {t("home.heroLead", { unit: mad(250), duo: mad(400) })}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/boutique"
              className={cn(buttonVariants({ size: "lg" }), "inline-flex bg-white text-foreground hover:bg-white/90")}
            >
              {t("nav.shop")}
            </Link>
            <Link
              href="/homme"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "inline-flex border-white bg-transparent text-white hover:bg-white/10"
              )}
            >
              {t("nav.men")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("home.introKicker")}</p>
        <h2 className="font-heading mt-3 text-3xl sm:text-4xl">{t("home.introTitle")}</h2>
        <p className="mt-4 text-muted-foreground">{t("home.introBody")}</p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("home.newKicker")}</p>
            <h2 className="font-heading mt-2 text-3xl">{t("home.newTitle")}</h2>
          </div>
          <Link href="/boutique" className="hidden text-sm underline sm:inline">
            {t("home.seeShop")}
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/boutique" className={cn(buttonVariants({ size: "lg" }), "inline-flex")}>
            {t("home.seeAll")}
          </Link>
        </div>
      </section>

      <section className="mt-8 grid min-h-[56vh] md:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lifestyle/medina-jeans.png"
          alt={t("home.medinaAlt")}
          className="h-full min-h-[320px] w-full object-cover"
        />
        <div className="flex flex-col justify-center bg-white px-6 py-16 sm:px-12">
          <h2 className="font-heading text-3xl sm:text-4xl">{t("home.cutTitle")}</h2>
          <p className="mt-4 max-w-md text-muted-foreground">{t("home.cutBody")}</p>
          <Link href="/homme" className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex w-fit")}>
            {t("home.menCta")}
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl">{t("home.wearTitle")}</h2>
        <p className="mt-2 text-muted-foreground">{t("home.wearLead")}</p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {CLIENT_VIDEOS.map((v, i) => (
            <figure key={v.src} className="overflow-hidden rounded-xl bg-black">
              <video
                className="aspect-[9/16] h-auto w-full object-cover"
                src={v.src}
                muted
                playsInline
                loop
                autoPlay
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
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:grid-cols-3 sm:px-6">
          <div>
            <h3 className="font-medium">{t("home.packTitle")}</h3>
            <p className="mt-1 text-muted-foreground">{t("home.packBody", { unit: mad(250), duo: mad(400) })}</p>
          </div>
          <div>
            <h3 className="font-medium">{t("home.shipTitle")}</h3>
            <p className="mt-1 text-muted-foreground">{t("home.shipBody")}</p>
          </div>
          <div>
            <h3 className="font-medium">{t("home.denimTitle")}</h3>
            <p className="mt-1 text-muted-foreground">{t("home.denimBody")}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
