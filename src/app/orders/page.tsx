"use client";

import Link from "next/link";
import { mad } from "@/data/catalog";
import { useCart } from "@/lib/cart";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

export default function OrdersPage() {
  const { orders } = useCart();
  const { t, locale } = useI18n();
  if (orders.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-heading text-3xl">{t("orders.emptyTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("orders.emptyLead")}</p>
        <Link href="/" className={cn(buttonVariants(), "mt-6 inline-flex")}>
          {t("nav.shop")}
        </Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <h1 className="font-heading text-3xl">{t("orders.title")}</h1>
      <ul className="mt-8 space-y-4">
        {orders.map((o) => (
          <li key={o.id} className="rounded-xl border border-border bg-white p-4">
            <Link href={`/thank-you/${o.id}`} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{o.id}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(o.createdAt).toLocaleString(locale === "ar" ? "ar-MA" : "fr-MA")} · {o.city}
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
