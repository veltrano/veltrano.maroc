"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { PRODUCTS, displayName, mad } from "@/data/catalog";
import { linePrice, lineProduct, useCart } from "@/lib/cart";
import { customerWhatsAppUrl } from "@/lib/whatsapp";
import { orderWhatsAppMessage } from "@/lib/order-message";
import { COUPON_VALUE_MAD } from "@/lib/coupons";
import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function ThankYouPage() {
  const params = useParams<{ id: string }>();
  const { orders } = useCart();
  const order = orders.find((o) => o.id === params.id);
  const wa = order ? customerWhatsAppUrl(order.phone, orderWhatsAppMessage(order)) : null;

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-heading text-3xl">Commande introuvable</h1>
        <p className="mt-3 text-muted-foreground">
          Cette confirmation est enregistrée uniquement sur cet appareil.
        </p>
        <Link href="/boutique" className={cn(buttonVariants(), "mt-6 inline-flex")}>
          Continuer les achats
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="font-heading text-4xl">Merci pour ta commande !</h1>
        <p className="mt-3 text-lg">Commande bien reçue</p>
        <p className="mt-4 text-muted-foreground">
          Un membre de l’équipe te contacte dans quelques minutes pour confirmer les
          détails.
        </p>
        <p className="mt-2 text-muted-foreground">
          Merci d’être disponible pour recevoir ta commande sous <strong>48 heures</strong>.
        </p>
        <p className="mt-8 text-lg">
          Tu as débloqué un coupon de 50 DH pour ta prochaine commande. 🎁
        </p>
        <p className="mt-3 font-heading text-3xl tracking-wide">
          {order.rewardCoupon ?? "—"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {COUPON_VALUE_MAD} DH de réduction sur ton prochain achat — à saisir dans le
          panier.
          {order.rewardCoupon
            ? ` Le code ${order.rewardCoupon} est unique à cette commande.`
            : ""}
        </p>
        <p className="mt-6 text-sm">
          {order.id} · {order.name} · {order.phone}
          <br />
          {order.address}, {order.city}
        </p>
        <ul className="mx-auto mt-4 max-w-md space-y-1 text-left text-sm">
          {order.lines.map((line) => {
            const product = lineProduct(line);
            return (
              <li key={line.id} className="flex justify-between gap-3">
                <span>
                  {product ? displayName(product) : line.slug} × {line.quantity}
                </span>
                <span>{mad(linePrice(line))}</span>
              </li>
            );
          })}
        </ul>
        {order.discountMad ? (
          <p className="mt-2 text-sm">Réduction −{mad(order.discountMad)}</p>
        ) : null}
        <p className="mt-2 font-medium">Total {mad(order.totalMad)}</p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/boutique" className={cn(buttonVariants({ size: "lg" }), "inline-flex")}>
            Continuer les achats
          </Link>
          {wa ? (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(buttonVariants({ size: "lg", variant: "outline" }), "inline-flex")}
            >
              Confirmer sur WhatsApp
            </a>
          ) : (
            <p className="text-sm text-muted-foreground">
              WhatsApp n’a pas pu s’ouvrir pour ce numéro. Vérifie le téléphone de la
              commande.
            </p>
          )}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-heading text-3xl">Envie d’ajouter autre chose ?</h2>
        <p className="mt-2 text-muted-foreground">
          Utilise ton coupon de 50 DH sur ton prochain achat.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.slug} product={p} showAddToCart />
          ))}
        </div>
      </section>
    </div>
  );
}
