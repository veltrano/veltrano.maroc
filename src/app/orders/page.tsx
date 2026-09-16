"use client";

import Link from "next/link";
import { mad } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OrdersPage() {
  const { orders } = useCart();
  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-heading text-3xl">Pas encore de commande</h1>
        <p className="mt-3 text-muted-foreground">
          Les commandes de cet appareil apparaîtront ici.
        </p>
        <Link href="/" className={cn(buttonVariants(), "mt-6 inline-flex")}>
          Boutique
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl">Commandes</h1>
      <ul className="mt-8 space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="rounded-xl border border-border bg-white p-4">
            <Link href={`/orders/${o.id}`} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{o.id}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString("fr-MA")} · {o.city}
                </p>
              </div>
              <span>{mad(o.totalMad)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
