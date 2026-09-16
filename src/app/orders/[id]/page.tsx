"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { displayName, mad } from "@/data/catalog";
import { linePrice, lineProduct, useCart } from "@/lib/cart";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const { orders } = useCart();
  const order = orders.find((o) => o.id === params.id);

  if (!order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-heading text-3xl">Commande introuvable</h1>
        <p className="mt-3 text-muted-foreground">
          Elle n’est pas enregistrée sur cet appareil.
        </p>
        <Link href="/orders" className={cn(buttonVariants(), "mt-6 inline-flex")}>
          Mes commandes
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <p className="text-sm uppercase tracking-widest text-muted-foreground">Commande confirmée</p>
      <h1 className="font-heading mt-2 text-3xl">{order.id}</h1>
      <p className="mt-2 text-muted-foreground">
        {order.name} · {order.phone} · {order.city}
      </p>
      <p className="text-sm">{order.address}</p>
      {order.notes ? <p className="mt-2 text-sm italic">{order.notes}</p> : null}
      <ul className="mt-8 space-y-3">
        {order.lines.map((line) => {
          const product = lineProduct(line);
          return (
            <li key={line.id} className="flex justify-between gap-4 text-sm">
              <span className="capitalize">
                {product ? displayName(product) : line.slug} ·{" "}
                {line.pack === "duo" ? `tailles ${line.size}/${line.sizeB}` : `taille ${line.size}`}
              </span>
              <span>{mad(linePrice(line))}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-6 text-lg font-medium">Total {mad(order.totalMad)}</p>
      <Link href="/" className={cn(buttonVariants(), "mt-8 inline-flex")}>
        Continuer les achats
      </Link>
    </div>
  );
}
