import { packPrice, productBySlug } from "@/data/catalog";

export type CartLine = {
  id: string;
  slug: string;
  pack: "single" | "duo";
  size: string;
  sizeB?: string;
  quantity: number;
};

export type WhatsAppDelivery = {
  status: "sent" | "queued" | "failed";
  provider?: "meta" | "twilio";
  queuedAt?: string;
  sentAt?: string;
  error?: string;
};

export type Order = {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  notes: string;
  lines: CartLine[];
  subtotalMad: number;
  discountMad: number;
  totalMad: number;
  appliedCoupon?: string;
  rewardCoupon: string;
  whatsapp: WhatsAppDelivery;
  locale?: "fr" | "ar";
};

export type WhatsAppQueueItem = {
  id: string;
  orderId: string;
  to: string;
  body: string;
  createdAt: string;
  reason: string;
};

export type Coupon = {
  code: string;
  amountMad: number;
  orderId: string;
  createdAt: string;
  usedAt?: string;
  usedOnOrderId?: string;
};

export function lineUnitCount(line: CartLine) {
  return line.pack === "duo" ? line.quantity * 2 : line.quantity;
}

export function linePrice(line: CartLine) {
  return packPrice(lineUnitCount(line));
}

export function cartSubtotal(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + linePrice(line), 0);
}

export function cartUnitCount(lines: CartLine[]) {
  return lines.reduce((sum, line) => sum + lineUnitCount(line), 0);
}

export function sanitizeLines(
  raw: CartLine[]
): CartLine[] | { error: string; errorKey?: string; slug?: string } {
  if (!Array.isArray(raw) || raw.length === 0) {
    return { error: "Le panier est vide.", errorKey: "checkout.emptyCart" };
  }
  const lines: CartLine[] = [];
  for (const row of raw) {
    const product = productBySlug(row.slug);
    if (!product) return { error: `Modèle inconnu : ${row.slug}.`, errorKey: "err.unknownSku", slug: row.slug };
    if (row.pack !== "single" && row.pack !== "duo") {
      return { error: "Pack invalide.", errorKey: "err.invalidPack" };
    }
    const qty = Number(row.quantity);
    if (!Number.isFinite(qty) || qty < 1) return { error: "Quantité invalide.", errorKey: "err.invalidQty" };
    if (!product.sizes.includes(row.size)) return { error: "Taille invalide.", errorKey: "err.invalidSize" };
    if (row.pack === "duo") {
      if (!row.sizeB || !product.sizes.includes(row.sizeB)) {
        return { error: "Deuxième taille invalide.", errorKey: "err.invalidSizeB" };
      }
    }
    lines.push({
      id: String(row.id || `${row.slug}-${row.pack}-${row.size}`),
      slug: row.slug,
      pack: row.pack,
      size: row.size,
      sizeB: row.pack === "duo" ? row.sizeB : undefined,
      quantity: Math.floor(qty),
    });
  }
  return lines;
}
