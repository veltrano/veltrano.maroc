"use client";

import Link from "next/link";
import { PRODUCTS, mad, productsByFit } from "@/data/catalog";
import { productImages } from "@/lib/product-images";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

export function CutComparison() {
  const { t } = useI18n();
  const baggy = productsByFit("baggy")[0];
  const straight = productsByFit("straight")[0];
  const baggyImg = baggy ? productImages(baggy)[1] ?? productImages(baggy)[0] : null;
  const straightImg = straight
    ? productImages(straight)[1] ?? productImages(straight)[0]
    : null;

  return (
    <section id="coupes" className="scroll-mt-24 border-y border-border bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl sm:text-4xl">{t("cut.sectionTitle")}</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">{t("cut.sectionLead")}</p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <article className="space-y-4">
            {baggyImg ? (
              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={baggyImg}
                  alt={t("cut.baggyTitle")}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <h3 className="font-heading text-2xl">{t("cut.baggyTitle")}</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium">{t("cut.silhouette")}</dt>
                <dd className="text-muted-foreground">{t("cut.baggySilhouette")}</dd>
              </div>
              <div>
                <dt className="font-medium">{t("cut.composition")}</dt>
                <dd className="text-muted-foreground">{t("cut.baggyComp")}</dd>
              </div>
              <div>
                <dt className="font-medium">{t("cut.guideChoice")}</dt>
                <dd className="text-muted-foreground">{t("cut.baggyGuide")}</dd>
              </div>
              <div>
                <dt className="font-medium">{t("cut.style")}</dt>
                <dd className="text-muted-foreground">{t("cut.baggyStyle")}</dd>
              </div>
            </dl>
            <Link
              href="/homme?fit=baggy"
              className={cn(buttonVariants({ size: "lg" }), "inline-flex h-12")}
            >
              {t("cut.discoverBaggy")}
            </Link>
          </article>

          <article className="space-y-4">
            {straightImg ? (
              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={straightImg}
                  alt={t("cut.straightTitle")}
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <h3 className="font-heading text-2xl">{t("cut.straightTitle")}</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium">{t("cut.silhouette")}</dt>
                <dd className="text-muted-foreground">{t("cut.straightSilhouette")}</dd>
              </div>
              <div>
                <dt className="font-medium">{t("cut.composition")}</dt>
                <dd className="text-muted-foreground">{t("cut.straightComp")}</dd>
              </div>
              <div>
                <dt className="font-medium">{t("cut.guideChoice")}</dt>
                <dd className="text-muted-foreground">{t("cut.straightGuide")}</dd>
              </div>
              <div>
                <dt className="font-medium">{t("cut.style")}</dt>
                <dd className="text-muted-foreground">{t("cut.straightStyle")}</dd>
              </div>
            </dl>
            <Link
              href="/homme?fit=straight"
              className={cn(buttonVariants({ size: "lg" }), "inline-flex h-12")}
            >
              {t("cut.discoverStraight")}
            </Link>
          </article>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          {t("cut.count", { n: PRODUCTS.length, price: mad(250) })}
        </p>
      </div>
    </section>
  );
}
