import Link from "next/link";
import { displayName, mad, type Product } from "@/data/catalog";
import { productImages, hasCatalogPhotos } from "@/lib/product-images";
import { Badge } from "@/components/ui/badge";

export function ProductCard({ product }: { product: Product }) {
  const image = productImages(product)[0];
  const live = hasCatalogPhotos(product.slug);

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-[#e8e2d8]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt={displayName(product)}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
        />
        {!live ? (
          <Badge className="absolute left-3 top-3 bg-background/90 text-foreground">
            Photo à venir
          </Badge>
        ) : null}
      </div>
      <div className="mt-3 space-y-1">
        <p className="text-sm capitalize text-muted-foreground">{product.fit}</p>
        <h3 className="font-heading text-lg capitalize leading-tight">{product.colour}</h3>
        <p className="text-sm">
          {mad(product.unitPriceMad)} · pack 2 {mad(product.duoPriceMad)}
        </p>
      </div>
    </Link>
  );
}
