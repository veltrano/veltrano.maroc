"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  duoPerJeanMad,
  duoSavingsMad,
  mad,
  packPrice,
  productsByFit,
  type Product,
} from "@/data/catalog";
import { SERVICE_LINE_MOBILE } from "@/data/product-content";
import { productImages, hasCatalogPhotos } from "@/lib/product-images";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SizeGuideModal } from "@/components/size-guide-modal";
import { ProductReviews } from "@/components/product-reviews";
import { ProductJsonLd } from "@/components/product-json-ld";
import { shopWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function ProductDetail({ product }: { product: Product }) {
  const images = productImages(product);
  const live = hasCatalogPhotos(product.slug);
  const content = product.content;
  const [active, setActive] = useState(0);
  const [pack, setPack] = useState<"single" | "duo">("single");
  const [size, setSize] = useState(product.sizes[2] ?? product.sizes[0]);
  const [sizeB, setSizeB] = useState(product.sizes[2] ?? product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [stickyVisible, setStickyVisible] = useState(false);
  const [sizePrompt, setSizePrompt] = useState(false);
  const buyRef = useRef<HTMLDivElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const { add } = useCart();
  const router = useRouter();

  const units = pack === "duo" ? qty * 2 : qty;
  const total = packPrice(units);
  const soldOut = product.stock <= 0;
  const siblings = productsByFit(product.fit).filter((p) => p.slug !== product.slug);
  const savings = duoSavingsMad();
  const perJean = duoPerJeanMad();

  const sizeLabel = useMemo(() => {
    if (pack === "duo") return `${size} + ${sizeB}`;
    return size;
  }, [pack, size, sizeB]);

  useEffect(() => {
    const el = buyRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setStickyVisible(!entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function onAdd(goCart = false) {
    if (soldOut) return;
    if (!size) {
      setSizePrompt(true);
      sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    add({
      slug: product.slug,
      pack,
      size,
      sizeB: pack === "duo" ? sizeB : undefined,
      quantity: qty,
    });
    setAdded(true);
    setSizePrompt(false);
    if (goCart) router.push("/cart");
  }

  function altFor(index: number) {
    if (index === 0) return content.imageAltFlat;
    return content.imageAltWorn;
  }

  return (
    <div className="pb-28 md:pb-0">
      <ProductJsonLd product={product} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Gallery */}
        <div className="min-w-0">
          <div className="relative aspect-[3/4] max-h-[70vh] overflow-hidden rounded-2xl bg-white md:max-h-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[active] ?? images[0]}
              alt={altFor(active)}
              className="h-full w-full object-contain"
            />
            {!live ? (
              <Badge className="absolute start-4 top-4 bg-background/90 text-foreground">
                Photo Drive en attente
              </Badge>
            ) : null}
            {images.length > 1 ? (
              <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
                {images.slice(0, 8).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Image ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      i === active ? "bg-foreground" : "bg-foreground/30"
                    )}
                  />
                ))}
              </div>
            ) : null}
          </div>

          {images.length > 1 ? (
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {images.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActive(i)}
                  className={cn(
                    "h-16 w-16 shrink-0 overflow-hidden rounded-lg border bg-white sm:h-20 sm:w-20",
                    i === active ? "border-foreground" : "border-transparent"
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          ) : null}
        </div>

        {/* Purchase panel */}
        <div ref={buyRef} className="space-y-6">
          <div>
            <p className="text-sm uppercase tracking-widest text-muted-foreground">
              {product.fit === "baggy" ? "Baggy" : "Coupe droite"}
              {product.fit === "straight" ? " · Straight fit" : null}
            </p>
            <h1 className="font-heading mt-1 text-3xl sm:text-4xl">{content.h1}</h1>
            <p className="mt-3 text-lg font-medium">{mad(total)}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {mad(product.unitPriceMad)} l’unité · {mad(product.duoPriceMad)} le pack de 2
            </p>
          </div>

          <p className="text-base leading-relaxed text-muted-foreground">
            {content.shortDescription}
          </p>

          <ul className="space-y-3">
            {content.benefits.map((b) => (
              <li key={b.label} className="border-s-2 border-foreground/20 ps-3">
                <p className="text-sm font-medium">{b.label}</p>
                <p className="text-sm text-muted-foreground">{b.text}</p>
              </li>
            ))}
          </ul>

          <p className="text-sm">
            <span className="font-medium">Composition :</span> {content.composition}
          </p>

          {/* Colour siblings */}
          <div className="space-y-2">
            <Label>Coloris — même coupe</Label>
            <div className="flex flex-wrap gap-2">
              <span
                className="inline-flex items-center gap-2 rounded-full border border-foreground px-3 py-1.5 text-sm"
                title={content.colourLabel}
              >
                <span
                  className="size-3 rounded-full border border-black/10"
                  style={{ backgroundColor: product.colourHex }}
                />
                {content.colourLabel}
              </span>
              {siblings.map((s) => (
                <Link
                  key={s.slug}
                  href={`/product/${s.slug}`}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-sm hover:border-foreground"
                  title={s.content.colourLabel}
                >
                  <span
                    className="size-3 rounded-full border border-black/10"
                    style={{ backgroundColor: s.colourHex }}
                  />
                  <span className="sr-only sm:not-sr-only">{s.content.colourLabel}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Pack */}
          <div className="space-y-2">
            <Label>Offre</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPack("single")}
                className={cn(
                  "rounded-xl border px-4 py-3 text-start",
                  pack === "single" ? "border-foreground bg-white" : "border-border"
                )}
              >
                <div className="font-medium">1 jean</div>
                <div className="text-sm text-muted-foreground">{mad(product.unitPriceMad)}</div>
              </button>
              <button
                type="button"
                onClick={() => setPack("duo")}
                className={cn(
                  "rounded-xl border px-4 py-3 text-start",
                  pack === "duo" ? "border-foreground bg-white" : "border-border"
                )}
              >
                <div className="font-medium">Pack de 2</div>
                <div className="text-sm text-muted-foreground">{mad(product.duoPriceMad)}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {mad(perJean)} par jean · Économisez {mad(savings)}
                </div>
              </button>
            </div>
          </div>

          {/* Sizes */}
          <div ref={sizeRef} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label>{pack === "duo" ? "Jean 1 — taille" : "Taille"}</Label>
              <button
                type="button"
                className="text-sm underline underline-offset-2"
                onClick={() => setGuideOpen(true)}
              >
                Guide des tailles
              </button>
            </div>
            {sizePrompt ? (
              <p className="text-sm text-destructive">Choisissez votre taille pour continuer.</p>
            ) : null}
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setSize(s);
                    setSizePrompt(false);
                  }}
                  className={cn(
                    "h-11 min-w-11 rounded-lg border px-3 text-sm",
                    size === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {pack === "duo" ? (
            <div className="space-y-2">
              <Label>Jean 2 — taille</Label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSizeB(s)}
                    className={cn(
                      "h-11 min-w-11 rounded-lg border px-3 text-sm",
                      sizeB === s
                        ? "border-foreground bg-foreground text-background"
                        : "border-border"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Même coloris. Tailles indépendantes pour chaque jean du pack.
              </p>
            </div>
          ) : null}

          <div className="space-y-2">
            <Label>{pack === "duo" ? "Quantité de packs" : "Quantité"}</Label>
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Diminuer"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </Button>
              <span className="w-8 text-center">{qty}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label="Augmenter"
                onClick={() => setQty((q) => q + 1)}
              >
                +
              </Button>
              {pack === "duo" ? (
                <span className="text-sm text-muted-foreground">= {units} jeans</span>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-white p-4 text-sm">
            <div className="flex justify-between gap-3">
              <span>
                {units} jean{units > 1 ? "s" : ""} · taille {sizeLabel}
              </span>
              <span className="font-medium">{mad(total)}</span>
            </div>
            <div className="mt-2 flex justify-between text-muted-foreground">
              <span>Livraison</span>
              <span>Gratuite</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-medium">
              <span>Total</span>
              <span>{mad(total)}</span>
            </div>
          </div>

          {soldOut ? <p className="text-sm text-destructive">Rupture de stock.</p> : null}
          {added ? <p className="text-sm text-foreground">Ajouté au panier.</p> : null}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="h-12 min-h-12 flex-1 shrink-0"
              disabled={soldOut}
              onClick={() => onAdd(false)}
            >
              Ajouter au panier
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 min-h-12 flex-1 shrink-0"
              disabled={soldOut}
              onClick={() => onAdd(true)}
            >
              Commander maintenant
            </Button>
          </div>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>{SERVICE_LINE_MOBILE[0]}</p>
            <p>
              <Link href="/aide/livraison-retours" className="underline underline-offset-2">
                {SERVICE_LINE_MOBILE[1]}
              </Link>
            </p>
            <p className="pt-1">Paiement à la commande · Confirmation par l’équipe Veltrano</p>
            <p>
              Besoin d’aide pour la taille ?{" "}
              <a
                href={shopWhatsAppUrl(
                  `Bonjour, j’ai besoin d’aide pour choisir ma taille — ${content.title}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2"
              >
                Écrire sur WhatsApp
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Below fold */}
      <section className="mt-16 space-y-10 border-t border-border pt-12">
        <div className="max-w-3xl">
          <h2 className="font-heading text-2xl sm:text-3xl">{content.detailTitle}</h2>
          <p className="mt-3 text-muted-foreground">{content.detailCopy}</p>
          <p className="mt-4 leading-relaxed text-muted-foreground">{content.longDescription}</p>
        </div>

        <ProductFaqs faqs={content.faqs} />
        <ProductReviews fit={product.fit} productSlug={product.slug} />

        <div>
          <h2 className="font-heading text-2xl">Dans la même coupe</h2>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {siblings.slice(0, 6).map((s) => {
              const img = productImages(s)[0];
              return (
                <Link
                  key={s.slug}
                  href={`/product/${s.slug}`}
                  className="w-36 shrink-0 sm:w-44"
                >
                  <div className="aspect-[3/4] overflow-hidden rounded-xl bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img}
                      alt={s.content.imageAltFlat}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <p className="mt-2 text-sm">{s.content.colourLabel}</p>
                  <p className="text-xs text-muted-foreground">{mad(s.unitPriceMad)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <SizeGuideModal
        fit={product.fit}
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
      />

      {/* Sticky purchase bar */}
      {stickyVisible ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{content.colourLabel}</p>
              <p className="text-sm text-muted-foreground">{mad(total)}</p>
            </div>
            <Button
              size="lg"
              className="h-12 min-h-12 shrink-0 px-5"
              disabled={soldOut}
              onClick={() => {
                if (!size) {
                  setSizePrompt(true);
                  sizeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                  return;
                }
                onAdd(false);
              }}
            >
              Ajouter
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ProductFaqs({ faqs }: { faqs: { question: string; answer: string }[] }) {
  return (
    <div>
      <h2 className="font-heading text-2xl">Questions fréquentes</h2>
      <div className="mt-4 divide-y divide-border border-y border-border">
        {faqs.map((faq) => (
          <details key={faq.question} className="group py-3">
            <summary className="cursor-pointer list-none font-medium marker:content-none [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-3">
                {faq.question}
                <span className="text-muted-foreground group-open:hidden">+</span>
                <span className="hidden text-muted-foreground group-open:inline">−</span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
