import type { Fit } from "@/data/catalog";

export type ProductBenefit = { label: string; text: string };

export type ProductFaq = { question: string; answer: string };

export type ProductContent = {
  slug: string;
  fit: Fit;
  colourLabel: string;
  title: string;
  h1: string;
  shortDescription: string;
  longDescription: string;
  composition: string;
  compositionShort: string;
  benefits: ProductBenefit[];
  detailTitle: string;
  detailCopy: string;
  colourSentence: string;
  seoTitle: string;
  metaDescription: string;
  imageAltFlat: string;
  imageAltWorn: string;
  faqs: ProductFaq[];
};

function colourTitle(colour: string) {
  return colour
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

const BAGGY_BENEFITS: ProductBenefit[] = [
  { label: "Coupe ample", text: "De l’aisance autour des jambes et une silhouette affirmée." },
  { label: "100 % coton", text: "Une composition clairement annoncée, pour choisir en connaissance de cause." },
  {
    label: "Finitions haut de gamme",
    text: "Des détails à découvrir de près dans la galerie.",
  },
];

const STRAIGHT_BENEFITS: ProductBenefit[] = [
  { label: "Coupe droite", text: "Une ligne nette pour composer facilement vos tenues." },
  {
    label: "98 % coton, 2 % élasthanne",
    text: "Le caractère du coton, avec une touche d’élasticité.",
  },
  {
    label: "Facile à associer",
    text: "Du t-shirt à la chemise, plusieurs façons de porter le même jean.",
  },
];

const SHARED_SERVICE_FAQS: ProductFaq[] = [
  {
    question: "La livraison est-elle gratuite ?",
    answer: "Oui, la livraison est gratuite au Maroc.",
  },
  {
    question: "Et si la taille ne me convient pas ?",
    answer:
      "Vous pouvez demander un échange de taille gratuit dans les 7 jours suivant la réception de votre commande. Contactez notre équipe pour organiser l’échange.",
  },
  {
    question: "Comment demander un retour ?",
    answer:
      "Retours acceptés dans les 7 jours suivant la livraison, si l’article est inutilisé et dans son état d’origine. Contactez notre équipe pour connaître la procédure.",
  },
  {
    question: "Comment entretenir mon jean ?",
    answer: "Suivez les indications de l’étiquette d’entretien de votre jean.",
  },
  {
    question: "Puis-je choisir deux coloris ou deux tailles dans le pack ?",
    answer:
      "Le pack de 2 s’applique au même modèle (même coloris). Vous pouvez choisir une taille différente pour chaque jean du pack.",
  },
  {
    question: "Quelle différence entre baggy et coupe droite ?",
    answer:
      "Le baggy offre une coupe ample et une silhouette décontractée en 100 % coton. La coupe droite dessine une ligne nette, avec 98 % coton et 2 % élasthanne pour une touche d’élasticité.",
  },
];

type ColourRow = {
  slug: string;
  colour: string;
  colourSentence: string;
};

const BAGGY_COLOURS: ColourRow[] = [
  {
    slug: "baggy-jean-bleu-blith",
    colour: "bleu blith",
    colourSentence:
      "Le coloris Bleu Blith offre un bleu denim soutenu, idéal pour un look casual net.",
  },
  {
    slug: "baggy-jean-dorty",
    colour: "dorty",
    colourSentence:
      "Le wash Dorty tire vers un beige-taupe pierre, facile à associer aux tons neutres.",
  },
  {
    slug: "baggy-jean-double-stone",
    colour: "double stone",
    colourSentence:
      "Le Double Stone présente un gris pierre nuancé, pour une allure urbaine discrète.",
  },
  {
    slug: "baggy-jean-gris-snow",
    colour: "gris snow",
    colourSentence:
      "Le Gris Snow est un gris clair lavé, lumineux sur une silhouette ample.",
  },
  {
    slug: "baggy-jean-noir",
    colour: "noir",
    colourSentence:
      "Le Noir affirme une présence nette : une base forte pour des tenues du soir comme du quotidien.",
  },
  {
    slug: "baggy-jean-stone",
    colour: "stone",
    colourSentence:
      "Le Stone propose un gris-beige pierre classique, polyvalent au fil des saisons.",
  },
];

const STRAIGHT_COLOURS: ColourRow[] = [
  {
    slug: "straight-fit-jean-dorty",
    colour: "dorty",
    colourSentence:
      "Le wash Dorty apporte une teinte pierre chaude sur une ligne droite soignée.",
  },
  {
    slug: "straight-fit-jean-gris",
    colour: "gris",
    colourSentence:
      "Le Gris offre un denim gris moyen, facile à porter avec baskets ou chemise.",
  },
  {
    slug: "straight-fit-jean-gris-liga",
    colour: "gris liga",
    colourSentence:
      "Le Gris Liga se distingue par un gris profond légèrement métallique.",
  },
  {
    slug: "straight-fit-jean-gris-noir",
    colour: "gris noir",
    colourSentence:
      "Le Gris Noir se situe entre le gris sombre et le noir, pour une allure discrète.",
  },
  {
    slug: "straight-fit-jean-noir",
    colour: "noir",
    colourSentence:
      "Le Noir souligne la ligne droite avec un contraste net et une présence affirmée.",
  },
  {
    slug: "straight-fit-jean-stone",
    colour: "stone",
    colourSentence:
      "Le Stone apporte un gris pierre doux sur une coupe droite facile à composer.",
  },
];

function baggyFaqs(): ProductFaq[] {
  return [
    {
      question: "Quelle est la composition ?",
      answer: "100 % coton.",
    },
    {
      question: "Comment choisir ma taille ?",
      answer:
        "Consultez le guide des tailles Baggy à côté du sélecteur de taille, puis comparez les mesures A–D à votre jean préféré.",
    },
    ...SHARED_SERVICE_FAQS,
  ];
}

function straightFaqs(): ProductFaq[] {
  return [
    {
      question: "Quelle est la composition ?",
      answer: "98 % coton, 2 % élasthanne.",
    },
    {
      question: "Comment choisir ma taille ?",
      answer:
        "Consultez le guide des tailles Coupe droite à côté du sélecteur de taille, puis comparez les mesures A–D à votre jean préféré.",
    },
    ...SHARED_SERVICE_FAQS,
  ];
}

function buildBaggy(row: ColourRow): ProductContent {
  const colourLabel = colourTitle(row.colour);
  const title = `Jean baggy — ${colourLabel}`;
  return {
    slug: row.slug,
    fit: "baggy",
    colourLabel,
    title,
    h1: title,
    shortDescription:
      "De l’aisance dans la coupe, du caractère dans le look. Un jean baggy 100 % coton aux finitions haut de gamme, pour composer une silhouette décontractée qui vous ressemble.",
    longDescription: `Le jean baggy Veltrano donne de l’ampleur à votre silhouette et de l’aisance autour des jambes. Son denim 100 % coton et ses finitions haut de gamme mettent la matière et les détails au premier plan. ${row.colourSentence} Avec un t-shirt et des baskets, il accompagne un look décontracté. Avec une chemise, il crée un contraste plus habillé. Choisissez le coloris qui vous ressemble et faites-en une pièce à part entière de votre vestiaire.`,
    composition: "100 % coton",
    compositionShort: "100 % coton",
    benefits: BAGGY_BENEFITS,
    detailTitle: "L’aisance d’une coupe ample. Le caractère du denim.",
    detailCopy:
      "Le volume donne le ton. Le coloris et les finitions complètent le look. Explorez les vues portées, les détails et le guide des tailles pour choisir le baggy qui correspond à votre silhouette.",
    colourSentence: row.colourSentence,
    seoTitle: `Jean baggy ${colourLabel} 100 % coton | Veltrano`,
    metaDescription: `Découvrez le jean baggy ${colourLabel} Veltrano : 100 % coton, coupe ample et finitions haut de gamme. Livraison gratuite au Maroc.`,
    imageAltFlat: `Jean baggy ${colourLabel} Veltrano, vue de face à plat`,
    imageAltWorn: `Jean baggy ${colourLabel} Veltrano, vue portée`,
    faqs: baggyFaqs(),
  };
}

function buildStraight(row: ColourRow): ProductContent {
  const colourLabel = colourTitle(row.colour);
  const title = `Jean coupe droite — ${colourLabel}`;
  return {
    slug: row.slug,
    fit: "straight",
    colourLabel,
    title,
    h1: title,
    shortDescription:
      "Une ligne droite, une allure soignée et une touche d’élasticité pour accompagner vos mouvements. Le jean Veltrano en 98 % coton et 2 % élasthanne trouve sa place dans les looks décontractés comme dans les tenues plus habillées.",
    longDescription: `Le jean coupe droite Veltrano dessine une silhouette nette et facile à associer. Sa composition de 98 % coton et 2 % élasthanne apporte une touche d’élasticité au denim, pour accompagner les mouvements du quotidien. ${row.colourSentence} Portez-le avec un t-shirt et des baskets pour une allure décontractée, ou avec une chemise pour un look plus habillé. Une coupe polyvalente, à choisir dans le coloris qui vous ressemble.`,
    composition: "98 % coton, 2 % élasthanne",
    compositionShort: "98 % coton, 2 % élasthanne",
    benefits: STRAIGHT_BENEFITS,
    detailTitle: "Une ligne nette. Une touche de souplesse.",
    detailCopy:
      "Une silhouette droite et une composition légèrement élastique : deux repères pour choisir votre jean. Consultez les vues portées et les mesures du modèle avant de sélectionner votre taille.",
    colourSentence: row.colourSentence,
    seoTitle: `Jean coupe droite ${colourLabel} 98 % coton | Veltrano`,
    metaDescription: `Jean coupe droite ${colourLabel} Veltrano : 98 % coton et 2 % élasthanne pour une touche de souplesse. Trouvez votre taille. Livraison gratuite au Maroc.`,
    imageAltFlat: `Jean coupe droite ${colourLabel} Veltrano, vue de face à plat`,
    imageAltWorn: `Jean coupe droite ${colourLabel} Veltrano, vue portée`,
    faqs: straightFaqs(),
  };
}

export const PRODUCT_CONTENT: ProductContent[] = [
  ...BAGGY_COLOURS.map(buildBaggy),
  ...STRAIGHT_COLOURS.map(buildStraight),
];

export const PRODUCT_CONTENT_BY_SLUG: Record<string, ProductContent> =
  Object.fromEntries(PRODUCT_CONTENT.map((c) => [c.slug, c]));

export function contentForSlug(slug: string): ProductContent | undefined {
  return PRODUCT_CONTENT_BY_SLUG[slug];
}

export const SERVICE_LINE =
  "Livraison gratuite au Maroc · Échange de taille gratuit sous 7 jours après réception";

export const SERVICE_LINE_MOBILE = [
  "Livraison gratuite au Maroc",
  "Échange de taille gratuit sous 7 jours après réception",
] as const;
