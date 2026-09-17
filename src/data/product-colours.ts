/** Per-product swatch colours sampled from flat garment photos (exclude white bg). */
export const PRODUCT_SWATCH_HEX: Record<string, string> = {
  "baggy-jean-bleu-blith": "#9eb0d3",
  "baggy-jean-dorty": "#33445f",
  "baggy-jean-double-stone": "#5b73a0",
  "baggy-jean-gris-snow": "#414146",
  "baggy-jean-noir": "#1c1c1e",
  "baggy-jean-stone": "#1a2645",
  "straight-fit-jean-dorty": "#2a3d4f",
  "straight-fit-jean-gris": "#51555c",
  "straight-fit-jean-gris-liga": "#67686c",
  "straight-fit-jean-gris-noir": "#2d2e32",
  "straight-fit-jean-noir": "#1e1e1e",
  "straight-fit-jean-stone": "#2f4264",
};

export function swatchHexForSlug(slug: string) {
  return PRODUCT_SWATCH_HEX[slug] ?? "#4a5560";
}

/** Prefer a cropped flat photo as the swatch face for washed denim. */
export function swatchImageForSlug(slug: string) {
  return `/products/${slug}/01.jpg`;
}
