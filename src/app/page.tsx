import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { CLIENT_VIDEOS, featuredProducts, mad } from "@/data/catalog";
import { cn } from "@/lib/utils";

export default function HomePage() {
  const featured = featuredProducts();

  return (
    <div className="bg-white">
      <section className="relative min-h-[78vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lifestyle/hassan-ii-jeans.png"
          alt="Jeans Veltrano devant Hassan II"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/35" />
        <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-16 sm:px-6 sm:pb-24">
          <p className="text-xs uppercase tracking-[0.28em] text-white/80">Veltrano</p>
          <h1 className="font-heading mt-4 max-w-2xl text-4xl leading-tight text-white sm:text-6xl">
            Le jean qu’on te demande dans la rue.
          </h1>
          <p className="mt-5 max-w-lg text-base text-white/90 sm:text-lg">
            Coupes baggy et droite, matière qui tient, prix clair : {mad(250)} le jean,{" "}
            {mad(400)} le pack de 2. La ligne grandit — Homme maintenant, Femme bientôt.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/boutique"
              className={cn(buttonVariants({ size: "lg" }), "inline-flex bg-white text-foreground hover:bg-white/90")}
            >
              Boutique
            </Link>
            <Link
              href="/homme"
              className={cn(
                buttonVariants({ size: "lg", variant: "outline" }),
                "inline-flex border-white bg-transparent text-white hover:bg-white/10"
              )}
            >
              Homme
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Présentation</p>
        <h2 className="font-heading mt-3 text-3xl sm:text-4xl">
          La marque marocaine qui te vaut les compliments que tu mérites.
        </h2>
        <p className="mt-4 text-muted-foreground">
          Veltrano, c’est le denim du quotidien élevé : silhouettes nettes, wash travaillés,
          et cette question — « c’est d’où, ton jean ? ». Pas une capsule figée. Une maison
          qui ajoute des pièces, saison après saison.
        </p>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Nouveautés</p>
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
          <Link href="/boutique" className={cn(buttonVariants({ size: "lg" }), "inline-flex")}>
            Voir toute la boutique
          </Link>
        </div>
      </section>

      <section className="mt-8 grid min-h-[56vh] md:grid-cols-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lifestyle/medina-jeans.png"
          alt="Jeans Veltrano en médina"
          className="h-full min-h-[320px] w-full object-cover"
        />
        <div className="flex flex-col justify-center bg-white px-6 py-16 sm:px-12">
          <h2 className="font-heading text-3xl sm:text-4xl">Coupe, wash, allure.</h2>
          <p className="mt-4 max-w-md text-muted-foreground">
            Des jeans pensés pour la ville — médina, corniche, soirée. On construit la
            garde-robe pièce par pièce. Reviens souvent : d’autres modèles arrivent.
          </p>
          <Link href="/homme" className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex w-fit")}>
            Boutique Homme
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <h2 className="font-heading text-3xl">Ils portent Veltrano</h2>
        <p className="mt-2 text-muted-foreground">
          Clients, looks, mouvements — le jean en vrai, pas en studio seulement.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          {CLIENT_VIDEOS.map((v) => (
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
              <figcaption className="px-3 py-2 text-xs text-muted-foreground">{v.label}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="border-t border-border bg-white">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-sm sm:grid-cols-3 sm:px-6">
          <div>
            <h3 className="font-medium">Pack malin</h3>
            <p className="mt-1 text-muted-foreground">{mad(250)} l’unité, {mad(400)} les deux.</p>
          </div>
          <div>
            <h3 className="font-medium">Livraison Maroc</h3>
            <p className="mt-1 text-muted-foreground">Commande en ligne, on te contacte pour la suite.</p>
          </div>
          <div>
            <h3 className="font-medium">Denim qui tient</h3>
            <p className="mt-1 text-muted-foreground">Baggy et coupe droite, tailles du quotidien.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
