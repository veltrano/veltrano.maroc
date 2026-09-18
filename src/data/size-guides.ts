import type { Fit } from "@/data/catalog";
import { MEDIA_ASSETS } from "@/data/media-assets";

export type SizeGuideRow = {
  size: string;
  a: number;
  b: number;
  c: number;
  d: number;
};

export type SizeGuide = {
  fit: Fit;
  modalTitle: string;
  imageSrc: string;
  imageAlt: string;
  /** Faithful transcription of the final guide image. */
  methodNote: string;
  columns: { key: keyof Omit<SizeGuideRow, "size">; label: string }[];
  rows: SizeGuideRow[];
};

/**
 * Accessible tables transcribed from the imported cut-specific guide images.
 * Labels A–D match the diagrams on those images (garment flat measures in cm).
 */
export const SIZE_GUIDES: Record<Fit, SizeGuide> = {
  baggy: {
    fit: "baggy",
    modalTitle: "Guide des tailles — Baggy",
    imageSrc: MEDIA_ASSETS.sizeGuideBaggy.localPath,
    imageAlt: "Guide des tailles Veltrano — jean baggy, mesures A B C D",
    methodNote:
      "Mesures du jean à plat (cm), selon les repères A–D indiqués sur le guide. A : ceinture. B : bassin. C : ouverture de jambe. D : longueur. Les tailles disponibles à l’achat restent celles du stock du modèle.",
    columns: [
      { key: "a", label: "A (cm)" },
      { key: "b", label: "B (cm)" },
      { key: "c", label: "C (cm)" },
      { key: "d", label: "D (cm)" },
    ],
    rows: [
      { size: "32", a: 40, b: 55, c: 23, d: 107 },
      { size: "33", a: 42, b: 57, c: 23, d: 107 },
      { size: "34", a: 44, b: 59, c: 23, d: 108 },
      { size: "36", a: 46, b: 60, c: 23, d: 108 },
      { size: "38", a: 48, b: 61, c: 24, d: 108 },
    ],
  },
  straight: {
    fit: "straight",
    modalTitle: "Guide des tailles — Coupe droite",
    imageSrc: MEDIA_ASSETS.sizeGuideStraight.localPath,
    imageAlt: "Guide des tailles Veltrano — jean coupe droite, mesures A B C D",
    methodNote:
      "Mesures du jean à plat (cm), selon les repères A–D indiqués sur le guide. A : ceinture. B : bassin. C : ouverture de jambe. D : longueur. Les tailles disponibles à l’achat restent celles du stock du modèle.",
    columns: [
      { key: "a", label: "A (cm)" },
      { key: "b", label: "B (cm)" },
      { key: "c", label: "C (cm)" },
      { key: "d", label: "D (cm)" },
    ],
    rows: [
      { size: "31", a: 38, b: 48, c: 18, d: 113 },
      { size: "32", a: 40, b: 50, c: 18, d: 114 },
      { size: "33", a: 42, b: 52, c: 18, d: 114 },
      { size: "34", a: 44, b: 54, c: 18, d: 114 },
      { size: "36", a: 46, b: 56, c: 19, d: 115 },
      { size: "38", a: 48, b: 58, c: 19, d: 115 },
      { size: "40", a: 50, b: 60, c: 19, d: 115 },
    ],
  },
};

export function sizeGuideForFit(fit: Fit): SizeGuide {
  return SIZE_GUIDES[fit];
}
