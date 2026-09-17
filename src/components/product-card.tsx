"use client";

import Link from "next/link";
import { useState } from "react";
import { mad, type Product } from "@/data/catalog";
import { getProductContent } from "@/data/product-content-i18n";
import { productImages, hasCatalogPhotos } from "@/lib/product-images";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { useI18n } from "@/lib/i18n/provider";
import { t as translate } from "@/lib/i18n/translate";

export function ProductCard({
  product,
  showAddToCart = false,
}: {
  product: Product;
  showAddToCart?: boolean;
}) {
  const images = productImages(product);
  const flat = images[0];
  const worn = images[1] ?? images[0];
  const live = hasCatalogPhotos(product.slug);
  const { add } = useCart();
  const { t, locale } = useI18n();
  const [added, setAdded] = useState(false);
  const [showWorn, setShowWorn] = useState(false);
  const size = product.sizes[2] ?? product.sizes[0];
  const fit = translate(locale, product.fit === "baggy" ? "fit.baggy" : "fit.straight");
  const content = getProductContent(product.slug, locale) ?? product.content;

  return (
    <div className="group">
      <Link
        href={`/product/${product.slug}`}
        className="block"
        onMouseEnter={() => setShowWorn(true)}
        onMouseLeave={() => setShowWorn(false)}
        onFocus={() => setShowWorn(true)}
        onBlur={() => setShowWorn(false)}
        onTouchStart={() => setShowWorn((v) => !v)}
      >
        <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-white">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={showWorn ? worn : flat}
            alt={content.imageAltFlat}
            className="h-full w-full object-contain transition duration-300"
          />
          {!live ? (
            <Badge className="absolute start-3 top-3 bg-background/90 text-foreground">
              {t("product.photoSoon")}
            </Badge>
          ) : null}
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-sm text-muted-foreground">{fit}</p>
          <h3 className="font-heading text-base leading-tight sm:text-lg">{content.title}</h3>
          <p className="text-sm">{mad(product.unitPriceMad)}</p>
          <p className="text-xs text-muted-foreground">
            {t("product.pack2short", { price: mad(product.duoPriceMad) })}
          </p>
        </div>
      </Link>
      {showAddToCart ? (
        <Button
          type="button"
          variant="outline"
          className="mt-3 h-11 w-full"
          onClick={() => {
            add({ slug: product.slug, pack: "single", size, quantity: 1 });
            setAdded(true);
          }}
        >
          {added ? t("product.addedShort") : t("product.add")}
        </Button>
      ) : null}
    </div>
  );
}
