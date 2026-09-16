"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { mad } from "@/data/catalog";
import { cartTotal, cartUnitCount, useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CheckoutPage() {
  const { lines, placeOrder } = useCart();
  const router = useRouter();
  const [error, setError] = useState("");
  const empty = lines.length === 0;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
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
    const order = placeOrder({ name, phone, city, address, notes });
    router.push(`/orders/${order.id}`);
  }

  if (empty) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-heading text-3xl">Rien à commander</h1>
        <p className="mt-3 text-muted-foreground">Votre panier est vide.</p>
        <Button className="mt-6" render={<Link href="/" />}>
          Boutique
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-2">
      <form className="space-y-4" onSubmit={onSubmit}>
        <h1 className="font-heading text-3xl">Livraison</h1>
        <p className="text-sm text-muted-foreground">
          Commande enregistrée localement (pas de paiement en ligne sur cette
          tranche).
        </p>
        <div className="space-y-2">
          <Label htmlFor="name">Nom</Label>
          <Input id="name" name="name" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <Input id="phone" name="phone" required inputMode="tel" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">Ville</Label>
          <Input id="city" name="city" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Adresse</Label>
          <Input id="address" name="address" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="notes">Notes</Label>
          <Textarea id="notes" name="notes" placeholder="Étage, taille de secours…" />
        </div>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" size="lg" className="w-full">
          Confirmer la commande · {mad(cartTotal(lines))}
        </Button>
      </form>
      <aside className="h-fit rounded-2xl bg-white p-6">
        <h2 className="font-heading text-xl">Récapitulatif</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {cartUnitCount(lines)} pièce{cartUnitCount(lines) > 1 ? "s" : ""}
        </p>
        <ul className="mt-4 space-y-2 text-sm">
          {lines.map((l) => (
            <li key={l.id} className="flex justify-between gap-4">
              <span className="capitalize">
                {l.slug.replace(/-/g, " ")} · {l.pack === "duo" ? "duo" : "unité"} × {l.quantity}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-lg font-medium">{mad(cartTotal(lines))}</p>
      </aside>
    </div>
  );
}
