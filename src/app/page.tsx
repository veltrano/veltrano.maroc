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
          Livraison gratuite au Maroc
        </p>
      </div>

      <HeroVideo>
        <p className="text-xs uppercase tracking-[0.28em] text-white/85">Veltrano</p>
        <h1 className="font-heading mt-4 max-w-2xl text-4xl leading-tight text-white sm:text-6xl">
          Le confort se ressent. Le style se remarque.
        </h1>
        <p className="mt-5 max-w-lg text-base text-white/90 sm:text-lg">
          Veltrano construit un vestiaire denim pour hommes, femmes et enfants. Découvrez
          aujourd’hui nos jeans baggy et coupe droite, et trouvez la silhouette qui vous
          ressemble.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/boutique"
            className={cn(
              buttonVariants({ size: "lg" }),
              "inline-flex h-12 min-h-12 bg-white text-foreground hover:bg-white/90"
            )}
          >
            Découvrir les jeans
          </Link>
          <Link
            href="/#coupes"
            className={cn(
              buttonVariants({ size: "lg", variant: "outline" }),
              "inline-flex h-12 min-h-12 border-white bg-transparent text-white hover:bg-white/10"
            )}
          >
            Trouver ma coupe
          </Link>
        </div>
      </HeroVideo>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 text-sm sm:grid-cols-3">
          <div>
            <h2 className="font-medium">Livraison gratuite au Maroc</h2>
            <p className="mt-1 text-muted-foreground">
              0 MAD de frais de port sur une commande d’un jean comme sur un pack de 2.
            </p>
          </div>
          <div>
            <h2 className="font-medium">Pack de 2</h2>
            <p className="mt-1 text-muted-foreground">
              {mad(250)} le jean · {mad(400)} le pack · 200 MAD par jean · Économisez 100 MAD.
            </p>
          </div>
          <div>
            <h2 className="font-medium">Échange de taille</h2>
            <p className="mt-1 text-muted-foreground">
              <Link href="/aide/livraison-retours" className="underline underline-offset-2">
                Échange de taille gratuit sous 7 jours après réception
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <CutComparison />

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">
              Collection homme
            </p>
            <h2 className="font-heading mt-2 text-3xl">À porter maintenant</h2>
          </div>
          <Link href="/boutique" className="hidden text-sm underline sm:inline">
            Voir la boutique
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 lg:grid-cols-4">
          {featured.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
        <div className="mt-10 flex justify-center">
          <Link href="/boutique" className={cn(buttonVariants({ size: "lg" }), "inline-flex h-12")}>
            Découvrir les jeans
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl">Le denim, dans votre quotidien.</h2>
        <p className="mt-2 text-muted-foreground">
          Mouvement, détails et silhouettes — le jean Veltrano porté en vrai.
        </p>
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
                preload="none"
                poster="/lifestyle/hassan-ii-jeans.png"
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
          <h2 className="font-heading text-3xl">Veltrano</h2>
          <p className="mt-4 text-muted-foreground">
            Un vestiaire denim pour affirmer son style au quotidien. Aujourd’hui : jeans homme
            baggy et coupe droite. Demain : des lignes femme et enfant, préparées avec la même
            exigence de silhouette et de confort.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/homme" className={cn(buttonVariants({ size: "lg" }), "inline-flex h-12")}>
              Boutique Homme
            </Link>
            <Link
              href="/femme"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "inline-flex h-12")}
            >
              Ligne Femme — bientôt
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
