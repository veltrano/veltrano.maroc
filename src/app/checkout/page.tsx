"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { displayName, mad, productBySlug } from "@/data/catalog";
import { cartDiscount, cartSubtotal, cartTotal, cartUnitCount, useCart } from "@/lib/cart";
import { applyCouponRemote, getAppliedCode, setAppliedCode, saveIssuedCoupon, markCouponUsed } from "@/lib/coupons";
import type { Order } from "@/lib/order";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CheckoutPage() {
  const { lines, rememberOrder } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [applied, setApplied] = useState<string | null>(null);
  const empty = lines.length === 0;
  const subtotal = cartSubtotal(lines);
  const discount = cartDiscount(lines, applied);
  const total = cartTotal(lines, applied);

  useEffect(() => {
    const code = getAppliedCode();
    if (code) {
      setApplied(code);
      setCouponInput(code);
    }
  }, []);

  async function onCoupon(e: FormEvent) {
    e.preventDefault();
    const result = await applyCouponRemote(couponInput);
    if (result.ok) {
      setApplied(result.code);
      setCouponMsg(`Code ${result.code} appliqué (−${mad(50)}).`);
      setError("");
    } else {
      setCouponMsg(result.error);
    }
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").trim();
    const city = String(data.get("city") ?? "").trim();
    const address = String(data.get("address") ?? "").trim();
    const notes = String(data.get("notes") ?? "").trim();
    if (!name || !phone || !city || !address) {
      setError("Nom, téléphone, ville et adresse sont requis.");
      return;
    }
    if (lines.length === 0) {
      setError("Le panier est vide.");
      return;
    }
    setPending(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          city,
          address,
          notes,
          lines,
          coupon: applied,
        }),
      });
      const json = (await res.json()) as { order?: Order; error?: string };
      if (!res.ok || !json.order) {
        setError(json.error || "Impossible d’enregistrer la commande.");
        setPending(false);
        return;
      }
      if (applied && json.order.appliedCoupon) {
        markCouponUsed(applied, json.order.id);
      }
      saveIssuedCoupon(json.order.rewardCoupon, json.order.id);
      rememberOrder(json.order);
      router.push(`/thank-you/${json.order.id}`);
    } catch {
      setError("Impossible d’enregistrer la commande. Réessaie.");
      setPending(false);
    }
  }

  if (empty) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-heading text-3xl">Rien à commander</h1>
        <p className="mt-3 text-muted-foreground">Ton panier est vide.</p>
        <Link href="/boutique" className={cn(buttonVariants(), "mt-6 inline-flex")}>
          Boutique
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
      <form className="space-y-4" onSubmit={onSubmit}>
        <h1 className="font-heading text-3xl">Livraison</h1>
        <p className="text-sm text-muted-foreground">
          Confirmer enregistre la commande tout de suite. L’équipe te contacte ensuite —
          tu n’as pas besoin d’ouvrir WhatsApp.
        </p>
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" name="name" required className="h-10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" required inputMode="tel" className="h-10" placeholder="06…" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" required className="h-10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input id="address" name="address" required className="h-10" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" placeholder="Étage, taille de secours…" />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Enregistrement…" : `Confirmer la commande · ${mad(total)}`}
        </Button>
      </form>
      <aside className="h-fit rounded-2xl border border-border bg-white p-6">
        <h2 className="font-heading text-xl">Récapitulatif</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {cartUnitCount(lines)} pièce{cartUnitCount(lines) > 1 ? "s" : ""}
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((l) => {
            const p = productBySlug(l.slug);
            return (
              <li key={l.id} className="flex justify-between gap-4">
                <span>
                  {p ? displayName(p) : l.slug.replace(/-/g, " ")} ·{" "}
                  {l.pack === "duo" ? "pack de 2" : "1 jean"} × {l.quantity}
                </span>
              </li>
            );
          })}
        </ul>
        <form className="mt-6 space-y-2" onSubmit={onCoupon}>
          <Label htmlFor="coupon">Code promo</Label>
          <div className="flex gap-2">
            <Input
              id="coupon"
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="h-10"
              placeholder="VT50-…"
            />
            <Button type="submit" variant="outline">
              Appliquer
            </Button>
          </div>
          {applied ? (
            <button
              type="button"
              className="text-xs underline"
              onClick={() => {
                setAppliedCode(null);
                setApplied(null);
                setCouponMsg("");
              }}
            >
              Retirer le code
            </button>
          ) : null}
          {couponMsg ? <p className="text-sm text-muted-foreground">{couponMsg}</p> : null}
        </form>
        <div className="mt-6 space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Sous-total</span>
            <span>{mad(subtotal)}</span>
          </div>
          {discount > 0 ? (
            <div className="flex justify-between">
              <span>Coupon</span>
              <span>−{mad(discount)}</span>
            </div>
          ) : null}
        </div>
        <p className="mt-4 text-lg font-medium">{mad(total)}</p>
      </aside>
    </div>
  );
}
