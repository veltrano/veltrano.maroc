import imageMap from "@/data/image-map.json";
import type { Product } from "@/data/catalog";

type ImageMap = Record<string, string[]>;

const map = imageMap as ImageMap;

export function productImages(product: Product): string[] {
  const files = map[product.slug];
  if (files && files.length > 0) {
    return files.map((file) => `/products/${product.slug}/${file}`);
  }
  return [`/products/placeholders/${product.slug}.svg`];
}

export function hasCatalogPhotos(slug: string) {
  return Boolean(map[slug]?.length);
}
