import type { CartLine, Order } from "@/lib/cart";
import { displayName, mad, productBySlug } from "@/data/catalog";
import { linePrice, lineUnitCount } from "@/lib/cart";

export function orderWhatsAppMessage(order: Order) {
  const lines = order.lines
    .map((line: CartLine) => {
      const product = productBySlug(line.slug);
      const label = product ? displayName(product) : line.slug.replace(/-/g, " ");
      const size =
        line.pack === "duo" ? `tailles ${line.size}/${line.sizeB}` : `taille ${line.size}`;
      return `- ${label} · ${line.pack === "duo" ? "pack de 2" : "1 jean"} × ${line.quantity} (${size}) · ${mad(linePrice(line))}`;
    })
    .join("\n");

  const units = order.lines.reduce((n, l) => n + lineUnitCount(l), 0);
  const discount =
    order.discountMad && order.discountMad > 0
      ? `\nRéduction : −${mad(order.discountMad)}`
      : "";

  return `Bonjour ${order.name}, merci pour ta commande !
Merci de confirmer que les informations ci-dessous sont exactes, et de nous indiquer si tu seras disponible sous 48 heures pour recevoir ta commande.

Nom : ${order.name}
Téléphone : ${order.phone}
Adresse de livraison : ${order.address}, ${order.city}
Produits (${units}) :
${lines}${discount}
Total : ${mad(order.totalMad)}
Commande : ${order.id}`;
}
