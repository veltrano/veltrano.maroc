"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { displayName, mad, packPrice, type Product } from "@/data/catalog";
import { productImages, hasCatalogPhotos } from "@/lib/product-images";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export function ProductDetail({ product }: { product: Product }) {
  const images = productImages(product);
  const live = hasCatalogPhotos(product.slug);
  const [active, setActive] = useState(0);
  const [pack, setPack] = useState<"single" | "duo">("single");
  const [size, setSize] = useState(product.sizes[2] ?? product.sizes[0]);
  const [sizeB, setSizeB] = useState(product.sizes[2] ?? product.sizes[0]);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  const router = useRouter();

  const units = pack === "duo" ? qty * 2 : qty;
  const total = packPrice(units);
  const soldOut = product.stock <= 0;

  const sizeLabel = useMemo(() => {
    if (pack === "duo") return `${size} + ${sizeB}`;
    return size;
  }, [pack, size, sizeB]);

  function onAdd(goCart = false) {
    if (soldOut) return;
    add({
      slug: product.slug,
      pack,
      size,
      sizeB: pack === "duo" ? sizeB : undefined,
      quantity: qty,
    });
    setAdded(true);
    if (goCart) router.push("/cart");
  }

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <div className="relative aspect-[3/4] overflow-hidden rounded-2xl bg-[#e8e2d8]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[active] ?? images[0]}
            alt={displayName(product)}
            className="h-full w-full object-cover"
          />
          {!live ? (
            <Badge className="absolute left-4 top-4 bg-background/90 text-foreground">
              Photo Drive en attente
            </Badge>
          ) : null}
        </div>
        {images.length > 1 ? (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {images.map((src, i) => (
              <button
                key={src + i}
                type="button"
                onClick={() => setActive(i)}
                className={`aspect-square overflow-hidden rounded-lg border ${
                  i === active ? "border-foreground" : "border-transparent"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-widest text-muted-foreground">
            {product.fit === "baggy" ? "Baggy" : "Straight fit"}
          </p>
          <h1 className="font-heading mt-1 text-4xl capitalize">{product.colour}</h1>
          <p className="mt-3 text-lg">
            {mad(product.unitPriceMad)} l’unité · {mad(product.duoPriceMad)} le pack de 2
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{product.stock} pièces en stock</p>
        </div>

        {product.description ? (
          <p className="text-muted-foreground">{product.description}</p>
        ) : (
          <p className="text-sm text-muted-foreground">
            Jean {product.fit} teinte {product.colour}. Tailles {product.sizes[0]} à{" "}
            {product.sizes[product.sizes.length - 1]}. Description catalogue vide — on
            affiche uniquement les champs officiels.
          </p>
        )}

        <div className="space-y-2">
          <Label>Pack</Label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPack("single")}
              className={`rounded-xl border px-4 py-3 text-left ${
                pack === "single" ? "border-foreground bg-white" : "border-border"
              }`}
            >
              <div className="font-medium">1 jean</div>
              <div className="text-sm text-muted-foreground">{mad(250)}</div>
            </button>
            <button
              type="button"
              onClick={() => setPack("duo")}
              className={`rounded-xl border px-4 py-3 text-left ${
                pack === "duo" ? "border-foreground bg-white" : "border-border"
              }`}
            >
              <div className="font-medium">Pack de 2</div>
              <div className="text-sm text-muted-foreground">{mad(400)}</div>
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Taille{pack === "duo" ? " 1" : ""}</Label>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSize(s)}
                className={`h-10 min-w-10 rounded-lg border px-3 text-sm ${
                  size === s ? "border-foreground bg-foreground text-background" : "border-border"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {pack === "duo" ? (
          <div className="space-y-2">
            <Label>Taille 2</Label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSizeB(s)}
                  className={`h-10 min-w-10 rounded-lg border px-3 text-sm ${
                    sizeB === s
                      ? "border-foreground bg-foreground text-background"
                      : "border-border"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label>Quantité de packs</Label>
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
            >
              −
            </Button>
            <span className="w-8 text-center">{qty}</span>
            <Button type="button" variant="outline" size="icon" onClick={() => setQty((q) => q + 1)}>
              +
            </Button>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 text-sm">
          <div className="flex justify-between">
            <span>
              {units} jean{units > 1 ? "s" : ""} · taille {sizeLabel}
            </span>
            <span className="font-medium">{mad(total)}</span>
          </div>
        </div>

        {soldOut ? (
          <p className="text-sm text-destructive">Rupture de stock.</p>
        ) : null}

        {added ? (
          <p className="text-sm text-foreground">Ajouté au panier.</p>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button size="lg" className="flex-1" disabled={soldOut} onClick={() => onAdd(false)}>
            Ajouter au panier
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1"
            disabled={soldOut}
            onClick={() => onAdd(true)}
          >
            Commander
          </Button>
        </div>
      </div>
    </div>
  );
}
