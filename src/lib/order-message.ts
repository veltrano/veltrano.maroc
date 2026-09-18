import type { CartLine, Order } from "@/lib/order";
import { displayName, mad, productBySlug } from "@/data/catalog";
import { linePrice, lineUnitCount } from "@/lib/order";
import { DEFAULT_LOCALE, parseLocale, type Locale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";

export function orderWhatsAppMessage(order: Order, locale?: Locale) {
  const loc = locale ?? parseLocale(order.locale) ?? DEFAULT_LOCALE;
  const lines = order.lines
    .map((line: CartLine) => {
      const product = productBySlug(line.slug);
      const label = product ? displayName(product) : line.slug.replace(/-/g, " ");
      const size =
        line.pack === "duo"
          ? t(loc, "wa.sizes", { a: line.size, b: line.sizeB ?? "" })
          : t(loc, "wa.size", { size: line.size });
      const pack = line.pack === "duo" ? t(loc, "product.pack2") : t(loc, "product.oneJean");
      return t(loc, "wa.line", {
        label,
        pack,
        qty: line.quantity,
        size,
        price: mad(linePrice(line)),
      });
    })
    .join("\n");

  const units = order.lines.reduce((n, l) => n + lineUnitCount(l), 0);
  const discount =
    order.discountMad && order.discountMad > 0
      ? `\n${t(loc, "wa.discount", { amount: mad(order.discountMad) })}`
      : "";
  const shipping = `\nLivraison : Gratuite (0 MAD)`;

  return `${t(loc, "wa.hello", { name: order.name })}

${t(loc, "wa.thanks")}
${t(loc, "wa.48h")}

${t(loc, "wa.name", { name: order.name })}
${t(loc, "wa.phone", { phone: order.phone })}
${t(loc, "wa.address", { address: order.address, city: order.city })}
${t(loc, "wa.products", { n: units })}
${lines}${discount}${shipping}
${t(loc, "wa.total", { amount: mad(order.totalMad) })}
${t(loc, "wa.order", { id: order.id })}`;
}
