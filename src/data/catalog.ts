export type Fit = "baggy" | "straight";

export type Product = {
  slug: string;
  name: string;
  fit: Fit;
  colour: string;
  colourHex: string;
  sizes: string[];
  stock: number;
  unitPriceMad: number;
  duoPriceMad: number;
  driveFolderId: string;
  driveFolderUrl: string;
  description: string;
};

export const UNIT_PRICE_MAD = 250;
export const DUO_PRICE_MAD = 400;

function slugify(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

const COLOUR_HEX: Record<string, string> = {
  "bleu blith": "#2f4f7a",
  dorty: "#5c5348",
  "double stone": "#8a8680",
  "gris snow": "#b8b6b1",
  noir: "#1a1a1a",
  stone: "#7a7468",
  gris: "#6e6e6e",
  "gris liga": "#5a5c5e",
  "gris noir": "#3a3a3c",
};

export const PRODUCTS: Product[] = [
  {
    name: "baggy jean bleu blith",
    colour: "bleu blith",
    sizes: ["32", "33", "34", "36", "38"],
    driveFolderId: "10dqVeaww9A7YXjO2PgNtYzfCQusRsTfS",
  },
  {
    name: "baggy jean dorty",
    colour: "dorty",
    sizes: ["32", "33", "34", "36", "38"],
    driveFolderId: "1AWpwYq6jAhMZ4tOt2ACcovTHORvx9buH",
  },
  {
    name: "baggy jean double stone",
    colour: "double stone",
    sizes: ["32", "33", "34", "36", "38"],
    driveFolderId: "1YyojZZUAD_OIyvj1Ei0CLsktOkuMhFa9",
  },
  {
    name: "baggy jean gris snow",
    colour: "gris snow",
    sizes: ["32", "33", "34", "36", "38"],
    driveFolderId: "16TXvjX3XDiDingPlFxYWU8GMB121XGtj",
  },
  {
    name: "baggy jean noir",
    colour: "noir",
    sizes: ["32", "33", "34", "36", "38"],
    driveFolderId: "1VcRVWzmaH_Bj-wfgohyhs59bw84HH307",
  },
  {
    name: "baggy jean stone",
    colour: "stone",
    sizes: ["32", "33", "34", "36", "38"],
    driveFolderId: "1qkr1fYicgp2iW-qIv1T4PvWyoOV3njJx",
  },
  {
    name: "straight fit jean dorty",
    colour: "dorty",
    sizes: ["31", "32", "33", "34", "36", "38", "40"],
    driveFolderId: "1Hc5qnoyFRDGIwmYph1PyVdLCl2hzMBRj",
  },
  {
    name: "straight fit jean gris",
    colour: "gris",
    sizes: ["31", "32", "33", "34", "36", "38", "40"],
    driveFolderId: "1xNIW5I5uKeGkxIu0eX-SeM1Kt3P7qKN8",
  },
  {
    name: "straight fit jean gris liga",
    colour: "gris liga",
    sizes: ["31", "32", "33", "34", "36", "38", "40"],
    driveFolderId: "1np1Bystn7p21lA2J6xpmPsXIIMGyLiww",
  },
  {
    name: "straight fit jean gris noir",
    colour: "gris noir",
    sizes: ["31", "32", "33", "34", "36", "38", "40"],
    driveFolderId: "1wEU2WmoFe7u9aDcA2yC3bnk8epIXdGkt",
  },
  {
    name: "straight fit jean noir",
    colour: "noir",
    sizes: ["31", "32", "33", "34", "36", "38", "40"],
    driveFolderId: "1Ocos-scijJBzv4h2PtSiE2QXsACm1z64",
  },
  {
    name: "straight fit jean stone",
    colour: "stone",
    sizes: ["31", "32", "33", "34", "36", "38", "40"],
    driveFolderId: "1HlZWCZ_YTlKwub6MejMXe8cW6gEFVF3z",
  },
].map((row) => {
  const fit: Fit = row.name.startsWith("baggy") ? "baggy" : "straight";
  return {
    slug: slugify(row.name),
    name: row.name,
    fit,
    colour: row.colour,
    colourHex: COLOUR_HEX[row.colour] ?? "#4a5560",
    sizes: row.sizes,
    stock: 100,
    unitPriceMad: UNIT_PRICE_MAD,
    duoPriceMad: DUO_PRICE_MAD,
    driveFolderId: row.driveFolderId,
    driveFolderUrl: `https://drive.google.com/drive/folders/${row.driveFolderId}?usp=sharing`,
    description: "",
  };
});

export const FITS: { id: Fit | "all"; label: string }[] = [
  { id: "all", label: "Tous les coupes" },
  { id: "baggy", label: "Baggy" },
  { id: "straight", label: "Straight fit" },
];

export function productBySlug(slug: string) {
  return PRODUCTS.find((p) => p.slug === slug);
}

export function displayName(product: Product) {
  if (product.fit === "baggy") return `Baggy · ${product.colour}`;
  return `Straight fit · ${product.colour}`;
}

export function packPrice(quantity: number) {
  const duos = Math.floor(quantity / 2);
  const singles = quantity % 2;
  return duos * DUO_PRICE_MAD + singles * UNIT_PRICE_MAD;
}

export function mad(amount: number) {
  return `${amount.toLocaleString("fr-MA")} MAD`;
}

/** Home “new arrivals” slice — not the full catalogue. */
export const FEATURED_SLUGS = [
  "baggy-jean-noir",
  "baggy-jean-bleu-blith",
  "straight-fit-jean-stone",
  "baggy-jean-dorty",
] as const;

export function featuredProducts() {
  return FEATURED_SLUGS.map((slug) => productBySlug(slug)).filter(
    (p): p is Product => Boolean(p)
  );
}

export const CLIENT_VIDEOS = [
  { src: "/videos/jean-baggy-signature.mp4", label: "Le jean baggy signature" },
  { src: "/videos/ensemble-urbain.mp4", label: "L’ensemble urbain" },
  { src: "/videos/onsomble-ete.mp4", label: "Look d’été" },
  { src: "/videos/trois-ensembles.mp4", label: "Chez Veltrano" },
] as const;
