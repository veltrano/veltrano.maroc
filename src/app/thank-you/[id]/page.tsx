"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PRODUCTS, displayName, mad } from "@/data/catalog";
import { linePrice, lineProduct } from "@/lib/cart";
import { COUPON_VALUE_MAD, markCouponUsed, saveIssuedCoupon } from "@/lib/coupons";
import type { Order } from "@/lib/order";
import { ProductCard } from "@/components/product-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n/provider";

export default function ThankYouPage() {
  const params = useParams<{ id: string }>();
  const { t } = useI18n();
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "missing">("loading");

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/orders/${params.id}`);
        if (!res.ok) {
          if (!cancelled) setStatus("missing");
          return;
        }
        const json = (await res.json()) as { order: Order };
        if (!cancelled) {
          setOrder(json.order);
          saveIssuedCoupon(json.order.rewardCoupon, json.order.id);
          if (json.order.appliedCoupon) {
            markCouponUsed(json.order.appliedCoupon, json.order.id);
          }
          setStatus("ok");
        }
      } catch {
        if (!cancelled) setStatus("missing");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  if (status === "loading") {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-heading text-3xl">{t("thanks.loadingTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("thanks.loading")}</p>
      </div>
    );
  }

  if (status === "missing" || !order) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-heading text-3xl">{t("thanks.missingTitle")}</h1>
        <p className="mt-3 text-muted-foreground">{t("thanks.missing")}</p>
        <Link href="/boutique" className={cn(buttonVariants(), "mt-6 inline-flex")}>
          {t("thanks.continue")}
        </Link>
      </div>
    );
  }

  const whatsappSent = order.whatsapp?.status === "sent";

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <section className="mx-auto max-w-2xl text-center">
        <h1 className="font-heading text-4xl">{t("thanks.title")}</h1>
        <p className="mt-3 text-lg">{t("thanks.received")}</p>
        <p className="mt-4 text-muted-foreground">{t("thanks.contact")}</p>
        <p className="mt-2 text-muted-foreground">{t("thanks.48h", { hours: 48 })}</p>
        {whatsappSent ? (
          <p className="mt-4 text-sm">{t("thanks.waSent")}</p>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">{t("thanks.waQueued")}</p>
        )}
        <p className="mt-8 text-lg">{t("thanks.couponUnlock")}</p>
        <p className="mt-3 font-heading text-3xl tracking-wide">
          {order.rewardCoupon ?? "—"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("thanks.couponHint", { amount: COUPON_VALUE_MAD })}
          {order.rewardCoupon ? t("thanks.couponUnique", { code: order.rewardCoupon }) : ""}
        </p>
        <p className="mt-6 text-sm">
          {order.id} · {order.name} · {order.phone}
          <br />
          {order.address}, {order.city}
        </p>
        <ul className="mx-auto mt-4 max-w-md space-y-1 text-start text-sm">
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
          <p className="mt-2 text-sm">{t("thanks.discount", { amount: mad(order.discountMad) })}</p>
        ) : null}
        <p className="mt-2 text-sm text-muted-foreground">Livraison : Gratuite</p>
        <p className="mt-2 font-medium">{t("thanks.total", { amount: mad(order.totalMad) })}</p>
        <p className="mt-4 text-sm text-muted-foreground">
          <a href="/aide/livraison-retours" className="underline underline-offset-2">
            Échange de taille gratuit sous 7 jours après réception
          </a>
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link href="/boutique" className={cn(buttonVariants({ size: "lg" }), "inline-flex h-12")}>
            {t("thanks.continue")}
          </Link>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="font-heading text-3xl">{t("thanks.moreTitle")}</h2>
        <p className="mt-2 text-muted-foreground">{t("thanks.moreLead")}</p>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.slug} product={p} showAddToCart />
          ))}
        </div>
      </section>
    </div>
  );
}
