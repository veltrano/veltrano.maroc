import type { CartLine, Order } from "@/lib/cart";
import { displayName, mad, productBySlug } from "@/data/catalog";
import { linePrice, lineUnitCount } from "@/lib/cart";

export function orderWhatsAppMessage(order: Order) {
  const lines = order.lines
    .map((line: CartLine) => {
      const product = productBySlug(line.slug);
      const label = product ? displayName(product) : line.slug.replace(/-/g, " ");
      const size =
        line.pack === "duo" ? `sizes ${line.size}/${line.sizeB}` : `size ${line.size}`;
      return `- ${label} · ${line.pack === "duo" ? "pack of 2" : "1 jean"} × ${line.quantity} (${size}) · ${mad(linePrice(line))}`;
    })
    .join("\n");

  const units = order.lines.reduce((n, l) => n + lineUnitCount(l), 0);
  const discount =
    order.discountMad && order.discountMad > 0
      ? `\nDiscount: -${mad(order.discountMad)}`
      : "";

  return `Hello Mr. ${order.name}, thank you for your order!
Please confirm that the information below is correct and let us know if you will be available within 48 hours to receive your order.

Name: ${order.name}
Phone: ${order.phone}
Delivery address: ${order.address}, ${order.city}
Products (${units}):
${lines}${discount}
Total: ${mad(order.totalMad)}
Order: ${order.id}`;
}
