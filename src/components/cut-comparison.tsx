import Link from "next/link";
import { PRODUCTS, mad, productsByFit } from "@/data/catalog";
import { productImages } from "@/lib/product-images";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CutComparison() {
  const baggy = productsByFit("baggy")[0];
  const straight = productsByFit("straight")[0];
  const baggyImg = baggy ? productImages(baggy)[1] ?? productImages(baggy)[0] : null;
  const straightImg = straight
    ? productImages(straight)[1] ?? productImages(straight)[0]
    : null;

  return (
    <section id="coupes" className="scroll-mt-24 border-y border-border bg-white py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <h2 className="font-heading text-3xl sm:text-4xl">Deux coupes. À vous de choisir votre allure.</h2>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          Comparez les silhouettes Veltrano disponibles aujourd’hui — sans inventer un gagnant.
        </p>

        <div className="mt-10 grid gap-8 md:grid-cols-2">
          <article className="space-y-4">
            {baggyImg ? (
              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={baggyImg}
                  alt="Jean baggy Veltrano porté"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <h3 className="font-heading text-2xl">Baggy</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium">Silhouette</dt>
                <dd className="text-muted-foreground">Ample, avec du volume autour des jambes</dd>
              </div>
              <div>
                <dt className="font-medium">Composition</dt>
                <dd className="text-muted-foreground">100 % coton</dd>
              </div>
              <div>
                <dt className="font-medium">Ce qui guide le choix</dt>
                <dd className="text-muted-foreground">
                  L’aisance de la coupe et l’effet décontracté
                </dd>
              </div>
              <div>
                <dt className="font-medium">Style à composer</dt>
                <dd className="text-muted-foreground">
                  Décontracté, avec une silhouette affirmée
                </dd>
              </div>
            </dl>
            <Link
              href="/homme?fit=baggy"
              className={cn(buttonVariants({ size: "lg" }), "inline-flex")}
            >
              Découvrir les baggy
            </Link>
          </article>

          <article className="space-y-4">
            {straightImg ? (
              <div className="aspect-[3/4] overflow-hidden rounded-2xl bg-neutral-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={straightImg}
                  alt="Jean coupe droite Veltrano porté"
                  className="h-full w-full object-cover"
                />
              </div>
            ) : null}
            <h3 className="font-heading text-2xl">Coupe droite</h3>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="font-medium">Silhouette</dt>
                <dd className="text-muted-foreground">Droite, avec une ligne nette</dd>
              </div>
              <div>
                <dt className="font-medium">Composition</dt>
                <dd className="text-muted-foreground">98 % coton, 2 % élasthanne</dd>
              </div>
              <div>
                <dt className="font-medium">Ce qui guide le choix</dt>
                <dd className="text-muted-foreground">
                  La ligne droite et une touche d’élasticité
                </dd>
              </div>
              <div>
                <dt className="font-medium">Style à composer</dt>
                <dd className="text-muted-foreground">
                  Décontracté ou plus habillé, selon les associations
                </dd>
              </div>
            </dl>
            <Link
              href="/homme?fit=straight"
              className={cn(buttonVariants({ size: "lg" }), "inline-flex")}
            >
              Découvrir les coupes droites
            </Link>
          </article>
        </div>

        <p className="mt-8 text-sm text-muted-foreground">
          {PRODUCTS.length} modèles homme disponibles · à partir de {mad(250)}.
        </p>
      </div>
    </section>
  );
}
