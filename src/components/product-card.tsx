"use client";

import Link from "next/link";
import { useState } from "react";
import { displayName, fitLabel, mad, type Product } from "@/data/catalog";
import { productImages, hasCatalogPhotos } from "@/lib/product-images";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";

export function ProductCard({
  product,
  showAddToCart = false,
}: {
  product: Product;
  showAddToCart?: boolean;
}) {
  const image = productImages(product)[0];
  const live = hasCatalogPhotos(product.slug);
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const size = product.sizes[2] ?? product.sizes[0];

  return (
    <div className="group">
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={image}
            alt={displayName(product)}
            className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
          />
          {!live ? (
            <Badge className="absolute left-3 top-3 bg-background/90 text-foreground">
              Photo à venir
            </Badge>
          ) : null}
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-sm text-muted-foreground">{fitLabel(product.fit)}</p>
          <h3 className="font-heading text-lg capitalize leading-tight">{product.colour}</h3>
          <p className="text-sm">
            {mad(product.unitPriceMad)} · pack 2 {mad(product.duoPriceMad)}
          </p>
        </div>
      </Link>
      {showAddToCart ? (
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full"
          onClick={() => {
            add({ slug: product.slug, pack: "single", size, quantity: 1 });
            setAdded(true);
          }}
        >
          {added ? "Ajouté" : "Ajouter au panier"}
        </Button>
      ) : null}
    </div>
  );
}
