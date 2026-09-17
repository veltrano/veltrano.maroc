/**
 * Review fixtures and helpers.
 * Demo cards are NEVER published in production builds.
 */

export type ReviewRecord = {
  id: string;
  productSlug?: string;
  fit?: "baggy" | "straight";
  author: string;
  text: string;
  rating: number | null;
  createdAt?: string;
  sizePurchased?: string;
  fitFeedback?: string;
  verifiedPurchase: boolean;
  isDemo: boolean;
  publish: boolean;
  photos?: string[];
};

/** Fictional design-preview only — excluded from production rendering and JSON-LD. */
export const DEMO_REVIEWS: ReviewRecord[] = [
  {
    id: "demo-yassine",
    fit: "baggy",
    author: "Yassine — DÉMO, prénom fictif",
    text: "DÉMO — avis fictif : « J’aime le volume de la coupe : le jean donne du caractère à une tenue simple. »",
    rating: null,
    verifiedPurchase: false,
    isDemo: true,
    publish: false,
  },
  {
    id: "demo-ayoub",
    fit: "baggy",
    author: "Ayoub — DÉMO, prénom fictif",
    text: "DÉMO — avis fictif : « La coupe baggy laisse de la place autour des jambes. C’est le style décontracté que je cherchais. »",
    rating: null,
    verifiedPurchase: false,
    isDemo: true,
    publish: false,
  },
  {
    id: "demo-hamza",
    fit: "baggy",
    author: "Hamza — DÉMO, prénom fictif",
    text: "DÉMO — avis fictif : « L9at3a baggy jat m3a style dyali. Kayban zwin m3a t-shirt simple. »",
    rating: null,
    verifiedPurchase: false,
    isDemo: true,
    publish: false,
  },
  {
    id: "demo-mehdi",
    fit: "straight",
    author: "Mehdi — DÉMO, prénom fictif",
    text: "DÉMO — avis fictif : « La ligne droite est facile à porter avec mes baskets comme avec une chemise. »",
    rating: null,
    verifiedPurchase: false,
    isDemo: true,
    publish: false,
  },
  {
    id: "demo-amine",
    fit: "straight",
    author: "Amine — DÉMO, prénom fictif",
    text: "DÉMO — avis fictif : « Je cherchais une coupe droite avec un peu de souplesse pour mes tenues du quotidien. »",
    rating: null,
    verifiedPurchase: false,
    isDemo: true,
    publish: false,
  },
  {
    id: "demo-othmane",
    fit: "straight",
    author: "Othmane — DÉMO, prénom fictif",
    text: "DÉMO — avis fictif : « J’aime le rendu de la coupe. Les photos portées m’aident à imaginer mes tenues. »",
    rating: null,
    verifiedPurchase: false,
    isDemo: true,
    publish: false,
  },
];

/** Real published reviews — empty until authentic submissions exist. */
export const PUBLISHED_REVIEWS: ReviewRecord[] = [];

export function eligibleReviews(opts?: {
  productSlug?: string;
  fit?: "baggy" | "straight";
  includeDemo?: boolean;
}): ReviewRecord[] {
  const allowDemo =
    Boolean(opts?.includeDemo) && process.env.NODE_ENV !== "production";
  const pool = [
    ...PUBLISHED_REVIEWS.filter((r) => r.publish && !r.isDemo),
    ...(allowDemo ? DEMO_REVIEWS : []),
  ];
  return pool.filter((r) => {
    if (opts?.productSlug && r.productSlug && r.productSlug !== opts.productSlug) {
      return false;
    }
    if (opts?.fit && r.fit && r.fit !== opts.fit) return false;
    return true;
  });
}

export const REVIEW_REQUEST_TEMPLATE =
  "Bonjour {prénom}, comment vous sentez-vous dans votre jean Veltrano ? Votre avis sur la taille, la coupe, le confort et les finitions aidera d’autres clients à choisir. Partagez votre expérience, positive ou négative, ici : {lien_avis}. Merci !";
